'use strict';

/**
 * @ngdoc function
 * @name vibesampleApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the vibesampleApp
 */


/*
var app = angular.module('vibesample', ['leaflet-directive']);


app.controller('ShowsCtrl', function ($scope, $http) {
    $http.get('/json/shows.geojson').
    success(function (data, status, headers, config) {
        $scope.shows = data;
    }).
    error(function (data, status, headers, config) {
        // log error
    });

    $scope.sound = {};

    $scope.streamTrack = function (show) {
        SC.stream(show.properties.stream_url, function (sound) {
            $scope.sound = sound;
            sound.play();
        });

        show.visible = false;
    };

    $scope.pauseTrack = function (show) {
        $scope.sound.pause();
        show.visible = true;
    };

});

app.controller('MapController', ['$scope', '$http', function ($scope, $http) {
    angular.extend($scope, {
        center: {
            lat: 37.7577,
            lng: -122.4376,
            zoom: 12
        },
        defaults: {
            scrollWheelZoom: false
        }
    });

    var defaultMarker = L.AwesomeMarkers.icon({
        icon: 'play',
        markerColor: 'darkblue'
    });

    var mouseoverMarker = L.AwesomeMarkers.icon({
        icon: 'play',
        markerColor: 'blue'
    });

    var layers = {};

    $scope.hoveritem = {};

    function pointMouseover(leafletEvent) {
        var layer = leafletEvent.target;
        layer.setIcon(mouseoverMarker);
        $scope.$apply(function () {
            $scope.hoveritem = layer.feature.properties.id;
        })
    }

    function pointMouseout(leafletEvent) {
        var layer = leafletEvent.target;
        layer.setIcon(defaultMarker);

        $scope.$apply(function () {
            $scope.hoveritem = {};
        })
    }

    $scope.menuMouse = function (show) {
        var layer = layers[show.properties.id];
        //console.log(layer);
        layer.setIcon(mouseoverMarker);
    }

    $scope.menuMouseout = function (show) {
        var layer = layers[show.properties.id];
        layer.setIcon(defaultMarker);
    }

    // Get the countries geojson data from a JSON
    $http.get('/json/shows.geojson').success(function (data, status) {
        angular.extend($scope, {
            geojson: {
                data: data,
                onEachFeature: function (feature, layer) {
                    layer.setIcon(defaultMarker);
                    layer.on({
                        mouseover: pointMouseover,
                        mouseout: pointMouseout
                    });
                    layers[feature.properties.id] = layer;
                    //console.log(layers);
                }
            }

        });
    });

}]);

*/