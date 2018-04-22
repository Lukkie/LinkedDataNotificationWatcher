# LinkedDataNotificationWatcher
Watches an inbox directory where Linked Data Notifications will arrive.

## Requirements
- Node.js

## Install and run
- Install: `npm install`
- Run: `node src/inboxwatcher.js <directory_to_watch> <listing_location> <base_listing_url>`

## Tool developed for UGent Master's thesis
Some of the code is reusable, however the code was customized to suit the thesis.
The goal of this tool is to capture all incoming (and existing) files in the inbox directory, analyze them to see if they announce an annotation, and add the annotation to a listing. Finally, the notification is moved to the `processed` directory.
