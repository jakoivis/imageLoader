
function Thread(options)
{
    if (!(this instanceof Thread))
    {
        return new Thread(options);
    }

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
