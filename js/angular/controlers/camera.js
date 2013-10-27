function camera($scope, $http, choozForMeResources, choozForMeServices) {
    window.URL = window.URL || window.webkitURL;
    navigator.getUserMedia = navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia ||
            navigator.oGetUserMedia ||
            navigator.msieGetUserMedia;

    var onFailSoHard = function(e) {
        console.log('Reeeejected!', e);
    };
 
    var canvas = document.querySelector('canvas');
    var ctx = canvas.getContext('2d');
    var localMediaStream = null;
    var file;
    $scope.photoCount = 0;
    $scope.displayResult = false;

    navigator.getUserMedia({video: true}, function(stream) {
    	localMediaStream = window.URL.createObjectURL(stream);
        video = $('<video/>', {
            autoplay: 'autoplay',
            id: 'video',
            style: 'height:' + $(window).height() + 'px',
            src: localMediaStream
        }).appendTo("#camera").get(0);
    }, onFailSoHard);

    $scope.snapshot = function() {
        if (localMediaStream) {
            ctx.drawImage(video, 0, 0, 320, 240);
            if ($scope.photoCount % 2 === 0) {
                file = canvas.toDataURL('image/png');
            } else {
                file = canvas.toDataURL('image/png');
            }
            $scope.photoCount++;
            $scope.loadThumbNail(false);
            if($scope.photoCount >= 2) {
            	$scope.showResult(true);
            }
        }
    };

    $scope.loadThumbNail = function(show) {
        $('#upImage').css('background-image', 'url(' + file + ')');
        $('#thumbnail').css('background-image', 'url("./images/transparent.png")');
        if (show) {
            $('#thumbnail').fadeIn();
        }
    };
    
    $scope.showResult = function(show) {
    	$scope.displayResult = show;
    };

}
    