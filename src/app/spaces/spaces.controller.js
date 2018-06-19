import DialogCtrl from './dialog.controller';

class SpacesCtrl {
	constructor($state, $scope, $mdDialog, $http, $location) {
		angular.extend(this, {
			$scope,
			$location,
			$mdDialog,
			$http,
			$state
		});
		this.$scope.records;
		//this.$scope.ready = false;
		this.getSpaces();
	}

	addSpace(name, description){
		let configObject = {
			method:'POST',
			url: "/scripts/addSpace.php",
			params: {
				spaceName: name,
				description: description
			}
		};

		this.$http(configObject)
			.then((response) => this.$scope.status = response.data)
			.catch((response) => console.log(response));

	}
	getSpaces(){
		let configObject = {
			method:'GET',
			url: "/scripts/getSpaces.php",
		};
		this.$http(configObject)
			.then((response) => this.$scope.records = response.data)
			.catch((response) => console.log(response));
		this.$scope.ready = true;
	}
	deleteSpace(id){
		let configObject = {
			method:'GET',
			url: "/scripts/deleteSpace.php",
			params: {
				id: id
			}
		};

		this.$http(configObject)
			.then((response) => this.getSpaces())
			.catch((response) => console.log(response));

	}

	goToSchedule(space){
		this.$state.go(space);
	}

	showAddSpaceDialog(ev) {
		this.$mdDialog.show({
      controller: DialogCtrl,
			controllerAs: 'addSpaceDialog',
      template: require('./addSpaceDialog.html'),
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose:true
    })
    .then( (answer) => {
      this.$scope.status = this.addSpace(answer.name, answer.description);
    }, () => {

    });
  }
}

export default SpacesCtrl;
