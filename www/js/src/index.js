$(function() {
  requirejs(['js/config.js'], function(config) {
    const backEndUrl = config.backendUrl;

    let widgetsContainer = $('div.widgets-container');

    function log(s) {
      if (typeof(console) != 'undefined') {
        for(let i in arguments) {
          // console.log(arguments[i]);
        }
      }
    }

    const renderers = { LineChart:       Renderer_LineChart
                      , FilledLineChart: Renderer_FilledLineChart
                      , Progress:        Renderer_Progress
                      , Table:           Renderer_Table
                      };

    let widgets = [];
    let metrics = {};

    function registerSensor(sensorInfo) {
      sensorInfo.metricsList.map(function(metricInfo) {
        if (!metrics[metricInfo.uid]) {
          if (metricInfo.rendererName && renderers[metricInfo.rendererName]) {
            let widget = new renderers[metricInfo.rendererName](widgetsContainer, sensorInfo, metricInfo);
            widgets.push(widget);
            metrics[metricInfo.uid] = widget;
          }
        }
      });
    }

    function pushData(metricUid, metricData) {
      let metric = metrics[metricUid];
      if (metric) {
        metric.__pushData(metricData);
      }
    }

    function removeSensor(sensorUid) {
      widgets = widgets.filter(function(widget) {
        if (widget.__sensorUid == sensorUid) {
          widget.remove();
          delete metrics[widget.__metricUid];
          return false;
        }
        return true;
      });
    }

    function removeAllSensors() {
      widgets = widgets.filter(function(widget) {
        widget.remove();
        delete metrics[widget.__metricUid];
        return false;
      });
    }

    function indicateHubStatus(connected) {
      if (connected) {
        $('#connectionStatus').removeClass('hub-disconnected').addClass('hub-connected');
      } else {
        $('#connectionStatus').removeClass('hub-connected').addClass('hub-disconnected');
      }
    }

    const dataServer = io.connect(backEndUrl, { reconnect: true });

    dataServer.on('connect', function () {
      log('connect');
      dataServer.emit('registerObserver');
    });
    dataServer.on('hubOnline', function () {
      log('online');
      indicateHubStatus(true);
    });
    dataServer.on('hubOffline', function () {
      log('offline');
      indicateHubStatus(false);
    });
    dataServer.on('sensorRegistered', function (data) {
      log('sensorRegistered', data);
      registerSensor(data.sensorInfo);
      filter();
    });
    dataServer.on('sensorUnregistered', function (data) {
      log('sensorUnregistered', data);
      window.setTimeout(function() {
        removeSensor(data.sensorInfo.sensorUid);
      });
    });
    dataServer.on('sensorData', function (data) {
      // console.log(data);
      pushData(data.metricUid, data.metricData);
    });
    dataServer.on('disconnect', function(data) {
      log('disconnect', data);
      indicateHubStatus(false);
      removeAllSensors();
    });

    function filter() {
      let keyword = $('.action-search').val().toLowerCase();
      let rendererName = $('.action-filter-by-renderer-type.active').attr('data-renderer-type');
      console.log(rendererName);
      $('#mainContainer .widget').each(function() {
        let scope = $('.widget-header', $(this)).text().toLowerCase() + ' ' + $('.widget-footer', $(this)).text().toLowerCase();
        if (scope.indexOf(keyword) == -1) {
          $(this).hide();
        } else {
          let currentRendererName = $(this).attr('data-renderer-type');
          if ((rendererName.length === 0) || (currentRendererName == rendererName)) {
            $(this).show();
          } else {
            $(this).hide();
          }
        }
      });
    }

    $('.action-clear-search').on('click', function() {
      $('.action-search').val('');
      filter();
    });

    $('.action-filter-by-renderer-type').on('click', function() {
      window.setTimeout(function() {
        filter();
      });
    });

    $('.action-search').on('keyup', function() {
      filter();
    });

    $('#mainContainer').on('click', '.widget .widget-action-close', function(event) {
      let widget = $(this).closest('.widget');
      widget.removeClass('widget-detached');
      $('body').removeClass('widget-detached-activated');
      event.stopPropagation();
    });

    $('#mainContainer').on('click', '.widget', function() {
      let widget = $(this).closest('.widget');
      widget.addClass('widget-detached');
      $('body').addClass('widget-detached-activated');
    });

    $('#backDrop').on('click', function() {
      $('.widget-detached').removeClass('widget-detached');
      $('body').removeClass('widget-detached-activated');
    });

  });
});