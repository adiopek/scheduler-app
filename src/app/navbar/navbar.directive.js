import NavbarCtrl from './navbar.controller.js';

class NavbarDirective {

	constructor() {
		angular.extend(this, {
			template: require('./navbar.html'),
			restrict: 'E',
			controller: NavbarCtrl,
			controllerAs: 'vm'
		});
	}
}

export default NavbarDirective;
