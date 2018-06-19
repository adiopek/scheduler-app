import SpacesCtrl from './spaces.controller';

const SpacesModule = angular.module('schedulerApp.spaces', [])
  .config(/*@ngInject*/($stateProvider, $urlRouterProvider) => {
  	$stateProvider
  	  .state('spaces', {
        url: '/spaces',
        template: require('./spaces.html'),
        controller: SpacesCtrl,
  	  	controllerAs: 'spaces'
      });
  });

export default SpacesModule;
