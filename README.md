Documentation is incomplete

#imageLoader
JavaScript image preloader

##ImageLoader options
Property name       | Default           | Description
-------------       | -------           | -----------
**images**          |                   | Array of strings or array of objects. When specifying array of strings, each string in the array is a path to the image file. e.g. `["/path/to/image", ...]` When specifying array of objects, each object must have src property which is a path to the image file. e.g. `[{src:"/path/to/image", someProperty:"user's data"}, ...]` 
**autoload**        | `true`            | Whether to load immediately when `ImageLoader` instance is created.
**onComplete**      |                   | Callback function that is called when everything has been loaded. This function doesn't get any parameters.
**onFileComplete**  |                   | Callback function that is called after each successfull or unsuccessfull load. This function has `QueueItem` parameter.
**onFileStart**     |                   | Callback function that called before each load. This function has `QueueItem` parameter.
**numberOfThreads** | 1                 | Number of threads used for preloading. Keeping the default value will load all the images in sequence. Changing this to 3 for example, will load 3 images parallel.
**simulationDelayMin**|                 | When spacified, a random time delay is added for each image download to simulate the connection speed. The random value is calculated between `simulationDelayMin` and `simulationDelayMax` values. This is used for testing purposes only. Specified in milliseconds. 
**simulationDelayMax**|                 | 

##Public interface

###ImageLoader
Function | Description
-------- | -----------
**load()** | Start loading. This needs to be called only if the `autoload` option is set to false.
**isComplete()** | Returns boolean value indicating whether all the images are loaded or not.
**getQueue()** | Returns `Queue` object.
**getPercentLoaded()** | Returns percentage loaded. Same as in Queue object. **TODO: just remove this** 

###Queue
Property | Description
-------- | -----------
**length** | Number of items in queue.

Function | Description
-------- | -----------
**get(index)** | Returns the `QueueItem` object at the specified index.
**isComplete()** | Returns boolean value indicating whether all the images are loaded or not.
**getNextPendingItem()** | Used internally only. **TODO does it have to be documented?**
**getPercentLoaded()** | Returns percentage loaded.

###QueueItem
Property | Description
-------- | -----------
**status** | Status of the image load. Use `isPending`, `isComplete`, `isLoading` and `isFailed` functions to test the status. 
**tag** | IMG tag if the image.
**src** | Source of the image.

Function | Description
-------- | -----------
**load(onLoadCallback)** | Used internally only. **TODO does it have to be documented?**
**isPending()** | Returns `true` if status is `"pending"`
**isComplete()** | Returns `true` if status is `"complete"`
**isLoading()** | Returns `true` if status is `"loading"`
**isFailed()** | Returns `true` if status is `"failed"`

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

######Using custom properties in images object

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
