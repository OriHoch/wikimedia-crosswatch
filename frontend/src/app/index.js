'use strict';
angular
  .module('crosswatch', [
    'ngAnimate',
    'ngSanitize',
    'ngRoute',
    'LocalStorageModule',
    'angular-translate-storage',
    'mgcrea.ngStrap',
    'pascalprecht.translate',
    'bd.sockjs',
    'angularMoment'
  ])
  .config(routeConfig)
  .config(locationConfig)
  .config(storageConfig)
  .factory('socket', socketFactory)
  .service('authService', authService)
  .service('dataService', dataService)
  .run(runBlock)
;

function routeConfig ($routeProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'app/main/main.html',
      controller: 'MainCtrl',
      controllerAs: 'ctrl'
    })
    .otherwise({
      redirectTo: '/'
    });
}

function locationConfig ($locationProvider) {
  // use the HTML5 History API
  $locationProvider.html5Mode({
    enabled: true,
    requireBase: true
  });
}

function storageConfig (localStorageServiceProvider) {
  localStorageServiceProvider
    .setPrefix('crosswatch')
    .setStorageCookie(30, '/crosswatch/');
}

function socketFactory (socketFactory, $browser, $location) {
  var baseHref = $browser.baseHref();
  var sockjsUrl = baseHref + 'sockjs';
  if ($location.host() === 'localhost') { // debug – use tools backend when developing
    sockjsUrl = 'https://tools.wmflabs.org/crosswatch/sockjs'
  }

  return socketFactory({
    url: sockjsUrl
  });
}

function authService (localStorageService, $rootScope, $log) {
  $rootScope.$watch(function () { return localStorageService.cookie.get('user');}, function (newValue) {
    if (newValue !== null) {
      $log.info('Singed in as ' + newValue);
      $rootScope.$emit('login', newValue);
    }
  });

  this.tokens = function () {
    return angular.fromJson(localStorageService.cookie.get('auth').replace(/\\054/g, ','));
  };

  this.user = function () {
    return localStorageService.cookie.get('user');
  };

  this.isloggedin = function () {
    return (localStorageService.cookie.get('auth') !== null);
  };

}

