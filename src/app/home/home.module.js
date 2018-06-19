import HomeCtrl from './home.controller';

const homeModule = angular.module('schedulerApp.home', [])
  .config(/*@ngInject*/($stateProvider, $urlRouterProvider) => {
  	$stateProvider
      .state('home', {
        url: '/home',
        template: require('./home.html'),
        controller: HomeCtrl,
  	  	controllerAs: 'home'
      });
  });

export default homeModule;
