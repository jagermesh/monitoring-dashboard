const MonitoringHub       = require('monitoring-hub');
const MonitoringDashboard = require(__dirname + '/index.js');
const MonitoringSensor    = require('monitoring-sensor');
const ProgressLogger      = require('monitoring-progress-logger');

const config = {
  hub: {
    listenSensorsOnPort: 8082
  , listenWebOnPort:     8081
  }
, dashboard: {
    listenOnPort:        8083
  , hubUrl: 'http://localhost:8081'
  }
, sensor: {
    hubUrl: 'http://localhost:8082'
  , metrics: [
       { name: 'LA'
       }
     , { name: 'ProcessList'
       }
    ]
  }
};

const hub = new MonitoringHub(config.hub);
const dashboard = new MonitoringDashboard(config.dashboard);
const sensor = new MonitoringSensor(config.sensor);

hub.start();
dashboard.start();
sensor.start();


function sleep(delay) {
  return new Promise(function(resolve) {
    setTimeout(resolve, delay);
  });
}

(async function() {
  const op1max = 20000;
  const op2max = 120;
  const timeout = 100;
  const progressLogger = new ProgressLogger();
  const loggerSession1 = progressLogger.createSession('Testing progress (1)');
  const loggerSession2 = progressLogger.createSession('Testing progress (2)');
  const loggerOperation11 = loggerSession1.createOperation('Main task (1)');
  const loggerOperation12 = loggerSession1.createOperation('Sub task (1)');
  const loggerOperation21 = loggerSession2.createOperation('Main task (2)');
  const loggerOperation22 = loggerSession2.createOperation('Sub task (2)');
  loggerOperation11.start(op1max);
  loggerOperation21.start(op1max);
  for(let i1 = 0; i1 < op1max; i1++) {
    loggerOperation12.start(op2max);
    loggerOperation22.start(op2max);
    for(let i2 = 0; i2 < op2max; i2++) {
      loggerOperation12.step();
      loggerOperation22.step();
      await sleep(timeout);
    }
    loggerOperation11.step();
    loggerOperation21.step();
    await sleep(timeout);
  }
  loggerSession1.finish();
  loggerSession2.finish();
})();