function dataService ($filter, socket, authService, localStorageService, $log) {
  var vm = this;

  vm.icons = {};
  vm.icons['wikibooks']   = "//upload.wikimedia.org/wikipedia/commons/f/fa/Wikibooks-logo.svg";
  vm.icons['wiktionary']  = "//upload.wikimedia.org/wikipedia/commons/e/ef/Wikitionary.svg";
  vm.icons['wikiquote']   = "//upload.wikimedia.org/wikipedia/commons/f/fa/Wikiquote-logo.svg";
  vm.icons['wikipedia']   = "//upload.wikimedia.org/wikipedia/commons/8/80/Wikipedia-logo-v2.svg";
  vm.icons['wikinews']    = "//upload.wikimedia.org/wikipedia/commons/2/24/Wikinews-logo.svg";
  vm.icons['wikivoyage']  = "//upload.wikimedia.org/wikipedia/commons/8/8a/Wikivoyage-logo.svg";
  vm.icons['wikisource']  = "//upload.wikimedia.org/wikipedia/commons/4/4c/Wikisource-logo.svg";
  vm.icons['wikiversity'] = "//upload.wikimedia.org/wikipedia/commons/9/91/Wikiversity-logo.svg";
  vm.icons['foundation']  = "//upload.wikimedia.org/wikipedia/commons/c/c4/Wikimedia_Foundation_RGB_logo_with_text.svg";
  vm.icons['mediawiki']   = "//upload.wikimedia.org/wikipedia/commons/3/3d/Mediawiki-logo.png";
  vm.icons['meta']        = "//upload.wikimedia.org/wikipedia/commons/7/75/Wikimedia_Community_Logo.svg";
  vm.icons['wikidata']    = "//upload.wikimedia.org/wikipedia/commons/f/ff/Wikidata-logo.svg";
  vm.icons['commons']     = "//upload.wikimedia.org/wikipedia/commons/4/4a/Commons-logo.svg";
  vm.icons['species']     = "//upload.wikimedia.org/wikipedia/en/b/bf/Wikispecies-logo-35px.png";
  vm.icons['incubator']   = "//upload.wikimedia.org/wikipedia/commons/e/e3/Incubator-logo.svg";
  vm.icons['test']        = "//upload.wikimedia.org/wikipedia/commons/4/4a/Wikipedia_logo_v2_%28black%29.svg";

  vm.flags = ["ad", "ae", "af", "ag", "ai", "al", "am", "an", "ao", "ar", "as", "at", "au", "aw", "ax", "az", "ba", "bb", "bd", "be", "bf", "bg", "bh", "bi", "bj", "bm", "bn", "bo", "br", "bs", "bt", "bv", "bw", "by", "bz", "ca", "cc", "cd", "cf", "cg", "ch", "ci", "ck", "cl", "cm", "cn", "co", "cr", "cs", "cu", "cv", "cx", "cy", "cz", "da", "de", "dj", "dk", "dm", "do", "dz", "ec", "ee", "eg", "eh", "en", "er", "es", "et", "fam", "fi", "fj", "fk", "fm", "fo", "fr", "ga", "gb", "gd", "ge", "gf", "gh", "gi", "gl", "gm", "gn", "gp", "gq", "gr", "gs", "gt", "gu", "gw", "gy", "he", "hk", "hm", "hn", "hr", "ht", "hu", "id", "ie", "il", "in", "io", "iq", "ir", "is", "it", "jm", "jo", "jp", "ke", "kg", "kh", "ki", "km", "kn", "kp", "kr", "kw", "ky", "kz", "la", "lb", "lc", "li", "lk", "lr", "ls", "lt", "lu", "lv", "ly", "ma", "mc", "md", "me", "mg", "mh", "mk", "ml", "mm", "mn", "mo", "mp", "mq", "mr", "ms", "mt", "mu", "mv", "mw", "mx", "my", "mz", "na", "nc", "ne", "nf", "ng", "ni", "nl", "no", "np", "nr", "nu", "nz", "om", "pa", "pe", "pf", "pg", "ph", "pk", "pl", "pm", "pn", "pr", "ps", "pt", "pw", "py", "qa", "re", "ro", "rs", "ru", "rw", "sa", "sb", "scotland", "sc", "sd", "se", "sg", "sh", "si", "sj", "sk", "sl", "sm", "sn", "so", "sr", "st", "sv", "sy", "sz", "tc", "td", "tf", "tg", "th", "tj", "tk", "tl", "tm", "tn", "to", "tr", "tt", "tv", "tw", "tz", "ua", "ug", "um", "us", "uy", "uz", "va", "vc", "ve", "vg", "vi", "vn", "vu", "wales", "wf", "ws", "ye", "yt", "za", "zh", "zm", "zw"];

  /**
   * Array that contains all watchlist entries.
   * @type {Array}
   */
  vm.watchlist = [];


  /**
   * Initialize user settings
   */
  vm.defaultconfig = {
    /**
     * true: show only latest change
     * false: show all changes
     * @type {boolean}
     */
    lastrevonly: false,
    watchlistperiod: 1.5,
    flagsenable: false
  };
  if (localStorageService.get('config') !== null) {
    vm.config = localStorageService.get('config');
    vm.config.__proto__ = vm.defaultconfig;
  } else {
    vm.config = Object.create(vm.defaultconfig);
  }

  /**
   * Process an array of new watchlist entries.
   * @param entries
   */
  vm.addWatchlistEntries = function (entries) {
    for (var i = 0; i < entries.length; i++) {
      var byte_change = entries[i].newlen - entries[i].oldlen;
      entries[i].bytes = vm.numberFormat(byte_change);
      entries[i].bytestyle = vm.byteStyle(byte_change);
      entries[i].titlestyle = vm.titleStyle(entries[i].notificationtimestamp);
    }
    vm.watchlist.push.apply(vm.watchlist, entries);
  };

  /**
   * Reset watchlist and query it again
   */
  vm.resetWatchlist = function () {
    vm.watchlist = [];
    vm.queryWatchlist();
    vm.saveConfig();
  };

  /**
   * Save user config to local storage
   */
  vm.saveConfig = function() {
    localStorageService.set('config', vm.config);
  };

  /**
   * Formats the string for the number of changed bytes in a edit.
   * @param x
   * @returns human readable number
   */
  vm.numberFormat =  function (x) {
    var result = $filter('number')(x);
    if (x > 0) {
      result = '+' + result;
    }
    return result;
  };

  /**
   * Get span class name from the number of changed bytes in a edit.
   * @param byte_change
   * @returns span class name
   */
  vm.byteStyle = function (byte_change) {
    var result;
    if (byte_change <= -500) {
      result = 'text-danger strong';
    } else if (byte_change < 0) {
      result = 'text-danger';
    } else if (byte_change === 0) {
      result = 'text-muted';
    } else if (byte_change >= 500) {
      result = 'text-success strong';
    } else { // 0 < byte_change <= 500
      result = 'text-success';
    }
    return result;
  };

  /**
   * Returns style for the page title based on the notificationtimestamp
   * @param timestamp
   * @returns {*}
   */
  vm.titleStyle = function(timestamp) {
    if (timestamp) {
      return 'mw-title';
    } else {
      return '';
    }
  };

  /**
   * If logged in, query watchlist.
   */
  vm.queryWatchlist = function () {
    if (authService.isloggedin()) {
      var watchlistQuery = {
        action: 'watchlist',
        access_token: authService.tokens(),
        watchlistdays: vm.config.watchlistperiod,
        allrev: !vm.config.lastrevonly
      };
      try {
        socket.send(angular.toJson(watchlistQuery));
      } catch(err) {
        // INVALID_STATE_ERR when sockjs is not yet connected
        if (err.message === 'InvalidStateError: The connection has not been established yet') {
          $log.warn('Wachtlist queried before socketjs connected.');
        } else {
          $log.error(err);
        }
      }
    }
  };
}

