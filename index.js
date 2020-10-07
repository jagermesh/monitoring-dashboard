const colors       = require('colors');
const express      = require('express');
const basicAuth    = require('basic-auth');
const socketServer = require('socket.io');
const socketClient = require('socket.io-client');

const app = express();

class MonitoringDashboard {

  constructor(config) {

    const _this = this;

    _this.dashboardConfig = Object.assign({ backEndPort: 8081, frontEndPort: 8083, backEndUrl: 'http://localhost:8081', hubUrl: 'http://localhost:8082' }, config);

  }

  log(message, attributes, isError) {

    const logTag = 'DSB';
    let text = colors.yellow(`[${logTag}]`);
    if (isError) {
      text += ' ' + colors.yellow(`[ERROR]`);
    }
    text += ' ' + message;
    if (attributes) {
      text += ' ' + colors.green(JSON.stringify(attributes));
    }
    console.log(text);

  }

  start() {

    const _this = this;

    let observers = Object.create({ });
    let metrics   = Object.create({ });

    // Backend

    _this.log('Starting backend server');

    _this.log(`Connecting to hub at ${_this.dashboardConfig.hubUrl}`);

    const backEndServer = socketServer.listen(_this.dashboardConfig.backEndPort, { log: false });
    const hubServer = socketClient.connect(_this.dashboardConfig.hubUrl, { reconnect: true });

    backEndServer.on('connection', function (socket) {
      let connectionInfo = {
        id: socket.id,
        address: socket.handshake.address.replace('::1', '127.0.0.1').replace('::ffff:', ''),
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
          _this.log('Sending metrics list to observers');
          for (let metricUid in metrics) {
            let metric = metrics[metricUid];
            _this.log('Sending metric info to observer',  { observerId: observerInfo.observerId, metricUid: metric.metricDescriptor.metricInfo.metricUid });
            socket.emit('registerMetric', metric.metricDescriptor);
          }
          setTimeout(function() {
            _this.log('Sending metrics data to observer');
            for (let metricUid in metrics) {
              let metric = metrics[metricUid];
              if (metric.metricData) {
                _this.log('Sending metric data to observer',  { observerId: observerInfo.observerId, metricUid: metric.metricDescriptor.metricInfo.metricUid });
                socket.emit('metricData', metric.metricData);
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

    _this.log('Backend listening on port ' + _this.dashboardConfig.backEndPort);

    // Front end

    _this.log('Starting dashboard server');

    if (_this.dashboardConfig.httpAuth) {
      app.get('/', function (req, res, next) {
        const user = basicAuth(req);
        if (!user || !user.name || !user.pass) {
          res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
          return res.sendStatus(401);
        }
        if ((user.name === _this.dashboardConfig.httpAuth.login) && (user.pass === _this.dashboardConfig.httpAuth.password)) {
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
          return { backendUrl: "${_this.dashboardConfig.backEndUrl}" };
        });
      `;
      res.setHeader('Content-Type', 'text/javascript');
      res.setHeader('Content-Length', body.length);
      res.end(body);
    });

    app.use(express.static(__dirname + '/www'));

    app.listen(_this.dashboardConfig.frontEndPort);

    _this.log(`Dashboard listening on port ${_this.dashboardConfig.frontEndPort}`);

    // Hub

    hubServer.on('connect', function () {
      _this.log(`Connected to hub`);
      _this.log('Registering as observer');
      hubServer.emit('registerObserver');
    });
    hubServer.on('observerRegistered', function () {
      _this.log('Observer registration acknowledged');
      for(let observerId in observers) {
        observers[observerId].socket.emit('hubOnline');
      }
    });
    hubServer.on('registerMetric', function (metricDescriptor) {
      _this.log('Metric registered', { metricUid: metricDescriptor.metricInfo.metricUid });
      metrics[metricDescriptor.metricInfo.metricUid] = { metricDescriptor: metricDescriptor };
      for(let observerId in observers) {
        observers[observerId].socket.emit('registerMetric', metricDescriptor);
      }
    });
    hubServer.on('metricData', function (data) {
      let metric = metrics[data.metricUid];
      if (metric) {
        metric.metricData = data.metricData;
        for (let observerId in observers) {
          observers[observerId].socket.emit('metricData', data);
        }
      }
    });
    hubServer.on('unregisterMetric', function (metricDescriptor) {
      let metric = metrics[metricDescriptor.metricInfo.metricUid];
      delete metrics[metricDescriptor.metricInfo.metricUid];
      if (metric) {
        _this.log('Metric disconnected', { metricUid: metric.metricDescriptor.metricInfo.metricUid });
        _this.log('Informing observers about metric disconnection',  { metricUid: metric.metricDescriptor.metricInfo.metricUid });
        for(let observerId in observers) {
          let observer = observers[observerId];
          _this.log('Informing observer about metric disconnection',  { observerId: observer.observerInfo.observerId, metricUid: metric.metricDescriptor.metricInfo.metricUid });
          observer.socket.emit('unregisterMetric', metricDescriptor);
        }
      }
    });
    hubServer.on('disconnect', function(data) {
      _this.log('Disconnected from hub');
      _this.log('Informing observers about metric disconnection');
      for(let observerId in observers) {
        let observer = observers[observerId];
        for(let metricUid in metrics) {
          let metric = metrics[metricUid];
          delete metrics[metricUid];
          _this.log('Informing observer about metric disconnection',  { observerId: observer.observerInfo.observerId, metricUid: metric.metricDescriptor.metricInfo.metricUid });
          observer.socket.emit('unregisterMetric', metric.metricDescriptor);
        }
        observer.socket.emit('hubOffline');
      }
    });

  }

}

module.exports = MonitoringDashboard;