const hound = require('hound')
const solid = require('solid-client');
const rdf = require('rdflib');
const ns = require('rdf-ns')(rdf);
const fs = require('fs');
const path = require('path');
/*************************************/

var inboxLocation = process.argv[2];
if (!inboxLocation) {
  console.log("No directory parameter found")
  console.log("Usage: node inboxwatcher.js <directory_to_watch> <listing_location> <base_listing_url>");
  process.exit(-1);
}

var listingLocation = process.argv[3];
if (!listingLocation) {
  console.log("No listing parameter found")
  console.log("Usage: node inboxwatcher.js <directory_to_watch> <listing_location> <base_listing_url>");
  process.exit(-1);
}

// TODO: How to get this from file? Should not be passed as parameter IMO
var baseListingUrl = process.argv[4];
if (!baseListingUrl) {
  console.log("No listing base URL parameter found")
  console.log("Usage: node inboxwatcher.js <directory_to_watch> <listing_location> <base_listing_url>");
  process.exit(-1);
}


/*************************************/
var vocab = solid.vocab;
vocab.oa = ns.base('http://www.w3.org/ns/oa#');
vocab.as = ns.base('http://www.w3.org/ns/activitystreams#');


function addAnnotationToListing(annotation, source, listingLocation) {
  console.log("Adding annotation to listing");
  return new Promise(function(resolve, reject) {
    // assumes listing already exists!
    fs.readFile(listingLocation, {encoding: 'utf-8'}, function(err, data){
      if (!err) {
        // parse file with RDFlib
        try {
          let graph = rdf.graph();
          rdf.parse(data, graph, baseListingUrl, 'text/turtle');
          if (graph.statementsMatching(source, vocab.as('items'), annotation).length == 0) {
            graph.add(source, vocab.as('items'), annotation);
            let newGraphContent = new rdf.Serializer(graph).toN3(graph);
            resolve(newGraphContent);
          } else {
            reject("Annotation is already present in listing.");
          }
        } catch (error) {
          reject(err);
        }
      } else {
        reject(err);
      }
    });
  })
  .then(function(content) {
    return new Promise(function(resolve, reject) {
      if (content) {
        // write to listingLocation
        fs.writeFile(listingLocation, content, function(err) {
          if(err) {
            reject(err);
          }
          console.log("The listing was updated");
          resolve();
        });
      } else {
        reject('content is empty');
      }
    });
  });

}

function moveToProcessedDirectory(file) {
  // TODO: Implement this
}

watcher = hound.watch(inboxLocation);

watcher.on('create', function(file, stats) {
  console.log(file + ' was added to the inbox');

  // open file
  fs.readFile(file, {encoding: 'utf-8'}, function(err, data){
    if (!err) {
      // parse file with RDFlib
      let notificationGraph = rdf.graph();
      try {
        rdf.parse(data, notificationGraph, 'https://example.org/somegraph', 'text/turtle');
        let notificationObject = notificationGraph.statementsMatching(undefined, vocab.as('Announce'), undefined)[0].object.value;

        solid.web.get(notificationObject).then(function(response) {
          let annotationGraph = response.parsedGraph();
          let annotation = annotationGraph.any(undefined, vocab.rdf('type'), vocab.oa('Annotation'));

          if (annotation) {
            // if annotation: add URL to listing
            console.log("Notification announces new annotation.")
            let target = annotationGraph.any(annotation, vocab.oa('hasTarget'), undefined);
            let source = annotationGraph.any(target, vocab.oa('hasSource'), undefined);

            addAnnotationToListing(annotation, source, listingLocation)
            .then(function() {
              // move notification to Process directory
              moveToProcessedDirectory(file);
            })
            .catch(function(err) {
              console.log(err);
            });
          }
        });



      } catch(err) {
        console.log(err);
      }
    } else {
        console.log(err);
    }
  });
});
