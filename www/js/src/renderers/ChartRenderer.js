class ChartRenderer extends CustomRenderer {

  constructor(container, metricDescriptor, settings) {
    super(container, metricDescriptor, settings);

    const _this = this;

    const bodyTemplate = Handlebars.compile(`
      <div class="chart">
        <canvas style="width:350px;height:280px;"></canvas>
      </div>
    `);

    _this.widgetContainer.find('.widget-body').append(bodyTemplate());

    _this.control_Chart    = _this.widgetContainer.find('.widget-body').find('.chart');
    _this.control_Context  = _this.control_Chart.find('canvas')[0].getContext('2d');

    _this.maxPeriod = 30;

    _this.statData = [];

    const colors = ['aqua', 'burlywood', 'deepskyblue', 'mediumslateblue', 'beige', 'honeydew', 'honeydew', 'paleturquoise'];
    let usedColors = 0;

    _this.metricDescriptor.metricConfig.datasets = _this.metricDescriptor.metricConfig.datasets || [];

    const isMultipleDataSets = (_this.metricDescriptor.metricConfig.datasets.length > 1);
    const opacity = 0.3;

    if (_this.metricDescriptor.metricConfig.lineColor) {
      let color = new RGBColor(_this.metricDescriptor.metricConfig.lineColor);
      _this.metricDescriptor.metricConfig.fillColor = `rgb(${color.r},${color.g},${color.b},${opacity})`;
    } else {
      let color = randomColor();
      _this.metricDescriptor.metricConfig.lineColor = color.lineColor;
      _this.metricDescriptor.metricConfig.fillColor = color.fillColor;
    }

    if (_this.metricDescriptor.metricConfig.ranges) {
      _this.metricDescriptor.metricConfig.ranges.map(function(range) {
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
        fillColor = `rgb(${r},${g},${b},${opacity})` ;
      } else {
        lineColor = colors[usedColors];
        usedColors++;
        let color = new RGBColor(lineColor);
        fillColor = `rgb(${color.r},${color.g},${color.b},${opacity})`;
      }
      return { lineColor: lineColor, fillColor: fillColor };
    }

    _this.chartDataSets = [];

    _this.metricDescriptor.metricConfig.datasets.map(function(dataset, index) {
      let color = index === 0 ? { lineColor: _this.metricDescriptor.metricConfig.lineColor, fillColor: _this.metricDescriptor.metricConfig.fillColor } : randomColor();
      _this.chartDataSets.push({
          data:            []
        , label:           dataset
        , borderColor:     color.lineColor
        , backgroundColor: color.fillColor
        , fill:            (index === 0 ? 'start' : false)
        , borderWidth:     2
        , pointRadius:     1
      });
    });

    _this.chart = new Chart(_this.control_Context, {
      type: 'line'
    , data: {
          labels:   _this.getLabels()
        , datasets: _this.getDataSets()
      }
    , options: {
        legend: {
            display:  isMultipleDataSets
          , position: 'bottom'
        }
      , scales: {
          xAxes: [{
            display: true,
            gridLines: {
              color: _this.getGridLinesColor()
            },
            ticks: {
              display: false,
              max: _this.maxPeriod,
              min: 0,
            }
          }],
          yAxes: [{
            display: true,
            gridLines: {
              color: _this.getGridLinesColor()
            },
            ticks: {
              suggestedMin: _this.metricDescriptor.metricConfig.suggestedMin,
              suggestedMax: _this.metricDescriptor.metricConfig.suggestedMax,
              min: _this.metricDescriptor.metricConfig.min,
              max: _this.metricDescriptor.metricConfig.max
            }
          }]
        }
      , animation: {
          duration: 0 // general animation time
        }
      }
    });
  }

  getLabels() {
    const _this = this;

    let res = [];
    for (let i = 0; i < _this.maxPeriod; i++) {
      res.push(i);
    }
    return res;
  }

  getDataSets() {
    const _this = this;

    let result = Object.assign([], _this.chartDataSets);
    result.map(function(item) {
      item.data = [];
    });

    if (result.length > 0) {
      let last = 0;

      _this.statData.map(function(values) {
        values.map(function(value, index) {
          result[index].data.push(value);
          if (index === 0) {
            last = value;
          }
        });
      });

      let found = false;

      if (last) {
        if (_this.metricDescriptor.metricConfig.ranges) {
          for(let i = _this.metricDescriptor.metricConfig.ranges.length-1; i >= 0; i--) {
            if (last >= _this.metricDescriptor.metricConfig.ranges[i].value) {
              result[0].borderColor     = _this.metricDescriptor.metricConfig.ranges[i].lineColor;
              result[0].backgroundColor = _this.metricDescriptor.metricConfig.ranges[i].fillColor;
              found  = true;
              break;
            }
          }
        }
      }

      if (!found) {
        result[0].borderColor     = _this.metricDescriptor.metricConfig.lineColor;
        result[0].backgroundColor = _this.metricDescriptor.metricConfig.fillColor;
      }
    }

    return result;
  }

  draw() {
    const _this = this;

    _this.chart.data.datasets = _this.getDataSets();
    _this.chart.update();
  }

  getGridLinesColor() {
    const _this = this;

    return (_this.settings.theme === 'dark' ? '#333333' : (_this.settings.theme === 'light' ? '#EEEEEE' : null));
  }

  pushData(data) {
    super.pushData(data);

    const _this = this;

    while (_this.statData.length > _this.maxPeriod) {
      _this.statData = _this.statData.slice(1);
    }
    _this.statData.push(data.points);
    _this.draw();
  }

  setTheme(theme) {
    const _this = this;

    _this.settings.theme = theme;
    _this.chart.options.scales.xAxes[0].gridLines.color = _this.getGridLinesColor();
    _this.chart.options.scales.yAxes[0].gridLines.color = _this.getGridLinesColor();
    _this.chart.update();
  }

}