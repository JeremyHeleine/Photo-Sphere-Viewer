/**
 * Represents a navigation bar button.
 * @class
 * @param {PhotoSphereViewer} psv - A PhotoSphereViewer object
 * @param {string} type - Type of button
 * @param {object} style - Style of the navigation bar
 **/

var PSVNavBarButton = function(psv, type, style) {
    /**
     * Attaches an event handler function to an elemnt.
     * @private
     * @param {HTMLElement} elt - The element
     * @param {string} evt - The event name
     * @param {Function} f - The handler function
     * @return {void}
     **/

    var addEvent = function(elt, evt, f) {
        if (!!elt.addEventListener)
            elt.addEventListener(evt, f, false);
        else
            elt.attachEvent('on' + evt, f);
    };

    /**
     * Creates the right button.
     * @private
     * @return {void}
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
        		button.style.boxSizing = 'inherit';
        		button.style.padding = '10px';
        		button.style.width = style.buttonsHeight + 'px';
        		button.style.height = style.buttonsHeight + 'px';
        		button.style.backgroundColor = style.buttonsBackgroundColor;
        		button.style.position = 'relative';
        		button.style.cursor = 'pointer';

                addEvent(button, 'click', function(){psv.toggleAutorotate();});

        		var autorotate_sphere = document.createElement('div');
        		autorotate_sphere.style.boxSizing = 'inherit';
        		autorotate_sphere.style.width = autorotate_sphere_width + 'px';
        		autorotate_sphere.style.height = autorotate_sphere_width + 'px';
        		autorotate_sphere.style.borderRadius = '50%';
        		autorotate_sphere.style.border = style.autorotateThickness + 'px solid ' + style.buttonsColor;
        		button.appendChild(autorotate_sphere);

        		var autorotate_equator = document.createElement('div');
        		autorotate_equator.style.boxSizing = 'inherit';
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
        		button.style.boxSizing = 'inherit';

        		// Zoom "-"
        		var zoom_minus = document.createElement('div');
        		zoom_minus.style.cssFloat = 'left';
        		zoom_minus.style.boxSizing = 'inherit';
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
        		zoom_range_bg.style.boxSizing = 'inherit';
        		zoom_range_bg.style.padding = (10 + (style.buttonsHeight - style.zoomRangeThickness) / 2) + 'px 5px';
        		zoom_range_bg.style.backgroundColor = style.buttonsBackgroundColor;
                zoom_range_bg.style.cursor = 'pointer';
                button.appendChild(zoom_range_bg);

        		zoom_range = document.createElement('div');
        		zoom_range.style.boxSizing = 'inherit';
        		zoom_range.style.width = style.zoomRangeWidth + 'px';
        		zoom_range.style.height = style.zoomRangeThickness + 'px';
        		zoom_range.style.backgroundColor = style.buttonsColor;
        		zoom_range.style.position = 'relative';
        		zoom_range_bg.appendChild(zoom_range);

        		zoom_value = document.createElement('div');
        		zoom_value.style.position = 'absolute';
        		zoom_value.style.top = ((style.zoomRangeThickness - style.zoomRangeDisk) / 2) + 'px';
        		zoom_value.style.left = -(style.zoomRangeDisk / 2) + 'px';
        		zoom_value.style.boxSizing = 'inherit';
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
				addEvent(zoom_range_bg, 'mousewheel', changeZoomOnMouseWheel);
				addEvent(zoom_range_bg, 'DOMMouseScroll', changeZoomOnMouseWheel);
                zoom_range.appendChild(zoom_value);

        		// Zoom "+"
        		var zoom_plus = document.createElement('div');
        		zoom_plus.style.cssFloat = 'left';
        		zoom_plus.style.boxSizing = 'inherit';
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
        		button.style.boxSizing = 'inherit';
        		button.style.padding = '10px';
        		button.style.width = fullscreen_width + 'px';
        		button.style.height = style.buttonsHeight + 'px';
        		button.style.backgroundColor = style.buttonsBackgroundColor;
        		button.style.cursor = 'pointer';

        		addEvent(button, 'click', function(){psv.toggleFullscreen();});

        		// Fullscreen icon left side
        		var fullscreen_left = document.createElement('div');
        		fullscreen_left.style.cssFloat = 'left';
        		fullscreen_left.style.boxSizing = 'inherit';
        		fullscreen_left.style.width = style.fullscreenThickness + 'px';
        		fullscreen_left.style.height = fullscreen_vertical_space + 'px';
        		fullscreen_left.style.borderStyle = 'solid';
        		fullscreen_left.style.borderColor = style.buttonsColor + ' transparent';
        		fullscreen_left.style.borderWidth = fullscreen_vertical_border + 'px 0';
        		button.appendChild(fullscreen_left);

        		// Fullscreen icon top/bottom sides (first half)
        		var fullscreen_tb_1 = document.createElement('div');
        		fullscreen_tb_1.style.cssFloat = 'left';
        		fullscreen_tb_1.style.boxSizing = 'inherit';
        		fullscreen_tb_1.style.width = fullscreen_horizontal_border + 'px';
        		fullscreen_tb_1.style.height = fullscreen_vertical_int + 'px';
        		fullscreen_tb_1.style.borderStyle = 'solid';
        		fullscreen_tb_1.style.borderColor = style.buttonsColor + ' transparent';
        		fullscreen_tb_1.style.borderWidth = style.fullscreenThickness + 'px 0';
        		button.appendChild(fullscreen_tb_1);

        		// Fullscreen icon top/bottom sides (second half)
        		var fullscreen_tb_2 = document.createElement('div');
        		fullscreen_tb_2.style.cssFloat = 'left';
        		fullscreen_tb_2.style.boxSizing = 'inherit';
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
        		fullscreen_right.style.boxSizing = 'inherit';
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

            case 'orientation':
                // Gyroscope icon sizes
                var gyroscope_sphere_width = style.buttonsHeight - style.gyroscopeThickness * 2;
                var gyroscope_ellipses_big_axis = gyroscope_sphere_width - style.gyroscopeThickness * 4;
                var gyroscope_ellipses_little_axis = gyroscope_sphere_width / 10;

                // Gyroscope button
        		button = document.createElement('div');
        		button.style.cssFloat = 'right';
        		button.style.boxSizing = 'inherit';
        		button.style.padding = '10px';
                button.style.width = style.buttonsHeight + 'px';
                button.style.height = style.buttonsHeight + 'px';
                button.style.backgroundColor = style.buttonsBackgroundColor;
                button.style.position = 'relative';
                button.style.cursor = 'pointer';

                addEvent(button, 'click', function(){psv.toggleDeviceOrientation();});

                var gyroscope_sphere = document.createElement('div');
        		gyroscope_sphere.style.boxSizing = 'inherit';
                gyroscope_sphere.style.width = gyroscope_sphere_width + 'px';
                gyroscope_sphere.style.height = gyroscope_sphere_width + 'px';
                gyroscope_sphere.style.borderRadius = '50%';
                gyroscope_sphere.style.border = style.gyroscopeThickness + 'px solid ' + style.buttonsColor;
                button.appendChild(gyroscope_sphere);

                var gyroscope_hor_ellipsis = document.createElement('div');
        		gyroscope_hor_ellipsis.style.boxSizing = 'inherit';
                gyroscope_hor_ellipsis.style.width = gyroscope_ellipses_big_axis + 'px';
                gyroscope_hor_ellipsis.style.height = gyroscope_ellipses_little_axis + 'px';
                gyroscope_hor_ellipsis.style.borderRadius = '50%';
                gyroscope_hor_ellipsis.style.border = style.gyroscopeThickness + 'px solid ' + style.buttonsColor;
                gyroscope_hor_ellipsis.style.position = 'absolute';
                gyroscope_hor_ellipsis.style.top = '50%';
                gyroscope_hor_ellipsis.style.left = '50%';
                gyroscope_hor_ellipsis.style.marginTop = -(gyroscope_ellipses_little_axis / 2 + style.gyroscopeThickness) + 'px';
                gyroscope_hor_ellipsis.style.marginLeft = -(gyroscope_ellipses_big_axis / 2 + style.gyroscopeThickness) + 'px';
                button.appendChild(gyroscope_hor_ellipsis);

                var gyroscope_ver_ellipsis = document.createElement('div');
        		gyroscope_ver_ellipsis.style.boxSizing = 'inherit';
                gyroscope_ver_ellipsis.style.width = gyroscope_ellipses_little_axis + 'px';
                gyroscope_ver_ellipsis.style.height = gyroscope_ellipses_big_axis + 'px';
                gyroscope_ver_ellipsis.style.borderRadius = '50%';
                gyroscope_ver_ellipsis.style.border = style.gyroscopeThickness + 'px solid ' + style.buttonsColor;
                gyroscope_ver_ellipsis.style.position = 'absolute';
                gyroscope_ver_ellipsis.style.top = '50%';
                gyroscope_ver_ellipsis.style.left = '50%';
                gyroscope_ver_ellipsis.style.marginTop = -(gyroscope_ellipses_big_axis / 2 + style.gyroscopeThickness) + 'px';
                gyroscope_ver_ellipsis.style.marginLeft = -(gyroscope_ellipses_little_axis / 2 + style.gyroscopeThickness) + 'px';
                button.appendChild(gyroscope_ver_ellipsis);

                // (In)active
                psv.addAction('device-orientation', toggleActive);

                break;

            case 'virtual-reality':
                // Sizes
                var vr_width = style.buttonsHeight * style.virtualRealityRatio;

                var vr_eye_diameter = vr_width / 4;
                var vr_eye_offset = vr_eye_diameter / 2;

                // Button
                button = document.createElement('div');
                button.style.cssFloat = 'right';
                button.style.position = 'relative';
        		button.style.boxSizing = 'inherit';
                button.style.padding = '10px';
                button.style.width = vr_width + 'px';
                button.style.height = style.buttonsHeight + 'px';
                button.style.backgroundColor = style.buttonsBackgroundColor;
                button.style.cursor = 'pointer';

                addEvent(button, 'click', function(){psv.toggleStereo();});

                // Icon
                var vr_rect = document.createElement('div');
        		vr_rect.style.boxSizing = 'inherit';
                vr_rect.style.width = vr_width + 'px';
                vr_rect.style.height = style.buttonsHeight + 'px';
                vr_rect.style.borderRadius = style.virtualRealityBorderRadius + 'px';
                vr_rect.style.backgroundColor = style.buttonsColor;
                button.appendChild(vr_rect);

                var left_eye = document.createElement('div');
        		left_eye.style.boxSizing = 'inherit';
                left_eye.style.width = vr_eye_diameter + 'px';
                left_eye.style.height = vr_eye_diameter + 'px';
                left_eye.style.position = 'absolute';
                left_eye.style.top = (vr_eye_offset + 10) + 'px';
                left_eye.style.left = (vr_eye_offset + 10) + 'px';
                left_eye.style.borderRadius = '50%';
                left_eye.style.backgroundColor = style.backgroundColor;
                button.appendChild(left_eye);

                var right_eye = document.createElement('div');
        		right_eye.style.boxSizing = 'inherit';
                right_eye.style.width = vr_eye_diameter + 'px';
                right_eye.style.height = vr_eye_diameter + 'px';
                right_eye.style.position = 'absolute';
                right_eye.style.top = (vr_eye_offset + 10) + 'px';
                right_eye.style.right = (vr_eye_offset + 10) + 'px';
                right_eye.style.borderRadius = '50%';
                right_eye.style.backgroundColor = style.backgroundColor;
                button.appendChild(right_eye);

                var nose = document.createElement('div');
        		nose.style.boxSizing = 'inherit';
                nose.style.width = vr_eye_diameter + 'px';
                nose.style.height = (style.buttonsHeight / 2) + 'px';
                nose.style.position = 'absolute';
                nose.style.left = '50%';
                nose.style.bottom = '10px';
                nose.style.marginLeft = -(vr_eye_diameter / 2) + 'px';
                nose.style.borderTopLeftRadius = '50% 60%';
                nose.style.borderTopRightRadius = '50% 60%';
                nose.style.backgroundColor = style.backgroundColor;
                button.appendChild(nose);

                //(In)active
                psv.addAction('stereo-effect', toggleActive);

                break;
        }
    };

    /**
     * Returns the button element.
     * @public
     * @return {HTMLElement} The button
     **/

    this.getButton = function() {
        return button;
    };

    /**
     * Changes the active state of the button.
     * @private
     * @param {boolean} active - `true` if the button should be active, `false` otherwise
     * @return {void}
     **/

    var toggleActive = function(active) {
        if (active)
            button.style.backgroundColor = style.activeButtonsBackgroundColor;

        else
            button.style.backgroundColor = style.buttonsBackgroundColor;
    };

    /**
     * Moves the zoom cursor.
     * @private
     * @param {integer} level - Zoom level (between 0 and 100)
     * @return {void}
     **/

    var moveZoomValue = function(level) {
        zoom_value.style.left = (level / 100 * style.zoomRangeWidth - style.zoomRangeDisk / 2) + 'px';
    };

    /**
     * The user wants to zoom.
     * @private
     * @param {Event} evt - The event
     * @return {void}
     **/

    var initZoomChangeWithMouse = function(evt) {
        initZoomChange(parseInt(evt.clientX));
    };

    /**
     * The user wants to zoom (mobile version).
     * @private
     * @param {Event} evt - The event
     * @return {void}
     **/

    var initZoomChangeByTouch = function(evt) {
        var touch = evt.touches[0];
        if (touch.target == zoom_range_bg || touch.target == zoom_range || touch.target == zoom_value)
            initZoomChange(parseInt(touch.clientX));
    };

    /**
     * Initializes a zoom change.
     * @private
     * @param {integer} x - Horizontal coordinate
     * @return {void}
     **/

    var initZoomChange = function(x) {
        mousedown = true;
        changeZoom(x);
    };

    /**
     * The user wants to stop zooming.
     * @private
     * @param {Event} evt - The event
     * @return {void}
     **/

    var stopZoomChange = function(evt) {
        mousedown = false;
    };

    /**
     * The user moves the zoom cursor.
     * @private
     * @param {Event} evt - The event
     * @return {void}
     **/

    var changeZoomWithMouse = function(evt) {
        evt.preventDefault();
        changeZoom(parseInt(evt.clientX));
    };

    /**
     * The user moves the zoom cursor (mobile version).
     * @private
     * @param {Event} evt - The event
     * @return {void}
     **/

    var changeZoomByTouch = function(evt) {
        var touch = evt.touches[0];
        if (touch.target == zoom_range_bg || touch.target == zoom_range || touch.target == zoom_value) {
            evt.preventDefault();
            changeZoom(parseInt(touch.clientX));
        }
    };

    /**
     * Zoom change.
     * @private
     * @param {integer} x - Horizontal coordinate
     * @return {void}
     **/

    var changeZoom = function(x) {
        if (mousedown) {
            var user_input = x - zoom_range.getBoundingClientRect().left;
            var zoom_level = user_input / style.zoomRangeWidth * 100;
            psv.zoom(zoom_level);
        }
    };

	/**
	 * Change zoom by scrolling.
	 * @private
	 * @param {Event} evt - The event
	 * @return {void}
	 **/

	var changeZoomOnMouseWheel = function(evt) {
		psv.mouseWheel(evt);
	};

    // Some useful attributes
    var zoom_range_bg, zoom_range, zoom_value;
    var mousedown = false;

    // Create the button
    var button;
    create();
};
