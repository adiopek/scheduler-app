// import NavbarDirective from './navbar.directive.js';
import CalendarCtrl from './calendar.controller';

const calendarModule = angular.module('schedulerApp.calendar', [])
  .config(/*@ngInject*/($stateProvider, $urlRouterProvider) => {
  	$stateProvider
  	  .state('calendar', {
        url: '/calendar',
        template: require('./calendar.html'),
        controller: CalendarCtrl,
  	  	controllerAs: 'calendar'
      });
  })
  .directive('onFinishRender', function ($timeout) {
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
            if (scope.$last === true) {
                $timeout(function () {
                    scope.$emit(attr.onFinishRender);
                });
            }
        }
    };
  });

export default calendarModule;
