describe("", function() {

    function getImages_stringArray() {
        return [
            "assets/sample1_tb.png",
            "assets/sample2_tb.png",
            "assets/sample3_tb.png"];
    }

    function getImages_stringArray_lastFails() {
        return [
            "assets/sample1_tb.png",
            "assets/sample2_tb.png",
            "assets/samplex_tb.png"];
    }

    function getImages_objectArray() {
        return [
            {src: "assets/sample1_tb.png", prop1:"value1", prop2:"value2"},
            {src: "assets/sample2_tb.png", prop3:3},
            {src: "assets/sample3_tb.png", prop4:4.4}
        ];
    }

    function getImages_objectArray_lastFails() {
        return [
            {src: "assets/sample1_tb.png", prop1:"value1", prop2:"value2"},
            {src: "assets/sample2_tb.png", prop3:3},
            {src: "assets/samplex_tb.png", prop4:4.4}
        ];
    }

    function getImages_objectArray_missingSrc() {
        return [
            {src: "assets/sample1_tb.png", prop1:"value1", prop2:"value2"},
            {prop3:3},
            {src: "assets/sample1_tb.png", prop4:4.4}
        ];
    }

    var TIMEOUT = 100;

    beforeEach(function(){
    });

    afterEach(function() {
    });

    describe("Options", function() {
        it("should be defined", function() {
            expect(function(){
                new ImageLoader();
            }).toThrow(new Error("Options should be an Object"));
        });

        it("should have images property", function() {
            expect(function(){
                new ImageLoader({});
            }).toThrow(new Error("Options object should have 'images' property (type of array) containing paths to the loaded images."));
        });

        it("images property should be an array", function() {
            expect(function(){
                new ImageLoader({images:{}});
            }).toThrow(new Error("Options object should have 'images' property (type of array) containing paths to the loaded images."));
        });

        it("onComplete should be a function", function() {
            expect(function(){
                new ImageLoader({images:[], onComplete:[]});
            }).toThrow(new Error("'onComplete' property should be a function"));
        });

        it("onFileComplete should be a function", function() {
            expect(function(){
                new ImageLoader({images:[], onFileComplete:[]});
            }).toThrow(new Error("'onFileComplete' property should be a function"));
        });

        it("onFileStart should be a function", function() {
            expect(function(){
                new ImageLoader({images:[], onFileStart:[]});
            }).toThrow(new Error("'onFileStart' property should be a function"));
        });

        it("image objects should have src attributes", function() {
            expect(function(){
                new ImageLoader({images:[{src:""},{}]});
            }).toThrow(new Error("Objects in 'images' property should have src property"));
        });

        it("numberOfThreads should be positive integer", function () {
            expect(function(){
                new ImageLoader({images:[], numberOfThreads: -1});
            }).toThrow(new Error("'numberOfThreads' should be integer number grater than 0"));
        });

        it("numberOfThreads cannot be 0", function () {
            expect(function(){
                new ImageLoader({images:[], numberOfThreads: 0});
            }).toThrow(new Error("'numberOfThreads' should be integer number grater than 0"));
        });

        it("numberOfThreads should be a number", function () {
            expect(function(){
                new ImageLoader({images:[], numberOfThreads: "asd"});
            }).toThrow(new Error("'numberOfThreads' should be integer number grater than 0"));
        });

        it("simulationDelayMin should be positive integer", function () {
            expect(function(){
                new ImageLoader({images:[], simulationDelayMin: -1});
            }).toThrow(new Error("'simulationDelayMin' should be a non-negative integer number"));
        });

        it("simulationDelayMin should be a number", function () {
            expect(function(){
                new ImageLoader({images:[], simulationDelayMin: "asd"});
            }).toThrow(new Error("'simulationDelayMin' should be a non-negative integer number"));
        });

        it("simulationDelayMax should be positive integer", function () {
            expect(function(){
                new ImageLoader({images:[], simulationDelayMax: -1});
            }).toThrow(new Error("'simulationDelayMax' should be a non-negative integer number"));
        });

        it("simulationDelayMax should be a number", function () {
            expect(function(){
                new ImageLoader({images:[], simulationDelayMax: "asd"});
            }).toThrow(new Error("'simulationDelayMax' should be a non-negative integer number"));
        });
    });

    describe("Initialization", function() {
        it("should have no items if images array is empty", function() {
            var loader = new ImageLoader({images:[], autoload:false});
            expect(loader.getQueue().length).toEqual(0);
        });
    });

    describe("options.autoload", function() {

        it("onComplete is not executed if autoload = false and loading is not started", function() {
            var onCompleteSpy = jasmine.createSpy('onComplete');
            var images = getImages_stringArray();
            var loader = new ImageLoader({images:images, onComplete:onCompleteSpy, autoload:false});

            expect(onCompleteSpy).not.toHaveBeenCalled();
        });

        it("load call starts the loading when autoload = false", function(done) {
            var onCompleteSpy = jasmine.createSpy('onComplete');
            var images = getImages_stringArray();
            var loader = new ImageLoader({images:images, onComplete:onCompleteSpy, autoload:false});

            loader.load();

            expect(onCompleteSpy).toHaveBeenCalled();
        });
    });

    describe("ImageLoader.isComplete", function() {

        it("returns false if nothing has been loaded", function() {
            var images = getImages_stringArray();
            var loader = new ImageLoader({images:images, autoload:false});
            expect(loader.isComplete()).toEqual(false);
        });

        it("returns true if everything has been loaded (options.images[n] is string)", function() {
            var images = getImages_stringArray();
            var loader = new ImageLoader({images:images});

            waitForComplete(loader);

            runs(function () {
                expect(loader.isComplete()).toEqual(true);
            });
        });

        it("returns true if everything has been loaded (options.images[n] is object)", function() {
            var images = getImages_objectArray();
            var loader = new ImageLoader({images:images});

            waitForComplete(loader);

            runs(function () {
                expect(loader.isComplete()).toEqual(true);
            });
        });
    });

    describe("options.onComplete", function() {

        it("is executed once when everything has been loaded", function() {
            var onCompleteSpy = jasmine.createSpy('onComplete');
            var images = getImages_stringArray();
            var loader = new ImageLoader({images:images, onComplete:onCompleteSpy});

            waitForComplete(loader);

            runs(function () {
                expect(onCompleteSpy.callCount).toEqual(1);

                var queue = loader.getQueue();

                for (var i = 0; i < queue.length; i++)
                {
                    expect(queue.get(i).isComplete()).toEqual(true);
                }
            });
        });

        it("is also executed for failing last file", function() {
            var onCompleteSpy = jasmine.createSpy('onComplete');
            var images = getImages_stringArray_lastFails();
            var loader = new ImageLoader({images:images, onComplete:onCompleteSpy});

            waitForComplete(loader);

            runs(function () {
                expect(onCompleteSpy.callCount).toEqual(1);
            });
        });
    });

    describe("options.onFileComplete", function() {
        it("has ImageLoader instance as an argument", function() {
            var onFileCompleteSpy = jasmine.createSpy('onFileComplete');
            var images = getImages_stringArray();
            var loader = new ImageLoader({images:images, onFileComplete:onFileCompleteSpy});

            waitForComplete(loader);

            runs(function () {
                var queueItem = onFileCompleteSpy.mostRecentCall.args[0];
                assertIsQueueItemObject(queueItem);
            });
        });

        it("is executed after each successfull or unsuccessfull load", function() {
            var images = getImages_stringArray();
            var loader = new ImageLoader({images:images, onFileComplete:onFileComplete});

            waitForComplete(loader);

            function onFileComplete(item) {
                expect(item.isComplete()).toEqual(true);
            }
        });

        it("is executed correct number of times", function() {
            var onFileCompleteSpy = jasmine.createSpy('onFileComplete');
            var images = getImages_stringArray_lastFails();
            var loader = new ImageLoader({images:images, onFileComplete:onFileCompleteSpy});

            waitForComplete(loader);

            runs(function () {
                expect(onFileCompleteSpy.callCount).toEqual(3);
            });
        });
    });

    describe("options.onFileStart", function() {
        it("has QueueItem instance as an argument", function() {
            var onFileStartSpy = jasmine.createSpy('onFileStart');
            var images = getImages_stringArray();
            var loader = new ImageLoader({images:images, onFileStart:onFileStartSpy});

            waitForComplete(loader);

            runs(function () {
                var queueItem = onFileStartSpy.mostRecentCall.args[0];
                assertIsQueueItemObject(queueItem);
            });
        });

        it("is executed before each successfull or unsuccessfull load", function() {
            var images = getImages_stringArray_lastFails();
            var loader = new ImageLoader({images:images, onFileStart:onFileStart});

            waitForComplete(loader);

            function onFileStart(item) {
                expect(item.isLoading()).toEqual(true);
            }
        });
    });

    describe("ImageLoader.getQueue", function() {
        it("should return correct number of items", function() {
            var images = getImages_objectArray_lastFails();
            var loader = new ImageLoader({images:images, onFileComplete: onFileComplete, autoload:false});
            var result = [loader.getQueue().length];

            loader.load();
            waitForComplete(loader);

            function onFileComplete(item)
            {
                result.push(loader.getQueue().length);
            }

            runs(function(){
                expect(result [0]).toEqual(3);
                expect(result [1]).toEqual(3);
                expect(result [2]).toEqual(3);
                expect(result [3]).toEqual(3);
            });
        });
    });

    describe("Returned data", function() {
        it("Should have tag property holding the image tag, except the failing ones", function() {
            var images = getImages_stringArray_lastFails();
            var loader = new ImageLoader({images:images});

            waitForComplete(loader);

            runs(function () {
                var queue = loader.getQueue();

                expect(queue.get(0).tag.nodeName).toEqual("IMG");
                expect(queue.get(1).tag.nodeName).toEqual("IMG");
                expect(queue.get(2).tag).toEqual(undefined);
            });
        });

        it("Should have properties property holding the original information", function() {
            var images = getImages_objectArray_lastFails();
            var loader = new ImageLoader({images:images});

            waitForComplete(loader);

            runs(function () {
                var queue = loader.getQueue();

                for(var i = 0; i < images.length; i++)
                {
                    for(var property in images[i])
                    {
                        expect(queue.get(i).hasOwnProperty(property)).toEqual(true);
                        expect(queue.get(i)[property]).toEqual(images[i][property]);
                    }
                }
            });
        });

        it("Should have src property", function() {
            var images = getImages_objectArray_lastFails();
            var loader = new ImageLoader({images:images});

            waitForComplete(loader);

            runs(function () {
                var queue = loader.getQueue();

                expect(queue.get(0).src).toEqual(images[0].src);
                expect(queue.get(1).src).toEqual(images[1].src);
                expect(queue.get(2).src).toEqual(images[2].src);
            });
        });

        it("Should have status property", function() {
            var images = getImages_objectArray_lastFails();
            var loader = new ImageLoader({images:images});

            waitForComplete(loader);

            runs(function () {
                var queue = loader.getQueue();

                expect(queue.get(0).status).toEqual("complete");
                expect(queue.get(1).status).toEqual("complete");
                expect(queue.get(2).status).toEqual("failed");
            });
        });
    });

    describe("Loading statistics", function() {
        it("percent to loaded", function() {
            var images = getImages_objectArray();
            var loader = new ImageLoader({images:images, onFileComplete: onFileComplete, autoload:false});
            var result = [loader.getPercentLoaded()];

            loader.load();
            waitForComplete(loader);

            function onFileComplete(item)
            {
                result.push(loader.getPercentLoaded());
            }

            runs(function(){
                expect(result.length).toEqual(4);

                var result0Fixed = result[0].toFixed(3);
                var result1Fixed = result[1].toFixed(3);
                var result2Fixed = result[2].toFixed(3);
                var result3Fixed = result[3].toFixed(3);

                expect(result0Fixed).toEqual("0.000");
                expect(result1Fixed).toEqual("0.333");
                expect(result2Fixed).toEqual("0.667");
                expect(result3Fixed).toEqual("1.000");
            });
        });
    });

    describe("numberOfThreads:", function() {

        it("loading should be done in sequence and loading order shold be preserved (1 thread)", function() {
            // add simulation delay to mix up the finishing times
            var images = getImages_stringArray().concat(getImages_stringArray());
            var loader = new ImageLoader({images:images, onFileComplete:onFileComplete, numberOfThreads:1, simulationDelayMin:25, simulationDelayMax:100});
            var result = [];

            waitForComplete(loader, 2000);

            function onFileComplete(item)
            {
                result.push(item.src);
            }

            runs(function(){
                for(var i = 0; i < images.length; i++) {
                    expect(result[i]).toEqual(images[i]);
                }
            });
        });

        it("final order should be preserved (3 thread)", function() {
            // add simulation delay to mix up the finishing times
            var images = getImages_stringArray().concat(getImages_stringArray());
            var loader = new ImageLoader({images:images, numberOfThreads:3, simulationDelayMin:25, simulationDelayMax:100});

            waitForComplete(loader, 2000);

            runs(function(){
                var queue = loader.getQueue();

                for(var i = 0; i < images.length; i++)
                {
                    expect(images[i]).toEqual(queue.get(i).src);
                }
            });
        });

        it("Number of threads is grater than number of images", function() {
            var onFileCompleteSpy = jasmine.createSpy('onFileComplete');
            var onCompleteSpy = jasmine.createSpy('onComplete');
            var onFileStartSpy = jasmine.createSpy('onFileStart');
            var images = getImages_stringArray();
            var loader = new ImageLoader({images:images, numberOfThreads:6,
                                       simulationDelayMin:25, simulationDelayMax:100,
                                       onComplete:onCompleteSpy, onFileComplete:onFileCompleteSpy,
                                       onFileStart:onFileStartSpy});

            waitForComplete(loader, 2000);

            runs(function(){
                expect(onCompleteSpy.callCount).toEqual(1);
                expect(onFileCompleteSpy.callCount).toEqual(3);
                expect(onFileStartSpy.callCount).toEqual(3);
            });
        });
    });

    describe("General functionality", function() {
        it("Modified arrays and objects should not affect the loader", function() {
            var images = getImages_stringArray_lastFails();
            var loader = new ImageLoader({images:images, autoload:false});

            // change the loaded files after it has been given for the imageLoader
            images.push("someFile");

            // then execute load. the changes should not be included in the ImageLoader
            loader.load();

            waitForComplete(loader);

            runs(function () {
                expect(loader.getQueue().length).toEqual(3);
            });
        });

        it("ImageLoader.load does nothing when called during loading", function() {
            var onFileCompleteSpy = jasmine.createSpy('onFileComplete');
            var onCompleteSpy = jasmine.createSpy('onComplete');
            var images = getImages_stringArray_lastFails();
            var loader = new ImageLoader({images:images, onFileComplete:onFileCompleteSpy, onComplete:onCompleteSpy});

            waitForComplete(loader);

            runs(function () {
                expect(onCompleteSpy.callCount).toEqual(1);
                expect(onFileCompleteSpy.callCount).toEqual(3);
            });
        });

        it("ImageLoader.load does nothing when called after loading", function() {
            var onFileCompleteSpy = jasmine.createSpy('onFileComplete');
            var onCompleteSpy = jasmine.createSpy('onComplete');
            var images = getImages_stringArray_lastFails();
            var loader = new ImageLoader({images:images, onFileComplete:onFileCompleteSpy, onComplete:onCompleteSpy});

            waitForComplete(loader);

            runs(function () {
                loader.load();

                waitForComplete(loader);

                runs(function () {
                    expect(onCompleteSpy.callCount).toEqual(1);
                    expect(onFileCompleteSpy.callCount).toEqual(3);
                });
            });
        });
    });

    function waitForComplete(loader, timeout)
    {
        waitsFor(function() {
            return loader.isComplete();
        }, "all files to load", timeout || TIMEOUT);
    }

    function assertIsQueueItemObject(item)
    {
        var hasTag = item.hasOwnProperty('tag');
        var hasSrc = item.hasOwnProperty('src');
        var hasStatus = item.hasOwnProperty('status');

        expect(hasTag).toEqual(true);
        expect(hasSrc).toEqual(true);
        expect(hasStatus).toEqual(true)
    }
});