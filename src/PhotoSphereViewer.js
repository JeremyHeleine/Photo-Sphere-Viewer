/*
 * Photo Sphere Viewer v2.9
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
 * @param {HTMLElement|string} args.container - Panorama container (should be a `div` or equivalent), can be a string (the ID of the element to retrieve)
 * @param {object} args.overlay - Image to add over the panorama
 * @param {string} args.overlay.image - Image URL or path
 * @param {object} [args.overlay.position=null] - Image position (default to the bottom left corner)
 * @param {string} [args.overlay.position.x=null] - Horizontal image position ('left' or 'right')
 * @param {string} [args.overlay.position.y=null] - Vertical image position ('top' or 'bottom')
 * @param {object} [args.overlay.size=null] - Image size (if it needs to be resized)
 * @param {number|string} [args.overlay.size.width=null] - Image width (in pixels or a percentage, like '20%')
 * @param {number|string} [args.overlay.size.height=null] - Image height (in pixels or a percentage, like '20%')
 * @param {integer} [args.segments=100] - Number of segments on the sphere
 * @param {integer} [args.rings=100] - Number of rings on the sphere
 * @param {boolean} [args.autoload=true] - `true` to automatically load the panorama, `false` to load it later (with the {@link PhotoSphereViewer#load|`.load`} method)
 * @param {boolean} [args.usexmpdata=true] - `true` if Photo Sphere Viewer must read XMP data, `false` if it is not necessary
 * @param {boolean} [args.cors_anonymous=true] - `true` to disable the exchange of user credentials via cookies, `false` otherwise
 * @param {object} [args.pano_size=null] - The panorama size, if cropped (unnecessary if XMP data can be read)
 * @param {number} [args.pano_size.full_width=null] - The full panorama width, before crop (the image width if `null`)
 * @param {number} [args.pano_size.full_height=null] - The full panorama height, before crop (the image height if `null`)
 * @param {number} [args.pano_size.cropped_width=null] - The cropped panorama width (the image width if `null`)
 * @param {number} [args.pano_size.cropped_height=null] - The cropped panorama height (the image height if `null`)
 * @param {number} [args.pano_size.cropped_x=null] - The cropped panorama horizontal offset relative to the full width (middle if `null`)
 * @param {number} [args.pano_size.cropped_y=null] - The cropped panorama vertical offset relative to the full height (middle if `null`)
 * @param {object} [args.captured_view=null] - The real captured view, compared to the theoritical 360°×180° possible view
 * @param {number} [args.captured_view.horizontal_fov=360] - The horizontal captured field of view in degrees (default to 360°)
 * @param {number} [args.captured_view.vertical_fov=180] - The vertical captured field of view in degrees (default to 180°)
 * @param {object} [args.default_position] - Defines the default position (the first point seen by the user)
 * @param {number|string} [args.default_position.long=0] - Default longitude, in radians (or in degrees if indicated, e.g. `'45deg'`)
 * @param {number|string} [args.default_position.lat=0] - Default latitude, in radians (or in degrees if indicated, e.g. `'45deg'`)
 * @param {number} [args.min_fov=30] - The minimal field of view, in degrees, between 1 and 179
 * @param {number} [args.max_fov=90] - The maximal field of view, in degrees, between 1 and 179
 * @param {boolean} [args.allow_user_interactions=true] - If set to `false`, the user won't be able to interact with the panorama (navigation bar is then disabled)
 * @param {boolean} [args.allow_scroll_to_zoom=true] - It set to `false`, the user won't be able to scroll with their mouse to zoom
 * @param {number} [args.zoom_speed=1] - Indicate a number greater than 1 to increase the zoom speed
 * @param {number|string} [args.tilt_up_max=π/2] - The maximal tilt up angle, in radians (or in degrees if indicated, e.g. `'30deg'`)
 * @param {number|string} [args.tilt_down_max=π/2] - The maximal tilt down angle, in radians (or in degrees if indicated, e.g. `'30deg'`)
 * @param {number|string} [args.min_longitude=0] - The minimal longitude to show
 * @param {number|string} [args.max_longitude=2π] - The maximal longitude to show
 * @param {number} [args.zoom_level=0] - The default zoom level, between 0 and 100
 * @param {boolean} [args.smooth_user_moves=true] - If set to `false` user moves have a speed fixed by `long_offset` and `lat_offset`
 * @param {number} [args.long_offset=π/360] - The longitude to travel per pixel moved by mouse/touch
 * @param {number} [args.lat_offset=π/180] - The latitude to travel per pixel moved by mouse/touch
 * @param {number|string} [args.keyboard_long_offset=π/60] - The longitude to travel when the user hits the left/right arrow
 * @param {number|string} [args.keyboard_lat_offset=π/120] - The latitude to travel when the user hits the up/down arrow
 * @param {integer} [args.time_anim=2000] - Delay before automatically animating the panorama in milliseconds, `false` to not animate
 * @param {boolean} [args.reverse_anim=true] - `true` if horizontal animation must be reversed when min/max longitude is reached (only if the whole circle is not described)
 * @param {string} [args.anim_speed=2rpm] - Animation speed in radians/degrees/revolutions per second/minute
 * @param {string} [args.vertical_anim_speed=2rpm] - Vertical animation speed in radians/degrees/revolutions per second/minute
 * @param {number|string} [args.vertical_anim_target=0] - Latitude to target during the autorotate animation, default to the equator
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
 * @param {number} [args.eyes_offset=5] - Eyes offset in VR mode
 * @param {string} [args.loading_msg=Loading…] - Loading message
 * @param {string} [args.loading_img=null] - Loading image URL or path (absolute or relative)
 * @param {HTMLElement|string} [args.loading_html=null] - An HTML loader (element to append to the container or string representing the HTML)
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
	 * @param {boolean} [is_2pi_allowed=false] - Can the measure be equal to 2π?
	 * @return {number} The wanted measure
	 **/

	var getAngleMeasure = function(angle, is_2pi_allowed) {
		is_2pi_allowed = (is_2pi_allowed !== undefined) ? !!is_2pi_allowed : false;
		return (is_2pi_allowed && angle == 2 * Math.PI) ? 2 * Math.PI :  angle - Math.floor(angle / (2.0 * Math.PI)) * 2.0 * Math.PI;
	};

	/**
	 * Starts to load the panorama.
	 * @public
	 * @return {void}
	 **/

	this.load = function() {
		container.innerHTML = '';

		// Loading HTML: HTMLElement
		if (!!loading_html && loading_html.nodeType === 1)
			container.appendChild(loading_html);

		// Loading HTML: string
		else if (!!loading_html && typeof loading_html == 'string')
			container.innerHTML = loading_html;

		// Loading image
		else if (!!loading_img) {
			var loading = document.createElement('img');
			loading.setAttribute('src', loading_img);
			loading.setAttribute('alt', loading_msg);
			container.appendChild(loading);
		}

		// Loading text
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
		if (readxmp && !panorama.match(/^data:image\/[a-z]+;base64/))
			loadXMP();

		else
			createBuffer();
	};

	/**
	 * Returns Google's XMP data.
	 * @private
	 * @param {string} file - Binary file
	 * @return {string} The data
	 **/

	var getXMPData = function(file) {
		var a = 0, b = 0;
		var data = '';

		while ((a = file.indexOf('<x:xmpmeta', b)) != -1 && (b = file.indexOf('</x:xmpmeta>', a)) != -1) {
			data = file.substring(a, b);
			if (data.indexOf('GPano:') != -1)
				return data;
		}

		return '';
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

		if (b == -1) {
			// XML-Metadata
			a = data.indexOf('GPano:' + attr) + attr.length + 7;
			b = data.indexOf('<', a);
		}

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
				var data = getXMPData(xhr.responseText);

				if (!data.length) {
					createBuffer();
					return;
				}

				// Useful values
				pano_size = {
					full_width: parseInt(getAttribute(data, 'FullPanoWidthPixels')),
					full_height: parseInt(getAttribute(data, 'FullPanoHeightPixels')),
					cropped_width: parseInt(getAttribute(data, 'CroppedAreaImageWidthPixels')),
					cropped_height: parseInt(getAttribute(data, 'CroppedAreaImageHeightPixels')),
					cropped_x: parseInt(getAttribute(data, 'CroppedAreaLeftPixels')),
					cropped_y: parseInt(getAttribute(data, 'CroppedAreaTopPixels')),
				};

				recalculate_coords = true;
				createBuffer();
			}
		};

		xhr.open('GET', panorama, true);
		xhr.send(null);
	};

	/**
	 * Creates an image in the right dimensions.
	 * @private
	 * @return {void}
	 **/

	var createBuffer = function() {
		var img = new Image();

		img.onload = function() {
			// Must the pano size be changed?
			var default_pano_size = {
				full_width: img.width,
				full_height: img.height,
				cropped_width: img.width,
				cropped_height: img.height,
				cropped_x: null,
				cropped_y: null
			};

			// Captured view?
			if (captured_view.horizontal_fov != 360 || captured_view.vertical_fov != 180) {
				// The indicated view is the cropped panorama
				pano_size.cropped_width = default_pano_size.cropped_width;
				pano_size.cropped_height = default_pano_size.cropped_height;
				pano_size.full_width = default_pano_size.full_width;
				pano_size.full_height = default_pano_size.full_height;

				// Horizontal FOV indicated
				if (captured_view.horizontal_fov != 360) {
					var rh = captured_view.horizontal_fov / 360.0;
					pano_size.full_width = pano_size.cropped_width / rh;
				}

				// Vertical FOV indicated
				if (captured_view.vertical_fov != 180) {
					var rv = captured_view.vertical_fov / 180.0;
					pano_size.full_height = pano_size.cropped_height / rv;
				}
			}

			else {
				// Cropped panorama: dimensions defined by the user
				for (var attr in pano_size) {
					if (pano_size[attr] === null && default_pano_size[attr] !== undefined)
						pano_size[attr] = default_pano_size[attr];
				}

				// Do we have to recalculate the coordinates?
				if (recalculate_coords) {
					if (pano_size.cropped_width != default_pano_size.cropped_width) {
						var rx = default_pano_size.cropped_width / pano_size.cropped_width;
						pano_size.cropped_width = default_pano_size.cropped_width;
						pano_size.full_width *= rx;
						pano_size.cropped_x *= rx;
					}

					if (pano_size.cropped_height != default_pano_size.cropped_height) {
						var ry = default_pano_size.cropped_height / pano_size.cropped_height;
						pano_size.cropped_height = default_pano_size.cropped_height;
						pano_size.full_height *= ry;
						pano_size.cropped_y *= ry;
					}
				}
			}

			// Middle if cropped_x/y is null
			if (pano_size.cropped_x === null)
				pano_size.cropped_x = (pano_size.full_width - pano_size.cropped_width) / 2;

			if (pano_size.cropped_y === null)
				pano_size.cropped_y = (pano_size.full_height - pano_size.cropped_height) / 2;

			// Size limit for mobile compatibility
			var max_width = 2048;
			if (isWebGLSupported()) {
				var canvas_tmp = document.createElement('canvas');
				var ctx_tmp = canvas_tmp.getContext('webgl');
				max_width = ctx_tmp.getParameter(ctx_tmp.MAX_TEXTURE_SIZE);
			}

			// Buffer width (not too big)
			var new_width = Math.min(pano_size.full_width, max_width);
			var r = new_width / pano_size.full_width;

			pano_size.full_width = new_width;
			pano_size.cropped_width *= r;
			pano_size.cropped_x *= r;
			img.width = pano_size.cropped_width;

			// Buffer height (proportional to the width)
			pano_size.full_height *= r;
			pano_size.cropped_height *= r;
			pano_size.cropped_y *= r;
			img.height = pano_size.cropped_height;

			// Buffer creation
			var buffer = document.createElement('canvas');
			buffer.width = pano_size.full_width;
			buffer.height = pano_size.full_height;

			var ctx = buffer.getContext('2d');
			ctx.drawImage(img, pano_size.cropped_x, pano_size.cropped_y, pano_size.cropped_width, pano_size.cropped_height);

			loadTexture(buffer.toDataURL('image/jpeg'));
		};

		// CORS when the panorama is not given as a base64 string
		if (cors_anonymous && !panorama.match(/^data:image\/[a-z]+;base64/))
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
		};

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
		var geometry = new THREE.SphereGeometry(200, rings, segments);
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

		// Overlay?
		if (overlay !== null) {
			// Add the image
			var overlay_img = document.createElement('img');

			overlay_img.onload = function() {
				overlay_img.style.display = 'block';

				// Image position
				overlay_img.style.position = 'absolute';
				overlay_img.style[overlay.position.x] = '5px';
				overlay_img.style[overlay.position.y] = '5px';

				if (overlay.position.y == 'bottom' && display_navbar)
					overlay_img.style.bottom = (navbar.getBar().offsetHeight + 5) + 'px';

				// Should we resize the image?
				if (overlay.size !== undefined) {
					overlay_img.style.width = overlay.size.width;
					overlay_img.style.height = overlay.size.height;
				}

				root.appendChild(overlay_img);
			};

			overlay_img.src = overlay.image;
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

			if (scroll_to_zoom) {
				addEvent(canvas_container, 'mousewheel', onMouseWheel);
				addEvent(canvas_container, 'DOMMouseScroll', onMouseWheel);
			}

			self.addAction('fullscreen-mode', toggleArrowKeys);
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
		stereo_effect.eyeSeparation = eyes_offset;
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
		lat -= (lat - anim_lat_target) * anim_lat_offset;

		long += anim_long_offset;

		var again = true;

		if (!whole_circle) {
			long = stayBetween(long, PSV_MIN_LONGITUDE, PSV_MAX_LONGITUDE);

			if (long == PSV_MIN_LONGITUDE || long == PSV_MAX_LONGITUDE) {
				// Must we reverse the animation or simply stop it?
				if (reverse_anim)
					anim_long_offset *= -1;

				else {
					stopAutorotate();
					again = false;
				}
			}
		}

		long = getAngleMeasure(long, true);

		triggerAction('position-updated', {
			longitude: long,
			latitude: lat
		});

		render();

		if (again)
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
	 * Returns the current position in radians
	 * @return {object} A longitude/latitude couple
	 **/

	this.getPosition = function() {
		return {
			longitude: long,
			latitude: lat
		};
	};

	/**
	 * Returns the current position in degrees
	 * @return {object} A longitude/latitude couple
	 **/

	this.getPositionInDegrees = function() {
		return {
			longitude: long * 180.0 / Math.PI,
			latitude: lat * 180.0 / Math.PI
		};
	};

	/**
	 * Moves to a specific position
	 * @private
	 * @param {number|string} longitude - The longitude of the targeted point
	 * @param {number|string} latitude - The latitude of the targeted point
	 * @return {void}
	 **/

	var moveTo = function(longitude, latitude) {
		var long_tmp = parseAngle(longitude);

		if (!whole_circle)
			long_tmp = stayBetween(long_tmp, PSV_MIN_LONGITUDE, PSV_MAX_LONGITUDE);

		var lat_tmp = parseAngle(latitude);

		if (lat_tmp > Math.PI)
			lat_tmp -= 2 * Math.PI;

		lat_tmp = stayBetween(lat_tmp, PSV_TILT_DOWN_MAX, PSV_TILT_UP_MAX);

		long = long_tmp;
		lat = lat_tmp;

		/**
		 * Indicates that the position has been modified.
		 * @callback PhotoSphereViewer~onPositionUpdateed
		 * @param {object} position - The new position
		 * @param {number} position.longitude - The longitude in radians
		 * @param {number} position.latitude - The latitude in radians
		 **/

		triggerAction('position-updated', {
			longitude: long,
			latitude: lat
		});

		render();
	};

	/**
	 * Moves to a specific position
	 * @public
	 * @param {number|string} longitude - The longitude of the targeted point
	 * @param {number|string} latitude - The latitude of the targeted point
	 * @return {void}
	 **/

	this.moveTo = function(longitude, latitude) {
		moveTo(longitude, latitude);
	};

	/**
	 * Rotates the view
	 * @private
	 * @param {number|string} dlong - The rotation to apply horizontally
	 * @param {number|string} dlat - The rotation to apply vertically
	 * @return {void}
	 **/

	var rotate = function(dlong, dlat) {
		dlong = parseAngle(dlong);
		dlat = parseAngle(dlat);

		moveTo(long + dlong, lat + dlat);
	};

	/**
	 * Rotates the view
	 * @public
	 * @param {number|string} dlong - The rotation to apply horizontally
	 * @param {number|string} dlat - The rotation to apply vertically
	 * @return {void}
	 **/

	this.rotate = function(dlong, dlat) {
		rotate(dlong, dlat);
	};

	/**
	 * Attaches or detaches the keyboard events
	 * @private
	 * @param {boolean} attach - `true` to attach the event, `false` to detach it
	 * @return {void}
	 **/

	var toggleArrowKeys = function(attach) {
		var action = (attach) ? window.addEventListener : window.removeEventListener;
		action('keydown', keyDown);
	};

	/**
	 * Tries to standardize the code sent by a keyboard event
	 * @private
	 * @param {KeyboardEvent} evt - The event
	 * @return {string} The code
	 **/

	var retrieveKey = function(evt) {
		// The Holy Grail
		if (evt.key) {
			var key = (/^Arrow/.test(evt.key)) ? evt.key : 'Arrow' + evt.key;
			return key;
		}

		// Deprecated but still used
		if (evt.keyCode || evt.which) {
			var key_code = (evt.keyCode) ? evt.keyCode : evt.which;

			var keycodes_map = {
				38: 'ArrowUp',
				39: 'ArrowRight',
				40: 'ArrowDown',
				37: 'ArrowLeft'
			};

			if (keycodes_map[key_code] !== undefined)
				return keycodes_map[key_code];
		}

		// :/
		return '';
	};

	/**
	 * Rotates the view through keyboard arrows
	 * @private
	 * @param {KeyboardEvent} evt - The event
	 * @return {void}
	 **/

	var keyDown = function(evt) {
		var dlong = 0, dlat = 0;

		switch (retrieveKey(evt)) {
			case 'ArrowUp':
				dlat = PSV_KEYBOARD_LAT_OFFSET;
				break;

			case 'ArrowRight':
				dlong = -PSV_KEYBOARD_LONG_OFFSET;
				break;

			case 'ArrowDown':
				dlat = -PSV_KEYBOARD_LAT_OFFSET;
				break;

			case 'ArrowLeft':
				dlong = PSV_KEYBOARD_LONG_OFFSET;
				break;
		}

		rotate(dlong, dlat);
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
		// Store the current position of the mouse
		mouse_x = x;
		mouse_y = y;

		// Stop the animation
		stopAutorotate();

		// Start the movement
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

				if (diff !== 0) {
					var direction = diff / Math.abs(diff);
					zoom(zoom_lvl + direction * zoom_speed);

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
			// Smooth movement
			if (smooth_user_moves) {
				long += (x - mouse_x) / viewer_size.height * fov * Math.PI / 180;
				lat += (y - mouse_y) / viewer_size.height * fov * Math.PI / 180;
			}

			// No smooth movement
			else {
				long += (x - mouse_x) * PSV_LONG_OFFSET;
				lat += (y - mouse_y) * PSV_LAT_OFFSET;
			}

			// Save the current coordinates for the next movement
			mouse_x = x;
			mouse_y = y;

			// Coordinates treatments
			if (!whole_circle)
				long = stayBetween(long, PSV_MIN_LONGITUDE, PSV_MAX_LONGITUDE);

			long = getAngleMeasure(long, true);

			lat = stayBetween(lat, PSV_TILT_DOWN_MAX, PSV_TILT_UP_MAX);

			triggerAction('position-updated', {
				longitude: long,
				latitude: lat
			});

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
		long = stayBetween(coords.longitude, PSV_MIN_LONGITUDE, PSV_MAX_LONGITUDE);
		lat = stayBetween(coords.latitude, PSV_TILT_DOWN_MAX, PSV_TILT_UP_MAX);

		triggerAction('position-updated', {
			longitude: long,
			latitude: lat
		});

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

		if (delta !== 0) {
			var direction = parseInt(delta / Math.abs(delta));
			zoom(zoom_lvl + direction * zoom_speed);
		}
	};

	/**
	 * Use a mousewheel event.
	 * @public
	 * @param {Event} evt - The event
	 * @return {void}
	 **/

	this.mouseWheel = function(evt) {
		onMouseWheel(evt);
	};

	/**
	 * Sets the new zoom level.
	 * @private
	 * @param {integer} level - New zoom level
	 * @return {void}
	 **/

	var zoom = function(level) {
		zoom_lvl = stayBetween(level, 0, 100);
		fov = PSV_FOV_MAX + (zoom_lvl / 100) * (PSV_FOV_MIN - PSV_FOV_MAX);

		camera.fov = fov;
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
	 * Returns the current zoom level.
	 * @public
	 * @return {integer} The current zoom level (between 0 and 100)
	 **/

	this.getZoomLevel = function() {
		return zoom_lvl;
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
			zoom(zoom_lvl + zoom_speed);
	};

	/**
	 * Zoom out.
	 * @public
	 * @return {void}
	 **/

	this.zoomOut = function() {
		if (zoom_lvl > 0)
			zoom(zoom_lvl - zoom_speed);
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
		// Fix the (weird and ugly) Chrome and IE behaviors
		if (!!document.webkitFullscreenElement || !!document.msFullscreenElement) {
			real_viewer_size.width = container.style.width;
			real_viewer_size.height = container.style.height;

			container.style.width = '100%';
			container.style.height = '100%';
			fitToContainer();
		}

		else if (!!container.webkitRequestFullscreen || !!container.msRequestFullscreen) {
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
	 * Parses an animation speed.
	 * @private
	 * @param {string} speed - The speed, in radians/degrees/revolutions per second/minute
	 * @return {number} The speed in radians
	 **/

	var parseAnimationSpeed = function(speed) {
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
		return rad_per_second * PSV_ANIM_TIMEOUT / 1000;
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
		// Allowed units
		var units = [
			'em', 'ex', 'cap', 'rem', 'lh',
			'%', 'vw', 'vh', 'vmin', 'vmax',
			'px', 'mm', 'cm', 'in', 'pt'
		];

		var units_str = ' '+(units.join(' '))+' ';

		// Checks all the values
		for (var dim in size) {
			// Only width and height matter
			if (dim == 'width' || dim == 'height') {
				// Size extraction
				var size_str = size[dim].toString().trim();

				var size_value = parseFloat(size_str.replace(/^([0-9]+(?:\.[0-9]*)?).*$/, '$1'));
				var size_unit = size_str.replace(/^[0-9]+(?:\.[0-9]*)?(.*)$/, '$1').trim();

				// Only percentages and pixels are allowed
				if (units_str.indexOf(' '+size_unit+' ') == -1)
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

	// Should the movement be smooth?
	var smooth_user_moves = (args.smooth_user_moves !== undefined) ? !!args.smooth_user_moves : true;

	// Movement speed
	var PSV_LONG_OFFSET = (args.long_offset !== undefined) ? parseAngle(args.long_offset) : Math.PI / 360.0;
	var PSV_LAT_OFFSET = (args.lat_offset !== undefined) ? parseAngle(args.lat_offset) : Math.PI / 180.0;

	var PSV_KEYBOARD_LONG_OFFSET = (args.keyboard_long_offset !== undefined) ? parseAngle(args.keyboard_long_offset) : Math.PI / 60.0;
	var PSV_KEYBOARD_LAT_OFFSET = (args.keyboard_lat_offset !== undefined) ? parseAngle(args.keyboard_lat_offset) : Math.PI / 120.0;

	// Minimum and maximum fields of view in degrees
	var PSV_FOV_MIN = (args.min_fov !== undefined) ? stayBetween(parseFloat(args.min_fov), 1, 179) : 30;
	var PSV_FOV_MAX = (args.max_fov !== undefined) ? stayBetween(parseFloat(args.max_fov), 1, 179) : 90;

	// Minimum tilt up / down angles
	var PSV_TILT_UP_MAX = (args.tilt_up_max !== undefined) ? stayBetween(parseAngle(args.tilt_up_max), 0, Math.PI / 2.0) : Math.PI / 2.0;
	var PSV_TILT_DOWN_MAX = (args.tilt_down_max !== undefined) ? -stayBetween(parseAngle(args.tilt_down_max), 0, Math.PI / 2.0) : -Math.PI / 2.0;

	// Minimum and maximum visible longitudes
	var min_long = (args.min_longitude !== undefined) ? parseAngle(args.min_longitude) : 0;
	var max_long = (args.max_longitude !== undefined) ? parseAngle(args.max_longitude) : 0;

	var whole_circle = (min_long == max_long);

	if (whole_circle) {
		min_long = 0;
		max_long = 2 * Math.PI;
	}

	else if (max_long === 0)
		max_long = 2 * Math.PI;

	var PSV_MIN_LONGITUDE, PSV_MAX_LONGITUDE;
	if (min_long < max_long) {
		PSV_MIN_LONGITUDE = min_long;
		PSV_MAX_LONGITUDE = max_long;
	}

	else {
		PSV_MIN_LONGITUDE = max_long;
		PSV_MAX_LONGITUDE = min_long;
	}

	// Default position
	var lat = 0, long = PSV_MIN_LONGITUDE;

	if (args.default_position !== undefined) {
		if (args.default_position.lat !== undefined) {
			var lat_angle = parseAngle(args.default_position.lat);
			if (lat_angle > Math.PI)
				lat_angle -= 2 * Math.PI;

			lat = stayBetween(lat_angle, PSV_TILT_DOWN_MAX, PSV_TILT_UP_MAX);
		}

		if (args.default_position.long !== undefined)
			long = stayBetween(parseAngle(args.default_position.long), PSV_MIN_LONGITUDE, PSV_MAX_LONGITUDE);
	}

	// Sphere segments and rings
	var segments = (args.segments !== undefined) ? parseInt(args.segments) : 100;
	var rings = (args.rings !== undefined) ? parseInt(args.rings) : 100;

	// Default zoom level
	var zoom_lvl = 0;

	if (args.zoom_level !== undefined)
		zoom_lvl = stayBetween(parseInt(Math.round(args.zoom_level)), 0, 100);

	var fov = PSV_FOV_MAX + (zoom_lvl / 100) * (PSV_FOV_MIN - PSV_FOV_MAX);

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

	// Horizontal animation speed
	var anim_long_offset = (args.anim_speed !== undefined) ? parseAnimationSpeed(args.anim_speed) : parseAnimationSpeed('2rpm');

	// Reverse the horizontal animation if autorotate reaches the min/max longitude
	var reverse_anim = true;

	if (args.reverse_anim !== undefined)
		reverse_anim = !!args.reverse_anim;

	// Vertical animation speed
	var anim_lat_offset = (args.vertical_anim_speed !== undefined) ? parseAnimationSpeed(args.vertical_anim_speed) : parseAnimationSpeed('2rpm');

	// Vertical animation target (default: equator)
	var anim_lat_target = 0;

	if (args.vertical_anim_target !== undefined) {
		var lat_target_angle = parseAngle(args.vertical_anim_target);
		if (lat_target_angle > Math.PI)
			lat_target_angle -= 2 * Math.PI;

		anim_lat_target = stayBetween(lat_target_angle, PSV_TILT_DOWN_MAX, PSV_TILT_UP_MAX);
	}

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

	// Is "scroll to zoom" allowed?
	var scroll_to_zoom = (args.allow_scroll_to_zoom !== undefined) ? !!args.allow_scroll_to_zoom : true;

	// User's zoom speed
	var zoom_speed = (args.zoom_speed !== undefined) ? parseFloat(args.zoom_speed) : 1.0;

	// Eyes offset in VR mode
	var eyes_offset = (args.eyes_offset !== undefined) ? parseFloat(args.eyes_offset) : 5;

	// Container (ID to retrieve?)
	var container = (typeof args.container == 'string') ? document.getElementById(args.container) : args.container;

	// Size of the viewer
	var viewer_size, new_viewer_size = {}, real_viewer_size = {};
	if (args.size !== undefined)
		setNewViewerSize(args.size);
	console.log(new_viewer_size)

	// Some useful attributes
	var panorama = args.panorama;
	var root, canvas_container;
	var renderer = null, scene = null, camera = null, stereo_effect = null;
	var mousedown = false, mouse_x = 0, mouse_y = 0;
	var touchzoom = false, touchzoom_dist = 0;
	var autorotate_timeout = null, anim_timeout = null;

	var sphoords = new Sphoords();

	var actions = {};

	// Do we have to read XMP data?
	var readxmp = (args.usexmpdata !== undefined) ? !!args.usexmpdata : true;

	// Can we use CORS?
	var cors_anonymous = (args.cors_anonymous !== undefined) ? !!args.cors_anonymous : true;

	// Cropped size?
	var pano_size = {
		full_width: null,
		full_height: null,
		cropped_width: null,
		cropped_height: null,
		cropped_x: null,
		cropped_y: null
	};

	// The user defines the real size of the panorama
	if (args.pano_size !== undefined) {
		for (var attr in pano_size) {
			if (args.pano_size[attr] !== undefined)
				pano_size[attr] = parseInt(args.pano_size[attr]);
		}

		readxmp = false;
	}

	// Captured FOVs
	var captured_view = {
		horizontal_fov: 360,
		vertical_fov: 180
	};

	if (args.captured_view !== undefined) {
		for (var attr in captured_view) {
			if (args.captured_view[attr] !== undefined)
				captured_view[attr] = parseFloat(args.captured_view[attr]);
		}

		readxmp = false;
	}

	// Will we have to recalculate the coordinates?
	var recalculate_coords = false;

	// Loading message
	var loading_msg = (args.loading_msg !== undefined) ? args.loading_msg.toString() : 'Loading…';

	// Loading image
	var loading_img = (args.loading_img !== undefined) ? args.loading_img.toString() : null;

	// Loading HTML
	var loading_html = (args.loading_html !== undefined) ? args.loading_html : null;

	// Overlay
	var overlay = null;
	if (args.overlay !== undefined) {
		// Image
		if (args.overlay.image !== undefined) {
			overlay = {
				image: args.overlay.image,
				position: {
					x: 'left',
					y: 'bottom'
				}
			};

			// Image position
			if (args.overlay.position !== undefined) {
				if (args.overlay.position.x !== undefined && (args.overlay.position.x == 'left' || args.overlay.position.x == 'right'))
					overlay.position.x = args.overlay.position.x;

				if (args.overlay.position.y !== undefined && (args.overlay.position.y == 'top' || args.overlay.position.y == 'bottom'))
					overlay.position.y = args.overlay.position.y;
			}

			// Image size
			if (args.overlay.size !== undefined) {
				// Default: keep the original size, or resize following the current ratio
				overlay.size = {
					width: (args.overlay.size.width !== undefined) ? args.overlay.size.width : 'auto',
					height: (args.overlay.size.height !== undefined) ? args.overlay.size.height : 'auto'
				};
			}
		}
	}

	// Function to call once panorama is ready?
	var self = this;
	if (args.onready !== undefined)
		this.addAction('ready', args.onready);

	// Go?
	var autoload = (args.autoload !== undefined) ? !!args.autoload : true;

	if (autoload)
		this.load();
};
