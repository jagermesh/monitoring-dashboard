class CustomRenderer {

  constructor(container, metricDescriptor, settings) {
    this.metricDescriptor = Object.assign({ }, metricDescriptor);
    this.settings = Object.assign({ }, settings);

    this.sensorUid = this.metricDescriptor.sensorInfo.sensorUid;
    this.metricUid = this.metricDescriptor.metricInfo.metricUid;

    const widgetTemplate = Handlebars.compile(`
      <div class="widget card mb-3 mr-3" data-ip="{{sensorInfo.sensorLocation}}" data-uid="{{metricInfo.metricUid}}" data-metric-name="{{metricInfo.metricName}}" data-renderer-name="{{metricInfo.metricRenderer}}">
        <div class="widget-header card-header pl-2 pt-1 pb-1 pr-2">
          <button type="button" class="close widget-action-close" aria-label="Close"><span aria-hidden="true">&times;</span></button>
          <div class="widget-title">
            <span class="widget-title-info"></span>
            <span class="widget-title-tags badge badge-pill badge-warning">{{metricInfo.metricTags}}</span>
          </div>
          <div class="widget-sub-title"></div>
        </div>
        <div class="widget-body card-body m-0 p-1">
        </div>
        <div class="widget-footer card-footer pl-2 pt-1 pb-1 pr-2">
          <div class="widget-footer-title float-left">
            {{sensorInfo.sensorLocation}}
          </div>
          <div class="widget-footer-sub-title float-right">
            {{metricConfig.filter}}
          </div>
        </div>
      </div>
    `);

    this.widgetContainer = $(widgetTemplate(metricDescriptor));
    $(container).append(this.widgetContainer);

    this.control_Title = this.widgetContainer.find('.widget-title');
    this.control_TitleInfo = this.control_Title.find('.widget-title-info');
    this.control_TitleTags = this.control_Title.find('.widget-title-tags');
    this.control_SubTitle = this.widgetContainer.find('.widget-sub-title');
    this.control_Body = this.widgetContainer.find('.widget-body');
    this.control_Footer_Title = this.widgetContainer.find('.widget-footer-title');
    this.control_Footer_SubTitle = this.widgetContainer.find('.widget-footer-sub-title');
  }

  pushData(data) {
    const _this = this;

    let title = `${data.title} (${_this.metricDescriptor.sensorInfo.sensorName})`;
    _this.control_TitleInfo.html(title);

    if (data.subTitle) {
      _this.control_SubTitle.html(data.subTitle);
    }
    if (data.footerTitle) {
      _this.control_Footer_Title.html(data.footerTitle);
    }
    if (data.footerSubTitle) {
      _this.control_Footer_SubTitle.html(data.footerSubTitle);
    }
  }

  setTheme(name) {

  }

  remove() {
    this.widgetContainer.remove();
  }

}