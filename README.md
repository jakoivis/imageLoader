#imageLoader
JavaScript image preloader

##Options
* images: [array] array of image file paths.
* autoload: [boolean] default true. whether to load immediately when ImageLoader instance is created.
* onComplete: [function()] called when everything has been loaded.
* onFileComplete: [function(QueueItem)] called after each successfull or unsuccessfull load.
* onFileStart: [function(QueueItem)] called before each load.
* numberOfThreads: [int] number of threads used for preloading.
* simulationDelayMin: [int] When specified a download simulation time delay will be added. Specified in milliseconds.
* simulationDelayMax: [int] When specified a download simulation time delay will be added. Specified in milliseconds.

## Examples
######Basic usage
When creating new instance of `ImageLoader`, all the listed images start to load immediately.
```js
var images = ["/assets/sample1_tb.png", "/assets/sample2_tb.png"]
var loader = new ImageLoader({images: images});
```

######Trigger load manually
When setting the `autoload` option to `false`, `load` function can be called to start the loading.
```js
var images = ["/assets/sample1_tb.png", "/assets/sample2_tb.png"]
var loader = new ImageLoader({images: images, autoload: false});
loader.load();
```

[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/jakoivis/imageloader/trend.png)](https://bitdeli.com/free "Bitdeli Badge")
