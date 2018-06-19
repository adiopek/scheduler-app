
class CalendarCtrl {
	/*@ngInject*/
	constructor($scope, $location, $http) {
		angular.extend(this, {
			$scope,
			$location,
			$http
		});

		this.$scope.roles = [];
		this.$scope.oldRoles = [];
		this.$scope.people = [];
		this.parents = [];

		$scope.$on('ngRepeatFinished', (ngRepeatFinishedEvent) => {
    	this.makeTemplatesDraggable();
		});

		this.loadCalendar();
		this.getTemplates();
		this.$scope.eventView = false;

		this.$scope.colorPickerOptions = {
			label: "Choose a color",
    	icon: "brush",
			genericPalette: false,
			openOnInput: true,
			alphaChannel: false
		};
	}

	getTemplates(){
		let configObject = {
			method:'GET',
			url: "/scripts/getTemplates.php",
		};
		this.$http(configObject)
			.then((response) => {
				this.$scope.templates = response.data;
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
				this.$scope.templates = response.data;
			})
			.catch((response) => console.log(response));
	}

	makeTemplatesDraggable() {
		$(".template_handle").each((index, element) => {
			this.loadHandle(index, element);
		});
	}

	loadHandle(index, handle) {

		var location = $(handle).offset();
		//var eventData = JSON.parse($(handle).attr("data"));
		var template = this.$scope.templates[index];
		$(handle).parent().append( "<div id=" + template.id + " class='fc-event draggable' data=" + template + "><span>" + template.defName + "</span></div>" );

		$("div#" + template.id)
			.css( "position", "absolute" )
			.css('cursor', 'move')
			.css("opacity", '0')
			.css('background-color', template.defColor)
			.css("border", template.defColor)
			.css("margin-right", 0)
			.css( "margin-left", "40%")
			.css('width', "10%")
			.css("height", "24px")
			.data('index', index)
			.data('duration', template.defDur)
			.data('start', moment(template.momentStart).format("HH:mm"))
			.data('allData', template);

		$("div#" + template.id + " > span")
			.css('display', 'none');

		$("div#" + template.id).draggable({
			helper: "clone",
			cursor: "move",
			revert: "valid",
			refreshPositions: true,
			cursorAt: {left: -40},
			start: function(event, ui) {
				ui.helper.appendTo(document.body);
				ui.helper.css("opacity", "1");
				ui.helper.css("zIndex", "3");
				ui.helper.css('margin-left', "0");
				ui.helper.css('height', "auto");
				ui.helper.children().css("display", "block");
			},
			drag: function(event, ui) {
				ui.position.top = event.pageY - 5;
			}
		});
	}

	loadCalendar(){
		var _this = this;
		$('#workspace').fullCalendar('destroy');
		var calendar = $('#workspace').fullCalendar({
				height: "parent",
				firstDay: "1",
				theme:false,
				views: {
					month: {
						selectable: false
					},
					agendaDay: {
						selectable: true
					}
				},
				slotDuration: "00:15:00",
        header: {
            left: 'today month',
            center: 'title',
            right: 'prev,next'
        },
				eventAfterAllRender: (view) => {
					_this.jQueryFormat();
				},
				select: (start, end, jsEvent, view) => {
						var calEvent = {start: start, end: end, allDay: !start.hasTime(), fromTemplate: false};
						this.newEvent(calEvent);
				},
        //defaultDate: '2016-12-13',
        navLinks: false,
        // can click day/week names to navigate views
				droppable: true,
				drop: function (date, jsEvent) {

					var eventData = _this.$scope.templates[$(this).data('index')];
					var duration = eventData.defDur;
					var defMomentStart = moment(eventData.stringStart);
					//console.log(defMomentStart.format());
					var start;
					if(date.hasTime()){
						start = date;
					} else {
						start = date.hour(defMomentStart.hour()).minutes(defMomentStart.minute());
					}

					var end = moment(start).add(duration);
					eventData.parent = null;
					eventData.momentStart = moment(start);
					eventData.momentEnd = moment(end);
					eventData.name = eventData.defName;
					eventData.color = eventData.defColor;
					eventData.fromTemplate = true;
					eventData.TemplateID = eventData.id;
					_this.addEventFromTemplate(eventData, '#workspace');
				},
				editable: true,
        eventLimit: true,
        // allow "more" link when too many events
        events: "/scripts/getEvents.php",

				// Convert the allDay from string to boolean
		    eventRender: (event, element, view) => {
			    if (event.allDay == 1) {
			     event.allDay = true;
			    } else {
			     event.allDay = false;
			    }
				},

				dayRender: (date, cell) => {
					cell.bind('dblclick', (e) => {
						_this.dayViewLoad(date);

		      });
				},

				eventClick: (calEvent, jsEvent, view) => {
					_this.viewEvent(calEvent);
				},

				dayClick: (date, jsEvent, view) => {
					this.rippleEffect(jsEvent);
					setTimeout(() => {
						if($('#workspace').fullCalendar('getView').name=="month"){
							var calEvent = {start: date, end: moment(date).add(1, 'days'), allDay: true, fromTemplate: false};
							_this.newEvent(calEvent);
						}
					}, 400);
				},
				eventDrop: (event) => {
					this.moveEvent(event);
				},

				eventResize: (event) => {
					this.moveEvent(event);
				}

    });

	}

