Documentation is incomplete

#imageLoader
JavaScript image preloader

##Options
######images:
Array of image file paths.
######autoload:
Whether to load immediately when `ImageLoader` instance is created.
Default `true`
######onComplete:
Callback function that is called when everything has been loaded.
######onFileComplete:
Callback function that is called after each successfull or unsuccessfull load.
######onFileStart:
Callback function that called before each load.
######numberOfThreads:
Number of threads used for preloading.
######simulationDelayMin:
When specified a download simulation time delay will be added. Specified in milliseconds.
######simulationDelayMax:
When specified a download simulation time delay will be added. Specified in milliseconds.

##Public interface
###ImageLoader
######load()
######isComplete()
######getQueue()
######getPercentLoaded()
###Queue
######length
######get(index)
######isComplete()
######getNextPendingItem()
######getPercentLoaded()
###QueueItem
######status
######tag
######src
######load(onLoadCallback)
######isPending
######isComplete
######isLoading
######isFailed

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

######Callbacks
```js
var images = ["/assets/sample1_tb.png", "/assets/sample2_tb.png"]
var loader = new ImageLoader({
                    images:images,
                    onComplete:onComplete,
                    onFileComplete:onFileComplete,
                    onFileStart:onFileStart});

function onComplete() {
    console.log("onComplete");
}
function onFileStart(item) {
    console.log("onFileStart: " + item.src);
}
function onFileComplete(item) {
    console.log("onFileComplete: " + item.src);
}
```

######SimulationDelayMin & SimulationDelayMax
```js
var images = ["/assets/sample1_tb.png", "/assets/sample2_tb.png"]
var loader = new ImageLoader({
                    images:images,
                    onFileComplete:onFileComplete,
                    simulationDelayMin:500,
                    simulationDelayMax:1000});

function onFileComplete(item) {
    console.log("onFileComplete: " + item.src);
}
```


[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/jakoivis/imageloader/trend.png)](https://bitdeli.com/free "Bitdeli Badge")
