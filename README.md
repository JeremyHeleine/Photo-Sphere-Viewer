# Photo Sphere Viewer

Photo Sphere Viewer is a JavaScript library that allows you to display 360-degree panoramas taken with Photo Sphere, the camera mode brought by Android 4.2 Jelly Bean.

Photo Sphere Viewer uses the Three.js library (http://threejs.org), so nothing is required for your visitors except for a browser compatible with canvas or, better, WebGL.

## How to use it

1. Include the `three.min.js` and `photo-sphere-viewer.js` files into your page.
2. Create a `div` in the size you want for your panorama.
3. In JavaScript, create a new `PhotoSphereViewer` object. You must pass it an object containing at least two parameters for the panorama:
    * *panorama* (required): the path to the panorama,
    * *container* (required): the `div` in which the panorama will be displayed,
    * *time_anim* (optional, default to *2000*): the panorama will be automatically animated after *time_anim* milliseconds ; indicate *false* to deactivate it,
    * *theta_offset* (deprecated, optional, default to *1440*): the horizontal speed during the automatic animation ; we add *PI / theta_offset* to the angle,
    * *anim_speed* (optional, default to *2rpm*): the animation speed in revolutions per minute (rpm) or second (rps), degrees per minute (dpm) or second (dps), or radians per minute (rad per minute) or second (rad per second) ; just indicate the speed value followed by the unit (for example: *720 dpm*),
    * *loading_img* (optional, default to *null*): the path to the image shown during the loading.

## License

This library is available under the MIT license.
