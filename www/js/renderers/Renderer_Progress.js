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
        <div class="widget-body card-body m-0 p-1">
          <table style="width:100%;"></table>
        </div>
        <div class="widget-footer card-footer pl-2 pt-1 pb-1 pr-2">
          {{sensorInfo.address}}
        </div>
      </div>`);

    const operationTemplate = Handlebars.compile(`<tr valign="top">
                                                    <td style="word-break:break-all;">{{name}}</td>
                                                    <td class="widget-optimal-width text-right">{{current}} of {{total}} ({{percent}}%)</td>
                                                  </tr>
                                                  <tr>
                                                    <td colspan="2">
                                                      <div class="progress">
                                                        <div class="progress-bar {{#if isFinished}}bg-success{{else}}bg-warning{{/if}}" role="progressbar" style="width: {{percent}}%;" aria-valuenow="{{percent}}" aria-valuemin="0" aria-valuemax="100">{{percent}}%</div>
                                                      </div>
                                                    </td>
                                                  </tr>`);

    const control = $(template({ sensorInfo: sensorInfo, metricInfo: metricInfo }));
    $(container).append(control);

    _this.remove = function() {
      control.remove();
    };

    _this.pushData = function(data) {
      control.find('.widget-title').html(data.title);
      control.find('.widget-sub-title').html(data.subTitle);
      let operations = data.operations;
      let text = '';
      operations.map(function(operation) {
        if (operation.total > 0) {
          operation.percent = (operation.current/operation.total*100).toFixed(2);
        } else {
          operation.percent = 100;
        }
        operation.isFinished = (operation.current == operation.total);
        text += operationTemplate(operation);
      });
      control.find('.widget-body table').html(text);
    };

    return _this;

  };

});
