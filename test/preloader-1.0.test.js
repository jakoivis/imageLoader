describe("myFunction", function() {
 
    function getImages_stringArray() {
        return [
            "assets/00_03.png",
            "assets/01_03.png",
            "assets/02_03.png"];
    }
    
    function getImages_stringArray_lastFails() {
        return [
            "assets/00_03.png",
            "assets/01_03.png",
            "assets/0x_03.png"];
    }
    
    function getImages_objectArray() {
        return [
            {src: "assets/00_03.png", prop1:"value1", prop2:"value2"},
            {src: "assets/01_03.png", prop3:3},
            {src: "assets/02_03.png", prop4:4.4}
        ];
    }
    
    function getImages_objectArray_lastFails() {
        return [
            {src: "assets/00_03.png", prop1:"value1", prop2:"value2"},
            {src: "assets/01_03.png", prop3:3},
            {src: "assets/0x_03.png", prop4:4.4}
        ];
    }
    
    function getImages_objectArray_missingSrc() {
        return [
            {src: "assets/00_03.png", prop1:"value1", prop2:"value2"},
            {prop3:3},
            {src: "assets/00_03.png", prop4:4.4}
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
                new Preloader();
            }).toThrow(new Error("Options should be an Object"));
        });
        
        it("should have images property", function() {
            expect(function(){
                new Preloader({});
            }).toThrow(new Error("Options object should have 'images' property (type of array) containing paths to the loaded images."));
        });
        
        it("images property should be an array", function() {
            expect(function(){
                new Preloader({images:{}});
            }).toThrow(new Error("Options object should have 'images' property (type of array) containing paths to the loaded images."));
        });
        
        it("onComplete should be a function", function() {
            expect(function(){
                new Preloader({images:[], onComplete:[]});
            }).toThrow(new Error("'onComplete' property should be a function"));
        });
        
        it("onFileComplete should be a function", function() {
            expect(function(){
                new Preloader({images:[], onFileComplete:[]});
            }).toThrow(new Error("'onFileComplete' property should be a function"));
        });
        
        it("image objects should have src attributes", function() {
            expect(function(){
                new Preloader({images:[{src:""},{}]});
            }).toThrow(new Error("Objects in 'images' property should have src property"));
        });
    });
    
    describe("Initialization", function() {
        it("should have none loaded", function() {
            var loader = new Preloader({images:[], autoload:false});
            expect(loader.getLoaded().length).toEqual(0);
        });
        
        it("should have none failed", function() {
            var loader = new Preloader({images:[], autoload:false});
            expect(loader.getFailed().length).toEqual(0);
        });
    });
    
    describe("options.autoload", function() {
        it("can override default autoload setting", function() {
            var loader = new Preloader({images:[], autoload:false});
            expect(loader.isAutoload()).toEqual(false);
        });
        
        it("onComplete is not executed if autoload = false and loading is not started", function() {
            var onCompleteSpy = jasmine.createSpy('onComplete');
            var images = getImages_stringArray();
            var loader = new Preloader({images:images, onComplete:onCompleteSpy, autoload:false});
            
            waits(TIMEOUT);
            
            runs(function () {
                expect(onCompleteSpy).not.toHaveBeenCalled();
            });
        });
        
        it("load call starts the loading when autoload = false", function() {
            var onCompleteSpy = jasmine.createSpy('onComplete');
            var images = getImages_stringArray();
            var loader = new Preloader({images:images, onComplete:onCompleteSpy, autoload:false});
            
            loader.load();
            
            waitForComplete(loader);
            
            runs(function () {
                var isProloaderInstance = onCompleteSpy.mostRecentCall.args[0] instanceof Preloader;
                expect(onCompleteSpy).toHaveBeenCalled();
                expect(isProloaderInstance).toEqual(true);
            });
        });
    });
    
    describe("preloader.isComplete", function() {
        it("returns false if nothing has been loaded", function() {
            var images = getImages_stringArray();
            var loader = new Preloader({images:images, autoload:false});
            expect(loader.isComplete()).toEqual(false);
        });
        
        it("returns true if everything has been loaded (options.images[n] is string)", function() {
            var images = getImages_stringArray();
            var loader = new Preloader({images:images, autoload:false});
            spyOn(loader, 'isComplete').andCallThrough();
            loader.load();
            
            waitForComplete(loader);
            
            runs(function () {
                var allLoaded = loader.getLoaded().length === images.length;
                expect(allLoaded).toEqual(true);
            });
        });
        
        it("returns true if everything has been loaded (options.images[n] is object)", function() {
            var images = getImages_objectArray();
            var loader = new Preloader({images:images, autoload:false});
            spyOn(loader, 'isComplete').andCallThrough();
            loader.load();
            
            waitForComplete(loader);
            
            runs(function () {
                var allLoaded = loader.getLoaded().length === images.length;
                expect(allLoaded).toEqual(true);
            });
        });
    });
    
    describe("options.onComplete", function() {
        it("is executed when everything has been loaded", function() {
            var onCompleteSpy = jasmine.createSpy('onComplete');
            var images = getImages_stringArray();
            var loader = new Preloader({images:images, onComplete:onCompleteSpy});
            
            waitForComplete(loader);
            
            runs(function () {
                expect(onCompleteSpy).toHaveBeenCalled();
                expect(onCompleteSpy.mostRecentCall.args[0] instanceof Preloader).toEqual(true);
            });
        });
        
        it("is also executed for failing last file", function() {
            var onCompleteSpy = jasmine.createSpy('onComplete');
            var images = getImages_stringArray_lastFails();
            var loader = new Preloader({images:images, onComplete:onCompleteSpy});
            
            waitForComplete(loader);
            
            runs(function () {
                expect(onCompleteSpy).toHaveBeenCalled();
                expect(onCompleteSpy.mostRecentCall.args[0] instanceof Preloader).toEqual(true);
            });
        });
    });
    
    describe("options.onFileComplete", function() {
        it("is executed after each successfull or unsuccessfull load", function() {
            var onFileCompleteSpy = jasmine.createSpy('onFileComplete');
            var images = getImages_stringArray_lastFails();
            var loader = new Preloader({images:images, onFileComplete:onFileCompleteSpy});
            
            waitForComplete(loader);
            
            runs(function () {
                expect(onFileCompleteSpy.callCount).toEqual(3);
                expect(onFileCompleteSpy.mostRecentCall.args[0] instanceof Preloader).toEqual(true);
            });
        });
    });
        
    describe("preloader.getLatestReady", function(){
        it("returned object points to the object that were most recestly loaded", function() {
            var images = getImages_stringArray_lastFails();
            var loader = new Preloader({images:images, onFileComplete:onFileComplete});
            var actual = [];
            
            waitForComplete(loader);

            runs(function () {
                // check the file names match in the current
                // (at the time of calling the getLatestReady)
                expect(actual[0]).toEqual(images[0]);
                expect(actual[1]).toEqual(images[1]);
                expect(actual[2]).toEqual(images[2]);
            });
            
            function onFileComplete(loader)
            {
                // just store the file name and assert later
                var currentSrc = loader.getLatestReady().src;
                var fileName = currentSrc.substring(currentSrc.length-16);
                actual.push(fileName);
            }
        });
        
        it("returned object should have the correct properties", function() {
            var images = getImages_stringArray_lastFails();
            var loader = new Preloader({images:images, onFileComplete:onFileComplete});
            var actual = [];
            
            waitForComplete(loader);

            function onFileComplete(loader)
            {
                var hasTag = loader.getLatestReady().hasOwnProperty('tag');
                var hasSrc = loader.getLatestReady().hasOwnProperty('src');
                var hasProperties = loader.getLatestReady().hasOwnProperty('properties');
                
                expect(hasTag).toEqual(true);
                expect(hasSrc).toEqual(true);
                expect(hasProperties).toEqual(true);
            }
        });
        
    });
        
    describe("General functionality", function() {
        it("Modified arrays and objects should not affect the loader", function() {
            var images = getImages_stringArray_lastFails();
            var loader = new Preloader({images:images, autoload:false});
            
            // change the loaded files after it has been given for the imageLoader
            images.push("someFile");
            
            // then execute load. the changes should not be included in the Preloader
            loader.load();
            
            waitForComplete(loader);
            
            runs(function () {
                expect(loader.getLoaded().length).toEqual(2);
                var loaded = loader.getLoaded();
                loaded.push("someFile");
                
                // the changes above should not have any affect on the Preloader
                expect(loader.getLoaded().length).toEqual(2);
                
                expect(loader.getFailed().length).toEqual(1);
                var failed = loader.getFailed();
                failed.push("someFile");
                
                // the changes above should not have any affect on the Preloader
                expect(loader.getFailed().length).toEqual(1);
            });
        }); 
    });  
        
    describe("getFailed and getLoaded", function() {
        it("returns correct number of files (options.images[n] is string)", function() {
            var images = getImages_stringArray_lastFails();
            var loader = new Preloader({images:images});
            
            waitForComplete(loader);
            
            runs(function () {
                expect(loader.getLoaded().length).toEqual(2);
                expect(loader.getFailed().length).toEqual(1);
            });
        });
        
        it("returns correct number of files (options.images[n] is object)", function() {
            var images = getImages_objectArray_lastFails();
            var loader = new Preloader({images:images});
            
            waitForComplete(loader);
            
            runs(function () {
                expect(loader.getLoaded().length).toEqual(2);
                expect(loader.getFailed().length).toEqual(1);
            });
        });
    });
    
    describe("Returned data", function() {
        it("Should have tag property holding the image tag", function() {
            var images = getImages_stringArray_lastFails();
            var loader = new Preloader({images:images});
             
            waitForComplete(loader);
             
            runs(function () {
                var loaded = loader.getLoaded();
                var failed = loader.getFailed();
                 
                expect(loaded[0].tag.nodeName).toEqual("IMG");
                expect(loaded[1].tag.nodeName).toEqual("IMG");
                expect(failed[0].tag.nodeName).toEqual("IMG");
            });
        });
        
        it("Should have properties property holding the original information", function() {
            var images = getImages_objectArray_lastFails();
            var loader = new Preloader({images:images});
            
            waitForComplete(loader);
            
            runs(function () {
                var loaded = loader.getLoaded();
                var failed = loader.getFailed();
                
                expect(loaded[0].properties).toEqual(images[0]);
                expect(loaded[1].properties).toEqual(images[1]);
                expect(failed[0].properties).toEqual(images[2]);
            });
        });
        
        it("Should have src property", function() {
            var images = getImages_objectArray_lastFails();
            var loader = new Preloader({images:images});
            
            waitForComplete(loader);
            
            runs(function () {
                var loaded = loader.getLoaded();
                var failed = loader.getFailed();
                
                expect(loaded[0].src).toEqual(images[0].src);
                expect(loaded[1].src).toEqual(images[1].src);
                expect(failed[0].src).toEqual(images[2].src);
            });
        });
        
        it("Should have status property", function() {
            var images = getImages_objectArray_lastFails();
            var loader = new Preloader({images:images});
            
            waitForComplete(loader);
            
            runs(function () {
                var loaded = loader.getLoaded();
                var failed = loader.getFailed();
                
                expect(loaded[0].status).toEqual("complete");
                expect(loaded[1].status).toEqual("complete");
                expect(failed[0].status).toEqual("failed");
            });
        });
    });
    
    describe("Loading statistics", function() {
        it("percent to loaded", function() {
            var images = getImages_objectArray();
            var loader = new Preloader({images:images, onFileComplete: onFileComplete, autoload:false});
            var result = [loader.getPercentLoaded()];
            
            loader.load();
            waitForComplete(loader);
            
            function onFileComplete(loader)
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
        
        it("getNumberOfLoadedItems should return number of items processed (both failed and loaded)", function() {
            var images = getImages_objectArray_lastFails();
            var loader = new Preloader({images:images, onFileComplete: onFileComplete, autoload:false});
            var result = [loader.getNumberOfLoadedItems()];
            
            loader.load();
            waitForComplete(loader);
            
            function onFileComplete(loader)
            {
                result.push(loader.getNumberOfLoadedItems());
            }
            
            runs(function(){
                expect(result[0]).toEqual(0);
                expect(result[1]).toEqual(1);
                expect(result[2]).toEqual(2);
                expect(result[3]).toEqual(3);
            });
        });
        
        it("getTotalNumberOfItems should return total number of items in queue", function() {
            var images = getImages_objectArray_lastFails();
            var loader = new Preloader({images:images, onFileComplete: onFileComplete, autoload:false});
            
            expect(loader.getTotalNumberOfItems()).toEqual(3);
            
            loader.load();
            waitForComplete(loader);
            
            function onFileComplete(loader)
            {
                expect(loader.getTotalNumberOfItems()).toEqual(3);
            }
        });
    });
    
    function waitForComplete(loader)
    {
        waitsFor(function() {
            return loader.isComplete();
        }, "all files to load", TIMEOUT);
    }
});