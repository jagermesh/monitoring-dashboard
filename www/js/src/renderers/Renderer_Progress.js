function Renderer_Progress(container, sensorInfo, metricInfo, settings) {

  Renderer_Custom.call(this, container, sensorInfo, metricInfo, { rendererType: 'Progress' });

  const _this = this;

  const bodyTemplate = Handlebars.compile(`
    <table style="width:100%;">
      <tbody>
      </tbody>
    </table>
  `);

  let widgetContainer = $(_this.widgetContainer);

  widgetContainer.find('.widget-body').append(bodyTemplate());

  const operationTemplate = Handlebars.compile(`
    <tr valign="top">
      <td style="word-break:break-all;">{{name}}</td>
      <td class="widget-optimal-width text-right">{{current}} of {{total}} ({{percent}}%)</td>
    </tr>
    <tr>
      <td colspan="2">
        <div class="progress">
          <div class="progress-bar {{#if isFinished}}bg-success{{else}}bg-warning{{/if}}" role="progressbar" style="width: {{percent}}%;" aria-valuenow="{{percent}}" aria-valuemin="0" aria-valuemax="100">{{percent}}%</div>
        </div>
      </td>
    </tr>
  `);

  const control_Title     = widgetContainer.find('.widget-title');
  const control_SubTitle  = widgetContainer.find('.widget-sub-title');
  const control_TableBody = widgetContainer.find('.widget-body').find('tbody');

  _this.widgetContainer.__pushData = function(data) {
    control_Title.html(data.title);
    control_SubTitle.html(data.subTitle);
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
    control_TableBody.html(text);
  };

  return _this.widgetContainer;

}