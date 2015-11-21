/**
 * Represents the navigation bar.
 * @class
 * @param {PhotoSphereViewer} psv - A PhotoSphereViewer object
 **/

var PSVNavBar = function(psv) {
	/**
	 * Checks if a value exists in an array.
	 * @private
	 * @param {*} searched - The searched value
	 * @param {array} array - The array
	 * @return {boolean} `true` if the value exists in the array, `false` otherwise
	 **/

	var inArray = function(searched, array) {
		for (var i = 0, l = array.length; i < l; ++i) {
			if (array[i] == searched)
				return true;
		}

		return false;
	};

	/**
	 * Checks if a property is valid.
	 * @private
	 * @param {string} property - The property
	 * @param {*} value - The value to check
	 * @return {boolean} `true` if the value is valid, `false` otherwise
	 **/

	var checkValue = function(property, value) {
		return (
				// Color
				(
					inArray(property, colors) && (typeof value == 'string') &&
					(
						value == 'transparent' ||
						!!value.match(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/) ||
						!!value.match(/^rgb\((1?[0-9]{1,2}|2[0-4][0-9]|25[0-5])(,\s*(1?[0-9]{1,2}|2[0-4][0-9]|25[0-5])){2}\)$/) ||
						!!value.match(/^rgba\(((1?[0-9]{1,2}|2[0-4][0-9]|25[0-5]),\s*){3}(0(\.[0-9]*)?|1)\)$/)
					)
				) ||

				// Number
				(inArray(property, numbers) && !isNaN(parseFloat(value)) && isFinite(value) && value >= 0)
			);
	};

	/**
	 * Sets the style.
	 * @public
	 * @param {object} new_style - The properties to change
	 * @param {string} [new_style.backgroundColor=rgba(61, 61, 61, 0.5)] - Navigation bar background color
	 * @param {string} [new_style.buttonsColor=rgba(255, 255, 255, 0.7)] - Buttons foreground color
	 * @param {string} [new_style.buttonsBackgroundColor=transparent] - Buttons background color
	 * @param {string} [new_style.activeButtonsBackgroundColor=rgba(255, 255, 255, 0.1)] - Active buttons background color
	 * @param {number} [new_style.buttonsHeight=20] - Buttons height in pixels
	 * @param {number} [new_style.autorotateThickness=1] - Autorotate icon thickness in pixels
	 * @param {number} [new_style.zoomRangeWidth=50] - Zoom range width in pixels
	 * @param {number} [new_style.zoomRangeThickness=1] - Zoom range thickness in pixels
	 * @param {number} [new_style.zoomRangeDisk=7] - Zoom range disk diameter in pixels
	 * @param {number} [new_style.fullscreenRatio=4/3] - Fullscreen icon ratio (width / height)
	 * @param {number} [new_style.fullscreenThickness=2] - Fullscreen icon thickness in pixels
	 * @param {number} [new_style.gyroscopeThickness=1] - Gyroscope icon thickness in pixels
	 * @param {number} [new_style.virtualRealityRatio=4/3] - Virtual reality icon ratio (width / height)
	 * @param {number} [new_style.virtualRealityBorderRadius=2] - Virtual reality icon border radius in pixels
	 * @return {void}
	 **/

	this.setStyle = function(new_style) {
		// Properties to change
		for (var property in new_style) {
			// Is this property a property we'll use?
			if ((property in style) && checkValue(property, new_style[property]))
				style[property] = new_style[property];
		}
	};

	/**
	 * Creates the elements.
	 * @public
	 * @return {void}
	 **/

	this.create = function() {
		// Container
		container = document.createElement('div');
		container.style.backgroundColor = style.backgroundColor;

		container.style.position = 'absolute';
		container.style.zIndex = 10;
		container.style.bottom = 0;
		container.style.width = '100%';
		container.style.boxSizing = 'content-box';

		container.style.transition = 'bottom 0.4s ease-out';

		// Autorotate button
		autorotate = new PSVNavBarButton(psv, 'autorotate', style);
		container.appendChild(autorotate.getButton());

		// Zoom buttons
		zoom = new PSVNavBarButton(psv, 'zoom', style);
		container.appendChild(zoom.getButton());

		// Fullscreen button
		fullscreen = new PSVNavBarButton(psv, 'fullscreen', style);
		container.appendChild(fullscreen.getButton());

		if (Sphoords.isDeviceOrientationSupported) {
			// Device orientation button
			orientation = new PSVNavBarButton(psv, 'orientation', style);
			container.appendChild(orientation.getButton());

			// Virtual reality button
			vr = new PSVNavBarButton(psv, 'virtual-reality', style);
			container.appendChild(vr.getButton());
		}
	};

	/**
	 * Returns the bar itself.
	 * @public
	 * @return {HTMLElement} The bar
	 **/

	this.getBar = function() {
		return container;
	};

	/**
	 * Shows the bar.
	 * @private
	 * @return {void}
	 **/

	var show = function() {
		// Stop hiding the bar if necessary
		if (!!must_hide_timeout) {
			clearTimeout(must_hide_timeout);

			if (!hidden && must_be_hidden)
				must_hide_timeout = setTimeout(hide, 5000);
		}

		if (hidden) {
			container.style.bottom = 0;
			hidden = false;

			// If bar must be hidden, we hide it again
			if (must_be_hidden)
				must_hide_timeout = setTimeout(hide, 5000);
		}
	};

	/**
	 * Shows the bar.
	 * @public
	 * @return {void}
	 **/

	this.show = function() {
		show();
	};

	/**
	 * Hides the bar.
	 * @private
	 * @return {void}
	 **/

	var hide = function() {
		if (!hidden) {
			container.style.bottom = (-container.offsetHeight + 1) + 'px';
			hidden = true;
		}
	};

	/**
	 * Hides the bar.
	 * @public
	 * @return {void}
	 **/

	this.hide = function() {
		hide();
	};

	/**
	 * Returns the current state.
	 * @public
	 * @return {boolean} `true` if navigation bar is hidden, `false` otherwise
	 **/

	this.isHidden = function() {
		return hidden;
	};

	/**
	 * Indicates that the bar must be hidden or not.
	 * @public
	 * @param {boolean} [state=true] - `true` to automatically hide the bar, `false` to show it
	 * @return {void}
	 **/

	this.mustBeHidden = function(state) {
		must_be_hidden = (state !== undefined) ? !!state : true;

		if (must_be_hidden)
			hide();

		else
			show();
	};

	// Default style
	var style = {
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
			fullscreenThickness: 2,

			// Gyroscope icon thickness in pixels
			gyroscopeThickness: 1,

			// Virtual reality icon ratio
			virtualRealityRatio: 4 / 3,

			// Virtual reality icon border radius in pixels
			virtualRealityBorderRadius: 2
		};

	// Properties types
	var colors = ['backgroundColor', 'buttonsColor', 'buttonsBackgroundColor', 'activeButtonsBackgroundColor'];
	var numbers = ['buttonsHeight', 'autorotateThickness', 'zoomRangeWidth', 'zoomRangeThickness', 'zoomRangeDisk', 'fullscreenRatio', 'fullscreenThickness'];

	// Some useful attributes
	var container;
	var autorotate, zoom, fullscreen, orientation, vr;
	var must_hide_timeout = null;
	var hidden = false, must_be_hidden = false;
};
