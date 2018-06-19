
class EventTemplatesCtrl {
	constructor($state, $scope, $mdDialog, $http, $location, $mdPanel, $timeout) {
		angular.extend(this, {
			$scope,
			$location,
			$mdPanel,
			$http,
			$state,
			$timeout
		});

		console.log(this.$state);
		console.log(this.$mdPanel);

		this.$scope.selectedTab;
		this.$scope.records;
		this.$scope.selectedEvent;
		this.$scope.roles = [];
		this.$scope.oldRoles = [];
		this.$scope.people = [];
		this.$scope.inputBlocker = "";
		this.parents = [];
		this.getTemplates();
		this.newTemplate();

		this.$scope.colorPickerOptions = {
			label: "Choose a color",
    	icon: "brush",
			genericPalette: false,
			openOnInput: true,
			alphaChannel: false
		};

	}

	loadHandle(handle) {

		var location = $(handle).offset();
		var eventData = JSON.parse($(handle).attr("data"));
		$(handle).parent().append( "<div id=" + eventData.id + " class='fc-event draggable' data=" + eventData + ">" + eventData.defName + "</div>" );

		$("div#" + eventData.id)
			.css( "position", "absolute" )
			.css('cursor', 'move')
			.css("opacity", '0')
			.css('background-color', eventData.defColor)
			.css("border", eventData.defColor)
			.css("margin-right", 0)
			.css( "margin-left", "90%")
			.css('width', "10%")
			.css("height", "24px")
			// .css( "left", location.left-50)
			// .css('width', $(handle).width() * 4)
			.data('id', eventData.id)
			.data('duration', eventData.defDur)
			.data('start', moment(eventData.momentStart).format("HH:mm"))
			.data('allData', eventData);

		$("div#" + eventData.id).draggable({
			helper: "clone",
			cursor: "move",
			revert: "valid",
			refreshPositions: true,
			cursorAt: {left: 0},
			start: function(event, ui) {
				ui.helper.appendTo(document.body);
				ui.helper.css("opacity", "1");
				ui.helper.css("zIndex", "3");
				ui.helper.css('margin-left', "34%");
				ui.helper.css('height', "auto");
			},
			drag: function(event, ui) {
				ui.position.top = event.pageY - 5;
			}
		});
	}

	switchDrag(bool){
		var _this = this;
		if (bool == true){

			$( ".ghost-handle" ).animate({
				width: "24px"
			}, 700);

			$( ".handle" ).animate({
				opacity: 1,
				width: "24px"
			}, 700, function() {
				_this.loadHandle(this);
			});

		} else {

			$(".draggable").remove();

			$( ".handle" ).animate({
				opacity: 0,
				width: "0px"
			}, 700);

			$( ".ghost-handle" ).animate({
				width: "0px"
			}, 700);

		}

	}

