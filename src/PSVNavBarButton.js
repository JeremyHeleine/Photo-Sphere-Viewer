/*
* Photo Sphere Viewer v2.0.1
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
        		var zoom_range_bg = document.createElement('div');
        		zoom_range_bg.style.cssFloat = 'left';
        		zoom_range_bg.style.padding = (10 + (style.buttonsHeight - style.zoomRangeThickness) / 2) + 'px 5px';
        		zoom_range_bg.style.backgroundColor = style.buttonsBackgroundColor;
                button.appendChild(zoom_range_bg);

        		zoom_range = document.createElement('div');
        		zoom_range.style.width = style.zoomRangeWidth + 'px';
        		zoom_range.style.height = style.zoomRangeThickness + 'px';
        		zoom_range.style.backgroundColor = style.buttonsColor;
        		zoom_range.style.position = 'relative';
        		zoom_range.style.cursor = 'pointer';
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
                addEvent(zoom_range, 'mousedown', initZoomChangeWithMouse);
                addEvent(zoom_range, 'touchstart', initZoomChangeByTouch);
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
        var touch = evt.changedTouches[0];
        if (touch.target == zoom_value || touch.target == zoom_value)
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
        var touch = evt.changedTouches[0];
        if (touch.target == zoom_range || touch.target == zoom_value) {
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
    var zoom_range, zoom_value;
    var mousedown = false;

    // Create the button
    var button;
    create();
}
