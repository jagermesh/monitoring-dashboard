class ValueRenderer extends CustomRenderer {

  constructor(container, metricDescriptor, settings) {
    super(container, metricDescriptor, settings);

    const _this = this;

    const bodyTemplate = Handlebars.compile(`
      <div class="content" style="text-align:center;">
        <div class="value1" style="font-size:64px;"></div>
        <div class="value2" style="font-size:64px;"></div>
        <div class="value3" style="font-size:64px;"></div>
      </div>
    `);

    _this.widgetContainer.find('.widget-body').append(bodyTemplate());

    _this.control_Content = _this.control_Body.find('.content');

  }

  pushData(data) {
    super.pushData(data);

    const _this = this;

    let texts = '';

    if (data.values) {
      data.values.map(function(value) {
        let text = value.formatted ? value.formatted : value.raw;
        text = `<div style="font-size:64px;line-height:1em;">${text}</div>`;
        if (value.label) {
          text = `<span style="font-size: 14px">${value.label}</span>${text}`;
        }
        if (value.threshold && _this.metricDescriptor.metricConfig.ranges) {
          for(let i = _this.metricDescriptor.metricConfig.ranges.length-1; i >= 0; i--) {
            if (value.threshold >= _this.metricDescriptor.metricConfig.ranges[i].value) {
              text = `<div style="color:${_this.metricDescriptor.metricConfig.ranges[i].lineColor}">${text}</div>`;
              break;
            }
          }
        }
        text = `<div style="margin-top:5px;height:85px;overflow:hidden;">${text}</div>`;
        texts += text;
      });
    }

    _this.control_Content.html(texts);
  }

}