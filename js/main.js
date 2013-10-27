    /*
     *      Copyright 2013  Samsung Electronics Co., Ltd
     *
     *      Licensed under the Flora License, Version 1.1 (the "License");
     *      you may not use this file except in compliance with the License.
     *      You may obtain a copy of the License at
     *
     *              http://floralicense.org/license/
     *
     *      Unless required by applicable law or agreed to in writing, software
     *      distributed under the License is distributed on an "AS IS" BASIS,
     *      WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     *      See the License for the specific language governing permissions and
     *      limitations under the License.
     */

    /*jslint devel: true*/
    /*global $, Audio, window, localStorage, tizen, canvas, SystemIO, document, navigator, clearInterval, setInterval, setTimeout */
    var selfCamera;
    function SelfCamera() {
            "use strict";
    }

    (function () {
            "use strict";
            SelfCamera.prototype = {
                    countSound: new Audio('sounds/sounds_count.wav'),
                    img: document.createElement('canvas'),
                    filename: '',
                    loadDirectory: '',
                    parentSaveDirectory: 'file:///opt/usr/media/',
                    saveDirectory: 'file:///opt/usr/media/Images/',
                    IMG_PREFIX: 'SelfCamera_',
                    shutterSound: new Audio('sounds/sounds_Shutter_01.wav'),
                    timer: null, // value set by the buttons
                    systemIO: null,
                    video: null,
                    src: null,
                    isMediaWorking: false
            };

            SelfCamera.prototype.onCaptureVideoSuccess = function onCaptureVideoSuccess(stream) {
                    var urlStream;
                    urlStream = window.webkitURL.createObjectURL(stream);
                    this.isMediaWorking = true;
                    this.createVideoElement(urlStream);
            };

            SelfCamera.prototype.createVideoElement = function (src) {
                    this.video = $('<video/>', {
                            autoplay: 'autoplay',
                            id: 'video',
                            style: 'height:' + $(window).height() + 'px',
                            src: src
                    }).appendTo("#camera").get(0);

                    this.bindVideoEvents();
            };

            SelfCamera.prototype.onCaptureVideoError = function onCaptureVideoError(e) {
                    // alert("Video Capture Error");
                    console.error(e);
            };

            SelfCamera.prototype.startPreview = function startPreview() {
                    var options = {
                            audio: true,
                            video: true
                    };

                    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
                    try {
                            if (typeof (navigator.getUserMedia) === 'function') {
                                    navigator.getUserMedia(options, this.onCaptureVideoSuccess.bind(this), this.onCaptureVideoError.bind(this));
                            }
                    } catch (e) {
                            alert('navigator.getUserMedia() error.');
                            console.error('navigator.getUserMedia() error: ' + e.message);
                    }

            };

            SelfCamera.prototype.launchPreview = function launchPreview() {
                    var service, onReply, self = this;
                    if (this.filename === '') {
                            return false;
                    }

                    function fillStr(num) {
                            num = num.toString();
                            if (num.length < 2) {
                                    num = '00' + num;
                            } else if (num.length < 3) {
                                    num = '0' + num;
                            }
                            return num;
                    }
                    this.showPhotoPreview(this.filename);
                    return true;
            };

            SelfCamera.prototype.showGallery = function showGallery(service) {
                    var onReply, self = this;
                    onReply = {
                            onsuccess: function (data) {
                                    self.showPhotoPreview(data[0].value[0]);
                            },
                            onfailure: function () {}
                    };

                    try {
                            tizen.application.launchAppControl(service, null, function () {
                            }, function (err) {
                                    console.error('Gallery launch failed: ' + err.message);
                            }, onReply);
                    } catch (exc) {
                            alert('Exception: ' + exc.message);
                    }
            };

            SelfCamera.prototype.showPhotoPreview = function showPhotoPreview(file) {
                    var service, onReply, self = this;
                    service = new tizen.ApplicationControl('http://tizen.org/appcontrol/operation/view', file, "image/*");
                    onReply = {onsuccess: function () {}, onfailure: function () {}};

                    try {
                            tizen.application.launchAppControl(service, null, function () {}, function (err) {
                                    console.error('Photo launch failed: ' + err.message);
                            }, onReply);
                    } catch (exc) {
                            alert('Exception: ' + exc.message);
                    }
            };

            SelfCamera.prototype.setLoadDirectory = function setLoadDirectory(dirName) {
                    this.loadDirectory = dirName;
                    if (!this.loadDirectory.match(/\/$/)) {
                            this.loadDirectory += '/';
                    }
            };

            SelfCamera.prototype.saveCanvas = function saveCanvas(canvas, fileName) {
                    var data, self = this, onSuccess = function (fileHandle) {
                            this.setLoadDirectory(this.getFileDirectoryURI(fileHandle));
                            tizen.content.scanFile(fileName, function () {
                                    self.loadThumbnail();
                            }, function () {
                                    console.error('scanFile: file not found');
                                    self.loadThumbnail();
                            });
                    }.bind(this);

                    try {
                            data = canvas.toDataURL().replace('data:image/png;base64,', '').replace('data:,', '');
                            if (data === '') {
                                    throw {message: "No image source"};
                            }
                    } catch (e) {
                            this.filename = '';
                            console.error('canvas.toDataUrl error: ' + e.message);
                            alert("Data source error: " + e.message);
                            return;
                    }

                    try {
                            this.systemIO.deleteNode(fileName, function () {
                                    try {
                                            this.systemIO.saveFileContent(fileName, data, onSuccess, 'base64');
                                    } catch (e) {
                                            console.error('saveDataToFile error: ' + e.message);
                                    }
                            }.bind(this));
                    } catch (e2) {
                            console.error('Delete old file error: ' + e2.message);
                    }
            };

            SelfCamera.prototype.captureImage = function captureImage(video) {
                    var sourceWidth = window.innerWidth,
                            sourceHeight = window.innerHeight,
                            sourceX = (sourceWidth - $(video).width()) / 2,
                            sourceY = (sourceHeight - $(video).height()) / 2;

                    this.img.width = sourceWidth;
                    this.img.height = sourceHeight;

                    // Crop image to viewport dimension
                    this.img.getContext('2d').drawImage(video, sourceX, sourceY, $(video).width(), $(video).height());

                    // To get best available dimension
                    // this.img.width = video.videoWidth;
                    // this.img.height = video.videoHeight;
                    // this.img.getContext('2d').drawImage(video, 0, 0);
            };

            SelfCamera.prototype.setFileName = function setFileName(filename) {
                    this.filename = filename;
                    this.loadThumbnail();
            };

            SelfCamera.prototype.getTimestamp = function getTimestamp() {
                    var d = new Date();
                    return '' + d.getUTCFullYear() +
                            '-' + d.getUTCMonth() +
                            '-' + d.getUTCDay() +
                            '-' + d.getUTCHours() +
                            '-' + d.getUTCMinutes() +
                            '-' + d.getUTCSeconds() +
                            '-' + d.getUTCMilliseconds();
            };

            SelfCamera.prototype.takePhoto = function takePhoto() {
                    this.captureImage(this.video);
                    this.filename = this.IMG_PREFIX + this.getTimestamp() + '.png';
                    this.savePhoto();
            };

            SelfCamera.prototype.savePhoto = function savePhoto() {
                    var self = this;
                    this.saveCanvas(this.img, this.saveDirectory + this.filename);
                    setTimeout(function(){ self.loadThumbnail(true); }, 500);
            };

            SelfCamera.prototype.findLastPhoto = function findLastPhoto(onFind) {
                    tizen.content.find(
                            function (files) {
                                    if (files.length !== 0) {
                                            onFind(files[0].contentURI);
                                    } else {
                                            onFind(null);
                                    }
                            },
                            null,
                            null,
                            new tizen.CompositeFilter("INTERSECTION",
                                    [
                                            new tizen.AttributeFilter("title", "STARTSWITH", this.IMG_PREFIX),
                                            new tizen.AttributeFilter("type", "EXACTLY", 'IMAGE')
                                    ]),
                            new tizen.SortMode("modifiedDate", "DESC")
                    );
            };

            SelfCamera.prototype.bindVideoEvents = function () {
                    var self = this;
                    $(this.video).on("stalled", function (e) {
                            this.load();
                    });
                    $(this.video).on("playing", function () {
                            var margin = ($(window).width() - $(self.video).width()) / 2,
                                    width = Math.round($(window).height() *
                                            self.video.videoWidth / self.video.videoHeight);

                            $(self.video).css({
                                    'margin-left': margin + 'px',
                                    'width': width + 'px'
                            });

                            if (self.countdown > 0) {
                                    self.startCountdown(self.countdown);
                            }
                    });
                    $(this.video).on('click', function () { this.play(); });
            };

            SelfCamera.prototype.bindEvents = function bindEvents() {
                    var self = this;
                    document.addEventListener('webkitvisibilitychange', function (event) {
                            if (document.webkitVisibilityState === 'visible') {
                                    if (self.video !== null) {
                                            self.reloadSaveDirectory(function () {
                                                    self.video.play();
                                            });
                                    }
                                    self.loadThumbnail();
                            } else {
                                    self.video.pause();
                            }
                    });

                    $('shutter').mousedown(function (ev) {
                            $('shutter').addClass('active');
                    }).mouseup(function (ev) {
                            $('shutter').removeClass('active');
                    }).on('touchstart', function (ev) {
                            $('shutter').addClass('active');
                    }).on('touchend', function (ev) {
                            $('shutter').removeClass('active');
                    });

                    $(window).on('tizenhwkey', function (e) {
                            if (e.originalEvent.keyName === "back") {
                                    tizen.application.getCurrentApplication().exit();
                            }
                    });

                    this.bindTimerClicks();

                    $('#thumbnail').on('click', this.launchPreview.bind(this));
                    $('#shutter').on('touchstart', this.shutterTouched.bind(this));
            };

            SelfCamera.prototype.shutterTouched = function () {
                    if (this.isMediaWorking) {
                            this.shutterSound.play();
                            try {
                                    this.takePhoto();
                            } catch (e) {
                                    console.error(e);
                            }
                    } else {
                            alert("To be able to take pictures you have to allow application to use" +
                                            " your media. Please restart app and allow Self Camera to" +
                                            " access media content.");
                    }
            };

            // Fix for file.parent.toURI() + escaping white signs
            SelfCamera.prototype.getFileDirectoryURI = function (file) {
                    var dirURI;
                    dirURI = encodeURI(
                            file.toURI()
                                    .split('/')
                                    .slice(0, -1)
                                    .join('/')
                    );
                    return dirURI;
            };

            SelfCamera.prototype.loadThumbnail = function (show) {
                    var self = this;
                    this.findLastPhoto(function (file) {
                            if (file) {

                                    self.filename = file;
                                    file = file + '?r=' + Math.random();
                                    $('#upImage').css('background-image', 'url(' + file + ')');
                                    $('#thumbnail').css('background-image', 'url("./images/transparent.png")');
                                    if (show) {
                                            $('#thumbnail').fadeIn();
                                    }
                            } else {
                                    self.filename = '';
                                    $('#thumbnail').hide();
                                    $('#upImage').css('background-image', '');
                            }
                    }.bind(this));
            };

            SelfCamera.prototype.reloadSaveDirectory = function (callback) {
                    var self = this;
                    tizen.filesystem.resolve('images', function () {
                            callback();
                    }, function () {
                            self.systemIO.openDir(self.parentSaveDirectory, function (dir) {
                                    dir.createDirectory('Images');
                                    callback();
                            }, function () {
                                    console.error('no parent directory');
                                    callback();
                            });
                    }, 'r');
            };

            SelfCamera.prototype.init = function init() {
                    var self = this;
                    this.reloadSaveDirectory(function () {
                            self.systemIO = new SystemIO();
                            self.loadThumbnail(true);
                            self.startPreview();
                            self.bindEvents();
                    });
            };

    }());

    selfCamera = new SelfCamera();
    $(document).ready(function () {
            "use strict";
            selfCamera.init();
    });
