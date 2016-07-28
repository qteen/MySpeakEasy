var express = require('express');
var router = express.Router();
var http = require("http");
var multer  = require('multer');
var querystring = require('querystring');
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
                data = {
                    'response_type': 'application/json',
                    'text': querystring.escape(buffer)
                };
                delayedMsg(response_url, data);
            } else {
                var hasil = JSON.parse(buffer);
                res.json(hasil);
            }
        });
    });
};

var delayedMsg = function(response_url, data, api_key, res) {
    // Set the headers
    var headers = {
        'Content-Type': 'application/json'
    }
    if(api_key) {
        headers['X-Redmine-API-Key']=api_key;
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
        if (!error && (response.statusCode == 200 || response.statusCode == 201)) {
            if(response.contentType=='application/json')
                res.json(JSON.parse(body));
            else {
                res.set('Content-Type','application/xml');
                res.send(body);
            }
        } else {
            res.send(error);
        }
    })

}

router.post('/kodepos', upload.array(), function(req, res, next) {
    delayedMsg('http://www.posindonesia.co.id/tarif/source/kodepos.php', { keyword: req.body.text}, res);
});

router.get('/kodepos', function(req, res, next) {
    delayedMsg('http://www.posindonesia.co.id/tarif/source/kodepos.php', { keyword: req.query.text}, res);
});

router.post('/zodiak', upload.array(), function(req, res, next) {
    var text = req.body.text;
    var texts = text.split(' ');
    var url = zodiak_url.replace('(0)',texts[0]);
    url = url.replace('(1)',texts[1]);
    console.log(url);
    ibacorCall(url, res);
});

router.post('/log_time',upload.array(), function (req,res,next) {
    var text = req.body.text;
    var texts = text.split(' ');
    var mydata = {time_entry:{}};
    mydata.time_entry.issue_id=texts[0];
    mydata.time_entry.hours=texts[1];
    mydata.time_entry.activity_id=texts[2];
    mydata.time_entry.comments=texts[3];
    if(texts.length>4) {
        for(var i=4;i<texts.length;i++) {
            mydata.time_entry.comments+=' '+texts[i];
        }
    }
    delayedMsg('http://iao1.ddns.net:9080/redmine/time_entries.xml',mydata,'666af96a666894a1810773d116906523b5c10c03',res);
});

module.exports = router;
