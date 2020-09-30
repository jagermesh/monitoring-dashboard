function Renderer_Chart(container, sensorInfo, metricInfo, settings) {

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
  const control_Context  = widgetContainer.find('.widget-body').find('.chart').find('canvas')[0].getContext('2d');

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

  function randomColor() {
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    return { lineColor: `rgb(${r},${g},${b})`, fillColor: `rgb(${r},${g},${b},${opacity})` };
  }

  const chartDataSets = [];

  metricInfo.metricConfig.datasets.map(function(dataset) {
    let color = randomColor();
    chartDataSets.push({ data:            []
                       , label:           dataset
                       , borderColor:     (isMultipleDataSets ? color.lineColor : metricInfo.metricConfig.lineColor)
                       , backgroundColor: (isMultipleDataSets ? color.fillColor : metricInfo.metricConfig.fillColor)
                       , fill:            (isMultipleDataSets ? false : 'start')
                       });
  });

  function getDataSets() {

    let result = Object.assign([], chartDataSets);
    result.map(function(item) {
      item.data = [];
    });

    statData.map(function(values) {
      values.map(function(value, index) {
        result[index].data.push(value);
      });
    });

    return result;
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
          display: false
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

  return _this.widgetContainer;

}