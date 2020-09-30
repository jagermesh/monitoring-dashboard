function Renderer_Table(container, sensorInfo, metricInfo, settings) {

  Renderer_Custom.call(this, container, sensorInfo, metricInfo, { rendererType: 'List' });

  const _this = this;

  const bodyTemplate = Handlebars.compile(`
    <table class="table-condensed table-striped table-hover" style="width:100%;font-size:8pt;font-family:Courier;line-height:8pt;">
      <thead class="table-header"></thead>
      <tbody class="table-body"></tbody>
    </table>
  `);

  let widgetContainer = $(_this.widgetContainer);

  widgetContainer.find('.widget-body').append(bodyTemplate());

  const control_Title       = widgetContainer.find('.widget-title');
  const control_SubTitle    = widgetContainer.find('.widget-sub-title');
  const control_TableHeader = widgetContainer.find('.widget-body').find('thead');
  const control_TableBody   = widgetContainer.find('.widget-body').find('tbody');

  _this.widgetContainer.__pushData = function(data) {
    control_Title.html(data.title);
    control_SubTitle.html(data.subTitle);

    let tableHeader = '<tr>';
    data.list.header.map(function(caption) {
      tableHeader += `<th>${caption}</th>`;
    });
    tableHeader += '</tr>';

    control_TableHeader.html(tableHeader);

    let tableBody = '';
    data.list.body.map(function(row) {
      tableBody += '<tr>';
      row.map(function(cell) {
        let value = $(`<span>${cell}</span>`).text();
        tableBody += `<td>${value}</td>`;
      });
      tableBody += '</tr>';
    });
    control_TableBody.html(tableBody);
  };

  return _this.widgetContainer;

}