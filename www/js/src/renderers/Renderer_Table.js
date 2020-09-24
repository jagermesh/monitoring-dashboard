function Renderer_Table(container, sensorInfo, metricInfo, settings) {

  Renderer_Custom.call(this, container, sensorInfo, metricInfo, settings);

  const _this = this;

  const bodyTemplate = Handlebars.compile(`
    <table class="table-condensed table-striped table-hover" style="width:100%;font-size:8pt;font-family:Courier;line-height:8pt;">
      <thead class="table-header" style="display:none;"></thead>
      <tbody class="table-body"></tbody>
    </table>
  `);

  let widgetContainer = $(_this.widgetContainer);

  widgetContainer.find('.widget-body').append(bodyTemplate());

  const control_Title       = widgetContainer.find('.widget-title');
  const control_SubTitle    = widgetContainer.find('.widget-sub-title');
  const control_TableHeader = widgetContainer.find('.widget-body').find('thead');
  const control_TableBody   = widgetContainer.find('.widget-body').find('tbody');

  if (metricInfo.metricConfig.fields) {
    let text = '<tr>';
    for (let name in metricInfo.metricConfig.fields) {
      text += `<th>${metricInfo.metricConfig.fields[name]}</th>`;
    }
    text += '</tr>';
    widgetContainer.find('.table-header').html(text);
  }

  _this.widgetContainer.__pushData = function(data) {
    control_Title.html(data.title);
    control_SubTitle.html(data.subTitle);
    if (data.list.length === 0) {
      control_TableHeader.hide();
    } else {
      control_TableHeader.show();
      let text = ';';
      for(let i = 0; i < data.list.length; i++) {
        text += '<tr>';
        for (let name in data.list[i].row) {
          let value = $(`<span>${data.list[i].row[name]}</span>`).text();
          text += `<td>${value}</td>`;
        }
        text += '</tr>';
      }
      control_TableBody.html(text);
    }
  };

  return _this.widgetContainer;

}