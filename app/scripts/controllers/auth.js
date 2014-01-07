'use strict';

angular.module('dropboxTaskpaperApp')
  .controller('AuthCtrl', function (Dropbox, DropboxLocalStorageOAuthKey, $rootScope, $location) {
    // $timeout(function() {
    //     dropbox.authenticate();
    // }, 200);

    if($rootScope.checkAuthenticated() && Dropbox.isAuthenticated()) {
      $location.path('/').replace();
      return;
    }

    Dropbox.authenticate().then(function (oauth) {
      if(oauth.uid){
        localStorage[DropboxLocalStorageOAuthKey] = angular.toJson(oauth);
        $rootScope.uid = oauth.uid;
        $rootScope.isAuthenticated = true;
        $location.path('/').replace();
      }
    });

  });
