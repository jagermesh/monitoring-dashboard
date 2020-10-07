const MonitoringDashboard = require(__dirname + '/index.js');

const config = {
  dashboard: {
    backEndPort: 8081,
    frontEndPort: 8083,
    backEndUrl: 'http://localhost:8081',
    hubUrl: 'http://localhost:8082',
  }
};

const dashboard = new MonitoringDashboard(config.dashboard);

dashboard.start();
