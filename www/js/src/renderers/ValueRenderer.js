/* global CustomRenderer */

class ValueRenderer extends CustomRenderer {
  constructor(container, metricDescriptor, settings) {
    super(container, metricDescriptor, settings);

    const bodyTemplate = Handlebars.compile(`
      <div class="content" style="text-align:center;">
        <div class="value1" style="font-size:64px;"></div>
        <div class="value2" style="font-size:64px;"></div>
        <div class="value3" style="font-size:64px;"></div>
      </div>
    `);

    this.widgetContainer.find('.widget-body').append(bodyTemplate());

    this.control_Content = this.control_Body.find('.content');
  }

  pushData(data) {
    super.pushData(data);

    let texts = '';

    if (data.values) {
      data.values.map((value) => {
        let cell = value.formatted ? value.formatted : value.raw;
        let dom = $(`<div>${cell}</div>`);
        dom.find('script,iframe,style').remove();
        let text = dom.html();
        text = `<div style="font-size:64px;line-height:1em;">${text}</div>`;
        if (value.label) {
          text = `<span style="font-size: 14px">${value.label}</span>${text}`;
        }
        if (value.threshold && this.metricDescriptor.metricConfig.ranges) {
          for (let i = this.metricDescriptor.metricConfig.ranges.length - 1; i >= 0; i--) {
            if (value.threshold >= this.metricDescriptor.metricConfig.ranges[i].value) {
              text = `<div style="color:${this.metricDescriptor.metricConfig.ranges[i].lineColor}">${text}</div>`;
              break;
            }
          }
        }
        text = `<div style="margin-top:5px;height:85px;overflow:hidden;">${text}</div>`;
        texts += text;
      });
    }

    this.control_Content.html(texts);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ValueRenderer;
} else {
  window.ValueRenderer = ValueRenderer;
}
