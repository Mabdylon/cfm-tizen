function votes($scope, $http, choozForMeResources, choozForMeServices) {
    $scope.togglePopup = function(show) {
        $scope.popupDiplay = show;
    };

    $scope.getChoose = function() {
        $scope.Chooses.get(function(data) {
            $scope.choose = data;
            $scope.choose.image_0_url = $scope.baseUrl + $scope.choose.image_0_url.substring(4);
            $scope.choose.image_1_url = $scope.baseUrl + $scope.choose.image_1_url.substring(4);
            $('#img-chose1').append('<img src="' + $scope.choose.image_0_url + '" style="height:370px;"/>');
            $('#img-chose2').append('<img src="' + $scope.choose.image_1_url + '" style="height:370px;"/>');
            $scope.pageLoading = false;
        });
    };

    $scope.voting = function(vote) {
        if ($scope.stats !== null) {
            alert('Petit malin !');
            return;
        }
        $scope.Votes.save({vote: vote}, function(data) {
            $scope.stats = data;
            $scope.sondageDisplay = true;
            $scope.popupDiplay = true;
        });
    };

    $scope.pageLoading = true;
    $scope.popupDiplay = false;
    $scope.sondageDisplay = false;
    $scope.choose = $scope.getChoose();
    $scope.stats = null;
}