	loadCalendar(){

		var _this = this;

		var id = this.$scope.selectedEvent.id;
		var start = moment(this.$scope.selectedEvent.momentStart);
		var end = moment(this.$scope.selectedEvent.momentEnd);

		if(this.$scope.selectedEvent.defDay != undefined) {
			var eventOffset = this.$scope.selectedEvent.defDay - 1;
			start.subtract(eventOffset, 'days');
			end.subtract(eventOffset, 'days');
		}
		var startTime = start.format("HH:mm");
		var endTime = end.format("HH:mm");

		var days = moment(end).subtract(1, 'seconds').date(); // Odjęta sekunda, żeby ukryć dzień który zaczyna się godziną 00:00:00, a nie jest częscią wydarzenia.

		this.innerEventLastDay;
		this.innerEventSelectedDay = 1;
		this.innerEventLastDay = days;

		var fcview;
		if (days > 4) {
			fcview = "month";

		} else {
			fcview = "agendaDays";
		}

		var events = [];
		var counter = 0;
		events[counter] = {
			start: '1972-12-30',
			end: '1973-01-01',
			overlap: false,
			rendering: 'background',
			color: 'rgb(180, 180, 180)'
		};
		counter = counter + 1;
		if(fcview == "month") {
			events[counter] = {
				start: moment(end).format("YYYY-MM-DD"),
				end: '1973-02-15',
				overlap: false,
				rendering: 'background',
				backgroundColor: 'rgb(180, 180, 180)'
			};
		} else {
			events[counter] = {
				start: moment(end).add(1,'days').format("YYYY-MM-DD"),
				end: '1973-02-15',
				overlap: false,
				rendering: 'background',
				backgroundColor: 'rgb(180, 180, 180)'
			};
		}
		counter = counter + 1;
		events[counter] = {
			start: moment(end),
			end: moment(end).add(1,'days'),
			overlap: false,
			rendering: 'background',
			backgroundColor: 'rgb(180, 180, 180)'
		};
		if (startTime != "00:00"){
			counter = counter + 1;
			events[counter] = {
				start: '1973-01-01 00:00:00',
				end: start,
				overlap: false,
				rendering: 'background',
				color: 'rgb(180, 180, 180)'
			};
		}

		$('#templateSchedule').fullCalendar('destroy');
		console.log(days);

		var calendar = $('#templateSchedule').fullCalendar({
				height: "parent",
				firstDay: "1",
				theme: false,
				defaultView: fcview,
				header: {
					left: 'month dayView',
					center: '',
					right: 'prevDay nextDay'
		    },
		    views: {
		        agendaDays: {
		            type: 'agenda',
		            duration: { days: days },
								columnFormat: 'D',
								scrollTime: '00:00:00',
								minTime: (days==1) ? startTime : "00:00",
								maxTime: (days==1 && endTime != "00:00") ? endTime : "24:00"
		        },
						month: {
							columnFormat: ' '
						},
						agendaDay: {
							columnFormat: 'D',
							minTime: (days==1) ? startTime : "00:00",
							maxTime: (days==1 && endTime != "00:00") ? endTime : "24:00"
						}
		    },
				slotDuration: "00:15:00",
				customButtons: {
	        dayView: {
            text: 'day',
            click: function() {
                $('#templateSchedule').fullCalendar('changeView', 'agendaDay');
            }
	        },
					nextDay: {
            text: '',
						icon: 'right-single-arrow',
            click: function(ev) {
							if($('#templateSchedule').fullCalendar('getView').name!="month" && _this.innerEventSelectedDay!=_this.innerEventLastDay) {
								_this.innerEventSelectedDay = _this.innerEventSelectedDay + 1;
								$('#templateSchedule').fullCalendar('next');
							}
            }
	        },
					prevDay: {
						icon: 'left-single-arrow',
            click: function(ev) {
							if($('#templateSchedule').fullCalendar('getView').name!="month"  && _this.innerEventSelectedDay!=1) {
								_this.innerEventSelectedDay = _this.innerEventSelectedDay - 1;
								$('#templateSchedule').fullCalendar('prev');
							}
            }
	        },
		    },
				eventSources: [
					{
						url: "/scripts/getTempChildren.php?parent=" + id + "",
						type: 'GET',
						description: ''
					},
					events
				],
				viewRender: (view) => {
					//this.jQueryFormat();
					$('.fc-other-month').css('visibility','hidden');
				},

        defaultDate: '1973-01-01',
        navLinks: false,
        // can click day/week names to navigate views
        editable: true,
				droppable: true,
		    drop: function (date) {
					var eventData = $(this).data('allData');
					var duration = eventData.defDur;
					var start;
					if (date.hasTime()) {
						start = date;
					} else {
						var defMomentStart = moment(eventData.stringStart);
						start = defMomentStart.date(date.date());
					}

					var end = moment(start).add(duration);

					eventData.parent = _this.$scope.selectedEvent.id;
					eventData.momentStart = moment(start);
					eventData.momentEnd = moment(end);
					eventData.dropped = true;
					_this.addTemplate(eventData);
		    },
        eventLimit: true,
				selectable: true,
				eventOverlap: true,

				selectOverlap: function(event) {
					return event.rendering !== 'background';
		    },

		    eventRender: (event, element, view) => {
			    if (event.allDay == 1) {
			     event.allDay = true;
			    } else {
			     event.allDay = false;
			    }
					element.bind('dblclick', () => {

		      });
				},

				select: (start, end, jsEvent, view) => {

					this.innerEvInit(start, end);

					var pos = $(jsEvent.target).offset();

					$( "body" ).append( "<p id='new'>New template</p>" );
					$("#new")
						.css( "position", "absolute" )
						.css("background-color", "rgba(210,210,210,0.7)")
						.css("color", "rgb(63,81,181)")
						.css("font-size", "30px")
						.css("font-weight", "normal")
						.css( "left", jsEvent.pageX - 100)
						.css( "top", jsEvent.pageY - 50 );

					var titlePos = $("#templateTitle").offset();

					$( "#new" ).animate({
						top: titlePos.top,
						opacity: 0.1,
						fontSize: "20px"
					}, 500, () => {
						$( "#new" ).remove();
					  this.$scope.$apply();
					});

				},

				dayRender: (date, cell) => {

					cell.bind('dblclick', (e) => {
						e.preventDefault();
		      });
				},

				eventClick: (calEvent, jsEvent, view) => {

					var start = moment(calEvent.start.format("YYYY-MM-DD HH:mm"), "YYYY-MM-DD HH:mm");
					var end = moment(calEvent.end.format("YYYY-MM-DD HH:mm"), "YYYY-MM-DD HH:mm");

					var durationInMilis = end.diff(start);
					var duration = moment.duration(durationInMilis);

					console.log(calEvent.description);

					this.parents.push(this.$scope.selectedEvent);

					this.$scope.selectedEvent = {
						id: calEvent.id,
						parents: this.parents,
						parent: calEvent.parent,
						defName : calEvent.title,
						description: calEvent.description,
						defColor: calEvent.color,
						allDay: calEvent.allDay,
						momentStart: start,
						momentEnd: end,
						defDay: start.date(),
						defStart: new Date(start.toString()),
						defDur: {
							days: duration.days(),
							hours: duration.hours(),
							minutes: duration.minutes()
						}
					};

					var pos = $(jsEvent.target).offset();

					$( "body" ).append( "<p id='new'>" + calEvent.title +"</p>" );
					$("#new")
						.css( "position", "absolute" )
						.css("background-color", "rgba(210,210,210,0.7)")
						.css("color", "rgb(63,81,181)")
						.css("font-size", "30px")
						.css("font-weight", "normal")
						.css( "left", jsEvent.pageX - 100)
						.css( "top", jsEvent.pageY - 50 );

					var titlePos = $("#templateTitle").offset();

					$( "#new" ).animate({
						top: titlePos.top,
						opacity: 0.1,
						fontSize: "20px"
					}, 500, () => {
						$( "#new" ).remove();
					  this.$scope.$apply();
						this.loadCalendar();
						this.getRoles(calEvent.id);
					});

					//this.rippleEffect(jsEvent);
					//this.showEventPanel(jsEvent, calEvent);
				},

				eventDrop: (event) => {
					this.moveTemplate(event);
				},

				eventResize: (event) => {
					this.moveTemplate(event);
				},

				dayClick: (date, jsEvent, view) => {
					//this.rippleEffect(jsEvent);
					//this.dayDialog(date, jsEvent);
				}

    });

	}

