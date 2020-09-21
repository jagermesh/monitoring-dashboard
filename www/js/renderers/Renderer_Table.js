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
          <table class="table-condensed table-striped table-hover" style="width:100%;font-size:8pt;font-family:Courier;line-height:8pt;">
            <thead class="table-header" style="display:none;"></thead>
            <tbody class="table-body"></tbody>
          </table>
        </div>
        <div class="widget-footer card-footer pl-2 pt-1 pb-1 pr-2">
          {{sensorInfo.address}}
        </div>
      </div>`);

    const control = $(template({ sensorInfo: sensorInfo, metricInfo: metricInfo }));
    $(container).append(control);

    control.find('.table-header').html('');

    if (metricInfo.metricConfig.fields) {
      let text = '<tr>';
      for (let name in metricInfo.metricConfig.fields) {
        text += `<th>${metricInfo.metricConfig.fields[name]}</th>`;
      }
      text += '</tr>';
      control.find('.table-header').append(text);
    }

    _this.remove = function() {
      control.remove();
    };

    _this.pushData = function(data) {
      control.find('.widget-title').html(data.title);
      control.find('.widget-sub-title').html(data.subTitle);
      control.find('.table-body').html('');

      if (data.list.length === 0) {
        control.find('.table-header').hide();
      } else {
        control.find('.table-header').show();
        for(let i = 0; i < data.list.length; i++) {
          let text = '<tr>';
          for (var name in data.list[i].row) {
            text += `<td>${data.list[i].row[name]}</td>`;
          }
          text += '</tr>';
          control.find('.table-body').append(text);
        }
      }
    };

    return _this;

  };

});
