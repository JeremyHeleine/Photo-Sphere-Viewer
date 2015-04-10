(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['three'], factory);
    }
    else {
        root.PhotoSphereViewer = factory(root.THREE);
    }
}(this, function(THREE) {
"use strict";

@@js

return PhotoSphereViewer;
}));