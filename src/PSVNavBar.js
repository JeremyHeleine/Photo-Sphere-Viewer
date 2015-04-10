/**
 * Navigation bar class
 * @param psv (PhotoSphereViewer) A PhotoSphereViewer object
 */
var PSVNavBar = function(psv, style) {
  this.style = PSVUtils.deepmerge(PSVNavBar.DEFAULTS, style);
  this.psv = psv;
  this.container = null;
  this.arrows = null;
  this.autorotate = null;
  this.zoom = null;
  this.fullscreen = null;

  this.create();
};

PSVNavBar.DEFAULTS = {
  // Bar background
  backgroundColor: 'rgba(61, 61, 61, 0.5)',

  // Buttons foreground color
  buttonsColor: 'rgba(255, 255, 255, 0.7)',

  // Buttons background color
  buttonsBackgroundColor: 'transparent',

  // Buttons background color when active
  activeButtonsBackgroundColor: 'rgba(255, 255, 255, 0.1)',

  // Buttons height in pixels
  buttonsHeight: 20,

  // Autorotate icon thickness in pixels
  autorotateThickness: 1,

  // Zoom range width in pixels
  zoomRangeWidth: 50,

  // Zoom range thickness in pixels
  zoomRangeThickness: 1,

  // Zoom range disk diameter in pixels
  zoomRangeDisk: 7,

  // Fullscreen icon ratio
  fullscreenRatio: 4 / 3,

  // Fullscreen icon thickness in pixels
  fullscreenThickness: 2
};

/**
 * Creates the elements
 * @return (void)
 */
PSVNavBar.prototype.create = function() {
  // Container
  this.container = document.createElement('div');
  this.container.style.backgroundColor = this.style.backgroundColor;

  this.container.style.position = 'absolute';
  this.container.style.zIndex = 10;
  this.container.style.bottom = 0;
  this.container.style.width = '100%';

  // Autorotate button
  this.autorotate = new PSVNavBarAutorotateButton(this.psv, this.style);
  this.container.appendChild(this.autorotate.getButton());

  // Zoom buttons
  this.zoom = new PSVNavBarZoomButton(this.psv, this.style);
  this.container.appendChild(this.zoom.getButton());

  // Fullscreen button
  this.fullscreen = new PSVNavBarFullscreenButton(this.psv, this.style);
  this.container.appendChild(this.fullscreen.getButton());
};

/**
 * Returns the bar itself
 * @return (HTMLElement) The bar
 */
PSVNavBar.prototype.getBar = function() {
  return this.container;
};