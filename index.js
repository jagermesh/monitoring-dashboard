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

  _this.log = function(message, attributes) {
    let text = colors.yellow(`[${logTag}]`) + ' ' + message;
    if (attributes) {
      text += ' ' + colors.green(JSON.stringify(attributes));
    }
    console.log(text);
  };

  _this.error = function(message, attributes) {
    let text = colors.yellow(`[${logTag}]`) + ' ' + colors.yellow(`[ERROR]`) + ' ' + message;
    if (attributes) {
      text += ' ' + colors.green(JSON.stringify(attributes));
    }
    console.log(text);
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
      _this.log('New connection', connectionInfo);
      socket.on('registerObserver', function(data) {
        let observerInfo = Object.assign({ observerId: connectionInfo.id }, connectionInfo);
        _this.log('New connection is observer', { observerId: observerInfo.id });
        observers[connectionInfo.id] = { socket: socket, observerInfo: observerInfo };
        socket.emit('observerRegistered', { observerInfo: observerInfo });
        if (hubServer.connected) {
          socket.emit('hubOnline');
        } else {
          socket.emit('hubOffline');
        }
        _this.log('Observer registered', { observerId: observerInfo.id });

        setTimeout(function() {
          _this.log('Sending sensors list to observers');
          for (let sensorUid in sensors) {
            let sensor = sensors[sensorUid];
            _this.log('Sending sensor info to observer',  { sensorUid: sensor.sensorInfo.sensorUid, observerId: observerInfo.observerId });
            socket.emit('sensorRegistered', { sensorInfo: sensor.sensorInfo });
          }
          setTimeout(function() {
            _this.log('Sending sensors data to observer');
            for (let sensorId in sensors) {
              let sensor = sensors[sensorId];
              let sensorData = sensorDataCache[sensor.sensorInfo.sensorUid];
              if (sensorData) {
                _this.log('Sending sensor data to observer',  { sensorUid: sensor.sensorInfo.sensorUid, metricUid: sensorData.metricUid, observerId: observerInfo.observerId });
                socket.emit('sensorData', sensorData);
              }
            }
          });
        });
      });
      socket.on('disconnect', function() {
        let observer = observers[connectionInfo.id];
        delete observers[connectionInfo.id];
        if (observer) {
          _this.log('Observer disconnected', { observerId: observer.observerInfo.observerId });
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
      _this.log('Registering as observer');
      hubServer.emit('registerObserver');
    });
    hubServer.on('observerRegistered', function () {
      _this.log('Observer egistration acknowledged');
      for(let observerId in observers) {
        observers[observerId].socket.emit('hubOnline');
      }
    });
    hubServer.on('sensorRegistered', function (data) {
      let sensorInfo = Object.assign({}, data.sensorInfo);
      _this.log('Sensor connected', { sensorUid: sensorInfo.sensorUid });
      sensors[sensorInfo.sensorUid] = { sensorInfo: sensorInfo };
      for(let observerId in observers) {
        observers[observerId].socket.emit('sensorRegistered', { sensorInfo: sensorInfo });
      }
    });
    hubServer.on('sensorData', function (data) {
      let sensorData = Object.assign({ }, data);
      // _this.log('sensorData ' + sensorData.metricUid);
      sensorDataCache[sensorData.sensorUid] = sensorData;
      for (let observerId in observers) {
        observers[observerId].socket.emit('sensorData', sensorData);
      }
    });
    hubServer.on('sensorUnregistered', function (data) {
      let sensor = sensors[data.sensorInfo.sensorUid];
      delete sensors[data.sensorInfo.sensorUid];
      delete sensorDataCache[data.sensorInfo.sensorUid];
      if (sensor) {
        _this.log('Sensor disconnected', { sensorUid: sensor.sensorInfo.sensorUid });
        for(let observerId in observers) {
          let observer = observers[observerId];
          _this.log('Informing observer about sensor disconnection',  { sensorUid: sensor.sensorInfo.sensorUid, observerId: observer.observerInfo.observerId });
          observer.socket.emit('sensorUnregistered', { sensorInfo: sensor.sensorInfo });
        }
      }
    });
    hubServer.on('disconnect', function(data) {
      _this.log('Disconnected from hub');
      _this.log('Informing observers about sensor disconnection');
      for(let observerId in observers) {
        let observer = observers[observerId];
        for(let sensorUid in sensors) {
          let sensor = sensors[sensorUid];
          delete sensors[sensorUid];
          _this.log('Informing observer about sensor disconnection',  { sensorUid: sensor.sensorInfo.sensorUid, observerId: observer.observerInfo.observerId });
          observers[observerId].socket.emit('sensorUnregistered', { sensorInfo: sensor.sensorInfo });
        }
        observer.socket.emit('hubOffline');
      }
    });

  };

  return _this;

};