	viewEvent(calEvent) {

		var start = moment(calEvent.start.format("YYYY-MM-DD HH:mm"), "YYYY-MM-DD HH:mm");
		var end = moment(calEvent.end.format("YYYY-MM-DD HH:mm"), "YYYY-MM-DD HH:mm");

		var durationInMilis = end.diff(start);
		var duration = moment.duration(durationInMilis);

		this.parents = [];

		this.$scope.selectedEvent = {
			id: calEvent.id,
			parent: null,
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

		this.$scope.eventView = true;
		this.$scope.$apply();

		this.$scope.selectedTab = 0;

		this.getRoles(calEvent.id);
		this.getPeople();
		this.loadEventSchedule();

	}

	newEvent(calEvent) {

		var start = moment(calEvent.start.format("YYYY-MM-DD HH:mm"), "YYYY-MM-DD HH:mm");
		var end = moment(calEvent.end.format("YYYY-MM-DD HH:mm"), "YYYY-MM-DD HH:mm");

		var durationInMilis = end.diff(start);
		var duration = moment.duration(durationInMilis);

		this.$scope.selectedEvent = {
			id: null,
			defName : "",
			description: "",
			defColor: "#3a87ad",
			momentStart: start,
			momentEnd: end,
			allDay: calEvent.allDay,
			defStart: new Date(start.toString()),
			defDur: {
				days: duration.days(),
				hours: duration.hours(),
				minutes: duration.minutes()
			}
		};

		this.$scope.eventView = true;
		this.$scope.$apply();
	}

	loadEventSchedule(){

		var _this = this;

		var id = this.$scope.selectedEvent.id;
		var start = moment('1973-01-01' + " " + this.$scope.selectedEvent.momentStart.format("HH:mm"));

		var end = moment(start).add(this.$scope.selectedEvent.defDur);

		var startTime = start.format("HH:mm");
		var endTime = end.format("HH:mm");

		console.log("this is it:" + this.$scope.selectedEvent.momentStart.format());
		var days = moment(end).subtract(1, 'seconds').date(); // Odjęta sekunda, żeby ukryć dzień który zaczyna się godziną 00:00:00, a nie jest częscią wydarzenia.

		this.innerEventLastDay;
		this.innerEventSelectedDay = 1;
		this.innerEventLastDay = days;

		var fcview;
		if (days > 4) {
			fcview = "month";

		} else {
			console.log(days);
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
			start: end,
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
				slotDuration: "00:15:00",
				eventSources: [
					"/scripts/getChildren.php?parent=" + id + "",
					events
				],
				viewRender: (view) => {
					//this.jQueryFormat();
					$('#templateSchedule .fc-other-month').css('visibility','hidden');
				},

        defaultDate: '1973-01-01',
        navLinks: false,
        // can click day/week names to navigate views
        editable: true,
				droppable: true,
		    drop: function (date) {

					var eventData = _this.$scope.templates[$(this).data('index')];
					var duration = eventData.defDur;
					var defMomentStart = moment(eventData.stringStart);
					//console.log(defMomentStart.format());
					var start;
					if(date.hasTime()){
						start = date;
					} else {
						start = date.hour(defMomentStart.hour()).minutes(defMomentStart.minute());
					}

					var end = moment(start).add(duration);
					eventData.parent = _this.$scope.selectedEvent.id;
					eventData.momentStart = moment(start);
					eventData.momentEnd = moment(end);
					eventData.name = eventData.defName;
					eventData.color = eventData.defColor;
					eventData.fromTemplate = true;
					eventData.TemplateID = eventData.id;
					_this.addEventFromTemplate(eventData, '#templateSchedule');

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

				// dayRender: (date, cell) => {
				// 	cell.bind('dblclick', (e) => {
				// 		e.preventDefault();
				// 		$('#templateSchedule').fullCalendar('changeView', 'agendaDay');
				// 		$('#templateSchedule').fullCalendar('gotoDate', date);
		    //   });
				// },
				//
				// dayClick: (date, jsEvent, view) => {
				// 	$(jsEvent.target).bind('click', (e) => {
				// 		console.log("log");
				// 		e.preventDefault();
				// 		$('#templateSchedule').fullCalendar('changeView', 'agendaDay');
				// 		$('#templateSchedule').fullCalendar('gotoDate', date);
				// 	});
				// },

				eventClick: (calEvent, jsEvent, view) => {

					var start = moment(calEvent.start.format("YYYY-MM-DD HH:mm"), "YYYY-MM-DD HH:mm");
					var end = moment(calEvent.end.format("YYYY-MM-DD HH:mm"), "YYYY-MM-DD HH:mm");

					var durationInMilis = end.diff(start);
					var duration = moment.duration(durationInMilis);

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
						this.loadEventSchedule();
					});

				},

				eventDrop: (event) => {
					this.moveEvent(event);
				},

				eventResize: (event) => {
					this.moveEvent(event);
				}

    });

	}

	goToParent(parentData, index) {

		this.$scope.selectedEvent = parentData;

		while (this.parents.push() > index) {
			this.parents.pop();
		}

		this.$scope.selectedTab = 2;
		//this.$scope.$apply();
		this.loadEventSchedule();
	}

	moveEvent(event) {
		let configObject = {
			method:'GET',
			url: "/scripts/mvEvent.php",
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

	updateEvent(){
		//różnice w źródłach wydarzeń. Wydarzenia główne/zagnieżdżone
		var updatedEvent = this.$scope.selectedEvent;

		var allDay = updatedEvent.allDay;
		var defStart = updatedEvent.defStart;
		var start = moment(updatedEvent.defStart);
		var end = moment(start);
		end.add({days:updatedEvent.defDur.days,hours:updatedEvent.defDur.hours,minutes:updatedEvent.defDur.minutes});

		if(updatedEvent.allDay) {
			allDay = 1;
		} else {
			allDay = 0;
		}

		let configObject = {
			method:'GET',
			url: "/scripts/updateEvent.php",
			params: {
				id: updatedEvent.id,
				defName: updatedEvent.defName,
				description: updatedEvent.description,
				defColor: updatedEvent.defColor,
				newStart: start.format(),
				newEnd: end.format(),
				allDay: allDay
			}
		};

		this.$http(configObject)
			.then((response) => {
				$("#workspace").fullCalendar( 'refetchEvents' );
				this.$scope.selectedEvent.momentStart = start;
				this.$scope.selectedEvent.momentEnd = end;
				this.loadEventSchedule();
			})
			.catch((response) => console.log(response));
	}

	deleteEvent(){
		var deleteID = this.$scope.selectedEvent.id;
		let configObject = {
			method:'GET',
			url: "/scripts/deleteEvent.php",
			params: {
				id: deleteID
			}
		};

		this.$http(configObject)
			.then((response) => {
				if(this.parents.push() > 0) {
					this.goToParent(this.parents[this.parents.push()-1], this.parents.push()-1);
				} else {
					this.$scope.eventView = false;
					$("#workspace").fullCalendar( 'refetchEvents' );
				}
			})
			.catch((response) => console.log(response));
	}

	innerEvInit(start, end) {

		var time = "00:00";

		var allDay = true;
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

	getRoles(eventID) {
		console.log(eventID);
		let configObject = {
			method:'GET',
			url: "/scripts/getRoles.php",
			params: {
				event: eventID
			}
		};

		this.$http(configObject)
			.then((response) => {
				if (response.data.length > 0) {
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
				} else {
					response.data = [
						{id: null, role: "", assigned: "", personID: null, groupID: null}
					];
				}
				angular.copy(response.data, this.$scope.oldRoles);
				angular.copy(response.data, this.$scope.roles);
			})
			.catch((response) => console.log(response));

	}

	updateRole(role){

		if (role.id == null) {
			this.addRole(role);
		}

		let configObject = {
			method:'GET',
			url: "/scripts/updateRole.php",
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

	deleteRole(role){
		let configObject = {
			method:'GET',
			url: "/scripts/deleteRole.php",
			params: {
				id: role.id
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
				url: "/scripts/addRole.php",
				params: {
					role: role.role,
					event: this.$scope.selectedEvent.id,
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

	areRolesChanged() {
		if (angular.equals(this.$scope.oldRoles, this.$scope.roles)) {
			return false;
		} else {
			return true;
		}
	}

	addEvent(){

		var newEvent = this.$scope.selectedEvent;

		var allDay = newEvent.allDay;
		var defStart = newEvent.defStart;
		var start;
		var end;

		console.log(newEvent.name);
		//różnice w źródłach wydarzeń. Wydarzenia główne/zagnieżdżone
		if (newEvent.parent!=null) {
			start = newEvent.momentStart;
			end = newEvent.momentEnd;
		} else {
			start = moment(newEvent.defStart);
			end = moment(start);
			end.add({days:newEvent.defDur.days,hours:newEvent.defDur.hours,minutes:newEvent.defDur.minutes});
			console.log(start);
		}

		if(newEvent.allDay) {
			allDay = 1;
		} else {
			allDay = 0;
		}

		let configObject = {
			method:'GET',
			url: "/scripts/addEvent.php",
			params: {
				name: newEvent.defName,
				description: newEvent.description,
				color: newEvent.defColor,
				start: start.format(),
				end: end.format(),
				parent: newEvent.parent,
				allDay: allDay
			}
		};
		this.$http(configObject)
			.then((response) => {
				var render = {
					id: response.data,
					title: newEvent.defName,
					description: newEvent.description,
					start: newEvent.momentStart,
					end: newEvent.momentEnd,
					allDay: newEvent.allDay,
					overlap: true,
					color: newEvent.defColor
				};
				if (newEvent.parent==null){
					$('#workspace').fullCalendar('renderEvent', render);
				}
				this.$scope.selectedEvent.id = response.data;
				this.getPeople();
				this.getRoles(response.data);
				this.loadEventSchedule();
			})
			.catch((response) => console.log(response));

	}

	addEventFromTemplate(newEvent, calendarHtmlID) {
		//różnice w źródłach wydarzeń. Wydarzenia główne/zagnieżdżone
		var allDay = newEvent.allDay;
		var defStart = newEvent.defStart;
		var start = newEvent.momentStart;
		var end = newEvent.momentEnd;

		if(newEvent.allDay) {
			allDay = 1;
		} else {
			allDay = 0;
		}

		let configObject = {
			method:'GET',
			url: "/scripts/addEvent.php",
			params: {
				name: newEvent.name,
				description: newEvent.description,
				color: newEvent.color,
				start: start.format(),
				end: end.format(),
				parent: newEvent.parent,
				allDay: allDay
			}
		};
		this.$http(configObject)
			.then((response) => {
				this.importNested(newEvent, response.data, calendarHtmlID, (newEvent, id, calendarHtmlID) => {
					var render = {
						id: response.data,
						title: newEvent.name,
						description: newEvent.description,
						start: newEvent.momentStart,
						end: newEvent.momentEnd,
						allDay: newEvent.allDay,
						overlap: true,
						color: newEvent.color
					};
					$(calendarHtmlID).fullCalendar('renderEvent', render);
				});
			})
			.catch((response) => console.log(response));
	}

	importNested(templateBasedEvent, newEventID, calendarHtmlID,_callback) {

		let configObject = {
			method:'GET',
			url: "/scripts/importNested.php",
			params: {
				eventID: newEventID,
				template: templateBasedEvent.id
			}
		};
		var newEvent = templateBasedEvent;
		this.$http(configObject)
			.then((response) => {
				_callback(newEvent, newEventID, calendarHtmlID);
			})
			.catch((response) => console.log(response));
	}

	dayViewLoad(date){

		$('#workspace').fullCalendar('changeView', 'agendaDay');
		$('#workspace').fullCalendar('gotoDate', date);

	}

	jQueryFormat(){
		$("#workspace .fc-header-toolbar").css("background-color", "rgb(63,81,181)");
		$("#workspace .fc-header-toolbar").css("color", "rgba(255,255,255,0.87)");
		$("#workspace .fc-header-toolbar").css("margin-bottom", "0px");
		$("#workspace .fc-header-toolbar").css("padding", "8px");
		$("#workspace .fc-day-header").css("background-color", "rgb(63,81,181)");
		$("#workspace .fc-day-header").css("color", "rgba(255,255,255,0.87)");
		$("#workspace .fc-day-header").css("padding", "4px");

		$("#workspace .fc-widget-content").addClass("ripple");
		$("#workspace .fc-day").addClass("ripple");
		$("#workspace .fc-day").addClass("dayHover");

	}

	rippleEffect(e){
		var element, parent, ink, d, x, y;

		element = $(e.target);
		parent = $(e.target).closest(".ripple");
		//create .ink element if it doesn't exist
		if(element.find(".ink").length == 0)
			element.append("<span class='ink'></span>");

		ink = element.find(".ink");
		//incase of quick double clicks stop the previous animation
		$(".animate").removeClass("animate");

		//set size of .ink
		if(!ink.height() && !ink.width())
		{
			//use parent's width or height whichever is larger for the diameter to make a circle which can cover the entire element.
			d = Math.max(parent.outerWidth(), parent.outerHeight());
			ink.css({height: d, width: d});
		}

		//get click coordinates
		//logic = click coordinates relative to page - parent's position relative to page - half of self height/width to make it controllable from the center;

		x = e.pageX - element.parent().offset().left - ink.width()/2;
		y = e.pageY - element.parent().offset().top - ink.height()/2;


		//set the position and add class .animate
		ink.css({top: y+'px', left: x+'px'}).addClass("animate");

		setTimeout(() => {
			$(".animate").removeClass("animate");
		}, 400);

	}

}

export default CalendarCtrl;
