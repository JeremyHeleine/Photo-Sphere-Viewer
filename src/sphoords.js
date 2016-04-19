/*
* Sphoords v0.1.1
* http://jeremyheleine.me
*
* Copyright (c) 2015,2016 Jérémy Heleine
*
* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included in
* all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
* THE SOFTWARE.
*/

/**
 * Sphoords class allowing to retrieve the current orientation of a device supporting the Orientation API.
 * @class
 **/

var Sphoords = function() {
	/**
	 * Detects the used browser engine.
	 * @private
	 * @return {void}
	 **/

	var detectBrowserEngine = function() {
		// User-Agent
		var ua = navigator.userAgent;

		// Gecko
		if (/Gecko\/[0-9.]+/.test(ua))
			return 'Gecko';

		// Blink
		if (/Chrome\/[0-9.]+/.test(ua))
			return 'Blink';

		// WebKit
		if (/AppleWebKit\/[0-9.]+/.test(ua))
			return 'WebKit';

		// Trident
		if (/Trident\/[0-9.]+/.test(ua))
			return 'Trident';

		// Presto
		if (/Opera\/[0-9.]+/.test(ua))
			return 'Presto';

		// No engine detected, Gecko by default
		return 'Gecko';
	};

	/**
	 * Returns the principal angle in degrees.
	 * @private
	 * @param {number} angle - The initial angle
	 * @return {number} The principal angle
	 **/

	var getPrincipalAngle = function(angle) {
		return angle - Math.floor(angle / 360.0) * 360.0;
	};

	/**
	 * Attaches the DeviceOrientation event to the window and starts the record, only if Device Orientation is supported.
	 * @public
	 * @return {boolean} `true` if event is attached, `false` otherwise
	 **/

	this.start = function() {
		if (Sphoords.isDeviceOrientationSupported) {
			window.addEventListener('deviceorientation', onDeviceOrientation, false);

			recording = true;
			return true;
		}

		else {
			console.log('Device Orientation API not supported');
			return false;
		}
	};

	/**
	 * Stops the record by removing the event handler.
	 * @public
	 * @return {void}
	 **/

	this.stop = function() {
		// Is there something to remove?
		if (recording) {
			window.removeEventListener('deviceorientation', onDeviceOrientation, false);

			recording = false;
		}
	};

	/**
	 * Toggles the recording state.
	 * @public
	 * @return {void}
	 **/

	this.toggle = function() {
		if (recording)
			this.stop();

		else
			this.start();
	};

	/**
	 * Determines whether Device Orientation Event is attached.
	 * @public
	 * @return {boolean} `true` if event is attached, `false` otherwise
	 **/

	this.isEventAttached = function() {
		return recording;
	};

	/**
	 * Records the current orientation
	 * @private
	 * @param {Event} evt - The event
	 * @return {void}
	 **/

	var onDeviceOrientation = function(evt) {
		// Current screen orientation
		orientation = Sphoords.getScreenOrientation();

		// Coordinates depend on the orientation
		var theta = 0, phi = 0;

		switch (orientation) {
			// Portrait mode
			case 'portrait-primary':
				theta = evt.alpha + evt.gamma;
				phi = evt.beta - 90;

				break;

			// Landscape mode
			case 'landscape-primary':
				// If "-90" is not present for theta, origin won't be the same than for portrait mode
				theta = evt.alpha + evt.beta - 90;
				phi = -evt.gamma - 90;

				// The user looks to the top while phi "looks" to the bottom
				if (Math.abs(evt.beta) > 90) {
					// Here browser engines have different behaviors
					// Hope we have a really respected standard soon

					switch (engine) {
						case 'Blink':
							phi += 180;
							break;

						case 'Gecko':
						default:
							phi = -phi;
							break;
					}
				}

				//fix to work on iOS (tested on Safari and Chrome)
				if( engine === 'WebKit' && !!window.orientation ){
					if( phi < 0 ){
						phi = (phi + 180) * -1;
					}
					if( theta >= 180 ){
						theta = theta - 180;
					} else {
						theta = theta + 180;
					}
				}

				break;

			// Landscape mode (inversed)
			case 'landscape-secondary':
				// Still the same reason for "+90"
				theta = evt.alpha - evt.beta + 90;
				phi = evt.gamma - 90;

				// The user looks to the top while phi "looks" to the bottom
				if (Math.abs(evt.beta) > 90) {
					// Here again, some different behaviors…

					switch (engine) {
						case 'Blink':
							phi += 180;
							break;

						case 'Gecko':
						default:
							phi = -phi;
							break;
					}
				}

				//fix to work on iOS (tested on Safari and Chrome)
				if( engine === 'WebKit' && !!window.orientation ){
					if( phi < 0 ){
						phi = (phi + 180) * -1;
					}
					if( theta >= 180 ){
						theta = theta - 180;
					} else {
						theta = theta + 180;
					}
				}

				break;

			// Portrait mode (inversed)
			case 'portrait-secondary':
				theta = evt.alpha - evt.gamma;
				phi = 180 - (evt.beta - 90);
				phi = 270 - evt.beta;

				break;
		}

		// First, we want phi to be between -π and π
		phi = getPrincipalAngle(phi);

		if (phi >= 180)
			phi -= 360;

		// We store the right values
		long_deg = getPrincipalAngle(theta);
		lat_deg = Math.max(-90, Math.min(90, phi));

		long = long_deg * DEG_TO_RAD;
		lat = lat_deg * DEG_TO_RAD;

		// We execute the wanted functions
		executeListeners();
	};

	/**
	 * Returns the current coordinates.
	 * @public
	 * @return {object} Longitude/latitude couple
	 **/

	this.getCoordinates = function() {
		return {
				longitude: long,
				latitude: lat
			};
	};

	/**
	 * Returns the current coordinates in degrees.
	 * @return {object} Longitude/latitude couple
	 **/

	this.getCoordinatesInDegrees = function() {
		return {
				longitude: long_deg,
				latitude: lat_deg
			};
	};

	/**
	 * Returns the current screen orientation.
	 * @return {string|null} The screen orientation (portrait-primary, portrait-secondary, landscape-primary, landscape-secondary) or `null` if not supported
	 **/

	this.getScreenOrientation = function() {
		return orientation;
	};

	/**
	 * Adds a function to execute when device orientation changes.
	 * @public
	 * @param {function} f - The handler function
	 * @return {void}
	 **/

	this.addListener = function(f) {
		listeners.push(f);
	};

	/**
	 * Executes all the wanted functions for the main event.
	 * @private
	 * @return {void}
	 **/

	var executeListeners = function() {
		if (!!listeners.length) {
			for (var i = 0, l = listeners.length; i < l; ++i) {
				listeners[i]({
					longitude: long,
					latitude: lat
				});
			}
		}
	};

	// Current state
	var recording = false;

	// Coordinates in degrees
	var long_deg = 0, lat_deg = 0;

	// Coordinates in radians
	var long = 0, lat = 0;

	// What a useful constant!
	var DEG_TO_RAD = Math.PI / 180;

	// Screen orientation
	var orientation = Sphoords.getScreenOrientation();

	// Browser engine
	var engine = detectBrowserEngine();

	// Listeners
	var listeners = [];
};

