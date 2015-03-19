var debug = require('debug')('agsclient');
var request = require('superagent');
var request2 = require('request');
var fs = require('fs');
var _ = require('underscore');
var urlencode = require('urlencode');

FeatureServer.prototype.addAttachment = function (objId, filePath, callback) {
    var rs = fs.createReadStream(filePath);
    var url = this.fsUrl + "/" + objId + "/addAttachment";

    var r = request2.post(url, function (err, resp, body) {
        callback(err); // TODO
    });
    var form = r.form();
    form.append('f', 'json');
    form.append('attachment', rs);
};

FeatureServer.prototype.addAttachmentUrl = function (objId, fileUrl, callback) {
    str = "";
    url = fileUrl.split("/");
    for (var i = 0; i < url.length; i++) {
        if (i == url.length - 1) {
            str += "/" + urlencode(url[i]);
        } else {
            str += url[i] + "/";
        }
    }
    var httpStream = request2(str);
    var url = this.fsUrl + "/" + objId + "/addAttachment";

    var r = request2.post(url, function (err, resp, body) {
        callback(err); // TODO
    });
    var form = r.form();
    form.append('f', 'json');
    form.append('attachment', httpStream);
};

FeatureServer.prototype.attachmentInfos = function (objId, callback) {
    var url = this.fsUrl + "/" + objId + "/attachments";

    var r = request2.post(url, function (err, resp, body) {
        callback(err, resp, body); // TODO
    });
    var form = r.form();
    form.append('f', 'json');
};
