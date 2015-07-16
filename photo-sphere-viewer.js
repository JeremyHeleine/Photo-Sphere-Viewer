/*
* Photo Sphere Viewer v2.2.1
* http://jeremyheleine.com/#photo-sphere-viewer
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
 * Viewer class
 * @param args (Object) Viewer settings
 * - panorama (string) Panorama URL or path (absolute or relative)
 * - container (HTMLElement) Panorama container (should be a div or equivalent)
 * - autoload (boolean) (optional) (true) true to automatically load the panorama, false to load it later (with the .load() method)
 * - usexmpdata (boolean) (optional) (true) true if Photo Sphere Viewer must read XMP data, false if it is not necessary
 * - default_position (Object) (optional) ({}) Defines the default position, the first point seen by the user (e.g. {long: Math.PI, lat: Math.PI/2})
 * - min_fov (number) (optional) (30) The minimal field of view, in degrees, between 1 and 179
 * - max_fov (number) (optional) (90) The maximal field of view, in degrees, between 1 and 179
 * - tilt_up_max (number) (optional) (Math.PI/2) The maximal tilt up angle, in radians
 * - tilt_down_max (number) (optional) (Math.PI/2) The maximal tilt down angle, in radians
 * - zoom_level (number) (optional) (0) The default zoom level, between 0 and 100
 * - long_offset (number) (optional) (PI/360) The longitude to travel per pixel moved by mouse/touch
 * - lat_offset (number) (optional) (PI/180) The latitude to travel per pixel moved by mouse/touch
 * - time_anim (integer) (optional) (2000) Delay before automatically animating the panorama in milliseconds, false to not animate
 * - theta_offset (integer) (optional) (1440) (deprecated) The PI fraction to add to theta during the animation
 * - anim_speed (string) (optional) (2rpm) Animation speed in radians/degrees/revolutions per second/minute
 * - navbar (boolean) (optional) (false) Display the navigation bar if set to true
 * - navbar_style (Object) (optional) ({}) Style of the navigation bar
 * - loading_img (string) (optional) (null) Loading image URL or path (absolute or relative)
 * - size (Object) (optional) (null) Final size of the panorama container (e.g. {width: 500, height: 300})
 * - onready (Function) (optional) (null) Function called once the panorama is ready and the first image is displayed
 **/

