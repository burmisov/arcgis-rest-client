arcgis-rest-client
==================

ArcGIS Server REST API client module for Node.js

```js
var arcgis = require('arcgis-rest-client');
var fsUrl = 'http://your-arcgis-host/arcgis/rest/services/test/testFS/FeatureServer/0';

arcgis.connectFeatureServer(fsUrl, function (err, featureService) {

    // Query
    featureService.query({<options>}, function (err, result) {});
    
    // Count only
    featureService.queryCount({<options>}, function (err, count) {});
    
    // Add features
    featureService.add([<features>], function (err, results) {});
    
    // Delete features
    featureService.del({<options>}, function (err, result) {});
    
    // Update features
    featureService.update([<features>], function (err, result) {});
});

```
