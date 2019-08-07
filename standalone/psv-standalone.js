function anError(error) {
    var errorMsg = document.createElement('div');
    errorMsg.innerHTML = error;
    document.getElementById('container').appendChild(errorMsg);
}

var viewer;
function parseURLParameters() {
    var URL;
    if (window.location.hash.length > 0) {
        // Prefered method since parameters aren't sent to server
        URL = [window.location.hash.slice(1)];
    } else {
        URL = decodeURI(window.location.href).split('?');
        URL.shift();
    }
    if (URL.length < 1) {
        // Display error if no configuration parameters are specified
        anError('No configuration options were specified.');
        return;
    }
    URL = URL[0].split('&');
    var configFromURL = {};

    configFromURL.container = document.getElementById('container');
    configFromURL.navbar = true;

    for (var i = 0; i < URL.length; i++) {
        var option = URL[i].split('=')[0];
        var value = URL[i].split('=')[1];
        if (value == '')
            continue; // Skip options with empty values in URL config

        // case distinction at time_anim, because boolean or number can be passed
        if (option == 'time_anim') {
            if (value == 'false') {
                configFromURL[option] = JSON.parse(value);
            } else {
                configFromURL[option] = Number(value);
            }
            continue;
        }

        switch(option) {
            case 'panorama': case 'anim_speed':
                configFromURL[option] = decodeURIComponent(value);
                break;
            case 'size': case 'navbar':
                configFromURL[option] = JSON.parse(decodeURIComponent(value));
                break;
            default:
                anError('An invalid configuration parameter was specified: ' + option);
                return;
        }
        
        /*
        Overview of the posibilities of converting the value
        case 'paramName1':
            configFromURL[option] = Number(value);
            break;
        case 'paramName2':
            configFromURL[option] = JSON.parse(value);
            break;
        case 'parmName3':
            configFromURL[option] = decodeURIComponent(value);
            break;
        */
    }

    // Create viewer
    viewer = new PhotoSphereViewer(configFromURL);
}

// Display error if opened from local file
if (window.location.protocol == 'file:') {
    anError('Due to browser security restrictions, Photo Sphere Viewer can\'t be run ' +
        'from the local filesystem; some sort of web server must be used.');
} else {
    // Initialize viewer
    parseURLParameters();
}
