module.exports = function(grunt) {
  grunt.util.linefeed = '\n';

  var files_in_order = [
    'src/PhotoSphereViewer.js',
    'src/PSVNavBar.js',
    'src/PSVNavBarButton.js',
    'src/PSVNavBarAutorotateButton.js',
    'src/PSVNavBarFullscreenButton.js',
    'src/PSVNavBarZoomButton.js',
    'src/PSVUtils.js'
  ];


  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    banner:
      '/*!\n'+
      ' * Photo Sphere Viewer v<%= pkg.version %>\n'+
      ' * http://jeremyheleine.com/#photo-sphere-viewer\n'+
      ' * Copyright (c) 2014,<%= grunt.template.today("yyyy") %> Jérémy Heleine\n'+
      ' * Licensed under MIT (http://opensource.org/licenses/MIT)\n'+
      ' */',

    concat: {
      options: {
        stripBanners: false,
        separator: '\n'
      },
      dist: {
        src: files_in_order,
        dest: 'photo-sphere-viewer.js'
      }
    },

    wrap: {
      dist: {
        src: 'photo-sphere-viewer.js',
        dest: '',
        options: {
          separator: '',
          wrapper: function() {
            var wrapper = grunt.file.read('src/.wrapper.js').replace(/\r\n/g, '\n').split(/@@js\n/);
            wrapper[0] = grunt.template.process('<%= banner %>\n\n') + wrapper[0];
            return wrapper;
          }
        }
      }
    },

    uglify: {
      options: {
        banner: '<%= banner %>\n'
      },
      dist: {
        src: 'photo-sphere-viewer.js',
        dest: 'photo-sphere-viewer.min.js'
      }
    },

    jshint: {
      dist: {
        src: files_in_order
      }
    }
  });


  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-wrap');
  grunt.loadNpmTasks('grunt-contrib-jshint');


  grunt.registerTask('default', [
    'concat',
    'wrap',
    'uglify'
  ]);

  grunt.registerTask('test', [
    'jshint'
  ]);
};