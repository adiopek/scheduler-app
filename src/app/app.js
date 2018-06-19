require('./app.css');
require('./img/logo.png');
require('./img/start_picture1.jpg');
require('./img/eventTemplates.png');
require('./img/spaces.png');
require('./img/people.png');

function getModuleName(module) {
	return module.name || module.default.name;
}

let appDependencies = [
  'ui.router',
  'ngMaterial',
	'mdColorPicker'
];
let appModules = [
	//Directive
	require('./navbar/navbar.module.js'),
	//Views
	require('./home/home.module.js'),
	require('./calendar/calendar.module.js'),
	require('./people/people.module.js'),
	require('./eventTemplates/eventTemplates.module.js'),

];

var app = angular.module('schedulerApp', appDependencies.concat(appModules.map(getModuleName)))
	.config(/*@ngInject*/($urlRouterProvider, $mdThemingProvider) => {
  	  $urlRouterProvider.otherwise('/home');
  	  $mdThemingProvider.theme('default')
  	  	.primaryPalette('indigo')
      	.accentPalette('orange');
    });
