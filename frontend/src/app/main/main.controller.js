'use strict';

angular.module('crosswatch')
  .controller('MainCtrl', function ($alert, socket, $rootScope, $translate, authService, $timeout, $log) {
    var vm = this;
    vm.loggedin = authService.isloggedin();
    showLoggedinAlert();

    $alert({
      title: 'Caution,',
      content: 'this tool is an early prototype. It\'s not ready for the prime time.',
      type: 'warning',
      container: '#message-container',
      show: true
    });

    $rootScope.$on('login', function (event, msg) {
      vm.loggedin = true;
      showLoggedinAlert();
    });

    $rootScope.$on('error', function (event, msg) {
      if (msg === 'loginerror') {
        $alert({
          title: '',
          content: 'You must <a href="login" target="_blank">sign in</a> to save changes.',
          type: 'danger',
          container: '#message-container',
          show: true
        });
      }
    });

    $rootScope.$on('$translateChangeSuccess', function () {
      if (authService.isloggedin() && (typeof vm.loginAlert !== "undefined")) {
        vm.loginAlert.destroy();
        showLoggedinAlert();
      }
    });

    function showLoggedinAlert() {
      if (!authService.isloggedin()) {
        return;
      }
      vm.loginAlertDict = {
        title: '',
        type: 'success',
        container: '#message-container',
        show: true
      };
      $translate('SIGNED_IN_MSG', { username: authService.user() }).then(function (msg) {
        vm.loginAlertDict.content = msg;
        vm.loginAlert = $alert(vm.loginAlertDict);
      });
    }
  });
