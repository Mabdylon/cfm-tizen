var choozForMe = angular.module('choozForMe', ['ngResource']);

choozForMe.service('choozForMeResources', function($resource, $rootScope) {
    $rootScope.dev = $.url().param("dev");
    $rootScope.baseUrl = window.location.origin = 
            window.location.protocol+"//"+window.location.host.split(':')[0]
            + ($rootScope.dev ? ":5000\:5000" : "");
    $rootScope.chooseId = {choose_id: $.url().param("choose_id")};

    $rootScope.Chooses = $resource(
            $rootScope.baseUrl + '/chooses/:choose_id/',
            {
                get: {method: 'GET'}
            }
    ).bind($rootScope.chooseId);

    $rootScope.Votes = $resource(
            $rootScope.baseUrl + '/chooses/:choose_id/votes/:vote',
            {
                save: {method: 'POST'}, params : {vote: '@vote'}
            }
    ).bind($rootScope.chooseId);

});