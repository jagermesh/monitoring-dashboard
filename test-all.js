const MonitoringHub        = require('monitoring-hub');
const MonitoringDashboard  = require(__dirname + '/index.js');
const { MonitoringSensor } = require('monitoring-sensor');
const ProgressLogger       = require('monitoring-progress-logger');

const config = {
  hub: {
    hubPort: 8082
  }
, dashboard: {
    backEndPort: 8081
  , frontEndPort: 8083
  , backEndUrl: 'http://localhost:8081'
  , hubUrl: 'http://localhost:8082'
  }
, sensor: {
    hubUrl: 'http://localhost:8082'
  , metrics: [
      // CPU
      { name: 'CPU'
      , rendererName: 'Chart,Value,Table,Gauge'
      },
      { name: 'CPU'
      , rendererName: 'Chart,Value,Table,Gauge'
      , settings: {
          processes: 'php,node'
        }
      },
      // RAM
      { name: 'RAM'
      , rendererName: 'Chart,Value,Table,Gauge'
      },
      // LA
      { name: 'LA'
      , rendererName: 'Chart,Value,Table,Gauge'
      },
      // Processes
      { name: 'Processes'
      , rendererName: 'Chart,Value,Table'
      },
      { name: 'Processes'
      , rendererName: 'Chart,Value,Table'
      , settings: {
          processes: 'php,node'
        }
      },
      // HDD
      { name: 'HDD'
      , rendererName: 'Chart,Value,Table'
      },
      { name: 'HDD'
      , rendererName: 'Chart,Value,Table'
      , settings: {
          mounts: '/System/Volumes/Data'
        , threshold: 80
        }
      },
      // Jenkins
      { name: 'Jenkins'
      , rendererName: 'Chart,Value,Table'
      , settings: {
          apiUrl: 'http://localhost:8080/job/project/',
          username: 'admin',
          password: '11acff4a9f050afc3787c908c0812c3c8d',
        }
      },
      // MySQLProcesses
      { name: 'MySQLProcesses'
      , rendererName: 'Chart,Value,Table'
      , settings: {
          host: 'localhost'
        , user: 'root'
        , password: ''
        }
      },
      // MySQL
      { name: 'MySQL'
      , rendererName: 'Chart,Value,Table'
      , settings: {
          host: 'localhost',
          user: 'root',
          password: '',
          database: '',
          sql: 'SHOW PROCESSLIST',
          description: 'MySQL Process List'
        }
      },
    ]
  }
};

const hub       = new MonitoringHub(config.hub);
const dashboard = new MonitoringDashboard(config.dashboard);
const sensor    = new MonitoringSensor(config.sensor);

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
  const progressLogger = new ProgressLogger(config.sensor.hubUrl);
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
      loggerOperation12.current++;
      loggerOperation22.current++;
      await sleep(timeout);
    }
    loggerOperation11.current++;
    loggerOperation21.current++;
    await sleep(timeout);
  }
  loggerSession1.finish();
  loggerSession2.finish();
})();

