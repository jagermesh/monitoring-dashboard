$(function() {
  requirejs(['js/config.js'], function(config) {

    function getTheme() {
      return $('body').attr('data-theme');
    }

    const backEndUrl = config.backendUrl;

    let widgetsContainer = $('div.widgets-container');

    function log(s) {
      if (typeof(console) != 'undefined') {
        for(let i in arguments) {
          // console.log(arguments[i]);
        }
      }
    }

    const renderers = {
        Chart:    ChartRenderer
      , Progress: ProgressRenderer
      , Table:    TableRenderer
      , Value:    ValueRenderer
    };

    let widgets = [];
    let metrics = {};

    function registerMetric(metricDescriptor) {
      let metric = metrics[metricDescriptor.metricInfo.metricUid];
      if (!metric) {
        if (metricDescriptor.metricInfo.metricRenderer && renderers[metricDescriptor.metricInfo.metricRenderer]) {
          const widget = new renderers[metricDescriptor.metricInfo.metricRenderer](widgetsContainer, metricDescriptor, { theme: getTheme() });
          widgets.push(widget);
          metrics[metricDescriptor.metricInfo.metricUid] = widget;
        }
      }
    }

    function pushData(metricUid, metricData) {
      let metric = metrics[metricUid];
      if (metric) {
        metric.pushData(metricData);
      }
    }

    function removeMetric(metricDescriptor) {
      widgets = widgets.filter(function(widget) {
        if (widget.metricUid == metricDescriptor.metricInfo.metricUid) {
          widget.remove();
          delete metrics[widget.metricUid];
          return false;
        }
        return true;
      });
    }

    function removeAllMetrics() {
      widgets = widgets.filter(function(widget) {
        widget.remove();
        delete metrics[widget.metricUid];
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
    dataServer.on('registerMetric', function (metricDescriptor) {
      log('registerMetric', metricDescriptor);
      registerMetric(metricDescriptor);
      filter();
    });
    dataServer.on('unregisterMetric', function (metricDescriptor) {
      log('unregisterMetric', metricDescriptor);
      removeMetric(metricDescriptor);
    });
    dataServer.on('metricData', function (data) {
      log(data);
      pushData(data.metricUid, data.metricData);
    });
    dataServer.on('disconnect', function() {
      log('disconnect');
      indicateHubStatus(false);
      removeAllMetrics();
    });

    function filter() {
      let keyword = $('.action-search').val().toLowerCase();
      let rendererName = $('.action-filter-by-renderer-name.active').attr('data-renderer-name');
      $('#mainContainer .widget').each(function() {
        let scope = $('.widget-header', $(this)).text().toLowerCase() + ' ' + $('.widget-footer', $(this)).text().toLowerCase();
        if (scope.indexOf(keyword) == -1) {
          $(this).hide();
        } else {
          let currentRendererName = $(this).attr('data-renderer-name');
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

    $('.action-filter-by-renderer-name').on('click', function() {
      window.setTimeout(function() {
        filter();
      });
    });

    $('.action-search').on('keyup', function() {
      filter();
    });

    $('.action-switch-theme').on('click', function() {
      $('.action-switch-theme').removeClass('active');
      $(this).addClass('active');
      $('body').attr('data-theme', $(this).attr('data-theme'));
      widgets.map(function(widget) {
        widget.setTheme(getTheme());
      });
    });

    $('#mainContainer').on('click', '.widget .widget-action-close', function(event) {
      let widget = $(this).closest('.widget');
      widget.removeClass('widget-detached');
      $('body').removeClass('widget-detached-activated');
      event.stopPropagation();
    });

    $('#mainContainer').on('click', '.widget', function(event) {
      if (event.target && (event.target.tagName !== 'A')) {
        let widget = $(this).closest('.widget');
        widget.addClass('widget-detached');
        $('body').addClass('widget-detached-activated');
      }
    });

    $('#backDrop').on('click', function() {
      $('.widget-detached').removeClass('widget-detached');
      $('body').removeClass('widget-detached-activated');
    });

  });
});