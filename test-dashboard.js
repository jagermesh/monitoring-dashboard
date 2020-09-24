const MonitoringDashboard = require(__dirname + '/index.js');

const config = {
  dashboard: {
    listenOnPort:        8083
  , hubUrl: 'http://localhost:8081'
  }
};

const dashboard = new MonitoringDashboard(config.dashboard);
