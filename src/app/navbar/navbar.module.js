import NavbarDirective from './navbar.directive.js';

const navbarModule = angular
    .module('schedulerApp.navbar',[])
    .directive('navbar', () => new NavbarDirective());

export default navbarModule;
