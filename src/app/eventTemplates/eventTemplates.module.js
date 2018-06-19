import EventTemplatesCtrl from './eventTemplates.controller';

const eventTemplatesModule = angular.module('schedulerApp.eventTemplates', [])
  .config(/*@ngInject*/($stateProvider, $urlRouterProvider) => {
  	$stateProvider
  	  .state('eventTemplates', {
        url: '/eventTemplates',
        template: require('./eventTemplates.html'),
        controller: EventTemplatesCtrl,
  	  	controllerAs: 'templates'
      });
  }).filter('secToHours', () => {
    return (seconds) => {
      var days = Math.floor(seconds/60/60/24);
  		var rest = seconds - days*24*60*60;
  		var hours = Math.floor(rest/60/60);
  		rest = rest - hours*60*60;
  		var minutes = Math.floor(rest/60);

      var duration = "";
      if (days > 0) {
        duration = days + "d ";
      }
      if (hours > 0) {
        duration = duration + hours + "h ";
      }
      if (minutes > 0) {
        duration = duration + minutes + "m";
      }

      return duration;
    };
  });

export default eventTemplatesModule;
