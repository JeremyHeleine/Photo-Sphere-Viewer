/**
 * Navigation bar fullscreen button class
 * @param psv (PhotoSphereViewer) A PhotoSphereViewer object
 * @param style (Object) Style of the navigation bar
 */
var PSVNavBarFullscreenButton = function(psv, style) {
  PSVNavBarButton.call(this, psv, style);
  this.create();
};

PSVNavBarFullscreenButton.prototype = Object.create(PSVNavBarButton.prototype);
PSVNavBarFullscreenButton.prototype.constructor = PSVNavBarFullscreenButton;

/**
 * Creates the button
 * @return (void)
 */
PSVNavBarFullscreenButton.prototype.create = function() {
  // Fullscreen icon size
  var fullscreen_width = this.style.buttonsHeight * this.style.fullscreenRatio;

  var fullscreen_vertical_space = this.style.buttonsHeight * 0.3;
  var fullscreen_vertical_border = (this.style.buttonsHeight - fullscreen_vertical_space) / 2;

  var fullscreen_horizontal_space = fullscreen_width * 0.3;
  var fullscreen_horizontal_border = (fullscreen_width - fullscreen_horizontal_space) / 2 - this.style.fullscreenThickness;
  var fullscreen_vertical_int = this.style.buttonsHeight - this.style.fullscreenThickness * 2;

  // Fullscreen button
  this.button = document.createElement('div');
  this.button.style.cssFloat = 'right';
  this.button.style.padding = '10px';
  this.button.style.width = fullscreen_width;
  this.button.style.height = this.style.buttonsHeight;
  this.button.style.backgroundColor = this.style.buttonsBackgroundColor;
  this.button.style.cursor = 'pointer';

  PSVUtils.addEvent(this.button, 'click', this.psv.toggleFullscreen.bind(this.psv));

  // Fullscreen icon left side
  var fullscreen_left = document.createElement('div');
  fullscreen_left.style.cssFloat = 'left';
  fullscreen_left.style.width = this.style.fullscreenThickness + 'px';
  fullscreen_left.style.height = fullscreen_vertical_space + 'px';
  fullscreen_left.style.borderStyle = 'solid';
  fullscreen_left.style.borderColor = this.style.buttonsColor + ' transparent';
  fullscreen_left.style.borderWidth = fullscreen_vertical_border + 'px 0';
  this.button.appendChild(fullscreen_left);

  // Fullscreen icon top/bottom sides (first half)
  var fullscreen_tb_1 = document.createElement('div');
  fullscreen_tb_1.style.cssFloat = 'left';
  fullscreen_tb_1.style.width = fullscreen_horizontal_border + 'px';
  fullscreen_tb_1.style.height = fullscreen_vertical_int + 'px';
  fullscreen_tb_1.style.borderStyle = 'solid';
  fullscreen_tb_1.style.borderColor = this.style.buttonsColor + ' transparent';
  fullscreen_tb_1.style.borderWidth = this.style.fullscreenThickness + 'px 0';
  this.button.appendChild(fullscreen_tb_1);

  // Fullscreen icon top/bottom sides (second half)
  var fullscreen_tb_2 = document.createElement('div');
  fullscreen_tb_2.style.cssFloat = 'left';
  fullscreen_tb_2.style.marginLeft = fullscreen_horizontal_space + 'px';
  fullscreen_tb_2.style.width = fullscreen_horizontal_border + 'px';
  fullscreen_tb_2.style.height = fullscreen_vertical_int + 'px';
  fullscreen_tb_2.style.borderStyle = 'solid';
  fullscreen_tb_2.style.borderColor = this.style.buttonsColor + ' transparent';
  fullscreen_tb_2.style.borderWidth = this.style.fullscreenThickness + 'px 0';
  this.button.appendChild(fullscreen_tb_2);

  // Fullscreen icon right side
  var fullscreen_right = document.createElement('div');
  fullscreen_right.style.cssFloat = 'left';
  fullscreen_right.style.width = this.style.fullscreenThickness + 'px';
  fullscreen_right.style.height = fullscreen_vertical_space + 'px';
  fullscreen_right.style.borderStyle = 'solid';
  fullscreen_right.style.borderColor = this.style.buttonsColor + ' transparent';
  fullscreen_right.style.borderWidth = fullscreen_vertical_border + 'px 0';
  this.button.appendChild(fullscreen_right);

  var fullscreen_clearer = document.createElement('div');
  fullscreen_clearer.style.clear = 'left';
  this.button.appendChild(fullscreen_clearer);

  // (In)active
  this.psv.addAction('fullscreen-mode', this.toggleActive.bind(this));
};