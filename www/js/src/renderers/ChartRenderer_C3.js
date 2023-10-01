/* global CustomRenderer */
/* global c3 */
/* global moment */

class ChartRenderer_C3 extends CustomRenderer {
  constructor(container, metricDescriptor, settings) {
    super(container, metricDescriptor, settings);

    const bodyTemplate = Handlebars.compile(`
      <div class="chart">
      </div>
    `);

    this.widgetContainer.find('.widget-body').append(bodyTemplate());

    this.control_Chart = this.widgetContainer.find('.widget-body').find('.chart');

    this.maxPeriod = 20;

    this.statData = [];

    this.colors = ['aqua', 'burlywood', 'deepskyblue', 'mediumslateblue', 'beige', 'honeydew', 'honeydew', 'paleturquoise'];

    this.valueName = this.metricDescriptor.metricInfo.metricName;

    const isMultipleDataSets = (this.metricDescriptor.metricConfig.datasets.length > 1);
    const dataTypes = {};
    this.metricDescriptor.metricConfig.datasets.map((dataset, index) => {
      dataTypes[dataset] = (index === 0 ? 'area-spline' : 'spline');
    });

    this.chart = c3.generate({
      bindto: this.control_Chart[0],
      data: {
        x: 'timestamp',
        xFormat: '%Y-%m-%d %H:%M:%S',
        columns: [
          // ['timestamp', moment().format('YYYY-MM-DD HH:mm:ss')],
        ],
        labels: false,
        types: dataTypes,
      },
      size: {
        height: 280,
      },
      transition: {
        duration: 0,
      },
      legend: {
        show: isMultipleDataSets,
      },
      axis: {
        x: {
          type: 'timeseries',
          tick: {
            format: '%H:%M:%S',
          },
          show: false,
        },
      },
      grid: {
        x: {
          show: true,
        },
        y: {
          show: true,
        },
      },
    });
  }

  getAvaialbleColor(index) {
    if (index >= this.colors.length) {
      const r = Math.floor(Math.random() * 255);
      const g = Math.floor(Math.random() * 255);
      const b = Math.floor(Math.random() * 255);
      return `rgb(${r},${g},${b})`;
    } else {
      return this.colors[index];
    }
  }

  getColor(index, value) {
    if (this.metricDescriptor.metricConfig.ranges) {
      for (let i = this.metricDescriptor.metricConfig.ranges.length - 1; i >= 0; i--) {
        if (value >= this.metricDescriptor.metricConfig.ranges[i].value) {
          return this.metricDescriptor.metricConfig.ranges[i].lineColor;
        }
      }
    }

    return (index === 0 ? this.metricDescriptor.metricConfig.lineColor : this.getAvaialbleColor(index - 1));
  }

  draw(columns, colors) {
    this.chart.load({
      columns: columns,
      colors: colors,
    });
  }

  pushData(data) {
    super.pushData(data);

    while (this.statData.length > this.maxPeriod) {
      this.statData = this.statData.slice(1);
    }
    this.statData.push({
      x: moment().format('YYYY-MM-DD HH:mm:ss'),
      values: data.points,
    });

    // let colors = {};
    let columns = [];
    let colors = {};

    let timeStampData = ['timestamp'];
    this.statData.map((data) => {
      timeStampData.push(data.x);
    });
    columns.push(timeStampData);

    this.metricDescriptor.metricConfig.datasets.map((dataset, index) => {
      let columnData = [dataset];
      let last = 0;
      this.statData.map((data) => {
        last = data.values[index];
        columnData.push(last);
      });
      columns.push(columnData);
      colors[dataset] = this.getColor(index, last);
    });

    this.requestAnimationFrame(() => {
      this.draw(columns, colors);
    });
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ChartRenderer_C3;
} else {
  window.ChartRenderer_C3 = ChartRenderer_C3;
}
