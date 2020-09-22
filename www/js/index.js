$(function() {

  const hubUrl = config.hubUrl;

  let widgetsContainer = $('div.widgets-container');

  function log(s) {
    if (typeof(console) != 'undefined') {
      for(let i in arguments) {
        // console.log(arguments[i]);
      }
    }
  }

  const renderers = { LineChart: Renderer_LineChart
                    , Progress:  Renderer_Progress
                    , Table:     Renderer_Table
                    };

  let widgets = [];
  let metrics = {};

  function registerSensor(sensorInfo) {
    sensorInfo.metricsList.map(function(metricInfo) {
      if (metricInfo.rendererName && renderers[metricInfo.rendererName]) {
        let widget = new renderers[metricInfo.rendererName](widgetsContainer, sensorInfo, metricInfo);
        widgets.push(widget);
        metrics[metricInfo.uid] = widget;
      }
    });
  }

  function pushData(metricUid, metricData) {
    metrics[metricUid].__pushData(metricData);
  }

  function removeSensor(sensorId) {
    widgets = widgets.filter(function(widget) {
      if (widget.__sensorId == sensorId) {
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

  const dataServer = io.connect(hubUrl, { reconnect: true });

  dataServer.on('connect', function () {
    log('connect');
    dataServer.emit('registerObserver');
  });

  dataServer.on('sensorRegistered', function (data) {
    log('sensorRegistered', data);
    registerSensor(data.sensorInfo);
  });

  dataServer.on('sensorUnregistered', function (data) {
    log('sensorUnregistered', data);
    window.setTimeout(function() {
      removeSensor(data.sensorInfo.id);
    });
  });

  dataServer.on('disconnect', function(data) {
    log('disconnect', data);
    removeAllSensors();
  });

  dataServer.on('error', function(data) {
    log('error', data);
  });

  dataServer.on('sensorData', function (data) {
    pushData(data.metricInfo.uid, data.metricData);
  });

  function filter() {
    let keyword = $('.action-search').val().toLowerCase();
    $('#mainContainer .widget').each(function() {
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