if (navigator.getUserMedia) {
  navigator.getUserMedia({audio: true, video: true}, function(stream) {
    video.src = window.URL.createObjectURL(stream);
  }, onFailSoHard);
} else {
  video.src = 'somevideo.webm'; // fallback.
}

var video = document.querySelector('video');
var canvas = document.querySelector('canvas');
var ctx = canvas.getContext('2d');
var localMediaStream = null;

function snapshot() {
    if
            (localMediaStream) {
        ctx.drawImage(video, 0, 0);
        document.querySelector('img').src = canvas.toDataURL('image/webp');
    }
};

video.addEventListener('click', snapshot, false);
navigator.getUserMedia({video: true}, function(stream) {
    video.src =
            window.URL.createObjectURL(stream);
    localMediaStream = stream;
},
        onFailSoHard);