function runBlock (socket, $rootScope, dataService, $log, $alert, $timeout, $translate, amMoment, localStorageService) {
  var connectionError = true;

  /**
   * Set Moment.js language
   * Strange bug, $translate.use() is sometimes undefined if loaded by angular-translate from local storage
   */
  if (typeof $translate.use() === "undefined") {
    var lang = localStorageService.get('NG_TRANSLATE_LANG_KEY');
    $translate.use(lang);
    amMoment.changeLocale(lang);
  }

  /**
   * Query watchlist on login.
   * Not part of authService to prevent circular dependency.
   */
  $rootScope.$on('login', function () {
    dataService.queryWatchlist();
    $timeout(errorHandler, 15000); // show error if no watchlist after 15 secs
  });

  /**
   * If logged in before sockjs connected, query watchlist again.
   */
  socket.setHandler('open', function () {
    $log.info('sockjs connected');
    dataService.queryWatchlist();
  });

  /**
   * Handle all sockjs incoming messages here.
   */
  socket.setHandler('message', function (msg) {
    msg = angular.fromJson(msg);
    var data = angular.fromJson(msg.data);
    if (data.msgtype === 'watchlist') {
      dataService.addWatchlistEntries(data.entires);
    } else if (data.msgtype === 'loginerror') {
      $rootScope.$emit('error', 'loginerror');
      $log.error('login failed!');
    } else {
      $log.error(data);
    }

    if (connectionError) {
      connectionError = false;
    }
  });

  /**
   * Show error message if no watchlist entries are retrieved.
   */
  function errorHandler () {
    if (connectionError) {
      $log.warn('No websocket message after 15 seconds.');
      $alert({
        title: 'Error,',
        content: 'no watchlist could be retrieved. This might be an internal server error.',
        type: 'danger',
        container: '#message-container',
        show: true
      });
    }
  }
}
