$(function() {

  function log(s) {
    if (typeof(console) != 'undefined') {
      for(let i in arguments) {
        // console.log(arguments[i]);
      }
    }
  }

  function Sensor(sensorInfo) {

    const __this = this;

    let __renderers = {};

    let __isRemoved = false;

    __this.init = function() {
      return new Promise(function(resolve, response) {
        let promises = sensorInfo.metricsList.map(function(metricInfo) {
          return new Promise(function(resolve, reject) {
            if (metricInfo.rendererName) {
              requirejs(['js/renderers/Renderer_' + metricInfo.rendererName], function(create) {
                if (!__this.isRemoved()) {
                  let container = $('div.widgets-container');
                  let renderer = new create(container, sensorInfo, metricInfo);
                  __renderers[metricInfo.uid] = renderer;
                }
                resolve();
              });
            } else {
              log('Outdated sensor or metric');
              log('Sensor', sensorInfo);
              log('Metric', metricInfo);
            }
          });
        });

        Promise.all(promises).then(function() {
          $('div.widgets-container').sortable();
          resolve();
        });
      });
    };

    __this.pushData = function(data) {
      let renderer = __renderers[data.metricInfo.uid];
      if (renderer) {
        renderer.pushData(data.metricData);
      }
    };

    __this.isRemoved = function() {
      return __isRemoved;
    };

    __this.remove = function() {
      for(let id in __renderers) {
        let renderer = __renderers[id];
        renderer.remove();
      }
      __isRemoved = true;
    };

    return __this;

  }

  const hubUrl = config.hubUrl;

  let sensors = {};

  const dataServer = io.connect(hubUrl, { reconnect: true });
  dataServer.on('connect', function (data) {
    log('connect');
    dataServer.emit('registerObserver');
  });
  dataServer.on('sensorRegistered', function (data) {
    log('sensorRegistered', data);
    let sensor = sensors[data.sensorInfo.id];
    if (!sensor) {
      let sensor = new Sensor(data.sensorInfo);
      sensors[data.sensorInfo.id] = sensor;
      sensor.init().then(function() {
        filter();
        if (sensor.isRemoved()) {
          sensor.remove();
        }
      });
    }
  });
  dataServer.on('sensorUnregistered', function (data) {
    log('sensorUnregistered', data);
    let sensor = sensors[data.sensorInfo.id];
    if (sensor) {
      log(sensor);
      sensor.remove();
    }
  });
  dataServer.on('disconnect', function(data) {
    log('disconnect', data);
    for(let id in sensors) {
      sensors[id].remove();
    }
    sensors = {};
  });
  dataServer.on('error', function(data) {
    log('error', data);
  });
  dataServer.on('sensorData', function (data) {
    // log('sensorData', data);
    let sensor = sensors[data.sensorInfo.id];
    if (sensor) {
      sensor.pushData(data);
    }
  });

  function filter() {
    let keyword = $('.action-search').val().toLowerCase();
    $('.widget').each(function() {
      let header = $('.widget-header', $(this)).text().toLowerCase();
      if (header.indexOf(keyword) == -1) {
        $(this).hide();
      } else {
        $(this).show();
      }
    });
  }

  $('.action-clear-search').on('click', function() {
    $('.action-search').val('');
    filter();
  });

  $('.action-search').on('keyup', function() {
    filter();
  });

  $('body').on('click', '.action-close', function() {
    if (confirm('Do you want to hide this widget?')) {
      $(this).closest('div.widget').hide();
    }
  });

  $('body').on('click', '.action-expand', function() {
    const widget = $(this).closest('div.widget');
    if (widget.hasClass('widget-card')) {
      $(this).closest('div.widget').addClass('widget-wide').removeClass('widget-card');
      $(this).text('<');
    } else {
      $(this).closest('div.widget').addClass('widget-card').removeClass('widget-wide');
      $(this).text('>');
    }
  });

});