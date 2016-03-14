var speakeasy = require('speakeasy');
var express = require('express');
var multer  = require('multer');
var base32  = require('base32.js');
var upload = multer();
var router = express.Router();
var secret = speakeasy.generateSecret({length: 25});
var token = speakeasy.totp({
  secret: secret.base32,
  encoding: 'base32'
});

var getTokenAndTimer = function(mySecret) {
  var verified = speakeasy.totp.verify({
    secret: mySecret?base32.encode(mySecret).toString():secret.base32,
    encoding: 'base32',
    token: token,
    window: 30
  });
  if(!verified) {
    token = speakeasy.totp({
      secret: mySecret?base32.encode(mySecret).toString():secret.base32,
      encoding: 'base32'
    });
  }
  return {token:token, timer:90};
};

/* GET home page. */
router.get('/home', function(req, res, next) {
  var hasil = getTokenAndTimer();
  res.render('index', { title: 'My Token Generator', token:hasil.token, timer:hasil.timer });
});

router.get('/token', function(req, res, next) {
  var hasil = getTokenAndTimer();
  res.json(hasil);
});

router.post('/token', upload.array(), function(req, res, next) {
  var hasil = getTokenAndTimer(req.body.secret);
  res.json(hasil);
});

router.post('/verify', upload.array(), function(req, res, next) {
  var verified=false;
  if (req.body && req.body.token) {
    var mySecret = req.body.secret;
    verified = speakeasy.totp.verify({
      secret: mySecret?base32.encode(mySecret).toString():secret.base32,
      encoding: 'base32',
      token: req.body.token,
      window: 30
    });
  }
  res.json({verified:verified});
});

module.exports = router;