var PhotoSphereViewer = function(args) {
	/**
	 * Detects whether canvas is supported
	 * @return (boolean) true if canvas is supported, false otherwise
	 **/

	var isCanvasSupported = function() {
		var canvas = document.createElement('canvas');
		return !!(canvas.getContext && canvas.getContext('2d'));
	}

	/**
	 * Detects whether WebGL is supported
	 * @return (boolean) true if WebGL is supported, false otherwise
	 **/

	var isWebGLSupported = function() {
		var canvas = document.createElement('canvas');
		return !!(window.WebGLRenderingContext && canvas.getContext('webgl'));
	}

	/**
	 * Attaches an event handler function to an elemnt
	 * @param elt (HTMLElement) The element
	 * @param evt (string) The event name
	 * @param f (Function) The handler function
	 * @return (void)
	 **/

	var addEvent = function(elt, evt, f) {
		if (!!elt.addEventListener)
			elt.addEventListener(evt, f, false);
		else
			elt.attachEvent('on' + evt, f);
	}

	/**
	 * Ensures that a number is in a given interval
	 * @param x (number) The number to check
	 * @param min (number) First endpoint
	 * @param max (number) Second endpoint
	 * @return (number) The checked number
	 **/

	var stayBetween = function(x, min, max) {
		return Math.max(min, Math.min(max, x));
	}

	/**
	 * Calculates the distance between two points (square of the distance is enough)
	 * @param x1 (number) Horizontal coordinate (first point)
	 * @param y1 (number) Vertical coordinate (first point)
	 * @param x2 (number) Horizontal coordinate (second point)
	 * @param y2 (number) Vertical coordinate (second point)
	 * @return (number) Squar of the wanted distance
	 **/

	var dist = function(x1, y1, x2, y2) {
		var x = x2 - x1;
		var y = y2 - y1;
		return x*x + y*y;
	}

	/**
	 * Returns the measure of an angle (between 0 and 2π)
	 * @param angle (number) The angle to reduce
	 * @return (number) The wanted measure
	 **/

	var getAngleMeasure = function(angle) {
		return angle - Math.floor(angle / (2.0 * Math.PI)) * 2.0 * Math.PI;
	}

	/**
	 * Starts to load the panorama
	 * @return (void)
	 **/

	this.load = function() {
		// Loading indicator (text or image if given)
		if (!!loading_img) {
			var loading = document.createElement('img');
			loading.setAttribute('src', loading_img);
			loading.setAttribute('alt', 'Loading...');
			container.appendChild(loading);
		}
		else
			container.textContent = 'Loading...';

		// Adds a new container
		root = document.createElement('div');
		root.style.width = '100%';
		root.style.height = '100%';
		root.style.position = 'relative';

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
	}

	/**
	 * Returns the value of a given attribute in the panorama metadata
	 * @param data (string) The panorama metadata
	 * @param attr (string) The wanted attribute
	 * @return (string) The value of the attribute
	 **/

	var getAttribute = function(data, attr) {
		var a = data.indexOf('GPano:' + attr) + attr.length + 8, b = data.indexOf('"', a);
		return data.substring(a, b);
	}

	/**
	 * Loads the XMP data with AJAX
	 * @return (void)
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
	}

	/**
	 * Creates an image in the right dimensions
	 * @param pano_data (mixed) An object containing the panorama XMP data (false if it there is not)
	 * @return (void)
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
	}

	/**
	 * Loads the sphere texture
	 * @param path (URL) Path to the panorama
	 * @return (void)
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
	}

	/**
	 * Creates the 3D scene
	 * @param texture (THREE.Texture) The sphere texture
	 * @return (void)
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

		addEvent(canvas_container, 'mousedown', onMouseDown);
		addEvent(canvas_container, 'touchstart', onTouchStart);
		addEvent(document, 'mouseup', onMouseUp);
		addEvent(document, 'touchend', onMouseUp);
		addEvent(document, 'mousemove', onMouseMove);
		addEvent(document, 'touchmove', onTouchMove);
		addEvent(canvas_container, 'mousewheel', onMouseWheel);
		addEvent(canvas_container, 'DOMMouseScroll', onMouseWheel);

		addEvent(document, 'fullscreenchange', fullscreenToggled);
		addEvent(document, 'mozfullscreenchange', fullscreenToggled);
		addEvent(document, 'webkitfullscreenchange', fullscreenToggled);
		addEvent(document, 'MSFullscreenChange', fullscreenToggled);

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

		// Panorama is ready
		triggerAction('ready');
	}

	/**
	* Renders an image
	* @return (void)
	**/

	var render = function() {
		var point = new THREE.Vector3();
		point.setX(Math.cos(lat) * Math.sin(long));
		point.setY(Math.sin(lat));
		point.setZ(Math.cos(lat) * Math.cos(long));

		camera.lookAt(point);
		renderer.render(scene, camera);
	}

	/**
	* Automatically animates the panorama
	* @return (void)
	**/

	var anim = function() {
		if (anim_delay !== false)
			anim_timeout = setTimeout(startAutorotate, anim_delay);
	}

	/**
	* Automatically rotates the panorama
	* @return (void)
	**/

	var autorotate = function() {
		// Returns to the equator (lat = 0)
		lat -= lat / 200;

		// Rotates the sphere
		long += long_offset;
		long -= Math.floor(long / (2.0 * Math.PI)) * 2.0 * Math.PI;

		render();
		autorotate_timeout = setTimeout(autorotate, PSV_ANIM_TIMEOUT);
	}

	/**
	 * Starts the autorotate animation
	 * @return (void)
	 **/

	var startAutorotate = function() {
		autorotate();
		triggerAction('autorotate', true);
	}

	/**
	 * Stops the autorotate animation
	 * @return (void)
	 **/

	var stopAutorotate = function() {
		clearTimeout(anim_timeout);
		anim_timeout = null;

		clearTimeout(autorotate_timeout);
		autorotate_timeout = null;

		triggerAction('autorotate', false);
	}

	/**
	 * Launches/stops the autorotate animation
	 * @return (void)
	 **/

	this.toggleAutorotate = function() {
		clearTimeout(anim_timeout);

		if (!!autorotate_timeout)
			stopAutorotate();

		else
			startAutorotate();
	}

	/**
	 * Resizes the canvas to make it fit the container
	 * @return (void)
	 **/

	var fitToContainer = function() {
		if (container.clientWidth != viewer_size.width || container.clientHeight != viewer_size.height) {
			resize({
				width: container.clientWidth,
				height: container.clientHeight
			});
		}
	}

	/**
	 * Resizes the canvas
	 * @param size (Object) New dimensions
	 * - width (integer) (optional) (previous value) The new canvas width
	 * - height (integer) (optional) (previous valus) The new canvas height
	 * @return (void)
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
	}

	/**
	 * The user wants to move
	 * @param evt (Event) The event
	 * @return (void)
	 **/

	var onMouseDown = function(evt) {
		startMove(parseInt(evt.clientX), parseInt(evt.clientY));
	}

	/**
	 * The user wants to move or to zoom (mobile version)
	 * @param evt (Event) The event
	 * @return (void)
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
	}

	/**
	 * Initializes the movement
	 * @param x (integer) Horizontal coordinate
	 * @param y (integer) Vertical coordinate
	 * @return (void)
	 **/

	var startMove = function(x, y) {
		mouse_x = x;
		mouse_y = y;

		stopAutorotate();

		mousedown = true;
	}

	/**
	 * Initializes the "pinch to zoom" action
	 * @param d (number) Square of the distance between the two fingers
	 * @return (void)
	 **/

	var startTouchZoom = function(d) {
		touchzoom_dist = d;

		touchzoom = true;
	}

	/**
	 * The user wants to stop moving (or stop zooming with their finger)
	 * @param evt (Event) The event
	 * @return (void)
	 **/

	var onMouseUp = function(evt) {
		mousedown = false;
		touchzoom = false;
	}

	/**
	 * The user moves the image
	 * @param evt (Event) The event
	 * @return (void)
	 **/

	var onMouseMove = function(evt) {
		evt.preventDefault();
		move(parseInt(evt.clientX), parseInt(evt.clientY));
	}

	/**
	 * The user moves the image (mobile version)
	 * @param evt (Event) The event
	 * @return (void)
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
	}

	/**
	 * Movement
	 * @param x (integer) Horizontal coordinate
	 * @param y (integer) Vertical coordinate
	 * @return (void)
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
	}

	/**
	 * The user wants to zoom
	 * @param evt (Event) The event
	 * @return (void)
	 **/

	var onMouseWheel = function(evt) {
		evt.preventDefault();
		evt.stopPropagation();

		var delta = (evt.detail) ? -evt.detail : evt.wheelDelta;

		if (delta != 0) {
			var direction = parseInt(delta / Math.abs(delta));
			zoom(zoom_lvl + direction);
		}
	}

	/**
	 * Zoom
	 * @paramlevel (integer) New zoom level
	 * @return (void)
	 **/

	var zoom = function(level) {
		zoom_lvl = stayBetween(parseInt(Math.round(level)), 0, 100);

		camera.fov = PSV_FOV_MAX + (zoom_lvl / 100) * (PSV_FOV_MIN - PSV_FOV_MAX);
		camera.updateProjectionMatrix();
		render();

		triggerAction('zoom-updated', zoom_lvl);
	}

	/**
	 * Zoom (public)
	 * @param level (integer) New zoom level
	 * @return (void)
	 **/
	this.zoom = function(level) {
		zoom(level);
	}

	/**
	 * Zoom in
	 * @return (void)
	 **/

	this.zoomIn = function() {
		if (zoom_lvl < 100)
			zoom(zoom_lvl + 1);
	}

	/**
	 * Zoom out
	 * @return (void)
	 **/

	this.zoomOut = function() {
		if (zoom_lvl > 0)
			zoom(zoom_lvl - 1);
	}

	/**
	 * Detects whether fullscreen is enabled or not
	 * @return (boolean) true if fullscreen is enabled, false otherwise
	 **/

	var isFullscreenEnabled = function() {
		return (!!document.fullscreenElement || !!document.mozFullScreenElement || !!document.webkitFullscreenElement || !!document.msFullscreenElement);
	}

	/**
	 * Fullscreen state has changed
	 * @return (void)
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

		triggerAction('fullscreen-mode', isFullscreenEnabled());
	}

	/**
	 * Enables/disables fullscreen
	 * @return (void)
	 **/
	this.toggleFullscreen = function() {
		// Switches to fullscreen mode
		if (!isFullscreenEnabled()) {
			if (!!container.requestFullscreen)
				container.requestFullscreen();

			else if (!!container.mozRequestFullScreen)
				container.mozRequestFullScreen();

			else if (!!container.webkitRequestFullscreen)
				container.webkitRequestFullscreen();

			else if (!!container.msRequestFullscreen)
				container.msRequestFullscreen();
		}

		// Switches to windowed mode
		else {
			if (!!document.exitFullscreen)
				document.exitFullscreen();

			else if (!!document.mozCancelFullScreen)
				document.mozCancelFullScreen();

			else if (!!document.webkitExitFullscreen)
				document.webkitExitFullscreen();

			else if (!!document.msExitFullscreen)
				document.msExitFullscreen();
		}
	}

	/**
	 * Sets the animation speed
	 * @param speed (string) The speed, in radians/degrees/revolutions per second/minute
	 * @return (void)
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
	}

	/**
	 * Sets the viewer size
	 * @param size (Object) An object containing the wanted width and height
	 * @return (void)
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
	}

	/**
	 * Adds an action
	 * @param name (string) Action name
	 * @param f (Function) The handler function
	 * @return (void)
	 **/

	this.addAction = function(name, f) {
		// New action?
		if (!(name in actions))
			actions[name] = [];

		actions[name].push(f);
	}

	/**
	 * Triggers an action
	 * @param name (string) Action name
	 * @param arg (mixed) An argument to send to the handler functions
	 * @return (void)
	 **/

	var triggerAction = function(name, arg) {
		// Does the action have any function?
		if ((name in actions) && actions[name].length > 0) {
			for (var i = 0, l = actions[name].length; i < l; ++i) {
				if (arg !== undefined)
					actions[name][i](arg);

				else
					actions[name][i]();
			}
		}
	}

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
	var PSV_TILT_UP_MAX = (args.tilt_up_max !== undefined) ? parseFloat(args.tilt_up_max) : Math.PI / 2.0;
	var PSV_TILT_DOWN_MAX = (args.tilt_down_max !== undefined) ? -parseFloat(args.tilt_down_max) : -Math.PI / 2.0;

	// Default position
	var lat = 0, long = 0;

	if (args.default_position !== undefined) {
		if (args.default_position.lat !== undefined)
			lat = getAngleMeasure(parseFloat(args.default_position.lat));

		if (args.default_position.long !== undefined)
			long = getAngleMeasure(parseFloat(args.default_position.long));
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

	// Container
	var container = args.container;

	// Size of the viewer
	var viewer_size, new_viewer_size = {}, real_viewer_size = {};
	if (args.size !== undefined)
		setNewViewerSize(args.size);

	// Some useful attributes
	var panorama = args.panorama;
	var root, canvas_container;
	var renderer = null, scene = null, camera = null;
	var mousedown = false, mouse_x = 0, mouse_y = 0;
	var touchzoom = false, touchzoom_dist = 0;
	var autorotate_timeout = null, anim_timeout = null;

	var actions = {};

	// Must we read XMP data?
	var readxmp = (args.usexmpdata !== undefined) ? !!args.usexmpdata : true;

	// Loading indicator
	var loading_img = (args.loading_img !== undefined) ? args.loading_img : null;

	// Function to call once panorama is ready?
	if (args.onready !== undefined)
		this.addAction('ready', args.onready);

	// Go?
	var autoload = (args.autoload !== undefined) ? !!args.autoload : true;

	if (autoload)
		this.load();
}

/**
 * Navigation bar class
 * @param psv (PhotoSphereViewer) A PhotoSphereViewer object
 **/

var PSVNavBar = function(psv) {
	/**
	 * Checks if a value exists in an array
	 * @param searched (mixed) The searched value
	 * @param array (Array) The array
	 * @return (boolean) true if the value exists in the array, false otherwise
	 **/

	var inArray = function(searched, array) {
		for (var i = 0, l = array.length; i < l; ++i) {
			if (array[i] == searched)
				return true;
		}

		return false;
	}

	/**
	 * Checks if a property is valid
	 * @param property (string) The property
	 * @param value (mixed) The value to check
	 * @return (boolean) true if the value is valid, false otherwise
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
	}

	/**
	 * Sets the style
	 * @param new_style (object) The properties to change
	 * @return (void)
	 **/

	this.setStyle = function(new_style) {
		// Properties to change
		for (property in new_style) {
			// Is this property a property we'll use?
			if ((property in style) && checkValue(property, new_style[property]))
				style[property] = new_style[property];
		}
	}

	/**
	 * Creates the elements
	 * @return (void)
	 **/

	this.create = function() {
		// Container
		container = document.createElement('div');
		container.style.backgroundColor = style.backgroundColor;

		container.style.position = 'absolute';
		container.style.zIndex = 10;
		container.style.bottom = 0;
		container.style.width = '100%';

		// Autorotate button
		autorotate = new PSVNavBarButton(psv, 'autorotate', style);
		container.appendChild(autorotate.getButton());

		// Zoom buttons
		zoom = new PSVNavBarButton(psv, 'zoom', style);
		container.appendChild(zoom.getButton());

		// Fullscreen button
		fullscreen = new PSVNavBarButton(psv, 'fullscreen', style);
		container.appendChild(fullscreen.getButton());
	}

	/**
	 * Returns the bar itself
	 * @return (HTMLElement) The bar
	 **/

	this.getBar = function() {
		return container;
	}

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
			fullscreenThickness: 2
		};

	// Properties types
	var colors = ['backgroundColor', 'buttonsColor', 'buttonsBackgroundColor', 'activeButtonsBackgroundColor'];
	var numbers = ['buttonsHeight', 'autorotateThickness', 'zoomRangeWidth', 'zoomRangeThickness', 'zoomRangeDisk', 'fullscreenRatio', 'fullscreenThickness'];

	// Some useful attributes
	var container;
	var arrows, autorotate, zoom, fullscreen;
}

