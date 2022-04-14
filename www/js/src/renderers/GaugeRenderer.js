/* global CustomRenderer */
/* global c3 */

class GaugeRenderer extends CustomRenderer {
  constructor(container, metricDescriptor, settings) {
    super(container, metricDescriptor, settings);

    const _this = this;

    const bodyTemplate = Handlebars.compile(`
      <div class="chart">
      </div>
    `);

    _this.widgetContainer.find('.widget-body').append(bodyTemplate());

    let min = (this.metricDescriptor.metricConfig.suggestedMin ? this.metricDescriptor.metricConfig.suggestedMin : (this.metricDescriptor.metricConfig.min ? this.metricDescriptor.metricConfig.min : 0));
    let max = (this.metricDescriptor.metricConfig.suggestedMax ? this.metricDescriptor.metricConfig.suggestedMax : (this.metricDescriptor.metricConfig.max ? this.metricDescriptor.metricConfig.max : 100));

    _this.control_Chart = _this.widgetContainer.find('.widget-body').find('.chart');

    _this.valueName = _this.metricDescriptor.metricInfo.metricName;

    _this.chart = c3.generate({
      bindto: _this.control_Chart[0],
      data: {
        columns: [],
        type: 'gauge',
        labels: false,
      },
      gauge: {
        label: {
          show: false,
        },
        min: min,
        max: max,
        units: ' %',
      },
      size: {
        height: 280,
      },
      transition: {
        duration: 0,
      },
      legend: {
        show: false
      }
    });
  }

  getColor(index, value) {
    const _this = this;

    if (_this.metricDescriptor.metricConfig.ranges) {
      for (let i = _this.metricDescriptor.metricConfig.ranges.length - 1; i >= 0; i--) {
        if (value >= _this.metricDescriptor.metricConfig.ranges[i].value) {
          return _this.metricDescriptor.metricConfig.ranges[i].lineColor;
        }
      }
    }

    return _this.metricDescriptor.metricConfig.lineColor;
  }

  draw(columns, colors) {
    const _this = this;

    _this.chart.load({
      columns: columns,
      colors: colors
    });
  }

  pushData(data) {
    super.pushData(data);

    const _this = this;

    let colors = {};
    let columns = [];
    for (let i = 0; i < 1; i++) {
      let value = [];
      value.push(_this.metricDescriptor.metricConfig.datasets[i]);
      value.push(data.points[i]);
      columns.push(value);
      colors[_this.metricDescriptor.metricConfig.datasets[i]] = _this.getColor(i, data.points[i]);
    }
    if (data.values && (data.values.length > 0)) {
      _this.requestAnimationFrame(function() {
        _this.draw(columns, colors);
      });
    }
  }
}

if (typeof module !== 'undefined' && module.exports) module.exports = GaugeRenderer; else window.GaugeRenderer = GaugeRenderer;
