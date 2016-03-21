module.exports = function (grunt) {
   'use strict';

   require('load-grunt-tasks')(grunt);

   var config = {
      src: 'src',
      dist: 'dist',
      three : 'node_modules/three'
   };

   grunt.initConfig({
      config: config,

      clean: [
         '<%= config.dist %>/*.js',
         '<%= config.dist %>/*.map'
      ],

      jshint: {
         files: [
            'Gruntfile.js',
            '<%= config.src %>/*.js'
         ],
         options: {
            reporter: require('jshint-stylish')
         }
      },

      concat: {
         dist: {
            src: [
               "src/PhotoSphereViewer.js",
               "src/PSVNavBar.js",
               "src/PSVNavBarButton.js",
               "src/sphoords.js"
            ],
            dest: "<%= config.dist %>/photo-sphere-viewer.js"
         }
      },

      copy : {
         dist: {
            src: [
               "<%= config.three %>/three.min.js"
            ],
            dest: "<%= config.dist %>/three.min.js"
         }
      },

      uglify: {
         options: {
            sourceMap: true,
            sourceMapName: '<%= config.dist %>/photo-sphere-viewer.js.map'
         },
         photo_sphere_viewer: {
            files : {
               "<%= config.dist %>/photo-sphere-viewer.min.js" : [
                  "<%= config.dist %>/photo-sphere-viewer.js"
               ]
            }
         }
      }
   });

   grunt.registerTask('default', [
      'clean',
      'concat',
      'uglify',
      'copy'
   ]);
};