/*
 * Photo Sphere Viewer v2.3.1
 * http://jeremyheleine.me/photo-sphere-viewer
 *
 * Copyright (c) 2014,2015 Jérémy Heleine
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
 * Represents a panorama viewer.
 * @class
 * @param {object} args - Settings to apply to the viewer
 * @param {string} args.panorama - Panorama URL or path (absolute or relative)
 * @param {HTMLElement} args.container - Panorama container (should be a `div` or equivalent)
 * @param {boolean} [args.autoload=true] - `true` to automatically load the panorama, `false` to load it later (with the {@link PhotoSphereViewer#load|`.load`} method)
 * @param {boolean} [args.usexmpdata=true] - `true` if Photo Sphere Viewer must read XMP data, `false` if it is not necessary
 * @param {object} [args.default_position] - Defines the default position (the first point seen by the user)
 * @param {number|string} [args.default_position.long=0] - Default longitude, in radians (or in degrees if indicated, e.g. `'45deg'`)
 * @param {number|string} [args.default_position.lat=0] - Default latitude, in radians (or in degrees if indicated, e.g. `'45deg'`)
 * @param {number} [args.min_fov=30] - The minimal field of view, in degrees, between 1 and 179
 * @param {number} [args.max_fov=90] - The maximal field of view, in degrees, between 1 and 179
 * @param {boolean} [args.allow_user_interactions=true] - If set to `false`, the user won't be able to interact with the panorama (navigation bar is then disabled)
 * @param {number|string} [args.tilt_up_max=π/2] - The maximal tilt up angle, in radians (or in degrees if indicated, e.g. `'30deg'`)
 * @param {number|string} [args.tilt_down_max=π/2] - The maximal tilt down angle, in radians (or in degrees if indicated, e.g. `'30deg'`)
 * @param {number} [args.zoom_level=0] - The default zoom level, between 0 and 100
 * @param {number} [args.long_offset=π/360] - The longitude to travel per pixel moved by mouse/touch
 * @param {number} [args.lat_offset=π/180] - The latitude to travel per pixel moved by mouse/touch
 * @param {integer} [args.time_anim=2000] - Delay before automatically animating the panorama in milliseconds, `false` to not animate
 * @param {integer} [args.theta_offset=1440] - (deprecated, use `anim_speed` instead) The π fraction to add to theta during the animation
 * @param {string} [args.anim_speed=2rpm] - Animation speed in radians/degrees/revolutions per second/minute
 * @param {boolean} [args.navbar=false] - Display the navigation bar if set to `true`
 * @param {object} [args.navbar_style] - Style of the navigation bar
 * @param {string} [args.navbar_style.backgroundColor=rgba(61, 61, 61, 0.5)] - Navigation bar background color
 * @param {string} [args.navbar_style.buttonsColor=rgba(255, 255, 255, 0.7)] - Buttons foreground color
 * @param {string} [args.navbar_style.buttonsBackgroundColor=transparent] - Buttons background color
 * @param {string} [args.navbar_style.activeButtonsBackgroundColor=rgba(255, 255, 255, 0.1)] - Active buttons background color
 * @param {number} [args.navbar_style.buttonsHeight=20] - Buttons height in pixels
 * @param {number} [args.navbar_style.autorotateThickness=1] - Autorotate icon thickness in pixels
 * @param {number} [args.navbar_style.zoomRangeWidth=50] - Zoom range width in pixels
 * @param {number} [args.navbar_style.zoomRangeThickness=1] - Zoom range thickness in pixels
 * @param {number} [args.navbar_style.zoomRangeDisk=7] - Zoom range disk diameter in pixels
 * @param {number} [args.navbar_style.fullscreenRatio=4/3] - Fullscreen icon ratio (width/height)
 * @param {number} [args.navbar_style.fullscreenThickness=2] - Fullscreen icon thickness in pixels
 * @param {string} [args.loading_msg=Loading…] - Loading message
 * @param {string} [args.loading_img=null] - Loading image URL or path (absolute or relative)
 * @param {object} [args.size] - Final size of the panorama container (e.g. {width: 500, height: 300})
 * @param {(number|string)} [args.size.width] - Final width in percentage (e.g. `'50%'`) or pixels (e.g. `500` or `'500px'`) ; default to current width
 * @param {(number|string)} [args.size.height] - Final height in percentage or pixels ; default to current height
 * @param {PhotoSphereViewer~onReady} [args.onready] - Function called once the panorama is ready and the first image is displayed
 **/

