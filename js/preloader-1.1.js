/*
    Preloader version 1.1
    preloader-1.1.js
    
    The MIT License (MIT)
    
    Copyright (c) 2014 Jarmo Koivisto
    
    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:
    
    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.
    
    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
    THE SOFTWARE.

    features 1.0:
        - basic implementation: preload images
        - hold custom paramters for each image
        - callback executed when everything has been loaded
        - callback executed after a file has been loaded
        
    features 1.1
        - loading threads
        - loading order is preserved.
        - examples
        - simulate loading time
        - onFileStart executed before a file starts loading
        
    Preloader(options [object])
        options argument
            - images: [array] array of image file paths.
            - autoload: [boolean] default true. whether to load immediately when Preloader instance is created.
            - onComplete: [function()] called when everything has been loaded.
            - onFileComplete: [function(QueueItem)] called after each successfull or unsuccessfull load.
            - onFileStart: [function(QueueItem)] called before each load.
            - numberOfThreads: [int] number of threads used for preloading.
            - simulationDelayMin: [int] When specified a download simulation time delay will be added. Specified in milliseconds.
            - simulationDelayMax: [int] When specified a download simulation time delay will be added. Specified in milliseconds.
*/

/**
 * @module Preloader
 */
;(function(undefined) {
    'use strict';
    
    window.Preloader = Preloader;
    
    /**
     * @exports Preloader
     */
    function Preloader(options)
    {
        if (!(this instanceof Preloader))
        {
            return new Preloader(options);
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
        
        me.getQueue = function() { return queue; };
        
        me.getPercentLoaded = function() { return queue.getPercentLoaded(); };
        
        /**
         * Description
         * @method getQueue
         */
        me.load = load;
        
        /**
         * Description
         * @method isComplete
         * @return CallExpression
         */
        me.isComplete = isComplete;
        
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
            
            QueueItem.setSimulationDelays(delayMin, delayMax);
            
            function getImages()
            {
                if (!options.images || !(options.images instanceof Array))
                {
                    throw new Error("Options object should have 'images' property (type of array) containing paths to the loaded images.");
                }
                
                for(var i = 0; i < options.images.length; i++)
                {
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
        
        return this;
    }
    
    var currentThreadIndex = 0;
    
    /**
     * @exports Thread
     */
    function Thread(options)
    {
        if (!(this instanceof Thread))
        {
            return new Thread(options);
        }
        
        var threadIndex = currentThreadIndex++;
        
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
            var queueItem = queue.getNextPendingItem();
            
            if (typeof queueItem === 'undefined')
            {
                onThreadCompleteCallback();
            }
            else
            {
                queueItem.load(onLoadHandler);
                onFileStartCallback(queueItem);
            }
        }
        
        function onLoadHandler(item)
        {
            onFileCompleteCallback(item);
            processNextItem();
        }
        
        return this;
    }
    
    /**
     * @exports Queue
     */
    function Queue(images)
    {
        if (!(this instanceof Queue))
        {
            return new Queue(images);
        }
        
        var items;
        var me = this;
        
        me.length = 0;
        
        init();
        
        me.get = function(index)
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
                    result.push(new QueueItem({
                        src: images[i]
                    }));
                }
                else if (typeof images[i] === "object")
                {
                    result.push(new QueueItem(images[i]));
                }
            }
            
            return result;
        }
        
        return this;
    }
    
    /**
     * @exports QueueItem
     */
    function QueueItem(options)
    {
        if (!(this instanceof QueueItem))
        {
            return new QueueItem();
        }
        
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
            setProperties()
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
            if (QueueItem.simulationDelayMin)
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
            if (QueueItem.simulationDelayMin)
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
            handleLoadCallback();
            onLoadCallback = undefined;
        }
        
        function finalizeOnError()
        {
            removeListeners();
            me.tag = undefined;
            setStatusFailed();
            handleLoadCallback();
            onLoadCallback = undefined;
        }
        
        function handleLoadCallback()
        {
            if (onLoadCallback)
            {
                onLoadCallback(me);
            }
        }
        
        function calculateSimulationDelay()
        {
            var max = QueueItem.simulationDelayMax;
            var min = QueueItem.simulationDelayMin;
            
            return Math.floor(Math.random() * (max - min) + min);
        }
        
        return this;
    }
    
    QueueItem.setSimulationDelays = function(min, max)
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
        
        QueueItem.simulationDelayMin = delayMin;
        QueueItem.simulationDelayMax = delayMax;
    }
    
    
})();