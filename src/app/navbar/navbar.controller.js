class NavbarCtrl {
	/*@ngInject*/
	constructor($scope, $location) {
		angular.extend(this, {
			$scope,
			$location
		});
	}
	sectionClick(section){
		this.$location.path(section);
	}
}

export default NavbarCtrl;
