angular
  .module('crosswatch')
  .directive('user', user);

function user() {
  var directive = {
    link: link,
    scope: true,
    template: '<a stop-event dir="auto" href="{{::event.projecturl}}/wiki/User:{{::user | urlEncode}}" target="_blank">{{::user}}</a> ' +
    '<span dir="auto" ng-if="event.showDiff">' +
    '(<a stop-event href="{{::event.projecturl}}/wiki/Special:Contributions/{{::user | urlEncode}}" target="_blank" translate="CONTRIBS"></a>)' +
    '</span>&#32;',
    restrict: 'E'
  };
  return directive;

  function link(scope, element, attrs) {
    if (typeof attrs.name !== 'undefined') {
      scope.user = attrs.name;
    } else {
      scope.user = scope.event.user;
    }

    var split = scope.user.split(':');
    scope.user = split[split.length - 1]
  }
}
