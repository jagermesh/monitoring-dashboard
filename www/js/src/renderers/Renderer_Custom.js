function Renderer_Custom(container, sensorInfo, metricInfo, settings) {

  const _this = this;

  const widgetTemplate = Handlebars.compile(`
    <div class="widget card mb-3 mr-3" data-ip="{{sensorInfo.address}}" data-uid="{{metricInfo.uid}}" data-metric-name="{{metricInfo.name}}" data-renderer-name="{{metricInfo.rendererName}}">
      <div class="widget-header card-header pl-2 pt-1 pb-1 pr-2">
        <button type="button" class="close widget-action-close" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
        <div class="widget-title">
        </div>
        <div class="widget-sub-title">
        </div>
      </div>
      <div class="widget-body card-body m-0 p-1">
      </div>
      <div class="widget-footer card-footer pl-2 pt-1 pb-1 pr-2">
        <div class="widget-end-title">
          {{sensorInfo.address}}
        </div>
      </div>
    </div>
  `);

  let widgetContainer = $(widgetTemplate({ sensorInfo: sensorInfo, metricInfo: metricInfo }));

  $(container).append(widgetContainer);

  _this.widgetContainer = widgetContainer[0];

  _this.widgetContainer.__sensorId  = sensorInfo.id;
  _this.widgetContainer.__metricUid = metricInfo.uid;

  _this.widgetContainer.__pushData  = function() { };

}