	moveTemplate(event) {
		console.log(moment(event.end).format("YYYY-MM-DD HH:mm"));
		let configObject = {
			method:'GET',
			url: "/scripts/mvTempChild.php",
			params: {
				id: event.id,
				newStart: moment(event.start).format("YYYY-MM-DD HH:mm"),
				newEnd: moment(event.end).format("YYYY-MM-DD HH:mm"),
				allDay: event.allDay==1 ? 1 : 0
			}
		};
		this.$http(configObject)
			.then((response) => {
				console.log(response.data);
			})
			.catch((response) => console.log(response));
	}

	updateTemplate(){
		//różnice w źródłach wydarzeń. Wydarzenia główne/zagnieżdżone
		var updatedTemplate = this.$scope.selectedEvent;

		var allDay = updatedTemplate.allDay;
		var defStart = updatedTemplate.defStart;
		var start = moment(updatedTemplate.defStart);
		var end = moment(start);
		end.add({days:updatedTemplate.defDur.days,hours:updatedTemplate.defDur.hours,minutes:updatedTemplate.defDur.minutes});

		if(updatedTemplate.allDay) {
			allDay = 1;
		} else {
			allDay = 0;
		}

		let configObject = {
			method:'GET',
			url: "/scripts/updateTemplate.php",
			params: {
				id: updatedTemplate.id,
				defName: updatedTemplate.defName,
				description: updatedTemplate.description,
				defColor: updatedTemplate.defColor,
				newStart: start.format(),
				newEnd: end.format(),
				allDay: allDay
			}
		};

		this.$http(configObject)
			.then((response) => {
				this.$scope.selectedEvent.momentStart = start;
				this.$scope.selectedEvent.momentEnd = end;
				this.getTemplates();
				this.loadCalendar();
			})
			.catch((response) => console.log(response));
	}

