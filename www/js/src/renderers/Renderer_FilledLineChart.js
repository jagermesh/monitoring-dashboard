function Renderer_FilledLineChart(container, sensorInfo, metricInfo, settings) {

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

  function getPlotData() {
    let last;
    let data = statData.map(function(value) {
      last = value.value;
      return value.value;
    });
    let result = {
      data: data
    , lineColor: metricInfo.metricConfig.lineColor
    , fillColor: metricInfo.metricConfig.fillColor
    };
    if (last) {
      if (metricInfo.metricConfig.ranges) {
        for(let i = 0; i < metricInfo.metricConfig.ranges.length; i++) {
          if (last >= metricInfo.metricConfig.ranges[i].value) {
            result.lineColor = metricInfo.metricConfig.ranges[i].lineColor;
            result.fillColor = metricInfo.metricConfig.ranges[i].fillColor;
            break;
          }
        }
      }
    }
    return result;
  }

  const chart = new Chart(control_Context, {
    type: 'line'
  , data: {
      labels: getLabels()
    , datasets: [{
        borderColor: metricInfo.metricConfig.lineColor
      , backgroundColor: metricInfo.metricConfig.fillColor
      , data: []
      , label: 'LA'
      , fill: metricInfo.metricConfig.fillColor ? 'start' : false
      }]
    }
  , options: {
      legend: {
        display: false
      }
    , animation: {
        duration: 0 // general animation time
      }
    }
  });

  function draw() {
    let data = getPlotData();
    chart.data.datasets[0].data            = data.data;
    chart.data.datasets[0].borderColor     = data.lineColor;
    chart.data.datasets[0].backgroundColor = data.fillColor;
    chart.data.datasets[0].fill            = data.fillColor ? 'start' : false;
    chart.update();
  }

  _this.widgetContainer.__pushData = function(data) {
    control_Title.html(data.title);
    control_SubTitle.html(data.subTitle);
    while (statData.length > maxPeriod) {
      statData = statData.slice(1);
    }
    statData.push(data);
    draw();
  };

  return _this.widgetContainer;

}