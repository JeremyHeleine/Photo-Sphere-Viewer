# Photo Sphere Viewer - standalone
## What is standalone
Standalone is adapted from the Panoramaviewer [Pannellum](https://github.com/mpetroff/pannellum/tree/master/src/standalone). It provides the possibility to integrate a panorama via an iframe. The parameters are passed via the URL and converted back to JSON by JavaScript.

## Supported parameters
|  Parameter | Description | Example(s) |
| --- | --- | --- |
| panorama | Path to the panorama image. It must be a single string for equirectangular panoramas and an array or an object for cubemaps. | snow.jpg |
| time_anim | Idle time (milliseconds) before the panorama automatically starts rotating. false to deactivate. | false or 2000 |
| anim_speed | Automatic rotation speed in radians/degrees/revolutions per second/minute. | -2rpm |
| navbar | Enable or disable the navigation bar, you can also choose which buttons are displayed and even add custom buttons. Default value is `true`. | false |
| size | The final size if the panorama container (e.g. {width: 500, height: 300}. By default the size of container is used and is followed during window resizes. **Important:** this string has to be encoded. | {"height":"400px", "width":"400px"} |

Parameters can be added to the switch-case in `psv-standalone.js`.

## How to use it
The parameters are passed as URL parameters. Here it is partly necessary to encode the values.

Example without encoding:  
`panoramaView/psv-standalone.html?panorama=example/snow.jpg&size={"height":"400px", "width":"400px"}&navbar=true&anim_speed=-2rpm&time_anim=2000`

Example with encoding:  
`panoramaView/psv-standalone.html?panorama=example%2Fsnow.jpg&size=%7B%22height%22%3A%22400px%22%2C%20%22width%22%3A%22400px%22%7D&navbar=true&anim_speed=-2rpm&time_anim=2000`

Example with iframe:  
`<iframe width="100%" height="100%" src="panoramaView/psv-standalone.html?panorama=example%2Fsnow.jpg&amp;size=%7B%22height%22%3A%22400px%22%2C%20%22width%22%3A%22400px%22%7D&amp;navbar=true&amp;anim_speed=-2rpm&amp;time_anim=2000" style="border: currentColor; border-image: none;"></iframe>`

**Using TypeScript to assemble the URL**
```ts
// Format and encode name and value as URL parameter
private encodeQry(name: string, value: string): string {
  return encodeURIComponent(name) + '=' + encodeURIComponent(value);
}

// Generate HTML from SPFx webpart properties
public generateHTML: void {
  // Add settings dynamically
  let url: string = `.../psv-standalone.html?`;
  url += this.encodeQry('panorama', escape(this.properties.imagePath));
  url += '&' + this.encodeQry('size', '{"height":"' + this.properties.elemHeight + '", "width":"' + this.properties.elemHeight + '"}');
  url += '&' + this.encodeQry('navbar', escape(String(this.properties.navbar)));
  url += '&' + this.encodeQry('anim_speed', escape(this.properties.rotationSpeed + 'rpm'));
  // Automatically rotation
  if (this.properties.autoRotate) {
    url += '&' + this.encodeQry('time_anim', this.properties.autoRotateDelay);
  }
  else {
    url += '&' + this.encodeQry('time_anim', 'false');
  }
  
  let innerHTML: string = `
    <style>
    #panorama {
      width: ${escape(this.properties.elemWidth)};
      height: ${escape(this.properties.elemHeight)};
    }
    </style>
    <div id="panorama"><iframe width="100%" height="100%" style="border:none;" src="` + url + `"></iframe></div>
  `;
  ...
}
```
Note: This source code is from an SPFx webpart.
