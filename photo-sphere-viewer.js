/*
 * Photo Sphere Viewer v1.1
 * http://jeremyheleine.com/#photo-sphere-viewer
 *
 * Copyright (c) 2014 Jeremy Heleine
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
 * @param args (Object) Viewer arguments
 * - panorama (string) Panorama URL or path (absolute or relative)
 * - container (HTMLElement) Panorama container (generally a div)
 * - time_anim (integer) (optional) (2000) Automatically animate the panorama after time_anim seconds, -1 to deactivate
 * - theta_offset (integer) (optional) (1440) The PI fraction to add to theta in the animation
 * - loading_img (string) (optional) (null) Loading image URL or path (absolute or relative)
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
	var attachEvent = function(elt, evt, f) {
		if (elt.addEventListener)
			elt.addEventListener(evt, f, false);
		else
			elt.attachEvent('on'+evt, f);
	}

	/**
	 * Start loading panorama
	 * @return (void)
	 **/
	var startLoading = function() {
		// Loading indicator (text or image if given)
		if (m_loading_img != null) {
			var loading = document.createElement('img');
			loading.setAttribute('src', m_loading_img);
			loading.setAttribute('alt', 'Loading...');
			m_container.appendChild(loading);
		}
		else
			m_container.textContent = 'Loading...';

		// Is canvas supported?
		if (!isCanvasSupported()) {
			m_container.textContent = 'Canvas is not supported, update your browser!';
			return;
		}

		// Is Three.js loaded?
		if (window.THREE === undefined) {
			console.log('PhotoSphereViewer: Three.js is not loaded.');
			return;
		}

		// Container size
		m_width = m_container.offsetWidth;
		m_height = m_container.offsetHeight;
		m_ratio = m_width / m_height;

		// EXIF data
		loadEXIF();
	}

	/**
	 * Returns the value of a given attribute in the panorama metadata
	 * @param data (string) The panorama metadata
	 * @param attr (string) The wanted attribute
	 * @return (string) The value of the attribute
	 **/
	var getAttribute = function(data, attr) {
		var a = data.indexOf('GPano:'+attr) + attr.length + 8, b = data.indexOf('"', a);
		return data.substring(a, b);
	}

	/**
	 * Loads the EXIF data with AJAX
	 * @return (void)
	 **/
	var loadEXIF = function() {
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
			m_container.textContent = 'XHR is not supported, update your browser!';
			return;
		}

		xhr.onreadystatechange = function() {
				if (xhr.readyState == 4 && xhr.status == 200) {
					// Metadata
					var binary = xhr.responseText;
					var a = binary.indexOf('<x:xmpmeta'), b = binary.indexOf('</x:xmpmeta>');

					// No data retrieved
					if (a == -1 || b == -1) {
						m_container.textContent = 'This is not a Photo Sphere panorama!';
						return;
					}

					// Useful values
					var data = binary.substring(a, b);
					var full_width = parseInt(getAttribute(data, 'FullPanoWidthPixels'));
					var full_height = parseInt(getAttribute(data, 'FullPanoHeightPixels'));
					var cropped_width = parseInt(getAttribute(data, 'CroppedAreaImageWidthPixels'));
					var cropped_height = parseInt(getAttribute(data, 'CroppedAreaImageHeightPixels'));
					var cropped_x = parseInt(getAttribute(data, 'CroppedAreaLeftPixels'));
					var cropped_y = parseInt(getAttribute(data, 'CroppedAreaTopPixels'));

					createBuffer(full_width, full_height, cropped_width, cropped_height, cropped_x, cropped_y);
				}
			};

		xhr.open('GET', m_panorama, true);
		xhr.send(null);
	}

	/**
	 * Creates an image in the right dimensions
	 * @return (void)
	 **/
	var createBuffer = function(full_width, full_height, cropped_width, cropped_height, cropped_x, cropped_y) {
		var img = new Image();

		img.onload = function() {
				var buffer = document.createElement('canvas');
				buffer.width = full_width;
				buffer.height = full_height;
				var ctx = buffer.getContext('2d');

				ctx.drawImage(img, cropped_x, cropped_y, cropped_width, cropped_height);
				loadTexture(buffer.toDataURL('image/png'));
			};

		img.src = m_panorama;
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
		// The chosen renderer depends on if WebGL is supported or not
		m_renderer = (isWebGLSupported()) ? new THREE.WebGLRenderer() : new THREE.CanvasRenderer();
		m_renderer.setSize(m_width, m_height);

		m_scene = new THREE.Scene();

		m_camera = new THREE.PerspectiveCamera(m_fov, m_ratio, 1, 300);
		m_camera.position.set(0, 0, 0);
		m_scene.add(m_camera);

		// Sphere
		var geometry = new THREE.SphereGeometry(200, 32, 32);
		var material = new THREE.MeshBasicMaterial({map: texture, overdraw: true});
		var mesh = new THREE.Mesh(geometry, material);
		mesh.scale.x = -1;
		m_scene.add(mesh);

		// Adding events
		attachEvent(window, 'resize', onResize);
		attachEvent(m_container, 'mousedown', onMouseDown);
		attachEvent(document, 'mouseup', onMouseUp);
		attachEvent(document, 'mousemove', onMouseMove);
		attachEvent(m_container, 'mousewheel', onMouseWheel);
		attachEvent(m_container, 'DOMMouseScroll', onMouseWheel);

		// First render
		m_container.innerHTML = '';
		m_container.appendChild(m_renderer.domElement);
		render();

		// Animation?
		anim();
	}

	/**
	 * Resize the canvas when the window is resized
	 * @return (void)
	 **/
	var onResize = function() {
		if (m_container.offsetWidth != m_width || m_container.offsetHeight != m_height) {
			m_width = m_container.offsetWidth;
			m_height = m_container.offsetHeight;
			m_renderer.setSize(m_width, m_height);
		}
	}

	/**
	 * The user wants to move
	 * @param evt (Event) The event
	 * @return (void)
	 **/
	var onMouseDown = function(evt) {
		m_mouse_x = evt.clientX;
		m_mouse_y = evt.clientY;
		clearTimeout(m_timeout);
		m_mousedown = true;
	}

	/**
	 * The user wants to stop moving
	 * @param evt (Event) The event
	 * @return (void)
	 **/
	var onMouseUp = function(evt) {
		m_mousedown = false;
		anim();
	}

	/**
	 * The user moves the image
	 * @param evt (Event) The event
	 * @return (void)
	 **/
	var onMouseMove = function(evt) {
		if (m_mousedown) {
			var x = evt.clientX;
			var y = evt.clientY;

			m_theta += (x - m_mouse_x) * Math.PI / 360.0;
			m_theta -= Math.floor(m_theta / (2.0*Math.PI)) * 2.0*Math.PI;
			m_phi += (y - m_mouse_y) * Math.PI / 180.0;
			m_phi = Math.min(Math.PI/2.0, Math.max(-Math.PI/2.0, m_phi));

			m_mouse_x = x;
			m_mouse_y = y;
			render();
		}
	}

	/**
	 * The user wants to zoom
	 * @param evt (Event) The event
	 * @return (void)
	 **/
	var onMouseWheel = function(evt) {
		var delta = (evt.detail) ? -evt.detail : evt.wheelDelta;
		if (delta != 0) {
			var direction = parseInt(delta / Math.abs(delta));
			m_fov -= direction;
			m_fov = Math.min(90, Math.max(30, m_fov));

			m_camera.fov = m_fov;
			m_camera.updateProjectionMatrix();
			render();
		}
	}

	/**
	 * Renders an image
	 * @return (void)
	 **/
	var render = function() {
		var point = new THREE.Vector3();
		point.setX(Math.cos(m_phi) * Math.sin(m_theta));
		point.setY(Math.sin(m_phi));
		point.setZ(Math.cos(m_phi) * Math.cos(m_theta));

		m_camera.lookAt(point);
		m_renderer.render(m_scene, m_camera);
	}

	/**
	 * Automatically animate the panorama
	 * @return (void)
	 **/
	var anim = function() {
		if (m_anim >= 0) {
			clearTimeout(m_timeout);
			m_timeout = setTimeout(rotate, m_anim);
		}
	}

	/**
	 * Rotate the panorama
	 * @return (void)
	 **/
	var rotate = function() {
		m_phi -= m_phi / 200;

		m_theta += Math.PI / m_theta_offset;
		m_theta -= Math.floor(m_theta / (2.0*Math.PI)) * 2.0*Math.PI;

		render();
		m_timeout = setTimeout(rotate, 15);
	}

	// Parameters
	if (args === undefined || args.panorama === undefined || args.container === undefined) {
		console.log('PhotoSphereViewer: no value given for panorama or container');
		return;
	}

	// Some useful attributes
	var m_panorama = args.panorama;
	var m_container = args.container;
	var m_anim = (args.time_anim !== undefined) ? args.time_anim : 2000;
	var m_theta_offset = (args.theta_offset !== undefined) ? args.theta_offset : 1440;
	var m_loading_img = (args.loading_img !== undefined) ? args.loading_img : null;

	var m_width, m_height, m_ratio;
	var m_renderer, m_scene, m_camera;
	var m_fov = 90, m_phi = 0, m_theta = 0;
	var m_mousedown = false, m_mouse_x = 0, m_mouse_y = 0;
	var m_timeout = null;

	startLoading();
}