	deleteTemplate(){
		var deleteID = this.$scope.selectedEvent.id;
		console.log(deleteID);
		let configObject = {
			method:'GET',
			url: "/scripts/deleteTemplate.php",
			params: {
				id: deleteID
			}
		};

		this.$http(configObject)
			.then((response) => {
				if(this.parents.push() > 0) {
					this.goToParent(this.parents[this.parents.push()-1], this.parents.push()-1);
				} else {
					this.getTemplates();
					this.viewEvent(null);
				}
			})
			.catch((response) => console.log(response));
	}

	innerEvInit(start, end) {

		var allDay = true;
		var time = "00:00";
		if (start.hasTime()) {
			allDay = false;
			time = moment(start).format("HH:mm");
		}

		start = moment(start.format("YYYY-MM-DD HH:mm"), "YYYY-MM-DD HH:mm");
		end = moment(end.format("YYYY-MM-DD HH:mm"), "YYYY-MM-DD HH:mm");

		var durationInMilis = end.diff(start);
		var duration = moment.duration(durationInMilis);

		this.parents.push(this.$scope.selectedEvent);
		var parentID = this.$scope.selectedEvent.id;

		this.$scope.selectedEvent = {
			id: null,
			parents: this.parents,
			parent: parentID,
			defName : "",
			description: "",
			defColor: "#3a87ad",
			allDay: !start.hasTime(),
			momentStart: start,
			momentEnd: end,
			defDay: start.date(),
			defStart: start.toDate(),
			defDur: {
				days: duration.days(),
				hours: duration.hours(),
				minutes: duration.minutes()
			}
		};

	}

	getTemplates(){
		let configObject = {
			method:'GET',
			url: "/scripts/getTemplates.php",
		};
		this.$http(configObject)
			.then((response) => {
				response.data.forEach((obj) => {
					var start = moment(obj.momentStart);
					obj.stringStart = obj.momentStart;
					obj.momentStart = moment(start);
					var end = moment(obj.momentEnd);
					obj.momentEnd = moment(end);
					var momentDefDur = moment.duration(end.diff(start));
					obj.defDur = {
						days: momentDefDur.days(),
						hours: momentDefDur.hours(),
						minutes: momentDefDur.minutes()
					};
					obj.allDay = obj.allDay == 1;
				});
				this.$scope.records = response.data;
			})
			.catch((response) => console.log(response));
		this.$scope.ready = true;
	}

	newTemplate() {
		this.viewEvent(null);
	}

