var express = require('express');
var router = express.Router();
var http = require("http");
var multer  = require('multer');
var upload = multer();
var kodepos_url = "http://ibacor.com/api/kode-pos-indonesia?query=(0)&next=(1)&k=(2)";
var zodiak_url = "http://ibacor.com/api/zodiak?nama=(0)&tgl=(1)";

var ibacorCall = function(url, res) {
    var request = http.get(url, function (response) {
        // data is streamed in chunks from the server
        // so we have to handle the "data" event
        var buffer = "",
            data,
            route;

        response.on("data", function (chunk) {
            buffer += chunk;
        });

        response.on("end", function (err) {
            // finished transferring data
            // dump the raw data
            //console.log(buffer);
            var hasil = JSON.parse(buffer);
            res.json(hasil);
        });
    });
}

router.post('/kodepos', upload.array(), function(req, res, next) {
    var url = kodepos_url.replace('(0)',req.body.text);
    url = url.replace('(1)','1');
    url = url.replace('(2)','da5c24ec6e9dfd9ec9770c880e7f1888');
    console.log(url);
    ibacorCall(url,res);
});

router.post('/zodiak', upload.array(), function(req, res, next) {
    var text = req.body.text;
    var texts = text.split(' ');
    var url = zodiak_url.replace('(0)',texts[0]);
    url = url.replace('(1)',texts[1]);
    console.log(url);
    ibacorCall(url,res);
});

module.exports = router;