/**
 * Retrieves the current screen orientation.
 * @static
 * @return {string|null} Current screen orientation, `null` if not supported
 **/

Sphoords.getScreenOrientation = function() {
	var screen_orientation = null;

	if (!!screen.orientation)
		screen_orientation = screen.orientation;

	else if (!!screen.mozOrientation)
		screen_orientation = screen.mozOrientation;

	else if (!!screen.msOrientation)
		screen_orientation = screen.msOrientation;

	else if (!!window.orientation || window.orientation === 0)
		switch (window.orientation) {
			case 0:
				screen_orientation = 'portrait-primary';
				break;
			case 180:
				screen_orientation = 'portrait-secondary';
				break;
			case -90:
				screen_orientation = 'landscape-primary';
				break;
			case 90:
				screen_orientation = 'landscape-secondary';
				break;
		}

	// Are the specs respected?
	return (screen_orientation !== null && (typeof screen_orientation == 'object')) ? screen_orientation.type : screen_orientation;
};

/**
 * A boolean to know if device orientation is supported (`true` if it is, `false` otherwise).
 * @static
 **/

Sphoords.isDeviceOrientationSupported = false;

// Just testing if window.DeviceOrientationEvent is defined is not enough
// In fact, it can return false positives with some desktop browsers which run in computers that don't have the dedicated hardware
(function() {
	// We attach the right event
	// If it is fired, the API is really supported so we can indicate true :)
	if (!!window.DeviceOrientationEvent && Sphoords.getScreenOrientation() !== null) {
		function testDeviceOrientation(evt) {
			if (evt !== null && evt.alpha !== null) {
				Sphoords.isDeviceOrientationSupported = true;
				window.removeEventListener('deviceorientation', testDeviceOrientation);
			}
		}

		window.addEventListener('deviceorientation', testDeviceOrientation);
	}
})();
