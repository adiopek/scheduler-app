import PeopleCtrl from './people.controller';

const peopleModule = angular.module('schedulerApp.people', [])
  .config(/*@ngInject*/($stateProvider, $urlRouterProvider) => {
  	$stateProvider
  	  .state('people', {
        url: '/people',
        template: require('./people.html'),
        controller: PeopleCtrl,
  	  	controllerAs: 'people'
      });
  });

export default peopleModule;
