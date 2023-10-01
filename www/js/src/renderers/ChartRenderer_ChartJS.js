/* global CustomRenderer */
/* global RGBColor */
/* global Chart */

class ChartRenderer_ChartJS extends CustomRenderer {
  constructor(container, metricDescriptor, settings) {
    super(container, metricDescriptor, settings);

    const bodyTemplate = Handlebars.compile(`
      <div class="chart">
        <canvas style="width:350px;height:280px;"></canvas>
      </div>
    `);

    this.widgetContainer.find('.widget-body').append(bodyTemplate());

    this.control_Chart = this.widgetContainer.find('.widget-body').find('.chart');
    this.control_Context = this.control_Chart.find('canvas')[0].getContext('2d');

    this.maxPeriod = 30;

    this.statData = [];

    const colors = ['aqua', 'burlywood', 'deepskyblue', 'mediumslateblue', 'beige', 'honeydew', 'honeydew', 'paleturquoise'];
    let usedColors = 0;

    this.metricDescriptor.metricConfig.datasets = this.metricDescriptor.metricConfig.datasets || [];

    const isMultipleDataSets = (this.metricDescriptor.metricConfig.datasets.length > 1);
    const opacity = 0.3;

    if (this.metricDescriptor.metricConfig.lineColor) {
      let color = new RGBColor(this.metricDescriptor.metricConfig.lineColor);
      this.metricDescriptor.metricConfig.fillColor = `rgb(${color.r},${color.g},${color.b},${opacity})`;
    } else {
      let color = randomColor();
      this.metricDescriptor.metricConfig.lineColor = color.lineColor;
      this.metricDescriptor.metricConfig.fillColor = color.fillColor;
    }

    if (this.metricDescriptor.metricConfig.ranges) {
      this.metricDescriptor.metricConfig.ranges.map((range) => {
        let color = new RGBColor(range.lineColor);
        range.fillColor = `rgb(${color.r},${color.g},${color.b},${opacity})`;
      });
    }

    function randomColor() {
      let lineColor, fillColor;
      if (usedColors >= colors.length) {
        const r = Math.floor(Math.random() * 255);
        const g = Math.floor(Math.random() * 255);
        const b = Math.floor(Math.random() * 255);
        lineColor = `rgb(${r},${g},${b})`;
        fillColor = `rgb(${r},${g},${b},${opacity})`;
      } else {
        lineColor = colors[usedColors];
        usedColors++;
        let color = new RGBColor(lineColor);
        fillColor = `rgb(${color.r},${color.g},${color.b},${opacity})`;
      }
      return {
        lineColor: lineColor,
        fillColor: fillColor,
      };
    }

    this.chartDataSets = [];

    this.metricDescriptor.metricConfig.datasets.map((dataset, index) => {
      let color = index === 0 ? {
        lineColor: this.metricDescriptor.metricConfig.lineColor,
        fillColor: this.metricDescriptor.metricConfig.fillColor,
      } : randomColor();
      this.chartDataSets.push({
        data: [],
        label: dataset,
        borderColor: color.lineColor,
        backgroundColor: color.fillColor,
        fill: (index === 0 ? 'start' : false),
        borderWidth: 2,
        pointRadius: 1,
      });
    });

    this.chart = new Chart(this.control_Context, {
      type: 'line',
      data: {
        labels: this.getLabels(),
        datasets: this.getDataSets(),
      },
      options: {
        legend: {
          display: isMultipleDataSets,
          position: 'bottom',
        },
        scales: {
          xAxes: [{
            display: true,
            gridLines: {
              color: this.getGridLinesColor(),
            },
            ticks: {
              display: false,
              max: this.maxPeriod,
              min: 0,
            },
          }],
          yAxes: [{
            display: true,
            gridLines: {
              color: this.getGridLinesColor(),
            },
            ticks: {
              suggestedMin: this.metricDescriptor.metricConfig.suggestedMin,
              suggestedMax: this.metricDescriptor.metricConfig.suggestedMax,
              min: this.metricDescriptor.metricConfig.min,
              max: this.metricDescriptor.metricConfig.max,
            },
          }],
        },
        animation: {
          duration: 0, // general animation time
        },
      },
    });
  }

  getLabels() {
    let res = [];
    for (let i = 0; i < this.maxPeriod; i++) {
      res.push(i);
    }
    return res;
  }

  getDataSets() {
    let result = Object.assign([], this.chartDataSets);
    result.map((item) => {
      item.data = [];
    });

    if (result.length > 0) {
      let last = 0;

      this.statData.map((values) => {
        values.map((value, index) => {
          result[index].data.push(value);
          if (index === 0) {
            last = value;
          }
        });
      });

      let found = false;

      if (last) {
        if (this.metricDescriptor.metricConfig.ranges) {
          for (let i = this.metricDescriptor.metricConfig.ranges.length - 1; i >= 0; i--) {
            if (last >= this.metricDescriptor.metricConfig.ranges[i].value) {
              result[0].borderColor = this.metricDescriptor.metricConfig.ranges[i].lineColor;
              result[0].backgroundColor = this.metricDescriptor.metricConfig.ranges[i].fillColor;
              found = true;
              break;
            }
          }
        }
      }

      if (!found) {
        result[0].borderColor = this.metricDescriptor.metricConfig.lineColor;
        result[0].backgroundColor = this.metricDescriptor.metricConfig.fillColor;
      }
    }

    return result;
  }

  draw(datasets) {
    this.chart.data.datasets = datasets;
    this.chart.update();
  }

  getGridLinesColor() {
    return (this.settings.theme === 'dark' ? '#333333' : (this.settings.theme === 'light' ? '#EEEEEE' : null));
  }

  pushData(data) {
    super.pushData(data);

    while (this.statData.length > this.maxPeriod) {
      this.statData = this.statData.slice(1);
    }
    this.statData.push(data.points);

    const datasets = this.getDataSets();

    this.requestAnimationFrame(() => {
      this.draw(datasets);
    });
  }

  setTheme(theme) {
    this.settings.theme = theme;
    this.chart.options.scales.xAxes[0].gridLines.color = this.getGridLinesColor();
    this.chart.options.scales.yAxes[0].gridLines.color = this.getGridLinesColor();
    this.chart.update();
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ChartRenderer_ChartJS;
} else {
  window.ChartRenderer_ChartJS = ChartRenderer_ChartJS;
}
