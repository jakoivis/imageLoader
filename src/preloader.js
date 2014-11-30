/*

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

;(function(undefined) {
    'use strict';

    window.Preloader = Preloader;

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

        me.load = load;

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

})();
