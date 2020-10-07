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
      , refreshInterval: 1000
      , rendererName: 'Chart'
      },
      { name: 'CPU'
      , refreshInterval: 1000
      , rendererName: 'Chart'
      , settings: {
          processes: 'php,node'
        }
      },
      { name: 'CPU'
      , rendererName: 'Value'
      , refreshInterval: 1000
      },
      { name: 'CPU'
      , rendererName: 'Value'
      , refreshInterval: 1000
      , settings: {
          processes: 'php,node'
        }
      },
      { name: 'CPU'
      , refreshInterval: 1000
      , rendererName: 'Table'
      },
      { name: 'CPU'
      , refreshInterval: 1000
      , rendererName: 'Table'
      , settings: {
          processes: 'php,node'
        }
      },
      // RAM
      { name: 'RAM'
      , rendererName: 'Chart'
      , refreshInterval: 1000
      },
      { name: 'RAM'
      , rendererName: 'Value'
      , refreshInterval: 1000
      },
      { name: 'RAM'
      , rendererName: 'Table'
      , refreshInterval: 1000
      },
      // LA
      { name: 'LA'
      , rendererName: 'Chart'
      , refreshInterval: 1000
      },
      { name: 'LA'
      , rendererName: 'Value'
      , refreshInterval: 1000
      },
      { name: 'LA'
      , rendererName: 'Table'
      , refreshInterval: 1000
      },
      // Processes
      { name: 'Processes'
      , rendererName: 'Chart'
      , refreshInterval: 5000
      },
      { name: 'Processes'
      , rendererName: 'Value'
      , refreshInterval: 5000
      },
      { name: 'Processes'
      , rendererName: 'Table'
      , refreshInterval: 5000
      },
      { name: 'Processes'
      , rendererName: 'Chart'
      , refreshInterval: 5000
      , settings: {
          processes: 'php,node'
        }
      },
      { name: 'Processes'
      , rendererName: 'Value'
      , refreshInterval: 5000
      , settings: {
          processes: 'php,node'
        }
      },
      { name: 'Processes'
      , rendererName: 'Table'
      , refreshInterval: 5000
      , settings: {
          processes: 'php,node'
        }
      },
      // HDD
      { name: 'HDD'
      , rendererName: 'Chart'
      , refreshInterval: 1000
      },
      { name: 'HDD'
      , refreshInterval: 1000
      , rendererName: 'Table'
      },
      { name: 'HDD'
      , refreshInterval: 1000
      , rendererName: 'Value'
      },
      { name: 'HDD'
      , refreshInterval: 1000
      , rendererName: 'Chart'
      , settings: {
          mounts: '/System/Volumes/Data'
        , threshold: 80
        }
      },
      { name: 'HDD'
      , refreshInterval: 1000
      , rendererName: 'Table'
      , settings: {
          mounts: '/System/Volumes/Data'
        }
      },
      { name: 'HDD'
      , refreshInterval: 1000
      , rendererName: 'Value'
      , settings: {
          mounts: '/System/Volumes/Data'
        }
      },
      // MySQLProcesses
      { name: 'MySQLProcesses'
      , refreshInterval: 5000
      , rendererName: 'Chart'
      , settings: {
          host: 'localhost'
        , user: 'root'
        , password: ''
        }
      },
      { name: 'MySQLProcesses'
      , refreshInterval: 5000
      , rendererName: 'Table'
      , settings: {
          host: 'localhost'
        , user: 'root'
        , password: ''
        }
      },
      { name: 'MySQLProcesses'
      , refreshInterval: 5000
      , rendererName: 'Value'
      , settings: {
          host: 'localhost'
        , user: 'root'
        , password: ''
        }
      },
      // Jenkins
      { name: 'Jenkins'
      , refreshInterval: 5000
      , rendererName: 'Chart'
      , settings: {
          apiUrl: 'http://localhost:8080'
        }
      },
      { name: 'Jenkins'
      , refreshInterval: 5000
      , rendererName: 'Table'
      , settings: {
          apiUrl: 'http://localhost:8080'
        }
      },
      { name: 'Jenkins'
      , refreshInterval: 5000
      , rendererName: 'Value'
      , settings: {
          apiUrl: 'http://localhost:8080'
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

