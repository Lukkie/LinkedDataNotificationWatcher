const hound = require('hound')
// const solid = require('solid-client');
// const rdf = require('rdflib');
// const ns = require('rdf-ns')(rdf);


// Run this script in the /solid directory
const inboxLocation = 'data/inbox/';

watcher = hound.watch(inboxLocation);

watcher.on('create', function(file, stats) {
  console.log(file + ' was created')
})
watcher.on('change', function(file, stats) {
  console.log(file + ' was changed')
})
watcher.on('delete', function(file) {
  console.log(file + ' was deleted')
})
