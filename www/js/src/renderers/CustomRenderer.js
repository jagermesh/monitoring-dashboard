class CustomRenderer {
  constructor(container, metricDescriptor, settings) {
    this.metricDescriptor = Object.assign({}, metricDescriptor);
    this.settings = Object.assign({}, settings);
    this.lastAnimationFramtTime = 0;

    const widgetTemplate = Handlebars.compile(`
      <div class="widget card mb-3 mr-3" data-ip="{{sensorInfo.sensorLocation}}" data-uid="{{metricInfo.metricUid}}" data-metric-name="{{metricInfo.metricName}}" data-renderer-name="{{metricInfo.metricRenderer}}">
        <div class="widget-header card-header pl-2 pt-1 pb-1 pr-2">
          <button type="button" class="close widget-action-close" aria-label="Close"><span aria-hidden="true">&times;</span></button>
          <div class="widget-title">
            <span class="widget-title-info"></span>
          </div>
          <div class="widget-sub-title"></div>
        </div>
        <div class="widget-body card-body m-0 p-1">
        </div>
        <div class="widget-footer card-footer pl-2 pt-1 pb-1 pr-2">
          <div class="widget-footer-title float-left">
            {{sensorInfo.sensorLocation}}
          </div>
          {{#if metricInfo.metricTags}}
          <div class="widget-footer-tags float-right">
            {{metricInfo.metricTags}}
          </div>
          {{/if}}
          <div class="widget-footer-sub-title float-right">
            {{metricConfig.settings}}
          </div>
        </div>
      </div>
    `);

    this.widgetContainer = $(widgetTemplate(metricDescriptor));
    $(container).append(this.widgetContainer);

    this.control_Title = this.widgetContainer.find('.widget-title');
    this.control_TitleInfo = this.control_Title.find('.widget-title-info');
    this.control_SubTitle = this.widgetContainer.find('.widget-sub-title');
    this.control_Body = this.widgetContainer.find('.widget-body');
    this.control_Footer_Title = this.widgetContainer.find('.widget-footer-title');
    this.control_Footer_SubTitle = this.widgetContainer.find('.widget-footer-sub-title');
  }

  pushData(data) {
    let title = `${data.title} (${this.metricDescriptor.sensorInfo.sensorName})`;
    this.control_TitleInfo.html(title);

    if (data.subTitle) {
      this.control_SubTitle.html(data.subTitle);
    }
    if (data.footerTitle) {
      this.control_Footer_Title.html(data.footerTitle);
    }
    if (data.footerSubTitle) {
      this.control_Footer_SubTitle.html(data.footerSubTitle);
    }
  }

  setTheme() {

  }

  requestAnimationFrame(callback, element) {
    let requestAnimationFrame =
      window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.oRequestAnimationFrame ||
      window.msRequestAnimationFrame ||
      ((callback) => {
        let currTime = new Date().getTime();
        let timeToCall = Math.max(0, 16 - (currTime - this.lastAnimationFramtTime));
        let id = window.setTimeout(() => {
          callback(currTime + timeToCall);
        }, timeToCall);
        this.lastAnimationFramtTime = currTime + timeToCall;
        return id;
      });

    return requestAnimationFrame.call(window, callback, element);
  }

  remove() {
    this.widgetContainer.remove();
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CustomRenderer;
} else {
  window.CustomRenderer = CustomRenderer;
}
