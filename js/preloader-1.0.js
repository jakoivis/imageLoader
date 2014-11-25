/*
    Preloader version 1.0
    preloader-1.0.js
    
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
        - call back executed when everything has been loaded
        - call back executed after a file has been loaded
        
    options [object]
         images [array] array of image file paths
         autoload: [boolean, default true] whether to load immediately when Preloader instance is created.
         onComplete(Preloader) [function] called when everything is loaded
         onFileComplete(Preloader) [function] called for each completed file
*/

;(function() {
    'use strict';
    
    function Preloader(options)
    {
        if (!(this instanceof Preloader))
        {
            return new Preloader(options);
        }
        
        var me = this;
        var autoload = true;
        
        var queue;
        var loaded;
        var failed;
        var latestReady;
        
        var STATUS = {
            PENDING: "pending",
            LOADING: "loading",
            COMPLETE: "complete",
            FAILED: "failed"
        };
        
        var callbacks = {
            onComplete: null,
            onFileComplete: null
        }
        
        init(options);
        
        me.isAutoload = function()
        {
            return autoload;
        }
        
        me.getLoaded = function()
        {
            return loaded.slice(0);
        }
        
        me.getFailed = function()
        {
            return failed.slice(0);
        }
        
        me.getLatestReady = function()
        {
            return latestReady;
        }
        
        me.getTotalNumberOfItems = function()
        {
            return queue.length;
        }
        
        me.getNumberOfLoadedItems = function()
        {
            return loaded.length + failed.length;
        }
        
        me.getPercentLoaded = function()
        {
            return (loaded.length + failed.length) / queue.length;
        }
        
        me.load = load;
        me.isComplete = isComplete;
        
        function init(options)
        {
            validateOptions(options);
            applyOptions(options);
            initializeVariables();
            
            if (autoload)
            {
                load();
            }
        }
        
        function applyOptions(options)
        {
            queue = createQueue(options);
            autoload = getValue(options.autoload, true);
            callbacks.onComplete = getValue(options.onComplete, null);
            callbacks.onFileComplete = getValue(options.onFileComplete, null);
        }
        
        function createQueue(options)
        {
            var images = options.images.slice(0);
            var queue = [];
            
            for(var i = 0; i < images.length; i++)
            {
                if (typeof images[i] === "string")
                {
                    queue.push({
                        src: images[i],
                        tag: document.createElement("img"),
                        properties: undefined,
                        status: STATUS.PENDING
                    });
                }
                else if (typeof images[i] === "object")
                {
                    queue.push({
                        src: images[i].src,
                        tag: document.createElement("img"),
                        properties: images[i],
                        status: STATUS.PENDING
                    });
                }
            }
            
            return queue;
        }
        
        function getValue(value, defaultValue)
        {
            return typeof value === 'undefined' ? defaultValue : value;
        }
        
        function initializeVariables()
        {
            loaded = [];
            failed = [];
            latestReady = null;
        }
        
        function validateOptions(options)
        {
            if (!options || typeof options !== "object")
            {
                throw new Error("Options should be an Object");
            }
            
            if (!options.images || !(options.images instanceof Array))
            {
                throw new Error("Options object should have 'images' property (type of array) containing paths to the loaded images.");
            }
            
            if (options.onComplete && typeof options.onComplete !== "function")
            {
                throw new Error("'onComplete' property should be a function");
            }
            
            if (options.onFileComplete && typeof options.onFileComplete !== "function")
            {
                throw new Error("'onFileComplete' property should be a function");
            }
            
            for(var i = 0; i < options.images.length; i++)
            {
                if (typeof options.images[i] !== "string" && !options.images[i].hasOwnProperty("src"))
                {
                    throw new Error("Objects in 'images' property should have src property");
                }
            }
        }
        
        function load()
        {
            for(var i = 0; i < queue.length; i++)
            {
                var queueItem = queue[i];
                var tag = queueItem.tag;
                
                addLoadingListeners(tag);
                queueItem.status = STATUS.LOADING;
                tag.src = queueItem.src;
            }
        }
        
        function addLoadingListeners(imageTag)
        {
            imageTag.addEventListener('load', onLoadHandler);
            imageTag.addEventListener('error', onErrorHandler);
        }
        
        function removeLoadingListeners(imageTag)
        {
            imageTag.removeEventListener('load', onLoadHandler);
            imageTag.removeEventListener('error', onErrorHandler);
        }
        
        function onLoadHandler(event)
        {
            var queueItem = getQueueItem(event.target);
            var tag = queueItem.tag;
            removeLoadingListeners(tag);
            loaded.push(queueItem);
            latestReady = queueItem;
            queueItem.status = STATUS.COMPLETE;
            handleFileCompleteCallback();
            handleCompleteCallback();
        }
        
        function onErrorHandler(event)
        {
            var queueItem = getQueueItem(event.target);
            var tag = queueItem.tag;
            removeLoadingListeners(tag);
            failed.push(queueItem);
            latestReady = queueItem;
            queueItem.status = STATUS.FAILED;
            handleFileCompleteCallback();
            handleCompleteCallback();
        }

        function getQueueItem(tag)
        {
            for(var i = 0; i < queue.length; i++)
            {
                if (queue[i].tag === tag)
                {
                    return queue[i]
                }
            }
            
            return null;
        }
        
        function handleCompleteCallback()
        {
            if (isComplete() && callbacks.onComplete)
            {
                callbacks.onComplete(me);
            }
        }
        
        function handleFileCompleteCallback()
        {
            if (callbacks.onFileComplete)
            {
                callbacks.onFileComplete(me);
            }
        }
        
        function isComplete()
        {
            var failedCount = failed.length;
            var loadedCount = loaded.length;
            var total = failedCount + loadedCount;
            
            return total === queue.length && queue.length > 0;
        }
        
        return this;
    }
    
    window.Preloader = Preloader;
    
})();