function Renderer_LineChart(container, sensorInfo, metricInfo, settings) {

  Renderer_Custom.call(this, container, sensorInfo, metricInfo, { rendererType: 'Chart' });

  const _this = this;

  const bodyTemplate = Handlebars.compile(`
    <div class="chart" style="width:350px;height:280px;">
    </div>
  `);

  let widgetContainer = $(_this.widgetContainer);

  widgetContainer.find('.widget-body').append(bodyTemplate());

  const control_Title    = widgetContainer.find('.widget-title');
  const control_SubTitle = widgetContainer.find('.widget-sub-title');
  const control_Chart    = widgetContainer.find('.widget-body').find('.chart');

  const maxPeriod = 120;

  let statData = [];

  function getPlotData() {
    let res = [];
    for (let i = 0; i < maxPeriod; i++) {
      if (statData[i] !== undefined) {
        res.push([ i, statData[i].value ]);
      } else {
        res.push([ i, null ]);
      }
    }
    return res;
  }

  function getFakeData(value) {
    let res = [];
    for (let i = 0; i < maxPeriod; i++) {
      if (statData[i] !== undefined) {
        if (statData[i].value > value) {
          res.push([ i, statData[i].value ]);
        } else {
          res.push([ i, null ]);
        }
      } else {
        res.push([ i, null ]);
      }
    }
    return res;
  }

  function getData() {
    let result = [];
    let label = '';
    if ((statData.length > 0) && statData[statData.length-1].label) {
      label = statData[statData.length-1].label;
    }
    result.push({ data: getPlotData()
                , lines: { fill: true }
                , color: metricInfo.metricConfig.lineColor
                , label: label
                });
    if (metricInfo.metricConfig.ranges) {
      for(let i = 0; i < metricInfo.metricConfig.ranges.length; i++) {
        result.push({ data: getFakeData(metricInfo.metricConfig.ranges[i].value)
                    , lines: { fill: true }
                    , color: metricInfo.metricConfig.ranges[i].lineColor
                    , label: metricInfo.metricConfig.ranges[i].title
                    });
      }
    }
    return result;
  }

  const plot = $.plot( control_Chart
                     , getData()
                     , { grid: { borderWidth:     1
                               , minBorderMargin: 20
                               , labelMargin:     10
                               , backgroundColor: {
                                   colors: [ '#fff', '#e4f4f4' ]
                                 }
                               , margin: { top:    8
                                         , bottom: 20
                                         , left:   20
                                         }
                               }
                       , yaxis: {
                            min: 0
                         }
                       , legend: {
                           show: true
                         , backgroundOpacity: 0.5
                         , position: 'sw'
                         }
                       });

  function draw() {
    plot.setData(getData());
    plot.setupGrid();
    plot.draw();
  }

  $(window).on('resize', function() {
    try {
      plot.resize();
      this.draw();
    } catch (e) {

    }
  });

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