var PhotoSphereViewer = function(args) {
	/**
	 * Detects whether canvas is supported.
	 * @private
	 * @return {boolean} `true` if canvas is supported, `false` otherwise
	 **/

	var isCanvasSupported = function() {
		var canvas = document.createElement('canvas');
		return !!(canvas.getContext && canvas.getContext('2d'));
	};

	/**
	 * Detects whether WebGL is supported.
	 * @private
	 * @return {boolean} `true` if WebGL is supported, `false` otherwise
	 **/

	var isWebGLSupported = function() {
		var canvas = document.createElement('canvas');
		return !!(window.WebGLRenderingContext && canvas.getContext('webgl'));
	};

	/**
	 * Attaches an event handler function to an element.
	 * @private
	 * @param {HTMLElement} elt - The element
	 * @param {string} evt - The event name
	 * @param {function} f - The handler function
	 * @return {void}
	 **/

	var addEvent = function(elt, evt, f) {
		if (!!elt.addEventListener)
			elt.addEventListener(evt, f, false);
		else
			elt.attachEvent('on' + evt, f);
	};

	/**
	 * Ensures that a number is in a given interval.
	 * @private
	 * @param {number} x - The number to check
	 * @param {number} min - First endpoint
	 * @param {number} max - Second endpoint
	 * @return {number} The checked number
	 **/

	var stayBetween = function(x, min, max) {
		return Math.max(min, Math.min(max, x));
	};

	/**
	 * Calculates the distance between two points (square of the distance is enough).
	 * @private
	 * @param {number} x1 - First point horizontal coordinate
	 * @param {number} y1 - First point vertical coordinate
	 * @param {number} x2 - Second point horizontal coordinate
	 * @param {number} y2 - Second point vertical coordinate
	 * @return {number} Square of the wanted distance
	 **/

	var dist = function(x1, y1, x2, y2) {
		var x = x2 - x1;
		var y = y2 - y1;
		return x*x + y*y;
	};

	/**
	 * Returns the measure of an angle (between 0 and 2π).
	 * @private
	 * @param {number} angle - The angle to reduce
	 * @return {number} The wanted measure
	 **/

	var getAngleMeasure = function(angle) {
		return angle - Math.floor(angle / (2.0 * Math.PI)) * 2.0 * Math.PI;
	};

	/**
	 * Starts to load the panorama.
	 * @public
	 * @return {void}
	 **/

	this.load = function() {
		// Loading indicator (text or image if given)
		if (!!loading_img) {
			var loading = document.createElement('img');
			loading.setAttribute('src', loading_img);
			loading.setAttribute('alt', loading_msg);
			container.appendChild(loading);
		}
		else
			container.textContent = loading_msg;

		// Adds a new container
		root = document.createElement('div');
		root.style.width = '100%';
		root.style.height = '100%';
		root.style.position = 'relative';
		root.style.overflow = 'hidden';

		// Is canvas supported?
		if (!isCanvasSupported()) {
			container.textContent = 'Canvas is not supported, update your browser!';
			return;
		}

		// Is Three.js loaded?
		if (window.THREE === undefined) {
			console.log('PhotoSphereViewer: Three.js is not loaded.');
			return;
		}

		// Current viewer size
		viewer_size = {
			width: 0,
			height: 0,
			ratio: 0
		};

		// XMP data?
		if (readxmp)
			loadXMP();

		else
			createBuffer(false);
	};

	/**
	 * Returns the value of a given attribute in the panorama metadata.
	 * @private
	 * @param {string} data - The panorama metadata
	 * @param {string} attr - The wanted attribute
	 * @return {string} The value of the attribute
	 **/

	var getAttribute = function(data, attr) {
		var a = data.indexOf('GPano:' + attr) + attr.length + 8, b = data.indexOf('"', a);
		return data.substring(a, b);
	};

	/**
	 * Loads the XMP data with AJAX.
	 * @private
	 * @return {void}
	 **/

	var loadXMP = function() {
		var xhr = null;

		if (window.XMLHttpRequest)
			xhr = new XMLHttpRequest();

		else if (window.ActiveXObject) {
			try {
				xhr = new ActiveXObject('Msxml2.XMLHTTP');
			}
			catch (e) {
				xhr = new ActiveXObject('Microsoft.XMLHTTP');
			}
		}

		else {
			container.textContent = 'XHR is not supported, update your browser!';
			return;
		}

		xhr.onreadystatechange = function() {
				if (xhr.readyState == 4 && xhr.status == 200) {
					// Metadata
					var binary = xhr.responseText;
					var a = binary.indexOf('<x:xmpmeta'), b = binary.indexOf('</x:xmpmeta>');
					var data = binary.substring(a, b);

					// No data retrieved
					if (a == -1 || b == -1 || data.indexOf('GPano:') == -1) {
						createBuffer(false);
						return;
					}

					// Useful values
					var pano_data = {
							full_width: parseInt(getAttribute(data, 'FullPanoWidthPixels')),
							full_height: parseInt(getAttribute(data, 'FullPanoHeightPixels')),
							cropped_width: parseInt(getAttribute(data, 'CroppedAreaImageWidthPixels')),
							cropped_height: parseInt(getAttribute(data, 'CroppedAreaImageHeightPixels')),
							cropped_x: parseInt(getAttribute(data, 'CroppedAreaLeftPixels')),
							cropped_y: parseInt(getAttribute(data, 'CroppedAreaTopPixels')),
						};

					createBuffer(pano_data);
				}
			};

		xhr.open('GET', panorama, true);
		xhr.send(null);
	};

	/**
	 * Creates an image in the right dimensions.
	 * @private
	 * @param {mixed} pano_data - An object containing the panorama XMP data (`false` if there is not)
	 * @return {void}
	 **/

	var createBuffer = function(pano_data) {
		var img = new Image();

		img.onload = function() {
				// No XMP data?
				if (!pano_data) {
					pano_data = {
						full_width: img.width,
						full_height: img.height,
						cropped_width: img.width,
						cropped_height: img.height,
						cropped_x: 0,
						cropped_y: 0,
					};
				}

				// Size limit for mobile compatibility
				var max_width = 2048;
				if (isWebGLSupported()) {
					var canvas = document.createElement('canvas');
					var ctx = canvas.getContext('webgl');
					max_width = ctx.getParameter(ctx.MAX_TEXTURE_SIZE);
				}

				// Buffer width (not too big)
				var new_width = Math.min(pano_data.full_width, max_width);
				var r = new_width / pano_data.full_width;

				pano_data.full_width = new_width;
				pano_data.cropped_width *= r;
				pano_data.cropped_x *= r;
				img.width = pano_data.cropped_width;

				// Buffer height (proportional to the width)
				pano_data.full_height *= r;
				pano_data.cropped_height *= r;
				pano_data.cropped_y *= r;
				img.height = pano_data.cropped_height;

				// Buffer creation
				var buffer = document.createElement('canvas');
				buffer.width = pano_data.full_width;
				buffer.height = pano_data.full_height;

				var ctx = buffer.getContext('2d');
				ctx.drawImage(img, pano_data.cropped_x, pano_data.cropped_y, pano_data.cropped_width, pano_data.cropped_height);

				loadTexture(buffer.toDataURL('image/jpeg'));
			};

		// CORS when the panorama is not given as a base64 string
		if (!panorama.match(/^data:image\/[a-z]+;base64/))
			img.setAttribute('crossOrigin', 'anonymous');

		img.src = panorama;
	};

	/**
	 * Loads the sphere texture.
	 * @private
	 * @param {string} path - Path to the panorama
	 * @return {void}
	 **/

	var loadTexture = function(path) {
		var texture = new THREE.Texture();
		var loader = new THREE.ImageLoader();

		var onLoad = function(img) {
			texture.needsUpdate = true;
			texture.image = img;

			createScene(texture);
		}

		loader.load(path, onLoad);
	};

	/**
	 * Creates the 3D scene.
	 * @private
	 * @param {THREE.Texture} texture - The sphere texture
	 * @return {void}
	 **/

	var createScene = function(texture) {
		// New size?
		if (new_viewer_size.width !== undefined)
			container.style.width = new_viewer_size.width.css;

		if (new_viewer_size.height !== undefined)
			container.style.height = new_viewer_size.height.css;

		fitToContainer();

		// The chosen renderer depends on whether WebGL is supported or not
		renderer = (isWebGLSupported()) ? new THREE.WebGLRenderer() : new THREE.CanvasRenderer();
		renderer.setSize(viewer_size.width, viewer_size.height);

		scene = new THREE.Scene();

		camera = new THREE.PerspectiveCamera(PSV_FOV_MAX, viewer_size.ratio, 1, 300);
		camera.position.set(0, 0, 0);
		scene.add(camera);

		// Sphere
		var geometry = new THREE.SphereGeometry(200, 32, 32);
		var material = new THREE.MeshBasicMaterial({map: texture, overdraw: true});
		var mesh = new THREE.Mesh(geometry, material);
		mesh.scale.x = -1;
		scene.add(mesh);

		// Canvas container
		canvas_container = document.createElement('div');
		canvas_container.style.position = 'absolute';
		canvas_container.style.zIndex = 0;
		root.appendChild(canvas_container);

		// Navigation bar?
		if (display_navbar) {
			navbar.setStyle(navbar_style);
			navbar.create();
			root.appendChild(navbar.getBar());
		}

		// Adding events
		addEvent(window, 'resize', fitToContainer);

		if (user_interactions_allowed) {
			addEvent(canvas_container, 'mousedown', onMouseDown);
			addEvent(document, 'mousemove', onMouseMove);
			addEvent(canvas_container, 'mousemove', showNavbar);
			addEvent(document, 'mouseup', onMouseUp);

			addEvent(canvas_container, 'touchstart', onTouchStart);
			addEvent(document, 'touchend', onMouseUp);
			addEvent(document, 'touchmove', onTouchMove);

			addEvent(canvas_container, 'mousewheel', onMouseWheel);
			addEvent(canvas_container, 'DOMMouseScroll', onMouseWheel);
		}

		addEvent(document, 'fullscreenchange', fullscreenToggled);
		addEvent(document, 'mozfullscreenchange', fullscreenToggled);
		addEvent(document, 'webkitfullscreenchange', fullscreenToggled);
		addEvent(document, 'MSFullscreenChange', fullscreenToggled);

		sphoords.addListener(onDeviceOrientation);

		// First render
		container.innerHTML = '';
		container.appendChild(root);

		var canvas = renderer.domElement;
		canvas.style.display = 'block';

		canvas_container.appendChild(canvas);
		render();

		// Zoom?
		if (zoom_lvl > 0)
			zoom(zoom_lvl);

		// Animation?
		anim();

		/**
		 * Indicates that the loading is finished: the first image is rendered
		 * @callback PhotoSphereViewer~onReady
		 **/

		triggerAction('ready');
	};

	/**
	* Renders an image.
	* @private
	* @return {void}
	**/

	var render = function() {
		var point = new THREE.Vector3();
		point.setX(Math.cos(lat) * Math.sin(long));
		point.setY(Math.sin(lat));
		point.setZ(Math.cos(lat) * Math.cos(long));

		camera.lookAt(point);

		// Stereo?
		if (stereo_effect !== null)
			stereo_effect.render(scene, camera);

		else
			renderer.render(scene, camera);
	};

	/**
	 * Starts the stereo effect.
	 * @private
	 * @return {void}
	 **/

	var startStereo = function() {
		stereo_effect = new THREE.StereoEffect(renderer);
		stereo_effect.eyeSeparation = 5;
		stereo_effect.setSize(viewer_size.width, viewer_size.height);

		startDeviceOrientation();
		enableFullscreen();
		navbar.mustBeHidden();
		render();

		/**
		 * Indicates that the stereo effect has been toggled.
		 * @callback PhotoSphereViewer~onStereoEffectToggled
		 * @param {boolean} enabled - `true` if stereo effect is enabled, `false` otherwise
		 **/

		triggerAction('stereo-effect', true);
	};

	/**
	 * Stops the stereo effect.
	 * @private
	 * @return {void}
	 **/

	var stopStereo = function() {
		stereo_effect = null;
		renderer.setSize(viewer_size.width, viewer_size.height);

		navbar.mustBeHidden(false);
		render();

		triggerAction('stereo-effect', false);
	};

	/**
	 * Toggles the stereo effect (virtual reality).
	 * @public
	 * @return {void}
	 **/

	this.toggleStereo = function() {
		if (stereo_effect !== null)
			stopStereo();

		else
			startStereo();
	};

	/**
	* Automatically animates the panorama.
	* @private
	* @return {void}
	**/

	var anim = function() {
		if (anim_delay !== false)
			anim_timeout = setTimeout(startAutorotate, anim_delay);
	};

	/**
	* Automatically rotates the panorama.
	* @private
	* @return {void}
	**/

	var autorotate = function() {
		// Returns to the equator (lat = 0)
		lat -= lat / 200;

		// Rotates the sphere
		long += long_offset;
		long -= Math.floor(long / (2.0 * Math.PI)) * 2.0 * Math.PI;

		render();
		autorotate_timeout = setTimeout(autorotate, PSV_ANIM_TIMEOUT);
	};

	/**
	 * Starts the autorotate animation.
	 * @private
	 * @return {void}
	 **/

	var startAutorotate = function() {
		autorotate();

		/**
		 * Indicates that the autorotate animation state has changed.
		 * @callback PhotoSphereViewer~onAutorotateChanged
		 * @param {boolean} enabled - `true` if animation is enabled, `false` otherwise
		 **/

		triggerAction('autorotate', true);
	};

	/**
	 * Stops the autorotate animation.
	 * @private
	 * @return {void}
	 **/

	var stopAutorotate = function() {
		clearTimeout(anim_timeout);
		anim_timeout = null;

		clearTimeout(autorotate_timeout);
		autorotate_timeout = null;

		triggerAction('autorotate', false);
	};

	/**
	 * Launches/stops the autorotate animation.
	 * @public
	 * @return {void}
	 **/

	this.toggleAutorotate = function() {
		clearTimeout(anim_timeout);

		if (!!autorotate_timeout)
			stopAutorotate();

		else
			startAutorotate();
	};

	/**
	 * Resizes the canvas to make it fit the container.
	 * @private
	 * @return {void}
	 **/

	var fitToContainer = function() {
		if (container.clientWidth != viewer_size.width || container.clientHeight != viewer_size.height) {
			resize({
				width: container.clientWidth,
				height: container.clientHeight
			});
		}
	};

	/**
	 * Resizes the canvas to make it fit the container.
	 * @public
	 * @return {void}
	 **/

	this.fitToContainer = function() {
		fitToContainer();
	};

	/**
	 * Resizes the canvas.
	 * @private
	 * @param {object} size - New dimensions
	 * @param {number} [size.width] - The new canvas width (default to previous width)
	 * @param {number} [size.height] - The new canvas height (default to previous height)
	 * @return {void}
	 **/

	var resize = function(size) {
		viewer_size.width = (size.width !== undefined) ? parseInt(size.width) : viewer_size.width;
		viewer_size.height = (size.height !== undefined) ? parseInt(size.height) : viewer_size.height;
		viewer_size.ratio = viewer_size.width / viewer_size.height;

		if (!!camera) {
			camera.aspect = viewer_size.ratio;
			camera.updateProjectionMatrix();
		}

		if (!!renderer) {
			renderer.setSize(viewer_size.width, viewer_size.height);
			render();
		}

		if (!!stereo_effect) {
			stereo_effect.setSize(viewer_size.width, viewer_size.height);
			render();
		}
	};

	/**
	 * The user wants to move.
	 * @private
	 * @param {Event} evt - The event
	 * @return {void}
	 **/

	var onMouseDown = function(evt) {
		startMove(parseInt(evt.clientX), parseInt(evt.clientY));
	};

	/**
	 * The user wants to move or to zoom (mobile version).
	 * @private
	 * @param {Event} evt - The event
	 * @return {void}
	 **/

	var onTouchStart = function(evt) {
		// Move
		if (evt.touches.length == 1) {
			var touch = evt.touches[0];
			if (touch.target.parentNode == canvas_container)
				startMove(parseInt(touch.clientX), parseInt(touch.clientY));
		}

		// Zoom
		else if (evt.touches.length == 2) {
			onMouseUp();

			if (evt.touches[0].target.parentNode == canvas_container && evt.touches[1].target.parentNode == canvas_container)
				startTouchZoom(dist(evt.touches[0].clientX, evt.touches[0].clientY, evt.touches[1].clientX, evt.touches[1].clientY));
		}

		// Show navigation bar if hidden
		showNavbar();
	};

	/**
	 * Initializes the movement.
	 * @private
	 * @param {integer} x - Horizontal coordinate
	 * @param {integer} y - Vertical coordinate
	 * @return {void}
	 **/

	var startMove = function(x, y) {
		mouse_x = x;
		mouse_y = y;

		stopAutorotate();

		mousedown = true;
	};

	/**
	 * Initializes the "pinch to zoom" action.
	 * @private
	 * @param {number} d - Square of the distance between the two fingers
	 * @return {void}
	 **/

	var startTouchZoom = function(d) {
		touchzoom_dist = d;

		touchzoom = true;
	};

	/**
	 * The user wants to stop moving (or stop zooming with their finger).
	 * @private
	 * @param {Event} evt - The event
	 * @return {void}
	 **/

	var onMouseUp = function(evt) {
		mousedown = false;
		touchzoom = false;
	};

	/**
	 * The user moves the image.
	 * @private
	 * @param {Event} evt - The event
	 * @return {void}
	 **/

	var onMouseMove = function(evt) {
		evt.preventDefault();
		move(parseInt(evt.clientX), parseInt(evt.clientY));
	};

	/**
	 * The user moves the image (mobile version).
	 * @private
	 * @param {Event} evt - The event
	 * @return {void}
	 **/

	var onTouchMove = function(evt) {
		// Move
		if (evt.touches.length == 1 && mousedown) {
			var touch = evt.touches[0];
			if (touch.target.parentNode == canvas_container) {
				evt.preventDefault();
				move(parseInt(touch.clientX), parseInt(touch.clientY));
			}
		}

		// Zoom
		else if (evt.touches.length == 2) {
			if (evt.touches[0].target.parentNode == canvas_container && evt.touches[1].target.parentNode == canvas_container && touchzoom) {
				evt.preventDefault();

				// Calculate the new level of zoom
				var d = dist(evt.touches[0].clientX, evt.touches[0].clientY, evt.touches[1].clientX, evt.touches[1].clientY);
				var diff = d - touchzoom_dist;

				if (diff != 0) {
					var direction = diff / Math.abs(diff);
					zoom(zoom_lvl + direction);

					touchzoom_dist = d;
				}
			}
		}
	};

	/**
	 * Movement.
	 * @private
	 * @param {integer} x - Horizontal coordinate
	 * @param {integer} y - Vertical coordinate
	 * @return {void}
	 **/

	var move = function(x, y) {
		if (mousedown) {
			long = getAngleMeasure(long + (x - mouse_x) * PSV_LONG_OFFSET);
			lat += (y - mouse_y) * PSV_LAT_OFFSET;
			lat = stayBetween(lat, PSV_TILT_DOWN_MAX, PSV_TILT_UP_MAX);

			mouse_x = x;
			mouse_y = y;
			render();
		}
	};

	/**
	 * Starts following the device orientation.
	 * @private
	 * @return {void}
	 **/

	var startDeviceOrientation = function() {
		sphoords.start();
		stopAutorotate();

		/**
		 * Indicates that we starts/stops following the device orientation.
		 * @callback PhotoSphereViewer~onDeviceOrientationStateChanged
		 * @param {boolean} state - `true` if device orientation is followed, `false` otherwise
		 **/

		triggerAction('device-orientation', true);
	};

	/**
	 * Stops following the device orientation.
	 * @private
	 * @return {void}
	 **/

	var stopDeviceOrientation = function() {
		sphoords.stop();

		triggerAction('device-orientation', false);
	};

	/**
	 * Starts/stops following the device orientation.
	 * @public
	 * @return {void}
	 **/

	this.toggleDeviceOrientation = function() {
		if (sphoords.isEventAttached())
			stopDeviceOrientation();

		else
			startDeviceOrientation();
	};

	/**
	* The user moved their device.
	* @private
	* @param {object} coords - The spherical coordinates to look at
	* @param {number} coords.longitude - The longitude
	* @param {number} coords.latitude - The latitude
	* @return {void}
	**/

	var onDeviceOrientation = function(coords) {
		long = coords.longitude;
		lat = stayBetween(coords.latitude, PSV_TILT_DOWN_MAX, PSV_TILT_UP_MAX);

		render();
	};

	/**
	 * The user wants to zoom.
	 * @private
	 * @param {Event} evt - The event
	 * @return {void}
	 **/

	var onMouseWheel = function(evt) {
		evt.preventDefault();
		evt.stopPropagation();

		var delta = (evt.detail) ? -evt.detail : evt.wheelDelta;

		if (delta != 0) {
			var direction = parseInt(delta / Math.abs(delta));
			zoom(zoom_lvl + direction);
		}
	};

	/**
	 * Sets the new zoom level.
	 * @private
	 * @param {integer} level - New zoom level
	 * @return {void}
	 **/

	var zoom = function(level) {
		zoom_lvl = stayBetween(parseInt(Math.round(level)), 0, 100);

		camera.fov = PSV_FOV_MAX + (zoom_lvl / 100) * (PSV_FOV_MIN - PSV_FOV_MAX);
		camera.updateProjectionMatrix();
		render();

		/**
		 * Indicates that the zoom level has changed.
		 * @callback PhotoSphereViewer~onZoomUpdated
		 * @param {number} zoom_level - The new zoom level
		 **/

		triggerAction('zoom-updated', zoom_lvl);
	};

	/**
	 * Sets the new zoom level.
	 * @public
	 * @param {integer} level - New zoom level
	 * @return {void}
	 **/

	this.zoom = function(level) {
		zoom(level);
	};

	/**
	 * Zoom in.
	 * @public
	 * @return {void}
	 **/

	this.zoomIn = function() {
		if (zoom_lvl < 100)
			zoom(zoom_lvl + 1);
	};

	/**
	 * Zoom out.
	 * @public
	 * @return {void}
	 **/

	this.zoomOut = function() {
		if (zoom_lvl > 0)
			zoom(zoom_lvl - 1);
	};

	/**
	 * Detects whether fullscreen is enabled or not.
	 * @private
	 * @return {boolean} `true` if fullscreen is enabled, `false` otherwise
	 **/

	var isFullscreenEnabled = function() {
		return (!!document.fullscreenElement || !!document.mozFullScreenElement || !!document.webkitFullscreenElement || !!document.msFullscreenElement);
	};

	/**
	 * Fullscreen state has changed.
	 * @private
	 * @return {void}
	 **/

	var fullscreenToggled = function() {
		// Fix the (weird and ugly) Chrome behavior
		if (!!document.webkitFullscreenElement) {
			real_viewer_size.width = container.style.width;
			real_viewer_size.height = container.style.height;

			container.style.width = '100%';
			container.style.height = '100%';
			fitToContainer();
		}

		else if (!!container.webkitRequestFullscreen) {
			container.style.width = real_viewer_size.width;
			container.style.height = real_viewer_size.height;
			fitToContainer();
		}

		/**
		 * Indicates that the fullscreen mode has been toggled.
		 * @callback PhotoSphereViewer~onFullscreenToggled
		 * @param {boolean} enabled - `true` if fullscreen is enabled, `false` otherwise
		 **/

		triggerAction('fullscreen-mode', isFullscreenEnabled());
	};

	/**
	 * Enables fullscreen.
	 * @private
	 * @return {void}
	 **/

	var enableFullscreen = function() {
		if (!!container.requestFullscreen)
			container.requestFullscreen();

		else if (!!container.mozRequestFullScreen)
			container.mozRequestFullScreen();

		else if (!!container.webkitRequestFullscreen)
			container.webkitRequestFullscreen();

		else if (!!container.msRequestFullscreen)
			container.msRequestFullscreen();
	};

	/**
	 * Disables fullscreen.
	 * @private
	 * @return {void}
	 **/

	var disableFullscreen = function() {
		if (!!document.exitFullscreen)
			document.exitFullscreen();

		else if (!!document.mozCancelFullScreen)
			document.mozCancelFullScreen();

		else if (!!document.webkitExitFullscreen)
			document.webkitExitFullscreen();

		else if (!!document.msExitFullscreen)
			document.msExitFullscreen();
	};

	/**
	 * Enables/disables fullscreen.
	 * @public
	 * @return {void}
	 **/

	this.toggleFullscreen = function() {
		// Switches to fullscreen mode
		if (!isFullscreenEnabled())
			enableFullscreen();

		// Switches to windowed mode
		else
			disableFullscreen();
	};

	/**
	 * Shows the navigation bar.
	 * @private
	 * @return {void}
	 **/

	var showNavbar = function() {
		if (display_navbar)
			navbar.show();
	};

	/**
	 * Sets the animation speed.
	 * @private
	 * @param {string} speed - The speed, in radians/degrees/revolutions per second/minute
	 * @return {void}
	 **/

	var setAnimSpeed = function(speed) {
		speed = speed.toString().trim();

		// Speed extraction
		var speed_value = parseFloat(speed.replace(/^(-?[0-9]+(?:\.[0-9]*)?).*$/, '$1'));
		var speed_unit = speed.replace(/^-?[0-9]+(?:\.[0-9]*)?(.*)$/, '$1').trim();

		// "per minute" -> "per second"
		if (speed_unit.match(/(pm|per minute)$/))
			speed_value /= 60;

		var rad_per_second = 0;

		// Which unit?
		switch (speed_unit) {
			// Revolutions per minute / second
			case 'rpm':
			case 'rev per minute':
			case 'revolutions per minute':
			case 'rps':
			case 'rev per second':
			case 'revolutions per second':
				// speed * 2pi
				rad_per_second = speed_value * 2 * Math.PI;
				break;

			// Degrees per minute / second
			case 'dpm':
			case 'deg per minute':
			case 'degrees per minute':
			case 'dps':
			case 'deg per second':
			case 'degrees per second':
				// Degrees to radians (rad = deg * pi / 180)
				rad_per_second = speed_value * Math.PI / 180;
				break;

			// Radians per minute / second
			case 'rad per minute':
			case 'radians per minute':
			case 'rad per second':
			case 'radians per second':
				rad_per_second = speed_value;
				break;

			// Unknown unit
			default:
				m_anim = false;
		}

		// Longitude offset
		long_offset = rad_per_second * PSV_ANIM_TIMEOUT / 1000;
	};

	/**
	 * Parses an angle given in radians or degrees.
	 * @private
	 * @param {number|string} angle - Angle in radians (number) or in degrees (string)
	 * @return {number} The angle in radians
	 **/

	var parseAngle = function(angle) {
		angle = angle.toString().trim();

		// Angle extraction
		var angle_value = parseFloat(angle.replace(/^(-?[0-9]+(?:\.[0-9]*)?).*$/, '$1'));
		var angle_unit = angle.replace(/^-?[0-9]+(?:\.[0-9]*)?(.*)$/, '$1').trim();

		// Degrees
		if (angle_unit == 'deg')
			angle_value *= Math.PI / 180;

		// Radians by default, we don't have anyting to do
		return getAngleMeasure(angle_value);
	};

	/**
	 * Sets the viewer size.
	 * @private
	 * @param {object} size - An object containing the wanted width and height
	 * @return {void}
	 **/

	var setNewViewerSize = function(size) {
		// Checks all the values
		for (dim in size) {
			// Only width and height matter
			if (dim == 'width' || dim == 'height') {
				// Size extraction
				var size_str = size[dim].toString().trim();

				var size_value = parseFloat(size_str.replace(/^([0-9]+(?:\.[0-9]*)?).*$/, '$1'));
				var size_unit = size_str.replace(/^[0-9]+(?:\.[0-9]*)?(.*)$/, '$1').trim();

				// Only percentages and pixels are allowed
				if (size_unit != '%')
					size_unit = 'px';

				// We're good
				new_viewer_size[dim] = {
						css: size_value + size_unit,
						unit: size_unit
					};
			}
		}
	};

	/**
	 * Adds a function to execute when a given action occurs.
	 * @public
	 * @param {string} name - The action name
	 * @param {function} f - The handler function
	 * @return {void}
	 **/

	this.addAction = function(name, f) {
		// New action?
		if (!(name in actions))
			actions[name] = [];

		actions[name].push(f);
	};

	/**
	 * Triggers an action.
	 * @private
	 * @param {string} name - Action name
	 * @param {*} arg - An argument to send to the handler functions
	 * @return {void}
	 **/

	var triggerAction = function(name, arg) {
		// Does the action have any function?
		if ((name in actions) && !!actions[name].length) {
			for (var i = 0, l = actions[name].length; i < l; ++i) {
				if (arg !== undefined)
					actions[name][i](arg);

				else
					actions[name][i]();
			}
		}
	};

	// Required parameters
	if (args === undefined || args.panorama === undefined || args.container === undefined) {
		console.log('PhotoSphereViewer: no value given for panorama or container');
		return;
	}

	// Movement speed
	var PSV_LONG_OFFSET = (args.long_offset !== undefined) ? parseFloat(args.long_offset) : Math.PI / 360.0;
	var PSV_LAT_OFFSET = (args.lat_offset !== undefined) ? parseFloat(args.lat_offset) : Math.PI / 180.0;

	// Minimal and maximal fields of view in degrees
	var PSV_FOV_MIN = (args.min_fov !== undefined) ? stayBetween(parseFloat(args.min_fov), 1, 179) : 30;
	var PSV_FOV_MAX = (args.max_fov !== undefined) ? stayBetween(parseFloat(args.max_fov), 1, 179) : 90;

	// Maximal tilt up / down angles
	var PSV_TILT_UP_MAX = (args.tilt_up_max !== undefined) ? stayBetween(parseAngle(args.tilt_up_max), 0, Math.PI / 2.0) : Math.PI / 2.0;
	var PSV_TILT_DOWN_MAX = (args.tilt_down_max !== undefined) ? -stayBetween(parseAngle(args.tilt_down_max), 0, Math.PI / 2.0) : -Math.PI / 2.0;

	// Default position
	var lat = 0, long = 0;

	if (args.default_position !== undefined) {
		if (args.default_position.lat !== undefined)
			lat = stayBetween(parseAngle(args.default_position.lat), PSV_TILT_DOWN_MAX, PSV_TILT_UP_MAX);

		if (args.default_position.long !== undefined)
			long = parseAngle(args.default_position.long);
	}

	// Default zoom level
	var zoom_lvl = 0;

	if (args.zoom_level !== undefined)
		zoom_lvl = stayBetween(parseInt(Math.round(args.zoom_level)), 0, 100);

	// Animation constants
	var PSV_FRAMES_PER_SECOND = 60;
	var PSV_ANIM_TIMEOUT = 1000 / PSV_FRAMES_PER_SECOND;

	// Delay before the animation
	var anim_delay = 2000;

	if (args.time_anim !== undefined) {
		if (typeof args.time_anim == 'number' && args.time_anim >= 0)
			anim_delay = args.time_anim;

		else
			anim_delay = false;
	}

	// Deprecated: horizontal offset for the animation
	var long_offset = (args.theta_offset !== undefined) ? Math.PI / parseInt(args.theta_offset) : Math.PI / 1440;

	// Horizontal animation speed
	if (args.anim_speed !== undefined)
		setAnimSpeed(args.anim_speed);
	else
		setAnimSpeed('2rpm');

	// Navigation bar
	var navbar = new PSVNavBar(this);

	// Must we display the navigation bar?
	var display_navbar = (args.navbar !== undefined) ? !!args.navbar : false;

	// Style of the navigation bar
	var navbar_style = (args.navbar_style !== undefined) ? args.navbar_style : {};

	// Are user interactions allowed?
	var user_interactions_allowed = (args.allow_user_interactions !== undefined) ? !!args.allow_user_interactions : true;

	if (!user_interactions_allowed)
		display_navbar = false;

	// Container
	var container = args.container;

	// Size of the viewer
	var viewer_size, new_viewer_size = {}, real_viewer_size = {};
	if (args.size !== undefined)
		setNewViewerSize(args.size);

	// Some useful attributes
	var panorama = args.panorama;
	var root, canvas_container;
	var renderer = null, scene = null, camera = null, stereo_effect = null;
	var mousedown = false, mouse_x = 0, mouse_y = 0;
	var touchzoom = false, touchzoom_dist = 0;
	var autorotate_timeout = null, anim_timeout = null;

	var sphoords = new Sphoords();

	var actions = {};

	// Must we read XMP data?
	var readxmp = (args.usexmpdata !== undefined) ? !!args.usexmpdata : true;

	// Loading message
	var loading_msg = (args.loading_msg !== undefined) ? args.loading_msg.toString() : 'Loading…';

	// Loading image
	var loading_img = (args.loading_img !== undefined) ? args.loading_img.toString() : null;

	// Function to call once panorama is ready?
	if (args.onready !== undefined)
		this.addAction('ready', args.onready);

	// Go?
	var autoload = (args.autoload !== undefined) ? !!args.autoload : true;

	if (autoload)
		this.load();
};
