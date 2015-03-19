// Warning!!! Test are specific for our local environment, sorry.

var _ = require('lodash');

var arcgis = require('../index');

var timeOut = 10 * 1000;
var arcgisServerUrl = process.env.AGS_SVR_URL || "http://gis.informatica.ru/arcgis";
var arcgisTestFS_01 = process.env.AGS_FS_01 || "test/agsRestClientTest01";

var testFSurl_01 = arcgisServerUrl + "/rest/services/" + arcgisTestFS_01 + "/FeatureServer/0";

describe('Arcgis REST client module', function () {
    console.info('Test FS 01: ', testFSurl_01);

    it('connects to Arcgis Feature Service', function (done) {
        arcgis.connectFeatureServer(testFSurl_01, function (err, featureService) {
            expect(err).toBeNull();
            expect(featureService).not.toBeNull();
            expect(featureService.fsInfo.type).toEqual('Feature Layer');
            expect(featureService.fsUrl).toEqual(testFSurl_01);

            done();
        });
    }, timeOut);

    var wrongUrl = testFSurl_01.slice(0, testFSurl_01.length - 10);

    it('refuses wrong Feature Service url', function (done) {
        arcgis.connectFeatureServer(wrongUrl, function (err, featureService) {
            expect(err).not.toBeNull();
            expect(featureService).not.toBeDefined();

            done();
        });
    }, timeOut);

    var badUrl = '!@#$%';

    it('refuses bad Feature Service url', function (done) {
        arcgis.connectFeatureServer(badUrl, function (err, featureService) {
            expect(err).not.toBeNull();
            expect(featureService).not.toBeDefined();

            done();
        });
    }, timeOut);

    it('performs a query, returning empty set', function (done) {
        arcgis.connectFeatureServer(testFSurl_01, function (err, featureService) {
            expect(err).toBeNull();
            expect(featureService).toBeDefined();

            featureService.query({ where: '1=0' }, function (err, featureSet) {
                expect(err).toBeNull();
                expect(featureSet).not.toBeNull();
                expect(featureSet.objectIdFieldName).toBeDefined();
                expect(featureSet.features).toBeDefined();
                expect(_.isArray(featureSet.features)).toBe(true);

                done();
            });
        });
    }, timeOut);

    it('rejects a query with wrong options', function (done) {
        arcgis.connectFeatureServer(testFSurl_01, function (err, featureService) {
            expect(err).toBeNull();
            expect(featureService).toBeDefined();

            featureService.query({ where: '!@#$' }, function (err, featureSet) {
                expect(err).not.toBeNull();
                expect(featureSet).not.toBeDefined();

                done();
            });
        });
    }, timeOut);

    it('performs a count query, returning empty set', function (done) {
        arcgis.connectFeatureServer(testFSurl_01, function (err, featureService) {
            expect(err).toBeNull();
            expect(featureService).toBeDefined();

            featureService.queryCount({ where: '1=0'}, function (err, count) {
                expect(err).toBeNull();
                expect(count).toBeDefined();
                expect(count).toEqual(0);

                done();
            });
        });
    }, timeOut);

    it('rejects a count query with wrong options', function (done) {
        arcgis.connectFeatureServer(testFSurl_01, function (err, featureService) {
            expect(err).toBeNull();
            expect(featureService).toBeDefined();

            featureService.queryCount({ where: '!@#$'}, function (err, count) {
                expect(err).not.toBeNull();
                expect(count).not.toBeDefined();

                done();
            });
        });
    }, timeOut);

    var testDate = new Date();
    testDate.setMilliseconds(0);
    var testFeature = {
        attributes: {
            FIELD_TEXT: 'Test text',
            FIELD_LINT: 123456,
            FIELD_SINT: 123,
            FIELD_DOUBLE: 123456.123456,
            FIELD_FLOAT: 123456.123456,
            FIELD_DATE: (testDate).getTime()
        },
        geometry: {
            x: 5256408,
            y: 7587597
        }
    };

    it('adds features through Feature Service', function (done) {
        var featuresToAdd = [ testFeature, testFeature, testFeature ];

        arcgis.connectFeatureServer(testFSurl_01, function (err, featureService) {
            expect(err).toBeNull();
            expect(featureService).toBeDefined();

            featureService.add(featuresToAdd, function (err, results) {
                expect(err).toBeNull();
                expect(results).toBeDefined();

                var allSuccess = _.reduce(
                    _.map(results, function (item) { return item.success; }),
                    function logicalAnd (accum, elem) { return accum && elem; },
                    true
                );

                expect(allSuccess).toBe(true);

                done();
            });
        });
    }, timeOut);

    it('performs a query returning Object IDs', function (done) {
        arcgis.connectFeatureServer(testFSurl_01, function (err, featureService) {
            expect(err).toBeNull();
            expect(featureService).toBeDefined();

            featureService.query({ where: '1=1', returnIdsOnly: true }, function (err, results) {
                expect(err).toBeNull();
                expect(results).toBeDefined();
                expect(results.objectIds).toBeDefined();

                var objectIds = results.objectIds;
                expect(_.isArray(objectIds)).toBe(true);
                expect(objectIds.length > 0).toBe(true);
                expect(objectIds[0]).toEqual(jasmine.any(Number));

                done();
            });
        });
    }, timeOut);

    it('deletes features by ObjectIds', function (done) {
        arcgis.connectFeatureServer(testFSurl_01, function (err, featureService) {
            expect(err).toBeNull();
            expect(featureService).toBeDefined();

            featureService.query({ where: '1=1', returnIdsOnly: true }, function (err, results) {
                expect(err).toBeNull();
                expect(results).toBeDefined();

                var objectIds = results.objectIds;
                expect(objectIds.length > 0).toBe(true);

                var objectIdsStr = objectIds.join(',');
                featureService.del({ objectIds: objectIdsStr }, function (err, results) {
                    expect(err).toBeNull();
                    expect(results).toBeDefined();

                    var allSuccess = _.reduce(
                        _.map(results, function (item) { return item.success; }),
                        function logicalAnd (accum, elem) { return accum && elem; },
                        true
                    );

                    expect(allSuccess).toBe(true);

                    featureService.query({ where: '1=1' }, function (err, featureSet) {
                        expect(err).toBeNull();
                        expect(featureSet).toBeDefined();
                        expect(featureSet.features).toBeDefined();
                        expect(_.isArray(featureSet.features)).toBe(true);
                        expect(featureSet.features.length).toEqual(0);

                        done();
                    });
                });
            });
        });
    }, timeOut * 2);

    it('adds and queries features, retaining field values', function (done) {
        var featuresToAdd = [ testFeature ];

        arcgis.connectFeatureServer(testFSurl_01, function (err, featureService) {
            expect(err).toBeNull();
            expect(featureService).toBeDefined();

            featureService.add(featuresToAdd, function (err, results) {
                expect(err).toBeNull();
                expect(results).toBeDefined();

                var allSuccess = _.reduce(
                    _.map(results, function (item) { return item.success; }),
                    function logicalAnd (accum, elem) { return accum && elem; },
                    true
                );
                expect(allSuccess).toBe(true);

                var newObjectIdsStr =
                    (_.map(results, function (item) { return item.objectId; })).join(',');

                featureService.query({ objectIds: newObjectIdsStr }, function (err, featureSet) {
                    expect(err).toBeNull();
                    expect(featureSet).toBeDefined();

                    var newFeatures = featureSet.features;
                    for (var k in featuresToAdd[0].attributes) {
                        expect(newFeatures[0].attributes[k]).toEqual(featuresToAdd[0].attributes[k]);
                    }

                    featureService.del({ objectIds: newObjectIdsStr }, function (err, results) {
                        expect(err).toBeNull();
                        expect(results).toBeDefined();
                    });

                    done();
                });
            });
        });
    });

    it('updates a feature', function (done) {
        var featuresToAdd = [ testFeature ];

        arcgis.connectFeatureServer(testFSurl_01, function (err, featureService) {
            expect(err).toBeNull();
            expect(featureService).toBeDefined();

            featureService.add(featuresToAdd, function (err, results) {
                expect(err).toBeNull();
                expect(results).toBeDefined();

                var allSuccess = _.reduce(
                    _.map(results, function (item) { return item.success; }),
                    function logicalAnd (accum, elem) { return accum && elem; },
                    true
                );
                expect(allSuccess).toBe(true);

                var newObjectIdsStr =
                    (_.map(results, function (item) { return item.objectId; })).join(',');

                featureService.query({ objectIds: newObjectIdsStr }, function (err, featureSet) {
                    expect(err).toBeNull();
                    expect(featureSet).toBeDefined();

                    var featureToUpdate = featureSet.features[0];
                    featureToUpdate.attributes.FIELD_TEXT = "New text";
                    featureToUpdate.attributes.FIELD_LINT += 1000;

                    var savedFeature = _.cloneDeep(featureToUpdate);
                    delete featureToUpdate.attributes.FIELD_GUID;
                    delete featureToUpdate.attributes.FIELD_RASTER;

                    featureService.update([ featureToUpdate ], function (err, results) {
                        expect(err).toBeNull();
                        expect(results).toBeDefined();

                        var allSuccess = _.reduce(
                            _.map(results, function (item) { return item.success; }),
                            function logicalAnd (accum, elem) { return accum && elem; },
                            true
                        );
                        expect(allSuccess).toBe(true);

                        featureService.query({ objectIds: newObjectIdsStr }, function (err, newFeatureSet) {
                            expect(err).toBeNull();
                            expect(newFeatureSet).toBeDefined();
                            expect(newFeatureSet.features[0]).toEqual(savedFeature);

                            done();
                        });
                    });
                });
            });
        });
    }, timeOut * 3);
});
