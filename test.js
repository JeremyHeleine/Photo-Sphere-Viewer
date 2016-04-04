window.onload = function() {
	document.getElementById('go').addEventListener('click', loadPredefinedPanorama, false);

	document.getElementById('pano').addEventListener('change', upload, false);
};

// Load the predefined panorama
function loadPredefinedPanorama(evt) {
	evt.preventDefault();

	// Loader
	var loader = document.createElement('div');
	loader.className = 'loader';

	// Panorama display
	var div = document.getElementById('container');
	div.style.height = '30px';

	PSV = new PhotoSphereViewer({
		// Path to the panorama
		panorama: 'examples/sun.jpg',

		// Container
		container: div,

		// Deactivate the animation
		time_anim: false,

		// Display the navigation bar
		navbar: true,

		// Resize the panorama
		size: {
			width: '100%',
			height: '500px'
		},

		// HTML loader
		loading_html: loader,

		// Disable smooth moves to test faster
		smooth_user_moves: false
	});
}

// Load a panorama stored on the user's computer
function upload() {
	// Retrieve the chosen file and create the FileReader object
	var file = document.getElementById('pano').files[0];
	var reader = new FileReader();

	reader.onload = function() {
		PSV = new PhotoSphereViewer({
			// Panorama, given in base 64
			panorama: reader.result,

			// Container
			container: 'your-pano',

			// Deactivate the animation
			time_anim: false,

			// Display the navigation bar
			navbar: true,

			// Resize the panorama
			size: {
				width: '100%',
				height: '500px'
			},

			// No XMP data
			usexmpdata: false
		});
	};

	reader.readAsDataURL(file);
}

// Yep, an ugly global variable (to make tests with the console)
var PSV;