/**
 * Navigation bar button class
 * @param psv (PhotoSphereViewer) A PhotoSphereViewer object
 * @param type (string) Type of button (arrows)
 * @param style (Object) Style of the navigation bar
 **/

var PSVNavBarButton = function(psv, type, style) {
    /**
     * Attaches an event handler function to an elemnt
     * @param elt (HTMLElement) The element
     * @param evt (string) The event name
     * @param f (Function) The handler function
     * @return (void)
     **/

    var addEvent = function(elt, evt, f) {
        if (!!elt.addEventListener)
            elt.addEventListener(evt, f, false);
        else
            elt.attachEvent('on' + evt, f);
    }

    /**
     * Creates the right button
     * @return (void)
     **/

    var create = function() {
        switch (type) {
            case 'autorotate':
                // Autorotate icon sizes
        		var autorotate_sphere_width = style.buttonsHeight - style.autorotateThickness * 2;
        		var autorotate_equator_height = autorotate_sphere_width / 10;

        		// Autorotate button
        		button = document.createElement('div');
        		button.style.cssFloat = 'left';
        		button.style.padding = '10px';
        		button.style.width = style.buttonsHeight + 'px';
        		button.style.height = style.buttonsHeight + 'px';
        		button.style.backgroundColor = style.buttonsBackgroundColor;
        		button.style.position = 'relative';
        		button.style.cursor = 'pointer';

                addEvent(button, 'click', function(){psv.toggleAutorotate();});

        		var autorotate_sphere = document.createElement('div');
        		autorotate_sphere.style.width = autorotate_sphere_width + 'px';
        		autorotate_sphere.style.height = autorotate_sphere_width + 'px';
        		autorotate_sphere.style.borderRadius = '50%';
        		autorotate_sphere.style.border = style.autorotateThickness + 'px solid ' + style.buttonsColor;
        		button.appendChild(autorotate_sphere);

        		var autorotate_equator = document.createElement('div');
        		autorotate_equator.style.width = autorotate_sphere_width + 'px';
        		autorotate_equator.style.height = autorotate_equator_height + 'px';
        		autorotate_equator.style.borderRadius = '50%';
        		autorotate_equator.style.border = style.autorotateThickness + 'px solid ' + style.buttonsColor;
        		autorotate_equator.style.position = 'absolute';
        		autorotate_equator.style.top = '50%';
        		autorotate_equator.style.marginTop = -(autorotate_equator_height / 2 + style.autorotateThickness) + 'px';
        		button.appendChild(autorotate_equator);

                // (In)active
                psv.addAction('autorotate', toggleActive);

                break;

            case 'zoom':
                // Zoom container
                button = document.createElement('div');
                button.style.cssFloat = 'left';

        		// Zoom "-"
        		var zoom_minus = document.createElement('div');
        		zoom_minus.style.cssFloat = 'left';
        		zoom_minus.style.padding = '10px';
        		zoom_minus.style.height = style.buttonsHeight + 'px';
        		zoom_minus.style.backgroundColor = style.buttonsBackgroundColor;
        		zoom_minus.style.lineHeight = style.buttonsHeight + 'px';
        		zoom_minus.style.color = style.buttonsColor;
        		zoom_minus.style.cursor = 'pointer';
        		zoom_minus.textContent = '-';

        		addEvent(zoom_minus, 'click', function(){psv.zoomOut();});
                button.appendChild(zoom_minus);

        		// Zoom range
        		zoom_range_bg = document.createElement('div');
        		zoom_range_bg.style.cssFloat = 'left';
        		zoom_range_bg.style.padding = (10 + (style.buttonsHeight - style.zoomRangeThickness) / 2) + 'px 5px';
        		zoom_range_bg.style.backgroundColor = style.buttonsBackgroundColor;
                zoom_range_bg.style.cursor = 'pointer';
                button.appendChild(zoom_range_bg);

        		zoom_range = document.createElement('div');
        		zoom_range.style.width = style.zoomRangeWidth + 'px';
        		zoom_range.style.height = style.zoomRangeThickness + 'px';
        		zoom_range.style.backgroundColor = style.buttonsColor;
        		zoom_range.style.position = 'relative';
        		zoom_range_bg.appendChild(zoom_range);

        		zoom_value = document.createElement('div');
        		zoom_value.style.position = 'absolute';
        		zoom_value.style.top = ((style.zoomRangeThickness - style.zoomRangeDisk) / 2) + 'px';
        		zoom_value.style.left = -(style.zoomRangeDisk / 2) + 'px';
        		zoom_value.style.width = style.zoomRangeDisk + 'px';
        		zoom_value.style.height = style.zoomRangeDisk + 'px';
        		zoom_value.style.borderRadius = '50%';
        		zoom_value.style.backgroundColor = style.buttonsColor;

                psv.addAction('zoom-updated', moveZoomValue);
                addEvent(zoom_range_bg, 'mousedown', initZoomChangeWithMouse);
                addEvent(zoom_range_bg, 'touchstart', initZoomChangeByTouch);
                addEvent(document, 'mousemove', changeZoomWithMouse);
                addEvent(document, 'touchmove', changeZoomByTouch);
                addEvent(document, 'mouseup', stopZoomChange);
                addEvent(document, 'touchend', stopZoomChange);
                zoom_range.appendChild(zoom_value);

        		// Zoom "+"
        		var zoom_plus = document.createElement('div');
        		zoom_plus.style.cssFloat = 'left';
        		zoom_plus.style.padding = '10px';
        		zoom_plus.style.height = style.buttonsHeight + 'px';
        		zoom_plus.style.backgroundColor = style.buttonsBackgroundColor;
        		zoom_plus.style.lineHeight = style.buttonsHeight + 'px';
        		zoom_plus.style.color = style.buttonsColor;
        		zoom_plus.style.cursor = 'pointer';
        		zoom_plus.textContent = '+';

        		addEvent(zoom_plus, 'click', function(){psv.zoomIn();});
        		button.appendChild(zoom_plus);

                break;

            case 'fullscreen':
                // Fullscreen icon size
        		var fullscreen_width = style.buttonsHeight * style.fullscreenRatio;

        		var fullscreen_vertical_space = style.buttonsHeight * 0.3;
        		var fullscreen_vertical_border = (style.buttonsHeight - fullscreen_vertical_space) / 2;

        		var fullscreen_horizontal_space = fullscreen_width * 0.3;
        		var fullscreen_horizontal_border = (fullscreen_width - fullscreen_horizontal_space) / 2 - style.fullscreenThickness;
        		var fullscreen_vertical_int = style.buttonsHeight - style.fullscreenThickness * 2;

        		// Fullscreen button
        		button = document.createElement('div');
        		button.style.cssFloat = 'right';
        		button.style.padding = '10px';
        		button.style.width = fullscreen_width;
        		button.style.height = style.buttonsHeight;
        		button.style.backgroundColor = style.buttonsBackgroundColor;
        		button.style.cursor = 'pointer';

        		addEvent(button, 'click', function(){psv.toggleFullscreen();})

        		// Fullscreen icon left side
        		var fullscreen_left = document.createElement('div');
        		fullscreen_left.style.cssFloat = 'left';
        		fullscreen_left.style.width = style.fullscreenThickness + 'px';
        		fullscreen_left.style.height = fullscreen_vertical_space + 'px';
        		fullscreen_left.style.borderStyle = 'solid';
        		fullscreen_left.style.borderColor = style.buttonsColor + ' transparent';
        		fullscreen_left.style.borderWidth = fullscreen_vertical_border + 'px 0';
        		button.appendChild(fullscreen_left);

        		// Fullscreen icon top/bottom sides (first half)
        		var fullscreen_tb_1 = document.createElement('div');
        		fullscreen_tb_1.style.cssFloat = 'left';
        		fullscreen_tb_1.style.width = fullscreen_horizontal_border + 'px';
        		fullscreen_tb_1.style.height = fullscreen_vertical_int + 'px';
        		fullscreen_tb_1.style.borderStyle = 'solid';
        		fullscreen_tb_1.style.borderColor = style.buttonsColor + ' transparent';
        		fullscreen_tb_1.style.borderWidth = style.fullscreenThickness + 'px 0';
        		button.appendChild(fullscreen_tb_1);

        		// Fullscreen icon top/bottom sides (second half)
        		var fullscreen_tb_2 = document.createElement('div');
        		fullscreen_tb_2.style.cssFloat = 'left';
        		fullscreen_tb_2.style.marginLeft = fullscreen_horizontal_space + 'px';
        		fullscreen_tb_2.style.width = fullscreen_horizontal_border + 'px';
        		fullscreen_tb_2.style.height = fullscreen_vertical_int + 'px';
        		fullscreen_tb_2.style.borderStyle = 'solid';
        		fullscreen_tb_2.style.borderColor = style.buttonsColor + ' transparent';
        		fullscreen_tb_2.style.borderWidth = style.fullscreenThickness + 'px 0';
        		button.appendChild(fullscreen_tb_2);

        		// Fullscreen icon right side
        		var fullscreen_right = document.createElement('div');
        		fullscreen_right.style.cssFloat = 'left';
        		fullscreen_right.style.width = style.fullscreenThickness + 'px';
        		fullscreen_right.style.height = fullscreen_vertical_space + 'px';
        		fullscreen_right.style.borderStyle = 'solid';
        		fullscreen_right.style.borderColor = style.buttonsColor + ' transparent';
        		fullscreen_right.style.borderWidth = fullscreen_vertical_border + 'px 0';
        		button.appendChild(fullscreen_right);

        		var fullscreen_clearer = document.createElement('div');
        		fullscreen_clearer.style.clear = 'left';
        		button.appendChild(fullscreen_clearer);

                // (In)active
                psv.addAction('fullscreen-mode', toggleActive);

                break;
        }
    }

    /**
     * Returns the button element
     * @return (HTMLElement) The button
     **/

    this.getButton = function() {
        return button;
    }

    /**
     * Changes the active state of the button
     * @param active (boolean) true if the button should be active, false otherwise
     * @return (void)
     **/

    var toggleActive = function(active) {
        if (active)
            button.style.backgroundColor = style.activeButtonsBackgroundColor;

        else
            button.style.backgroundColor = style.buttonsBackgroundColor;
    }

    /**
     * Moves the zoom cursor
     * @param level (integer) Zoom level (between 0 and 100)
     * @return (void)
     **/

    var moveZoomValue = function(level) {
        zoom_value.style.left = (level / 100 * style.zoomRangeWidth - style.zoomRangeDisk / 2) + 'px';
    }

    /**
     * The user wants to zoom
     * @param evt (Event) The event
     * @return (void)
     **/

    var initZoomChangeWithMouse = function(evt) {
        initZoomChange(parseInt(evt.clientX));
    }

    /**
     * The user wants to zoom (mobile version)
     * @param evt (Event) The event
     * @return (void)
     **/

    var initZoomChangeByTouch = function(evt) {
        var touch = evt.touches[0];
        if (touch.target == zoom_range_bg || touch.target == zoom_range || touch.target == zoom_value)
            initZoomChange(parseInt(touch.clientX));
    }

    /**
     * Initializes a zoom change
     * @param x (integer) Horizontal coordinate
     * @return (void)
     **/

    var initZoomChange = function(x) {
        mousedown = true;
        changeZoom(x);
    }

    /**
     * The user wants to stop zooming
     * @param evt (Event) The event
     * @return (void)
     **/

    var stopZoomChange = function(evt) {
        mousedown = false;
    }

    /**
     * The user moves the zoom cursor
     * @param evt (Event) The event
     * @return (void)
     **/

    var changeZoomWithMouse = function(evt) {
        evt.preventDefault();
        changeZoom(parseInt(evt.clientX));
    }

    /**
     * The user moves the zoom cursor (mobile version)
     * @param evt (Event) The event
     * @return (void)
     **/

    var changeZoomByTouch = function(evt) {
        var touch = evt.touches[0];
        if (touch.target == zoom_range_bg || touch.target == zoom_range || touch.target == zoom_value) {
            evt.preventDefault();
            changeZoom(parseInt(touch.clientX));
        }
    }

    /**
     * Zoom change
     * @param x (integer) Horizontal coordinate
     * @return (void)
     **/

    var changeZoom = function(x) {
        if (mousedown) {
            var user_input = x - zoom_range.getBoundingClientRect().left;
            var zoom_level = user_input / style.zoomRangeWidth * 100;
            psv.zoom(zoom_level);
        }
    }

    // Some useful attributes
    var zoom_range_bg, zoom_range, zoom_value;
    var mousedown = false;

    // Create the button
    var button;
    create();
}
