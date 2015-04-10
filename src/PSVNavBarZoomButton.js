/**
 * Navigation bar zoom button class
 * @param psv (PhotoSphereViewer) A PhotoSphereViewer object
 * @param style (Object) Style of the navigation bar
 */
var PSVNavBarZoomButton = function(psv, style) {
  PSVNavBarButton.call(this, psv, style);

  this.zoom_range = null;
  this.zoom_value = null;
  this.mousedown = false;

  this.create();
};

PSVNavBarZoomButton.prototype = Object.create(PSVNavBarButton.prototype);
PSVNavBarZoomButton.prototype.constructor = PSVNavBarZoomButton;

/**
 * Creates the button
 * @return (void)
 */
PSVNavBarZoomButton.prototype.create = function() {
  // Zoom container
  this.button = document.createElement('div');
  this.button.style.cssFloat = 'left';

  // Zoom "-"
  var zoom_minus = document.createElement('div');
  zoom_minus.style.cssFloat = 'left';
  zoom_minus.style.padding = '10px';
  zoom_minus.style.height = this.style.buttonsHeight + 'px';
  zoom_minus.style.backgroundColor = this.style.buttonsBackgroundColor;
  zoom_minus.style.lineHeight = this.style.buttonsHeight + 'px';
  zoom_minus.style.color = this.style.buttonsColor;
  zoom_minus.style.cursor = 'pointer';
  zoom_minus.textContent = '-';

  PSVUtils.addEvent(zoom_minus, 'click', this.psv.zoomOut.bind(this.psv));
  this.button.appendChild(zoom_minus);

  // Zoom range
  var zoom_range_bg = document.createElement('div');
  zoom_range_bg.style.cssFloat = 'left';
  zoom_range_bg.style.padding = (10 + (this.style.buttonsHeight - this.style.zoomRangeThickness) / 2) + 'px 5px';
  zoom_range_bg.style.backgroundColor = this.style.buttonsBackgroundColor;
  this.button.appendChild(zoom_range_bg);

  this.zoom_range = document.createElement('div');
  this.zoom_range.style.width = this.style.zoomRangeWidth + 'px';
  this.zoom_range.style.height = this.style.zoomRangeThickness + 'px';
  this.zoom_range.style.backgroundColor = this.style.buttonsColor;
  this.zoom_range.style.position = 'relative';
  this.zoom_range.style.cursor = 'pointer';
  zoom_range_bg.appendChild(this.zoom_range);

  this.zoom_value = document.createElement('div');
  this.zoom_value.style.position = 'absolute';
  this.zoom_value.style.top = ((this.style.zoomRangeThickness - this.style.zoomRangeDisk) / 2) + 'px';
  this.zoom_value.style.left = -(this.style.zoomRangeDisk / 2) + 'px';
  this.zoom_value.style.width = this.style.zoomRangeDisk + 'px';
  this.zoom_value.style.height = this.style.zoomRangeDisk + 'px';
  this.zoom_value.style.borderRadius = '50%';
  this.zoom_value.style.backgroundColor = this.style.buttonsColor;

  this.psv.addAction('zoom-updated', this._moveZoomValue.bind(this));
  PSVUtils.addEvent(this.zoom_range, 'mousedown', this._initZoomChangeWithMouse.bind(this));
  PSVUtils.addEvent(this.zoom_range, 'touchstart', this._initZoomChangeByTouch.bind(this));
  PSVUtils.addEvent(document, 'mousemove', this._changeZoomWithMouse.bind(this));
  PSVUtils.addEvent(document, 'touchmove', this._changeZoomByTouch.bind(this));
  PSVUtils.addEvent(document, 'mouseup', this._stopZoomChange.bind(this));
  PSVUtils.addEvent(document, 'touchend', this._stopZoomChange.bind(this));
  this.zoom_range.appendChild(this.zoom_value);

  // Zoom "+"
  var zoom_plus = document.createElement('div');
  zoom_plus.style.cssFloat = 'left';
  zoom_plus.style.padding = '10px';
  zoom_plus.style.height = this.style.buttonsHeight + 'px';
  zoom_plus.style.backgroundColor = this.style.buttonsBackgroundColor;
  zoom_plus.style.lineHeight = this.style.buttonsHeight + 'px';
  zoom_plus.style.color = this.style.buttonsColor;
  zoom_plus.style.cursor = 'pointer';
  zoom_plus.textContent = '+';

  PSVUtils.addEvent(zoom_plus, 'click', this.psv.zoomIn.bind(this.psv));
  this.button.appendChild(zoom_plus);
};

/**
 * Moves the zoom cursor
 * @param level (integer) Zoom level (between 0 and 100)
 * @return (void)
 */
PSVNavBarZoomButton.prototype._moveZoomValue = function(level) {
  this.zoom_value.style.left = (level / 100 * this.style.zoomRangeWidth - this.style.zoomRangeDisk / 2) + 'px';
};

/**
 * The user wants to zoom
 * @param evt (Event) The event
 * @return (void)
 */
PSVNavBarZoomButton.prototype._initZoomChangeWithMouse = function(evt) {
  this._initZoomChange(parseInt(evt.clientX));
};

/**
 * The user wants to zoom (mobile version)
 * @param evt (Event) The event
 * @return (void)
 */
PSVNavBarZoomButton.prototype._initZoomChangeByTouch = function(evt) {
  var touch = evt.changedTouches[0];
  if (touch.target == this.zoom_range || touch.target == this.zoom_value)
    this._initZoomChange(parseInt(touch.clientX));
};

/**
 * Initializes a zoom change
 * @param x (integer) Horizontal coordinate
 * @return (void)
 */
PSVNavBarZoomButton.prototype._initZoomChange = function(x) {
  this.mousedown = true;
  this._changeZoom(x);
};

/**
 * The user wants to stop zooming
 * @param evt (Event) The event
 * @return (void)
 */
PSVNavBarZoomButton.prototype._stopZoomChange = function(evt) {
  this.mousedown = false;
};

/**
 * The user moves the zoom cursor
 * @param evt (Event) The event
 * @return (void)
 */
PSVNavBarZoomButton.prototype._changeZoomWithMouse = function(evt) {
  evt.preventDefault();
  this._changeZoom(parseInt(evt.clientX));
};

/**
 * The user moves the zoom cursor (mobile version)
 * @param evt (Event) The event
 * @return (void)
 */
PSVNavBarZoomButton.prototype._changeZoomByTouch = function(evt) {
  var touch = evt.changedTouches[0];
  if (touch.target == this.zoom_range || touch.target == this.zoom_value) {
    evt.preventDefault();
    this._changeZoom(parseInt(touch.clientX));
  }
};

/**
 * Zoom change
 * @param x (integer) Horizontal coordinate
 * @return (void)
 */
PSVNavBarZoomButton.prototype._changeZoom = function(x) {
  if (this.mousedown) {
    var user_input = x - this.zoom_range.getBoundingClientRect().left;
    var zoom_level = user_input / this.style.zoomRangeWidth * 100;
    this.psv.zoom(zoom_level);
  }
};