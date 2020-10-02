function Renderer_Chart(container, sensorInfo, metricInfo, settings) {

  let __settings = Object.assign({ }, settings);

  Renderer_Custom.call(this, container, sensorInfo, metricInfo, { rendererType: 'Chart' });

  const _this = this;

  const bodyTemplate = Handlebars.compile(`
    <div class="chart">
      <canvas style="width:350px;height:280px;"></canvas>
    </div>
  `);

  let widgetContainer = $(_this.widgetContainer);

  widgetContainer.find('.widget-body').append(bodyTemplate());

  const control_Title    = widgetContainer.find('.widget-title');
  const control_SubTitle = widgetContainer.find('.widget-sub-title');
  const control_Chart    = widgetContainer.find('.widget-body').find('.chart');
  const control_Context  = control_Chart.find('canvas')[0].getContext('2d');

  const maxPeriod = 30;

  let statData = [];

  function getLabels() {
    let res = [];
    for (let i = 0; i < maxPeriod; i++) {
      res.push(i);
    }
    return res;
  }

  const isMultipleDataSets = (metricInfo.metricConfig.datasets.length > 1);
  const opacity = 0.3;

  if (metricInfo.metricConfig.lineColor) {
    let color = new RGBColor(metricInfo.metricConfig.lineColor);
    metricInfo.metricConfig.fillColor = `rgb(${color.r},${color.g},${color.b},${opacity})`;
  } else {
    let color = randomColor();
    metricInfo.metricConfig.lineColor = color.lineColor;
    metricInfo.metricConfig.fillColor = color.fillColor;
  }

  if (metricInfo.metricConfig.ranges) {
    metricInfo.metricConfig.ranges.map(function(range) {
      let color = new RGBColor(range.lineColor);
      range.fillColor = `rgb(${color.r},${color.g},${color.b},${opacity})`;
    });
  }

  function randomColor() {
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    return { lineColor: `rgb(${r},${g},${b})`, fillColor: `rgb(${r},${g},${b},${opacity})` };
  }

  const chartDataSets = [];

  metricInfo.metricConfig.datasets.map(function(dataset, index) {
    let color = randomColor();
    chartDataSets.push({ data:            []
                       , label:           dataset
                       , borderColor:     (index === 0 ? metricInfo.metricConfig.lineColor : color.lineColor)
                       , backgroundColor: (index === 0 ? metricInfo.metricConfig.fillColor : color.fillColor)
                       , fill:            (index === 0 ? 'start' : false)
                       , borderWidth:     2
                       , pointRadius:     1
                       });
  });

  function getDataSets() {

    let result = Object.assign([], chartDataSets);
    result.map(function(item) {
      item.data = [];
    });

    let last = 0;

    statData.map(function(values) {
      values.map(function(value, index) {
        result[index].data.push(value);
        if (index === 0) {
          last = value;
        }
      });
    });

    let found = false;

    if (last) {
      if (metricInfo.metricConfig.ranges) {
        for(let i = metricInfo.metricConfig.ranges.length-1; i >= 0; i--) {
          if (last >= metricInfo.metricConfig.ranges[i].value) {
            result[0].borderColor = metricInfo.metricConfig.ranges[i].lineColor;
            result[0].backgroundColor = metricInfo.metricConfig.ranges[i].fillColor;
            found  = true;
            break;
          }
        }
      }
    }

    if (!found) {
      result[0].borderColor = metricInfo.metricConfig.lineColor;
      result[0].backgroundColor = metricInfo.metricConfig.fillColor;
    }

    return result;
  }

  function getGridLinesColor() {
    return (__settings.theme === 'dark' ? '#333333' : (__settings.theme === 'light' ? '#EEEEEE' : null));
  }

  const chart = new Chart(control_Context, {
    type: 'line'
  , data: {
      labels:   getLabels()
    , datasets: getDataSets()
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
            color: getGridLinesColor()
          },
          ticks: {
                display: false,
                max: maxPeriod,
                min: 0,
            }
        }],
        yAxes: [{
          display: true,
          gridLines: {
            color: getGridLinesColor()
          },
          ticks: {
            suggestedMin: metricInfo.metricConfig.suggestedMin,
            suggestedMax: metricInfo.metricConfig.suggestedMax,
            min: metricInfo.metricConfig.min,
            max: metricInfo.metricConfig.max
          }
        }]
      }
    , animation: {
        duration: 0 // general animation time
      }
    }
  });

  function draw() {
    chart.data.datasets = getDataSets();
    chart.update();
  }

  _this.widgetContainer.__pushData = function(data) {
    control_Title.html(data.title);
    control_SubTitle.html(data.subTitle);
    while (statData.length > maxPeriod) {
      statData = statData.slice(1);
    }
    statData.push(data.values);
    draw();
  };

  _this.widgetContainer.__setTheme = function(theme) {
    __settings.theme = theme;
    chart.options.scales.xAxes[0].gridLines.color = getGridLinesColor();
    chart.options.scales.yAxes[0].gridLines.color = getGridLinesColor();
    chart.update();
  };

  return _this.widgetContainer;

}