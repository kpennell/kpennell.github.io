// Code goes here

'use strict';

/* Controllers */

angular.module('myApp.controllers', ['firebase.utils', 'simpleLogin', 'leaflet-directive'])

.controller('HomeCtrl', ['$scope', 'fbutil', 'user', 'FBURL',
  function($scope, fbutil, user, FBURL) {
    $scope.syncedValue = fbutil.syncObject('syncedValue');
    $scope.user = user;
    $scope.FBURL = FBURL;


  }
])

.controller('ChatCtrl', ['$scope', 'messageList',
  function($scope, messageList) {
    $scope.messages = messageList;
    $scope.addMessage = function(newMessage) {
      if (newMessage) {
        $scope.messages.$add({
          text: newMessage
        });
        $scope.messages.$add({
          text: newMessage
        });
      }
    };
  }
])

.controller('LoginCtrl', ['$scope', 'simpleLogin', '$location',
  function($scope, simpleLogin, $location) {
    $scope.email = null;
    $scope.pass = null;
    $scope.confirm = null;
    $scope.createMode = false;

    $scope.login = function(email, pass) {
      $scope.err = null;
      simpleLogin.login(email, pass)
        .then(function( /* user */ ) {
          $location.path('/account');
        }, function(err) {
          $scope.err = errMessage(err);
        });
    };

    $scope.createAccount = function() {
      $scope.err = null;
      if (assertValidAccountProps()) {
        simpleLogin.createAccount($scope.email, $scope.pass)
          .then(function( /* user */ ) {
            $location.path('/account');
          }, function(err) {
            $scope.err = errMessage(err);
          });
      }
    };

    function assertValidAccountProps() {
      if (!$scope.email) {
        $scope.err = 'Please enter an email address';
      } else if (!$scope.pass || !$scope.confirm) {
        $scope.err = 'Please enter a password';
      } else if ($scope.createMode && $scope.pass !== $scope.confirm) {
        $scope.err = 'Passwords do not match';
      }
      return !$scope.err;
    }

    function errMessage(err) {
      return angular.isObject(err) && err.code ? err.code : err + '';
    }
  }
])

.controller('AccountCtrl', ['$scope', 'simpleLogin', 'fbutil', 'user', '$location',
  function($scope, simpleLogin, fbutil, user, $location) {
    // create a 3-way binding with the user profile object in Firebase
    var profile = fbutil.syncObject(['users', user.uid]);
    profile.$bindTo($scope, 'profile');

    // expose logout function to scope
    $scope.logout = function() {
      profile.$destroy();
      simpleLogin.logout();
      $location.path('/login');
    };

    $scope.changePassword = function(pass, confirm, newPass) {
      resetMessages();
      if (!pass || !confirm || !newPass) {
        $scope.err = 'Please fill in all password fields';
      } else if (newPass !== confirm) {
        $scope.err = 'New pass and confirm do not match';
      } else {
        simpleLogin.changePassword(profile.email, pass, newPass)
          .then(function() {
            $scope.msg = 'Password changed';
          }, function(err) {
            $scope.err = err;
          })
      }
    };

    $scope.clear = resetMessages;

    $scope.changeEmail = function(pass, newEmail) {
      resetMessages();
      profile.$destroy();
      simpleLogin.changeEmail(pass, newEmail)
        .then(function(user) {
          profile = fbutil.syncObject(['users', user.uid]);
          profile.$bindTo($scope, 'profile');
          $scope.emailmsg = 'Email changed';
        }, function(err) {
          $scope.emailerr = err;
        });
    };

    function resetMessages() {
      $scope.err = null;
      $scope.msg = null;
      $scope.emailerr = null;
      $scope.emailmsg = null;
    }
  }
])




.controller('ShowsCtrl', ['$scope', '$http', '$firebase',
  function($scope, $http, $firebase) {
    var ref = new Firebase("https://torid-fire-4332.firebaseio.com");
    var showsSync = $firebase(ref.child("shows"));
    $scope.shows = showsSync.$asObject();
    $scope.shows.$loaded(function() {
      //console.log($scope.shows);

    });

    $scope.sound = {};

    $scope.streamTrack = function(show) {
      SC.stream(show.properties.stream_url, function(sound) {
        $scope.sound = sound;
        sound.play();
      });

      show.visible = false;
    };

    $scope.pauseTrack = function(show) {
      $scope.sound.pause();
      show.visible = true;
    };



  }
])

.controller('MapController', ['$scope', '$http',
  function($scope, $http) {
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

      $scope.$apply(function() {
        $scope.hoveritem = layer.feature.properties.id;
      })
    }

    function pointMouseout(leafletEvent) {
      var layer = leafletEvent.target;
      layer.setIcon(defaultMarker);

      $scope.$apply(function() {
        $scope.hoveritem = {};
      })
    }

    $scope.menuMouse = function(show) {
      var layer = layers[show.properties.id];
      //console.log(layer);
      layer.setIcon(mouseoverMarker);
    }

    $scope.menuMouseout = function(show) {
      var layer = layers[show.properties.id];
      layer.setIcon(defaultMarker);
    }

    // Get the countries geojson data from a JSON
    $http.get('/app/json/shows.geojson').success(function(data, status) {
      angular.extend($scope, {
        geojson: {
          data: data,
          onEachFeature: function(feature, layer) {
            layer.setIcon(defaultMarker);
            layer.on({
              mouseover: pointMouseover,
              mouseout: pointMouseout
            });
            layers[feature.properties.id] = layer;
          }
        }

      });
    });
  }
])


