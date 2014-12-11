;(function(undefined) {
"use strict";

window.ImageLoader = ImageLoader;

function ImageLoader(options)
{
    if (!(this instanceof ImageLoader))
    {
        return new ImageLoader(options);
    }

    var me = this;
    var autoload;
    var queue;
    var numberOfThreads;
    var onCompleteCallback;
    var onFileCompleteCallback;
    var onFileStartCallback;
    var isLoading;

    init(options);

    me.load = load;
    me.isComplete = isComplete;
    me.getPercentLoaded = getPercentLoaded;
    me.getItemAt = getItemAt;
    me.length = length;

    function init(options)
    {
        applyOptions(options);

        isLoading = false;

        if (autoload)
        {
            load();
        }
    }

    function applyOptions(options)
    {
        if (!options || typeof options !== "object")
        {
            throw new Error("Options should be an Object");
        }

        queue = new Queue(getImages());
        onCompleteCallback = getOnComplete();
        onFileCompleteCallback = getOnFileComplete();
        onFileStartCallback = getOnFileStart();
        autoload = getAutoload();
        numberOfThreads = getNumberOfThreads();

        var delayMin = getSimulationDelayMin();
        var delayMax = getSimulationDelayMax();

        ImageLoaderItem.setSimulationDelays(delayMin, delayMax);

        function getImages()
        {
            if (!options.images || !(options.images instanceof Array))
            {
                throw new Error("Options object should have 'images' property (type of array) containing paths to the loaded images.");
            }

            for(var i = 0; i < options.images.length; i++)
            {
                if(!options.images[i])
                {
                    throw new Error("Objects in 'images' cannot be null or undefined");
                }

                if (typeof options.images[i] !== "string" && !options.images[i].hasOwnProperty("src"))
                {
                    throw new Error("Objects in 'images' property should have src property");
                }
            }

            return options.images.slice(0);
        }

        function getOnComplete()
        {
            if (options.onComplete && typeof options.onComplete !== "function")
            {
                throw new Error("'onComplete' property should be a function");
            }

            return getValue(options.onComplete, undefined);
        }

        function getOnFileComplete()
        {
            if (options.onFileComplete && typeof options.onFileComplete !== "function")
            {
                throw new Error("'onFileComplete' property should be a function");
            }

            return getValue(options.onFileComplete, undefined);
        }

        function getOnFileStart()
        {
            if (options.onFileStart && typeof options.onFileStart !== "function")
            {
                throw new Error("'onFileStart' property should be a function");
            }

            return getValue(options.onFileStart, undefined);
        }

        function getAutoload()
        {
            return getValue(options.autoload, true);
        }

        function getNumberOfThreads()
        {
            var value = getValue(options.numberOfThreads, 1);
            var number = parseInt(value);

            if (isNaN(number) || number < 1)
            {
                throw new Error("'numberOfThreads' should be integer number grater than 0");
            }

            return number;
        }

        function getSimulationDelayMin()
        {
            var value = getValue(options.simulationDelayMin, undefined);
            var number = parseInt(value);

            // allow undefined values but other values that cannot be converted to number are not allowed
            if (typeof value !== 'undefined' && (isNaN(number) || number < 0))
            {
                throw new Error("'simulationDelayMin' should be a non-negative integer number");
            }

            if (typeof value === 'undefined')
            {
                number = undefined;
            }

            return number;
        }

        function getSimulationDelayMax()
        {
            var value = getValue(options.simulationDelayMax, undefined);
            var number = parseInt(value);

            // allow undefined values but other values that cannot be converted to number are not allowed
            if (typeof value !== 'undefined' && (isNaN(number) || number < 0))
            {
                throw new Error("'simulationDelayMax' should be a non-negative integer number");
            }

            if (typeof value === 'undefined')
            {
                number = undefined;
            }

            return number;
        }

        function getValue(value, defaultValue)
        {
            return typeof value === 'undefined' ? defaultValue : value;
        }
    }

    function load()
    {
        if (isLoading === false && isComplete() === false)
        {
            isLoading = true;
            createThreads();
        }
    }

    function createThreads()
    {
        for(var i = 0; i < numberOfThreads; i++)
        {
            new Thread({
                onThreadComplete: threadCompleteHandler,
                onFileComplete: onFileCompleteHandler,
                onFileStart: onFileStartHandler,
                queue: queue
            });
        }
    }

    function onFileCompleteHandler(item)
    {
        if (onFileCompleteCallback)
        {
            onFileCompleteCallback(item);
        }
    }

    function onFileStartHandler(item)
    {
        if (onFileStartCallback)
        {
            onFileStartCallback(item);
        }
    }

    function threadCompleteHandler()
    {
        if (isComplete() && onCompleteCallback)
        {
            isLoading = false;
            onCompleteCallback();
        }
    }

    function isComplete()
    {
        return queue.isComplete();
    }

    function getPercentLoaded()
    {
        return queue.getPercentLoaded();
    }

    function getItemAt(index)
    {
        return queue.getItemAt(index);
    }

    function length()
    {
        return queue.length;
    }

    return this;
}


function ImageLoaderItem(options)
{
    var STATUS = {
        PENDING: "pending",
        LOADING: "loading",
        COMPLETE: "complete",
        FAILED: "failed"
    };

    var me = this;

    var onLoadCallback;

    init();

    me.load = function(onLoad)
    {
        onLoadCallback = onLoad;

        setStatusLoading();

        me.tag.addEventListener('load', onLoadHandler);
        me.tag.addEventListener('error', onErrorHandler);

        me.tag.src = me.src;
    };

    me.isPending = function () { return me.status === STATUS.PENDING; };
    me.isComplete = function () { return me.status === STATUS.COMPLETE; };
    me.isLoading = function () { return me.status === STATUS.LOADING; };
    me.isFailed = function () { return me.status === STATUS.FAILED; };

    function init()
    {
        setProperties();
        setStatusPending();
    }

    function setProperties()
    {
        for(var property in options)
        {
            me[property] = options[property];
        }

        me.tag = document.createElement("img");
    }

    function setStatusFailed() { me.status = STATUS.FAILED; }
    function setStatusComplete() { me.status = STATUS.COMPLETE; }
    function setStatusLoading() { me.status = STATUS.LOADING; }
    function setStatusPending() { me.status = STATUS.PENDING; }

    function removeListeners()
    {
        me.tag.removeEventListener('load', onLoadHandler);
        me.tag.removeEventListener('error', onErrorHandler);
    }

    function onLoadHandler(event)
    {
        if (ImageLoaderItem.simulationDelayMin)
        {
            setTimeout(function()
            {
                finalizeOnLoad();

            }, calculateSimulationDelay());
        }
        else
        {
            finalizeOnLoad();
        }
    }

    function onErrorHandler(event)
    {
        if (ImageLoaderItem.simulationDelayMin)
        {
            setTimeout(function()
            {
                finalizeOnError();

            }, calculateSimulationDelay());
        }
        else
        {
            finalizeOnError();
        }
    }

    function finalizeOnLoad()
    {
        removeListeners();
        setStatusComplete();
        onLoadCallback(me);
        onLoadCallback = undefined;
    }

    function finalizeOnError()
    {
        removeListeners();
        me.tag = undefined;
        setStatusFailed();
        onLoadCallback(me);
        onLoadCallback = undefined;
    }

    function calculateSimulationDelay()
    {
        var max = ImageLoaderItem.simulationDelayMax;
        var min = ImageLoaderItem.simulationDelayMin;

        return Math.floor(Math.random() * (max - min) + min);
    }

    return this;
}

ImageLoaderItem.setSimulationDelays = function(min, max)
{
    var delayMin = min;
    var delayMax = max;

    if (delayMin && !delayMax)
    {
        delayMax = delayMin;
    }
    else if (delayMax && !delayMin)
    {
        delayMin = delayMax;
    }

    ImageLoaderItem.simulationDelayMin = delayMin;
    ImageLoaderItem.simulationDelayMax = delayMax;
};


function Queue(images)
{
    var items;
    var me = this;

    me.length = 0;

    init();

    me.getItemAt = function(index)
    {
        return items[index];
    };

    me.isComplete = function()
    {
        var result = true;
        var item;

        for(var i = 0; i < items.length; i++)
        {
            item = items[i];

            if (item.isPending() || item.isLoading())
            {
                result = false;
                break;
            }
        }

        return result;
    };

    me.getNextPendingItem = function()
    {
        var result;

        for(var i = 0; i < items.length; i++)
        {
            if (items[i].isPending())
            {
                result = items[i];
                break;
            }
        }

        return result;
    };

    me.getPercentLoaded = function()
    {
        var item;
        var i = 0;
        var len = items.length;

        for(i; i < len; i++)
        {
            item = items[i];

            if (item.isPending() || item.isLoading())
            {
                break;
            }
        }

        return i / len;
    };

    function init()
    {
        items = createItems(images);
        me.length = items.length;
    }

    function createItems(images)
    {
        var result = [];

        for(var i = 0; i < images.length; i++)
        {
            if (typeof images[i] === "string")
            {
                result.push(new ImageLoaderItem({
                    src: images[i]
                }));
            }
            else
            {
                result.push(new ImageLoaderItem(images[i]));
            }
        }

        return result;
    }

    return this;
}


function Thread(options)
{
    var me = this;
    var onThreadCompleteCallback;
    var onFileCompleteCallback;
    var onFileStartCallback;
    var queue;

    init();

    function init()
    {
        onThreadCompleteCallback = options.onThreadComplete;
        onFileCompleteCallback = options.onFileComplete;
        onFileStartCallback = options.onFileStart;
        queue = options.queue;

        processNextItem();
    }

    function processNextItem()
    {
        var imageLoaderItem = queue.getNextPendingItem();

        if (typeof imageLoaderItem === 'undefined')
        {
            onThreadCompleteCallback();
        }
        else
        {
            imageLoaderItem.load(onLoadHandler);
            onFileStartCallback(imageLoaderItem);
        }
    }

    function onLoadHandler(item)
    {
        onFileCompleteCallback(item);
        processNextItem();
    }

    return this;
}
})();