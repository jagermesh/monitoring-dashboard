/* global CustomRenderer */

class ProgressRenderer extends CustomRenderer {
  constructor(container, metricDescriptor, settings) {
    super(container, metricDescriptor, settings);

    const bodyTemplate = Handlebars.compile(`
      <table style="width:100%;">
        <tbody>
        </tbody>
      </table>
    `);

    this.widgetContainer.find('.widget-body').append(bodyTemplate());

    this.operationTemplate = Handlebars.compile(`
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

    this.control_TableBody = this.widgetContainer.find('.widget-body').find('tbody');
  }

  pushData(data) {
    console.log(data);
    super.pushData(data);

    let operations = data.operations;
    let text = '';
    operations.map((operation) => {
      if (operation.total > 0) {
        operation.percent = (operation.current / operation.total * 100).toFixed(2);
      } else {
        operation.percent = 100;
      }
      operation.isFinished = (operation.current == operation.total);
      text += this.operationTemplate(operation);
    });
    this.control_TableBody.html(text);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ProgressRenderer;
} else {
  window.ProgressRenderer = ProgressRenderer;
}
