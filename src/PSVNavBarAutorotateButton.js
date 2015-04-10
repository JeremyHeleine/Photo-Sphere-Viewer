/**
 * Navigation bar autorotate button class
 * @param psv (PhotoSphereViewer) A PhotoSphereViewer object
 * @param style (Object) Style of the navigation bar
 */
var PSVNavBarAutorotateButton = function(psv, style) {
  PSVNavBarButton.call(this, psv, style);
  this.create();
};

PSVNavBarAutorotateButton.prototype = Object.create(PSVNavBarButton.prototype);
PSVNavBarAutorotateButton.prototype.constructor = PSVNavBarAutorotateButton;

/**
 * Creates the button
 * @return (void)
 */
PSVNavBarAutorotateButton.prototype.create = function() {
  // Autorotate icon sizes
  var autorotate_sphere_width = this.style.buttonsHeight - this.style.autorotateThickness * 2;
  var autorotate_equator_height = autorotate_sphere_width / 10;

  // Autorotate button
  this.button = document.createElement('div');
  this.button.style.cssFloat = 'left';
  this.button.style.padding = '10px';
  this.button.style.width = this.style.buttonsHeight + 'px';
  this.button.style.height = this.style.buttonsHeight + 'px';
  this.button.style.backgroundColor = this.style.buttonsBackgroundColor;
  this.button.style.position = 'relative';
  this.button.style.cursor = 'pointer';

  PSVUtils.addEvent(this.button, 'click', this.psv.toggleAutorotate.bind(this.psv));

  var autorotate_sphere = document.createElement('div');
  autorotate_sphere.style.width = autorotate_sphere_width + 'px';
  autorotate_sphere.style.height = autorotate_sphere_width + 'px';
  autorotate_sphere.style.borderRadius = '50%';
  autorotate_sphere.style.border = this.style.autorotateThickness + 'px solid ' + this.style.buttonsColor;
  this.button.appendChild(autorotate_sphere);

  var autorotate_equator = document.createElement('div');
  autorotate_equator.style.width = autorotate_sphere_width + 'px';
  autorotate_equator.style.height = autorotate_equator_height + 'px';
  autorotate_equator.style.borderRadius = '50%';
  autorotate_equator.style.border = this.style.autorotateThickness + 'px solid ' + this.style.buttonsColor;
  autorotate_equator.style.position = 'absolute';
  autorotate_equator.style.top = '50%';
  autorotate_equator.style.marginTop = -(autorotate_equator_height / 2 + this.style.autorotateThickness) + 'px';
  this.button.appendChild(autorotate_equator);

  // (In)active
  this.psv.addAction('autorotate', this.toggleActive.bind(this));
};