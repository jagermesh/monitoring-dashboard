/* global CustomRenderer */
/* global c3 */

class GaugeRenderer extends CustomRenderer {
  constructor(container, metricDescriptor, settings) {
    super(container, metricDescriptor, settings);

    const bodyTemplate = Handlebars.compile(`
      <div class="chart">
      </div>
    `);

    this.widgetContainer.find('.widget-body').append(bodyTemplate());

    let min = (this.metricDescriptor.metricConfig.suggestedMin ? this.metricDescriptor.metricConfig.suggestedMin : (this.metricDescriptor.metricConfig.min ? this.metricDescriptor.metricConfig.min : 0));
    let max = (this.metricDescriptor.metricConfig.suggestedMax ? this.metricDescriptor.metricConfig.suggestedMax : (this.metricDescriptor.metricConfig.max ? this.metricDescriptor.metricConfig.max : 100));

    this.control_Chart = this.widgetContainer.find('.widget-body').find('.chart');

    this.valueName = this.metricDescriptor.metricInfo.metricName;

    this.chart = c3.generate({
      bindto: this.control_Chart[0],
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
        show: false,
      },
    });
  }

  getColor(index, value) {
    if (this.metricDescriptor.metricConfig.ranges) {
      for (let i = this.metricDescriptor.metricConfig.ranges.length - 1; i >= 0; i--) {
        if (value >= this.metricDescriptor.metricConfig.ranges[i].value) {
          return this.metricDescriptor.metricConfig.ranges[i].lineColor;
        }
      }
    }

    return this.metricDescriptor.metricConfig.lineColor;
  }

  draw(columns, colors) {
    this.chart.load({
      columns: columns,
      colors: colors,
    });
  }

  pushData(data) {
    super.pushData(data);

    let colors = {};
    let columns = [];
    for (let i = 0; i < 1; i++) {
      let value = [];
      value.push(this.metricDescriptor.metricConfig.datasets[i]);
      value.push(data.points[i]);
      columns.push(value);
      colors[this.metricDescriptor.metricConfig.datasets[i]] = this.getColor(i, data.points[i]);
    }
    if (data.values && (data.values.length > 0)) {
      this.requestAnimationFrame(() => {
        this.draw(columns, colors);
      });
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = GaugeRenderer;
} else {
  window.GaugeRenderer = GaugeRenderer;
}
