const express   = require('express');
const app       = express();
const basicAuth = require('basic-auth');

module.exports = function(config) {

  const _this = this;

  _this.config = Object.assign({ listenOnPort: 8083, hubUrl: 'http://localhost:8081' }, config);

  _this.log = function(message) {
    console.log(`[WEB] ${message}`);
  };

  _this.error = function(message) {
    console.log(`[WEB] [ERROR] ${message}`);
  };

  _this.start = function() {
    _this.log('Starting');

    if (_this.config.httpAuth) {
      app.get('/', function (req, res, next) {
        const user = basicAuth(req);
        if (!user || !user.name || !user.pass) {
          res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
          return res.sendStatus(401);
        }
        if ((user.name === _this.config.httpAuth.login) && (user.pass === _this.config.httpAuth.password)) {
          return next();
        } else {
          res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
          return res.sendStatus(401);
        }
      });
    }

    app.all('*', function(req, res, next) {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "X-Requested-With");
      next();
    });

    app.get('/js/config.js', function(req, res){
      const body = `config = { hubUrl: "${_this.config.hubUrl}" }`;
      res.setHeader('Content-Type', 'text/javascript');
      res.setHeader('Content-Length', body.length);
      res.end(body);
    });

    app.use(express.static(__dirname + '/www'));

    app.listen(_this.config.listenOnPort);

    _this.log(`Listening on port ${_this.config.listenOnPort}`);

  };

  return _this;

};