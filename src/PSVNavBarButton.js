/**
 * Navigation bar button class
 * @param psv (PhotoSphereViewer) A PhotoSphereViewer object
 * @param style (Object) Style of the navigation bar
 */
var PSVNavBarButton = function(psv, style) {
  this.style = style;
  this.psv = psv;
  this.button = null;
};

/**
 * Creates the button
 * @return (void)
 */
PSVNavBarButton.prototype.create = function() {
  throw "Not implemented";
};

/**
 * Returns the button element
 * @return (HTMLElement) The button
 */
PSVNavBarButton.prototype.getButton = function() {
  return this.button;
};

/**
 * Changes the active state of the button
 * @param active (boolean) true if the button should be active, false otherwise
 * @return (void)
 */
PSVNavBarButton.prototype.toggleActive = function(active) {
  this.button.style.backgroundColor = active ? this.style.activeButtonsBackgroundColor : this.style.buttonsBackgroundColor;
};