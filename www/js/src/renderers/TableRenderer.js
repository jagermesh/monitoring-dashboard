/* global CustomRenderer */

class TableRenderer extends CustomRenderer {
  constructor(container, metricDescriptor, settings) {
    super(container, metricDescriptor, settings);

    const bodyTemplate = Handlebars.compile(`
      <table class="widget-table table table-condensed table-striped table-bordered" style="width:100%;font-size:8pt;font-family:monospace,Courier;line-height:1.2em;">
        <thead class="table-header"></thead>
        <tbody class="table-body"><tr><td>No data</td></tr></tbody>
      </table>
    `);

    this.widgetContainer.find('.widget-body').append(bodyTemplate());

    this.control_TableHeader = this.control_Body.find('thead');
    this.control_TableBody = this.control_Body.find('tbody');
  }

  pushData(data) {
    super.pushData(data);

    if (data.table) {
      if (data.table.header && (data.table.header.length > 0)) {
        let tableHeader = '<tr>';
        data.table.header.map((caption) => {
          tableHeader += `<th>${caption}</th>`;
        });
        tableHeader += '</tr>';
        this.control_TableHeader.html(tableHeader);
      }
      if (data.table.body && (data.table.body.length > 0)) {
        let tableBody = '';
        data.table.body.map((row) => {
          tableBody += '<tr>';
          row.map((cell) => {
            let dom = $(`<div>${cell}</div>`);
            dom.find('script,iframe,style').remove();
            let value = dom.html();
            let style = '';
            if (/^[0-9][0-9.]*?([a-zA-Z]{0,2}|[%])$/i.test(value)) {
              style = 'style="text-align:right;"';
            }
            tableBody += `<td ${style}>${value}</td>`;
          });
          tableBody += '</tr>';
        });
        this.control_TableBody.html(tableBody);
      } else {
        this.control_TableBody.html('');
      }
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = TableRenderer;
} else {
  window.TableRenderer = TableRenderer;
}
