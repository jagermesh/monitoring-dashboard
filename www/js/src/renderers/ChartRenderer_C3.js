class ChartRenderer_C3 extends CustomRenderer {

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

    _this.maxPeriod = 20;

    _this.statData = [];

    _this.colors = ['aqua', 'burlywood', 'deepskyblue', 'mediumslateblue', 'beige', 'honeydew', 'honeydew', 'paleturquoise'];

    _this.valueName = _this.metricDescriptor.metricInfo.metricName;

    const isMultipleDataSets = (_this.metricDescriptor.metricConfig.datasets.length > 1);
    const dataTypes = {};
    _this.metricDescriptor.metricConfig.datasets.map(function(dataset, index) {
      dataTypes[dataset] = (index === 0 ? 'area-spline' : 'spline');
    });

    _this.chart = c3.generate({
      bindto: _this.control_Chart[0],
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
        show: isMultipleDataSets
      },
      axis: {
        x: {
          type: 'timeseries',
          tick: {
            format: '%H:%M:%S',
          },
          show: false
        },
      },
      grid: {
        x: {
          show: true
        },
        y: {
          show: true
        }
      }
    });

  }

  getAvaialbleColor(index) {
    const _this = this;

    if (index >= _this.colors.length) {
      const r = Math.floor(Math.random() * 255);
      const g = Math.floor(Math.random() * 255);
      const b = Math.floor(Math.random() * 255);
      return `rgb(${r},${g},${b})`;
    } else {
      return _this.colors[index];
    }
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

    return (index === 0 ? _this.metricDescriptor.metricConfig.lineColor : _this.getAvaialbleColor(index - 1));
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

    while (_this.statData.length > _this.maxPeriod) {
      _this.statData = _this.statData.slice(1);
    }
    _this.statData.push({
      x: moment().format('YYYY-MM-DD HH:mm:ss'),
      values: data.points
    });

    // let colors = {};
    let columns = [];
    let colors = {};

    let timeStampData = ['timestamp'];
    _this.statData.map(function(data) {
      timeStampData.push(data.x);
    });
    columns.push(timeStampData);

    _this.metricDescriptor.metricConfig.datasets.map(function(dataset, index) {
      let columnData = [dataset];
      let last = 0;
      _this.statData.map(function(data) {
        last = data.values[index];
        columnData.push(last);
      });
      columns.push(columnData);
      colors[dataset] = _this.getColor(index, last);
    });

    _this.requestAnimationFrame(function() {
      _this.draw(columns, colors);
    });
  }

}