/* global MonitoringSensorConfig */
/* global ChartRenderer_ChartJS */
/* global ChartRenderer_C3 */
/* global ProgressRenderer */
/* global TableRenderer */
/* global ValueRenderer */
/* global GaugeRenderer */
/* global io */

$(() => {
  let config = MonitoringSensorConfig();

  function getTheme() {
    return $('body').attr('data-theme');
  }

  const backEndUrl = config.backendUrl;

  let widgetsContainer = $('div.widgets-container');

  const renderers = {
    Chart: (document.location.search.indexOf('c3') === -1 ? ChartRenderer_ChartJS : ChartRenderer_C3),
    Progress: ProgressRenderer,
    Table: TableRenderer,
    Value: ValueRenderer,
    Gauge: GaugeRenderer,
  };

  let widgets = [];

  function registerMetric(metricDescriptor) {
    if (metricDescriptor.metricInfo.metricRenderer) {
      const metricRenderers = metricDescriptor.metricInfo.metricRenderer.split(',');
      metricRenderers.map((metricRenderer) => {
        if (renderers[metricRenderer]) {
          const metricDescriptorCopy = JSON.parse(JSON.stringify(metricDescriptor));
          metricDescriptorCopy.metricInfo.metricRenderer = metricRenderer;
          let existingWidgets = widgets.filter((widget) => {
            return (
              (widget.metricDescriptor.metricInfo.metricUid === metricDescriptorCopy.metricInfo.metricUid) &&
              (widget.metricDescriptor.metricInfo.metricRenderer === metricDescriptorCopy.metricInfo.metricRenderer)
            );
          });
          if (existingWidgets.length === 0) {
            let widget = new renderers[metricRenderer](widgetsContainer, metricDescriptorCopy, {
              theme: getTheme(),
            });
            widgets.push(widget);
          }
        }
      });
    }
  }

  function pushData(metricUid, metricData) {
    widgets.map((widget) => {
      if (widget.metricDescriptor.metricInfo.metricUid == metricUid) {
        widget.pushData(metricData);
      }
    });
  }

  function removeMetric(metricUid) {
    widgets = widgets.filter((widget) => {
      if (widget.metricDescriptor.metricInfo.metricUid == metricUid) {
        widget.remove();
        return false;
      }
      return true;
    });
  }

  function removeAllMetrics() {
    widgets = widgets.filter((widget) => {
      widget.remove();
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

  const dataServer = io.connect(backEndUrl, {
    reconnect: true,
  });

  dataServer.on('connect', () => {
    dataServer.emit('registerObserver');
  });

  dataServer.on('hubOnline', () => {
    indicateHubStatus(true);
  });

  dataServer.on('hubOffline', () => {
    indicateHubStatus(false);
  });

  dataServer.on('registerMetric', (metricDescriptor) => {
    registerMetric(metricDescriptor);
    filter();
  });

  dataServer.on('unregisterMetric', (metricDescriptor) => {
    removeMetric(metricDescriptor.metricInfo.metricUid);
  });

  dataServer.on('metricData', (data) => {
    pushData(data.metricUid, data.metricData);
  });

  dataServer.on('disconnect', () => {
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

  $('.action-clear-search').on('click', () => {
    $('.action-search').val('');
    filter();
  });

  $('.action-filter-by-renderer-name').on('click', () => {
    window.setTimeout(() => {
      filter();
    });
  });

  $('.action-search').on('keyup', () => {
    filter();
  });

  $('.action-switch-theme').on('click', function() {
    $('.action-switch-theme').removeClass('active');
    $(this).addClass('active');
    $('body').attr('data-theme', $(this).attr('data-theme'));
    widgets.map((widget) => {
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
