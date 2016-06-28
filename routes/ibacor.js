var express = require('express');
var router = express.Router();
var http = require("http");
var multer  = require('multer');
var request = require('request');
var upload = multer();
var kodepos_url = "http://ibacor.com/api/kode-pos-indonesia?query=(0)&next=(1)&k=(2)";
var zodiak_url = "http://ibacor.com/api/zodiak?nama=(0)&tgl=(1)";

var ibacorCall = function(url, res, response_url) {
    if(response_url)
        res.sendStatus(200);
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
            if(response_url) {
                data = {text:buffer};
                delayedMsg(response_url, data);
            } else {
                var hasil = JSON.parse(buffer);
                res.json(hasil);
            }
        });
    });
};

var delayedMsg = function(response_url, data) {
    // Set the headers
    var headers = {
        'Content-Type':     'application/json'
    }

// Configure the request
    var options = {
        url: response_url,
        method: 'POST',
        headers: headers,
        form: data
    }

    console.log(response_url);
    // Start the request
    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            // Print out the response body
            console.log(body)
        }
    })

}

router.post('/kodepos', upload.array(), function(req, res, next) {
    var url = kodepos_url.replace('(0)',req.body.text);
    url = url.replace('(1)','1');
    url = url.replace('(2)','da5c24ec6e9dfd9ec9770c880e7f1888');
    console.log(url);
    ibacorCall(url, res, req.body.response_url);
});

router.post('/zodiak', upload.array(), function(req, res, next) {
    var text = req.body.text;
    var texts = text.split(' ');
    var url = zodiak_url.replace('(0)',texts[0]);
    url = url.replace('(1)',texts[1]);
    console.log(url);
    ibacorCall(url, res, req.body.response_url);
});

module.exports = router;
