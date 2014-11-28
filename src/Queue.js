;(function(undefined) {
    'use strict';

    window.Queue = Queue;

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
})();