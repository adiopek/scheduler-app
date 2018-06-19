
class HomeCtrl {
	constructor($location) {
		angular.extend(this, {
			$location
		});

		this.loadJQueryScroll();
	}
	loadJQueryScroll(){
		$("#moreInfoBtn").on('click', (event) => {

	      $('html, body').animate({
	        scrollTop: $("#moreInfo").offset().top
	      }, 800, () => {
	      });
	  });
	}

	startInCalendar(){
		this.$location.path('calendar');
	}

}

export default HomeCtrl;