	goToParent(parentData, index) {
		this.$scope.selectedEvent = parentData;

		while (this.parents.push() > index) {
			this.parents.pop();
		}

		this.$scope.selectedTab = 2;
		//this.$scope.$apply();
		this.loadCalendar();
	}

	viewEvent(record){

		this.parents = [];

		if(record==null){
			this.$scope.selectedEvent = {
				id: null,
				defName : "",
				description: "",
				defColor: "#3a87ad",
				allDay: true,
				defStart: new Date("Jan 01 1973 00:00:00"),
				parent: null,
				defDur: {
					days: 1,
					hours: 0,
					minutes: 0
				}
			};
			//console.log(this.$scope.selectedEvent.defStart.toTimeString().substring(0,8));
		} else {
			angular.copy(record, this.$scope.selectedEvent);
			this.$scope.selectedEvent.parent = null;
			this.$scope.selectedEvent.defStart = record.momentStart.toDate();
			this.loadCalendar();
			this.getRoles(record.id);
			this.getPeople();
			this.$scope.selectedTab = 0;
		}
	}

	getRoles(templateID) {
		let configObject = {
			method:'GET',
			url: "/scripts/getTempRoles.php",
			params: {
				template: templateID
			}
		};

		this.$http(configObject)
			.then((response) => {
				response.data.forEach((obj) => {
					if(obj.personID != null) {
						obj.assigned = obj.person;
						obj.isGroup = false;
					} else {
						if(obj.groupID != null){
							obj.assigned = obj.group;
							obj.isGroup = true;
						} else {
							obj.assigned = "";
						}
					}
				});
				response.data.push({id: null, role: "", assigned: "", personID: null, groupID: null});
				angular.copy(response.data, this.$scope.oldRoles);
				angular.copy(response.data, this.$scope.roles);
			})
			.catch((response) => console.log(response));

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
				this.$scope.people = response.data;
				this.includeGroups();
			})
			.catch((response) => console.log(response));
	}

	includeGroups() {
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
				this.$scope.peopleAndGroups = this.$scope.people.concat(response.data);
				console.log(this.$scope.peopleAndGroups);
			})
			.catch((response) => console.log(response));
	}

	peopleDragActivate() {
		$( ".assignee" ).each((index, element) => {
			console.log($(element).offset());
			var location = $(element).parent().offset();
			$(element).parent().append('<i class="material-icons assignee_ghost" index=' + index + '>assignment_ind</i>');

			$(".assignee_ghost[index='" + index + "']")
				.css( "position", "absolute" )
				.css('cursor', 'move')
				.css("opacity", '0')
				.css('width', $(element).width());
		});

		$(".assignee_ghost").draggable({
			helper: "clone",
			cursor: "move",
			start: function(event, ui) {
				ui.helper.appendTo(document.body);
				ui.helper.css("opacity", "1");
			},
			drag: function(event, ui) {
				ui.position.top = event.pageY - 5;
				ui.position.left = event.pageX - 5;
			}
		});

		this.initializeDrop();

	}

	initializeDrop(){
		$(".assignee_drop").droppable({
			accept: ".assignee_ghost",
			drop: (event, ui) => {

				var peopleInd = ui.draggable.attr('index');
				var roleInd = $(event.target).attr('ind');
				var peopleObj = this.$scope.peopleAndGroups[peopleInd];
				var roles = this.$scope.roles;

				if (peopleObj.isGroup) {
					roles[roleInd].groupID = peopleObj.id;
					roles[roleInd].personID = null;
					roles[roleInd].isGroup = true;
					roles[roleInd].assigned = peopleObj.name;
				} else {
					roles[roleInd].personID = peopleObj.id;
					roles[roleInd].groupID = null;
					roles[roleInd].isGroup = false;
					roles[roleInd].assigned = peopleObj.first_name + " " + peopleObj.last_name;
				}
				this.$scope.$apply();
				this.updateRole(roles[roleInd]);
			}
		});
	}

	roleChange(record, index){

		var roles = this.$scope.roles;
		var lastRole = roles[roles.push()-1];
		if (lastRole.role != "") {
			roles.push({id: null, role: "", assigned: "", personID: null, groupID: null});
			this.initializeDrop();
		}
		var beforeLastRole = roles[roles.push()-2];
		if (beforeLastRole.role == "") {
			roles.pop();
		}
	}

	updateRole(role){

		if (role.id == null) {
			this.addRole(role);
		}

		let configObject = {
			method:'GET',
			url: "/scripts/updateTempRole.php",
			params: {
				id: role.id,
				role: role.role,
				person: role.personID,
				group: role.groupID,
			}
		};

		this.$http(configObject)
			.then((response) => {

			})
			.catch((response) => console.log(response));
	}

	addRole(role) {
		if (role.role != '') {
			let configObject = {
				method:'GET',
				url: "/scripts/addTempRole.php",
				params: {
					role: role.role,
					template: this.$scope.selectedEvent.id,
					person: role.personID,
					group: role.groupID,
				}
			};

			this.$http(configObject)
				.then((response) => {
					role.id = response.data;
				})
				.catch((response) => console.log(response));
		}
	}

	copyRoles(sourceTemplate, targetTemplate) {
		let configObject = {
			method:'GET',
			url: "/scripts/importTempRoles.php",
			params: {
				targetID: targetTemplate,
				sourceID: sourceTemplate
			}
		};
		this.$http(configObject)
			.then((response) => {

			})
			.catch((response) => console.log(response));
	}

	deleteRole(role){
		let configObject = {
			method:'GET',
			url: "/scripts/deleteTempRole.php",
			params: {
				id: role.id
			}
		};

		this.$http(configObject)
			.then((response) => {

			})
			.catch((response) => console.log(response));
	}

	areRolesChanged() {
		if (angular.equals(this.$scope.oldRoles, this.$scope.roles)) {
			return false;
		} else {
			return true;
		}
	}

	scrollbarVisible(){
		return $("#templatesList").get(0).scrollHeight > $("#templatesList").get(0).clientHeight;
	}

	addTemplate(newEvent){

		//różnice w źródłach wydarzeń. Wydarzenia główne/zagnieżdżone
		var allDay = newEvent.allDay;
		var defStart = newEvent.defStart;
		if (newEvent.parent == null) {
			var start = moment(newEvent.defStart);
			var end = moment(start);
			end.add({days:newEvent.defDur.days,hours:newEvent.defDur.hours,minutes:newEvent.defDur.minutes});
			//defStart = newEvent.defStart.toTimeString().substring(0,8);
		} else {
			var start = newEvent.momentStart;
			var end = newEvent.momentEnd;
		}
		if(newEvent.allDay) {
			allDay = 1;
		} else {
			allDay = 0;
		}

		let configObject = {
			method:'GET',
			url: "/scripts/addTemplate.php",
			params: {
				templateName: newEvent.defName,
				description: newEvent.description,
				color: newEvent.defColor,
				momentStart: start.format(),
				momentEnd: end.format(),
				parent: newEvent.parent,
				allDay: allDay
			}
		};

		this.$http(configObject)
			.then((response) => {
				if (newEvent.parent == null || newEvent.defDay != undefined){
					this.$scope.selectedEvent.id = response.data;
					this.$scope.selectedEvent.momentStart = start;
					this.$scope.selectedEvent.momentEnd = end;
					this.getTemplates();
					this.getRoles(response.data);
					this.getPeople();
					this.loadCalendar();
				}
				if (newEvent.dropped == true) {
					var render = {
						id: response.data,
						title: newEvent.defName,
						description: newEvent.description,
						start: start,
						end: end,
						allDay: newEvent.allDay,
						overlap: true,
						color: newEvent.defColor
					};
					this.copyRoles(newEvent.id, response.data);
					$('#templateSchedule').fullCalendar('renderEvent', render);
				}
			})
			.catch((response) => console.log(response));

	}
}

export default EventTemplatesCtrl;
