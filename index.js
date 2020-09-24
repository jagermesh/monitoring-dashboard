const colors       = require('colors');
const express      = require('express');
const basicAuth    = require('basic-auth');
const socketServer = require('socket.io');
const socketClient = require('socket.io-client');

const app = express();

module.exports = function(config) {

  const _this = this;

  _this.config = Object.assign({ backEndPort: 8081, frontEndPort: 8083, backEndUrl: 'http://localhost:8081', hubUrl: 'http://localhost:8082' }, config);

  let logTag = 'DSB';

  _this.log = function(message, tag) {
    tag = tag || logTag;
    console.log(colors.yellow(`[${tag}]`) + ' ' + message);
  };

  _this.error = function(message, tag) {
    tag = tag || logTag;
    console.log(colors.yellow(`[${tag}]`) + ' ' + colors.red('[HUB]') + ' ' + message);
  };

  _this.start = function() {

    let observers       = Object.create({ });
    let sensors         = Object.create({ });
    let sensorDataCache = Object.create({ });

    // Backend

    _this.log('Starting backend server');
    _this.log(`Connecting to hub at ${_this.config.hubUrl}`);

    const backEndServer = socketServer.listen(_this.config.backEndPort, { log: false });
    const hubServer = socketClient.connect(_this.config.hubUrl, { reconnect: true });

    backEndServer.on('connection', function (socket) {
      let connectionInfo = { id:      socket.id
                           , address: socket.handshake.address.replace('::1', '127.0.0.1').replace('::ffff:', '')
                           };
      _this.log('New connection ' + JSON.stringify(connectionInfo));
      socket.on('registerObserver', function(data) {
        let observerInfo = Object.assign({ }, connectionInfo);
        _this.log('Observer registration request received ' + JSON.stringify(observerInfo));
        observers[connectionInfo.id] = { socket: socket, observerInfo: observerInfo, isActive: true};
        socket.emit('observerRegistered', { observerInfo: observerInfo });
        if (hubServer.connected) {
          socket.emit('hubOnline');
        } else {
          socket.emit('hubOffline');
        }
        _this.log('Observer registered: ' + JSON.stringify(observerInfo));

        setTimeout(function() {
          _this.log('Sending sensors list to observers');
          for (let sensorUid in sensors) {
            let sensorInfo = sensors[sensorUid].sensorInfo;
            _this.log('Sending sensor info to observer ' + JSON.stringify(sensorInfo));
            socket.emit('sensorRegistered', { sensorInfo: sensorInfo });
          }
          setTimeout(function() {
            _this.log('Sending sensors data to observer');
            for (let sensorUid in sensors) {
              let sensorInfo = sensors[sensorUid].sensorInfo;
              let sensorData = sensorDataCache[sensorUid];
              if (sensorData) {
                _this.log('Sending sensor data to observer ' + JSON.stringify(sensorInfo));
                socket.emit('sensorData', sensorData);
              }
            }
          });
        });
      });
      socket.on('disconnect', function() {
        let observer = observers[connectionInfo.id];
        if (observer) {
          observer.isActive = false;
          _this.log('Observer disconnected: ' + JSON.stringify(observer.observerInfo));
        }
      });
    });

    _this.log('Backend listening on port ' + _this.config.backEndPort);

    // Front end

    _this.log('Starting dashboard server');

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
      const body = `
        define(function (require) {
          return { backendUrl: "${_this.config.backEndUrl}" };
        });
      `;
      res.setHeader('Content-Type', 'text/javascript');
      res.setHeader('Content-Length', body.length);
      res.end(body);
    });

    app.use(express.static(__dirname + '/www'));

    app.listen(_this.config.frontEndPort);

    _this.log(`Dashboard listening on port ${_this.config.frontEndPort}`);

    // Hub

    hubServer.on('connect', function () {
      _this.log(`Connected to hub`);
      hubServer.emit('registerObserver');
      for(let observerId in observers) {
        observers[observerId].socket.emit('hubOnline');
      }
    });
    hubServer.on('sensorRegistered', function (data) {
      let sensorInfo = Object.assign({}, data.sensorInfo);
      _this.log('sensorRegistered ' + JSON.stringify(sensorInfo));
      sensors[sensorInfo.sensorUid] = { sensorInfo: sensorInfo };
      for(let observerId in observers) {
        observers[observerId].socket.emit('sensorRegistered', { sensorInfo: sensorInfo });
      }
    });
    hubServer.on('sensorData', function (data) {
      let sensorData = Object.assign({ }, data);
      sensorDataCache[sensorData.sensorUid] = sensorData;
      for (let observerId in observers) {
        observers[observerId].socket.emit('sensorData', sensorData);
      }
    });
    hubServer.on('sensorUnregistered', function (data) {
      let sensorInfo = Object.assign({}, data.sensorInfo);
      _this.log('sensorUnregistered ' + JSON.stringify(sensorInfo));
      for(let observerId in observers) {
        observers[observerId].socket.emit('sensorUnregistered', { sensorInfo: sensorInfo });
      }
      delete sensors[sensorInfo.sensorUid];
    });
    hubServer.on('disconnect', function(data) {
      _this.log('Disconnected from hub');
      for(let observerId in observers) {
        for(let sensorUid in sensors) {
          let sensor = sensors[sensorUid];
          observers[observerId].socket.emit('sensorUnregistered', { sensorInfo: sensor.sensorInfo });
        }
        observers[observerId].socket.emit('hubOffline');
      }
    });

  };

  return _this;

};