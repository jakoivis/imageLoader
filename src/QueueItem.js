;(function(undefined) {
    'use strict';

    window.QueueItem = QueueItem;

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
    };
})();