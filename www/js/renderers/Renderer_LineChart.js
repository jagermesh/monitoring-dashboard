/* global define */

define(function () {

  return function(container, sensorInfo, metricInfo) {

    const _this = this;

    const template = Handlebars.compile(`
      <div class="widget card mb-3 mr-3" data-ip="{{sensorInfo.address}}" data-uid="{{metricInfo.uid}}" data-metric-name="{{metricInfo.name}}">
        <div class="widget-header card-header pl-2 pt-1 pb-1 pr-2">
          <div class="widget-title"></div>
          <div class="widget-sub-title"></div>
        </div>
        <div class="widget-body card-body m-0 p-0">
           <div class="chart" style="height:280px;"></div>
        </div>
        <div class="widget-footer card-footer pl-2 pt-1 pb-1 pr-2">
          {{sensorInfo.address}}
        </div>
      </div>`);

    const control = $(template({ sensorInfo: sensorInfo, metricInfo: metricInfo }));
    $(container).append(control);

    const selector = control.find('.chart');

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
                  , color: 'green'
                  , label: label
                  });
      if (metricInfo.metricConfig.ranges) {
        for(let i = 0; i < metricInfo.metricConfig.ranges.length; i++) {
          result.push({ data: getFakeData(metricInfo.metricConfig.ranges[i].value)
                      , lines: { fill: true }
                      , color: metricInfo.metricConfig.ranges[i].color
                      , label: metricInfo.metricConfig.ranges[i].title
                      });
        }
      }
      return result;

    }

    const plot = $.plot( selector
                       , getData()
                       , { grid: { borderWidth: 1
                                 , minBorderMargin: 20
                                 , labelMargin: 10
                                 , backgroundColor: {
                                     colors: ["#fff", "#e4f4f4"]
                                   }
                                 , margin: { top: 8
                                           , bottom: 20
                                           , left: 20
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

    _this.remove = function() {
      control.remove();
    };

    _this.pushData = function(data) {
      control.find('.widget-title').html(data.title);
      control.find('.widget-sub-title').html(data.subTitle);
      while (statData.length > maxPeriod) {
        statData = statData.slice(1);
      }
      statData.push(data);
      draw();
    };

    $(window).on('resize', function() {
      try {
        plot.resize();
        this.draw();
      } catch (e) {

      }
    });

    return _this;

  };

});
