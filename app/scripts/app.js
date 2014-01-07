'use strict';

angular.module('dropboxTaskpaperApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'ngAnimate',
  'dropbox'
])
  .config(function ($routeProvider, $locationProvider) {
    $locationProvider.html5Mode(true);
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/auth', {
        templateUrl: 'views/main.html',
        controller: 'AuthCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  })
  .value('DropboxClientId', '563mc3wfk1qd68q')
  .value('DropboxRedirectUri', 'https://' + window.location.host + '/bower_components/ngDropbox/callback.html')
  .value('DropboxLocalStorageOAuthKey', 'ngDropbox.oauth')
  .config(function (DropboxProvider) {
    DropboxProvider.config('563mc3wfk1qd68q',
      'https://' + window.location.host + '/bower_components/ngDropbox/callback.html');
  })
  // .constant('DROPBOX_APP_KEY', '563mc3wfk1qd68q')
  // .service('dropbox', function (DROPBOX_APP_KEY, $rootScope) {
  //   // Exposed for easy access in the browser console.
  //   var dropbox = new Dropbox.Client({
  //     key: DROPBOX_APP_KEY
  //   });

  //   dropbox.authenticate({
  //     interactive: false
  //   }, function(error) {
  //     if (error) {
  //       console.log('Authentication error', error);
  //     } else {
  //       $rootScope.authenticated = true;
  //     }
  //   });

  //   dropbox.getAccountInfo({}, function(info){
  //     console.log(info);
  //   })

  //   if (dropbox.isAuthenticated()) {
  //     $rootScope.authenticated = true;
  //   }
  //   return dropbox;
  // })
  // .service('datastore', function (dropbox, $q, $rootScope) {
  //   var promise = $q.defer();

  //     // console.log(dropbox.getDatastoreManager());
  //   if (dropbox.isAuthenticated()) {
  //     // dropbox is authenticated. Display UI.
  //     console.log(dropbox.getDatastoreManager());
  //     dropbox.getDatastoreManager().openDefaultDatastore(function(error, datastore) {
  //       if (error) {
  //         console.error('Error opening default datastore', error);
  //       }

  //       promise.resolve(datastore);
  //     });
  //   } else {
  //     promise.reject();
  //   }
  //   return promise.promise;
  // })
  .run(function ($rootScope, Dropbox, DropboxLocalStorageOAuthKey) {
    $rootScope.isAuthenticated = false;

    $rootScope.checkAuthenticated = function () {
      // console.log(localStorage);
      if (localStorage[DropboxLocalStorageOAuthKey]) {
        var oauth = angular.fromJson(localStorage[DropboxLocalStorageOAuthKey]);
        if(oauth) {

        }
        Dropbox.setCredentials(oauth);
        $rootScope.uid = oauth.uid;
        $rootScope.isAuthenticated = true;
        return true;
      } else {
        return false;
      }
    };

    $rootScope.checkAuthenticated();

  })
  ;
