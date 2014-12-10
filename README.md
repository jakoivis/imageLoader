Simple JavaScript image loader. Provides complete callbacks for the whole load and for individual files. Loading can be done in parallel or in sequence. 

#ImageLoader options
Property name       | Default           | Description
-------------       | -------           | -----------
**images**          |                   | Array of strings or array of objects. When specifying array of strings, each string in the array is a path to the image file. e.g. `["/path/to/image", ...]` When specifying array of objects, each object must have src property which is a path to the image file. e.g. `[{src:"/path/to/image", someProperty:"user's data"}, ...]` 
**autoload**        | `true`            | Whether to load immediately when `ImageLoader` instance is created.
**onComplete**      |                   | Callback function that is called when everything has been loaded. This function doesn't get any parameters.
**onFileComplete**  |                   | Callback function that is called after each successfull or unsuccessfull load. This function has `ImageLoaderItem` parameter.
**onFileStart**     |                   | Callback function that called before each load. This function has `ImageLoaderItem` parameter.
**numberOfThreads** | 1                 | Number of threads used for preloading. Keeping the default value will load all the images in sequence. Changing this to 3 for example, will load 3 images parallel.
**simulationDelayMin**|                 | When spacified, a random time delay is added for each image download to simulate the connection speed. The random value is calculated between `simulationDelayMin` and `simulationDelayMax` values. This is used for testing purposes only. Specified in milliseconds. 
**simulationDelayMax**|                 | 

##Public interface

###ImageLoader
Function | Description
-------- | -----------
**load()** | Start loading. This needs to be called only if the `autoload` option is set to false.
**isComplete()** | Returns boolean value indicating whether all the images are loaded or not.
**getItemAt(index)** | Returns the `ImageLoaderItem` object at the specified index.
**getPercentLoaded()** | Returns percentage loaded.
**length()** | Number of items

###ImageLoaderItem
Property | Description
-------- | -----------
**status** | Status of the image load. Use `isPending`, `isComplete`, `isLoading` and `isFailed` functions to test the status. 
**tag** | IMG tag.
**src** | Source of the image.

Function | Description
-------- | -----------
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
// do something...
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
    console.log("Everything has been loaded");
}
function onFileStart(item) {
    console.log("onFileStart: " + item.src);
}
function onFileComplete(item) {
    console.log("onFileComplete: " + item.src);
    document.body.appendChild(item.tag);
}
```

######Using custom properties in images object
All the properties of image objects will be be accessible in the onFileComplete callback. Those properties are copied to the `ImageLoaderItem` objects.
```js
var images = [
    {src:"/assets/sample1_tb.png", someProperty:"someValue1"},
    {src:"/assets/sample2_tb.png", someProperty:"someValue2"}
];
var loader = new ImageLoader({images:images, onFileComplete:onFileComplete});

function onFileComplete(item) {
    console.log("onFileComplete: " + item.src);
    console.log("someProperty: " + item.someProperty);
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
    document.body.appendChild(item.tag);
}
```


[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/jakoivis/imageloader/trend.png)](https://bitdeli.com/free "Bitdeli Badge")
