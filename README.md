# Photo Sphere Viewer

Photo Sphere Viewer is a JavaScript library that allows you to display 360×180 degrees panoramas on any web page. Panoramas must use the equirectangular projection and they can be taken with Photo Sphere, the camera mode brought by Android 4.2 Jelly Bean.

Photo Sphere Viewer uses the [Three.js](http://threejs.org) library, so nothing is required for your visitors except for a browser compatible with canvas or, better, WebGL.

## How To Use It

1. Include the `three.min.js` and `photo-sphere-viewer.min.js` files into your page.
2. Create a `div` in the size you want for your panorama.
3. In JavaScript, create a new `PhotoSphereViewer` object. You must pass it an object containing at least two parameters for the panorama. Here is the list of available parameters.
    * `panorama` (required): the path to the panorama.
    * `container` (required): the `div` in which the panorama will be displayed.
    * `autoload` (optional, default to `true`): `true` to automatically load the panorama, `false` to load it later (with the `.load()` method).
    * `usexmpdata` (optional, default to `true`): `true` if Photo Sphere Viewer must read XMP data, `false` if it is not necessary.
    * `cors_anonymous` (optional, default to `true`): `true` to disable the exchange of user credentials via cookies, `false` otherwise.
    * `pano_size` (optional, default to null) The panorama size, if cropped (unnecessary if XMP data can be read).
    * `default_position` (optional, default to `{}`) Defines the default position, the first point seen by the user (e.g. `{long: Math.PI, lat: Math.PI/2}`).
    * `min_fov` (optional, default to `30`): the minimal field of view, in degrees, between 1 and 179.
    * `max_fov` (optional, default to `90`): the maximal field of view, in degrees, between 1 and 179.
    * `allow_user_interactions` (optional, default to `true`): If set to `false`, the user won't be able to interact with the panorama (navigation bar is then disabled).
    * `allow_scroll_to_zoom (optional, default to `true`): It set to `false`, the user won't be able to scroll with their mouse to zoom.
    * `tilt_up_max` (optional, default to `Math.PI/2`): The maximal tilt up angle, in radians.
    * `tilt_down_max` (optional, default to `Math.PI/2`): The maximal tilt down angle, in radians.
    * `min_longitude` (optional, default to 0): The minimal longitude to show.
    * `max_longitude` (optional, default to 2π): The maximal longitude to show.
    * `zoom_level` (optional, default to `0`): The default zoom level, between 0 and 100.
    * `long_offset` (optional, default to `PI/360`): the longitude to travel per pixel moved by mouse/touch.
    * `lat_offset` (optional, default to `PI/180`): the latitude to travel per pixel moved by mouse/touch.
    * `time_anim` (optional, default to `2000`): the panorama will be automatically animated after `time_anim` milliseconds (indicate `false` to deactivate it).
    * `reverse_anim` (optional, default to true) `true` if horizontal animation must be reversed when min/max longitude is reached (only if the whole circle is not described).
    * `anim_speed` (optional, default to `2rpm`): animation speed in radians/degrees/revolutions per second/minute.
    * `vertical_anim_speed` (optional, default to `2rpm`): vertical animation speed in radians/degrees/revolutions per second/minute.
    * `vertical_anim_target` (optional, default to `0`): latitude to target during the autorotate animation, default to the equator.
    * `navbar` (optional, default to `false`): set to `true`, a navigation bar will be displayed.
    * `navbar_style` (optional, default to `{}`): a custom style for the navigation bar. See the list below to know what properties are available.
        * `backgroundColor`: the navigation bar background color (default to `rgba(61, 61, 61, 0.5)`).
        * `buttonsColor`: the buttons foreground color (default to `rgba(255, 255, 255, 0.7)`).
        * `buttonsBackgroundColor`: the buttons background color (default to `transparent`).
        * `activeButtonsBackgroundColor`: the buttons background color when they are active (default to `rgba(255, 255, 255, 0.1)`).
        * `buttonsHeight`: buttons height in pixels (default to `20`).
        * `autorotateThickness`: autorotate icon thickness in pixels (default to `1`).
        * `zoomRangeWidth`: zoom range width in pixels (default to `50`).
        * `zoomRangeThickness`: zoom range thickness in pixels (default to `1`).
        * `zoomRangeDisk`: zoom range disk diameter in pixels (default to `7`).
        * `fullscreenRatio`: fullscreen icon ratio (default to `4/3`).
        * `fullscreenThickness`: fullscreen icon thickness in pixels (default to `2`).

        Colors can be in `rgb()`, `rgba()` or hexadecimal format, and the keyword `transparent` is accepted.
    * `loading_msg` (optional, default to `Loading…`): Loading message.
    * `loading_img` (optional, default to `null`): the path to the image shown during the loading.
    * `loading_html` (optional, default to null) An HTML loader (element to append to the container or string representing the HTML).
    * `size` (optional, default to `null`): the final size of the panorama container (e.g. `{width: 500, height: 300}`).
    * `onready` (optional, default to `null`) Function called once the panorama is ready and the first image is displayed.

You can find a basic example of use in the file `example.html`. The `example1.html` is a more complete (and more interesting) example.

If your panorama is taken with Google's Photo Sphere, `usexmpdata` must be set to `true`, unless it is not cropped.

## License

This library is available under the MIT license.