.controller('StarredCtrl', ['$scope', '$firebase', 'simpleLogin',
  function($scope, $firebase, simpleLogin) {
    var ref = new Firebase("https://torid-fire-4332.firebaseio.com");

    simpleLogin.getUser().then(function(user) {

      var showsSync = $firebase(ref.child("shows"));
      var loggedInUserFavoritesSync = $firebase(ref.child("users").child(user.uid).child("favorites"));

      $scope.shows = showsSync.$asObject();
      $scope.loggedInUserFavorites = loggedInUserFavoritesSync.$asObject();

      //$scope.loggedInUserFavorites.$loaded(function(){

      //  });
      //console.log($scope.loggedInUserFavorites);

      //console.log($scope.shows);
      //console.log($scope.loggedInUserFavorites);

      // users.favorites.showid = true

      /*
  "users": {
    "facebook:6923": {
      "name": "Jacob Wenger",
      "age": 24,
      "favorites": {
        "-J92Mh85aSz3": true,
        "-J92rh569ka1": true,

  */
  
      $scope.toggleStarred = function(show) {

        console.log(show.properties.id);

        if ($scope.loggedInUserFavorites.$value === null) {
          // if undefined, set to true
          $scope.loggedInUserFavorites[show.properties.id] = true;

        } else if ($scope.loggedInUserFavorites[show.properties.id] = false) {
          // if false, change to true
          $scope.loggedInUserFavorites[show.properties.id] = true;

        } else {
          // if already true, set to false
          $scope.loggedInUserFavorites[show.properties.id] = false;

        }

        $scope.loggedInUserFavorites.$save();
      };

      })



  }
]);










/*  EXTRA STUFF


// .controller('AccountCtrl', ['$scope', 'simpleLogin', 'fbutil', 'user', '$location',
//    function($scope, simpleLogin, fbutil, user, $location) {



  .controller('ShowsCtrl', ['$scope', '$http','$firebase', 
    function ($scope, $http, $firebase) {
      $http.get('/app/json/shows.geojson').
      success(function (data, status, headers, config) {
      $scope.shows = data;

      console.log($scope.shows);

      }).
      error(function (data, status, headers, config) {
          // log error
      });

      $scope.sound = {};

//      var ref = new Firebase("https://torid-fire-4332.firebaseio.com/");
//      var showsSync = $firebase(ref.child("shows"));
//      data = showsSync.$asArray();

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

  }
  ])


.controller("StarredCtrl", function($scope, $firebase) {
  var ref = new Firebase("https://torid-fire-4332.firebaseio.com/");
  var starredSync = $firebase(ref.child("starred"));
  $scope.starred = starredSync.$asArray();
  //console.log($scope.starred);
  
   $scope.toggleStarred = function(show) {
    show.isStarred = !show.isStarred;

    console.log(show);

    // if id is part of the array, call save, if not, call add

    if ($scope.starred.$indexFor(show) > -1) {
      $scope.starred.$save(angular.copy(show))
    }
    else {
      $scope.starred.$add(angular.copy(show)).then(function(ref) {
        var id = ref.name();
        console.log($scope.starred.$indexFor(id));
  })
}

}
});


$scope.starred.$save(angular.copy(show));
  }).then( function(ref) {
    $scope.starred.$add(angular.copy(show));
 


 $scope.toggleStarred = function(show) {
    show.isStarred = !show.isStarred;
    $scope.starred.$add(angular.copy(show)).then(function(ref) {
      console.log(ref);
      
      console.log("added record with id: " + id);
      console.log($scope.starred.$indexFor(id));
});



$scope.starred.$save(angular.copy(show)).then(function(ref) {
      var id = ref.name();
      console.log("added record with id: " + id);
      console.log($scope.starred.$indexFor(id));
});


$scope.starred.$loaded()
  .then(function(ref) {
    var id = ref.name();
    var indexnum = $scope.starred.$indexFor(id)
    if(indexnum > -1){
      $scope.starred.$save(angular.copy(show))
    }
    else {
      $scope.starred.$add(angular.copy(show))
    }
 });


    var list = $firebase(ref).$asArray();
list.$add({foo: "bar"}).then(function(ref) {
   var id = ref.name();
   console.log("added record with id " + id);
   list.$indexFor(id); // returns location in the array
});

if (starred.$indexFor(show) > -1) {
      //$scope.starred.$save(angular.copy(show));
      console.log(show);
    }
    else
    {
      //$scope.starred.$add(angular.copy(show));
    } */

//  next I shall work on the logic for only adding to $scope.shows (which should be called $scope.starred) when the item isn't already in there.  Otherwise, remove it.
//  then, get the toggle set for the star (full or empty)

/* To do

rename shows -> starred
Remove if already in there.
Toggle starred.


show.isStarred = !show.isStarred;
    console.log(show);
    $scope.shows.$add(angular.copy(show));

*/