# Photo Sphere Viewer

Photo Sphere Viewer is a JavaScript library that allows you to display 360×180 degrees panoramas on any web page. Panoramas must use the equirectangular projection and they can be taken with Photo Sphere, the camera mode brought by Android 4.2 Jelly Bean.

Photo Sphere Viewer uses the [Three.js](http://threejs.org) library, so nothing is required for your visitors except for a browser compatible with canvas or, better, WebGL.

## How To Use It

1. Include the `three.min.js` and `photo-sphere-viewer.js` files into your page.
2. Create a `div` in the size you want for your panorama.
3. In JavaScript, create a new `PhotoSphereViewer` object. You must pass it an object containing at least two parameters for the panorama. Here is the list of available parameters.
    * `panorama` (required): the path to the panorama.
    * `container` (required): the `div` in which the panorama will be displayed.
    * `autoload` (optional, default to `true`): `true` to automatically load the panorama, `false` to load it later (with the `.load()` method).
    * `usexmpdata` (optional, default to `true`): `true` if Photo Sphere Viewer must read XMP data, `false` if it is not necessary.
    * `time_anim` (optional, default to `2000`): the panorama will be automatically animated after `time_anim` milliseconds (indicate `false` to deactivate it).
    * `theta_offset` (deprecated, optional, default to `1440`): the horizontal speed during the automatic animation (we add `PI / theta_offset` to the angle).
    * `anim_speed` (optional, default to `2rpm`): animation speed in radians/degrees/revolutions per second/minute.
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
    * `loading_img` (optional, default to `null`): the path to the image shown during the loading.

You can find an example of use in the file `example.html`.

If your panorama is taken with Photo Sphere, `usexmpdata` must be set to `true`, unless it is not cropped.

## License

This library is available under the MIT license.
