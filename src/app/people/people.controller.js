class PeopleCtrl {
	constructor($state, $scope, $mdDialog, $http, $location, $timeout) {
		angular.extend(this, {
			$scope,
			$location,
			$http,
			$state,
			$timeout
		});

		this.$scope.selectedPerson = [];
		this.$scope.selectedGroup = [];
		this.getPeople();
		this.getGroups();

		this.selectPerson(null);

	}

	getPeople() {
		let configObject = {
			method:'GET',
			url: "/scripts/getPeople.php",
		};

		this.$http(configObject)
			.then((response) => {
				response.data.forEach((obj) => {
					obj.isGroup = false;
				});
				this.$scope.individPeople = response.data;
				setTimeout(() => {
					this.peopleDragActivate();
				}, 300);
			})
			.catch((response) => console.log(response));
	}

	getGroups() {
		let configObject = {
			method:'GET',
			url: "/scripts/getGroups.php",
		};

		this.$http(configObject)
			.then((response) => {
				response.data.forEach((obj) => {
					obj.isGroup = true;
				});
				this.$scope.groups = response.data;
			})
			.catch((response) => console.log(response));
	}

	addPerson() {
		var newPerson = this.$scope.selectedPerson;

		let configObject = {
			method:'GET',
			url: "/scripts/addPerson.php",
			params: {
				first_name: newPerson.first_name,
				last_name: newPerson.last_name,
				email: newPerson.email,
				phone: newPerson.phone
			}
		};

		this.$http(configObject)
			.then((response) => {
				this.getPeople();
				this.selectPerson(null);
			})
			.catch((response) => console.log(response));

	}

	addGroup() {
		var newGroup = this.$scope.selectedGroup;

		let configObject = {
			method:'GET',
			url: "/scripts/addGroup.php",
			params: {
				name: newGroup.name,
				description: newGroup.description
			}
		};

		this.$http(configObject)
			.then((response) => {
				this.getGroups();
				this.$scope.selectedGroup.id = response.data;
			})
			.catch((response) => console.log(response));
	}

	peopleDragActivate() {
		$( ".person" ).each((index, element) => {
			console.log($(element).offset());
			var location = $(element).offset();
			$(element).parent().append('<i class="material-icons person_ghost" index=' + index + '>assignment_ind</i>');

			$(".person_ghost[index='" + index + "']")
				.css( "position", "absolute" )
				.css("left", location.left-20)
				.css('cursor', 'move')
				.css("opacity", '0')
				.css('width', $(element).width());

				console.log(index);
		});

		$(".person_ghost").draggable({
			helper: "clone",
			cursor: "move",
			start: function(event, ui) {
				ui.helper.appendTo(document.body);
				ui.helper.css("opacity", "1");
			},
			drag: function(event, ui) {
				ui.position.top = event.pageY - 20;
				ui.position.left = event.pageX - 20;
			}
		});

		$(".person_drop").droppable({
			accept: ".person_ghost",
			drop: (event, ui) => {
				var personInd = ui.draggable.attr('index');
				var personID = this.$scope.individPeople[personInd].id;
				console.log(personID);
				this.addPersonToGroup(personID);
			}
		});
	}

	addPersonToGroup(personID) {
		var groupID = this.$scope.selectedGroup.id;
		console.log(personID);
		let configObject = {
			method:'GET',
			url: "/scripts/addPersonToGroup.php",
			params: {
				groupID: groupID,
				personID: personID
			}
		};

		this.$http(configObject)
			.then((response) => {
				this.getGroupMembers(groupID);
			})
			.catch((response) => console.log(response));
	}

	deletePersonFromGroup (groups_peopleID) {
		var params = {
			id: groups_peopleID,
		};

		this.executeScpript("deletePersonFromGroup.php", params, () => this.getGroupMembers(this.$scope.selectedGroup.id));
	}

	deletePerson () {
		var params = {
			id: this.$scope.selectedPerson.id
		};

		this.executeScpript("deletePerson.php", params,
		() =>  {
			this.getPeople();
			this.selectPerson(null);
		});
	}

	updatePerson() {
		var params = this.$scope.selectedPerson;

		this.executeScpript("updatePerson.php", params,
		() =>  {
			this.getPeople();
		});
	}

	updateGroup() {
		var params = this.$scope.selectedGroup;

		this.executeScpript("updateGroup.php", params,
		() =>  {
			this.getGroups();
		});
	}

	deleteGroup () {
		var params = {
			id: this.$scope.selectedGroup.id
		};

		this.executeScpript("deleteGroup.php", params,
		() =>  {
			this.getGroups();
			this.selectGroup(null);
		});
	}

	executeScpript(scriptString, params, _callback) {
		let configObject = {
			method:'GET',
			url: "/scripts/" + scriptString,
			params: params
		};

		this.$http(configObject)
			.then((response) => {
				_callback();
				console.log(response);
			})
			.catch((response) => console.log(response));
	}

	getGroupMembers(groupID) {
		let configObject = {
			method:'GET',
			url: "/scripts/getGroupMembers.php",
			params: {
				groupID: groupID
			}
		};

		this.$http(configObject)
			.then((response) => {
				this.$scope.selectedGroupMembers = response.data;
			})
			.catch((response) => console.log(response));
	}

	selectPerson(record) {
		if(record == null) {
			record = {
				id: null,
				first_name: '',
				last_name: '',
				email: '',
				phone: ''
			};
		}
		angular.copy(record, this.$scope.selectedPerson);
		this.$scope.isGroupSelected = false;
	}
	selectGroup(record) {
		if(record == null) {
			record = {
				id: null,
				name: '',
				description: ''
			};
		}
		angular.copy(record, this.$scope.selectedGroup);
		this.$scope.isGroupSelected = true;
		this.getGroupMembers(record.id);
	}

}

export default PeopleCtrl;
