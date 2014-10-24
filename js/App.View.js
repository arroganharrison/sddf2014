var appView = Backbone.View.extend({
	el: "#app",
	initialize: function() {
		$('body').keyup(this.swipe);
		app.people.fetch();
		
	},
	
	events: {
	'click #have-swipes': 'swipeScreen',
	'click #need-swipes': 'waitScreen',
	'keyup window': 'swipe',
	'click #cancel-search': 'waitScreen'
	},

	swipeScreen: function() {
		
		
		var personView = new app.PersonView({model: app.people.first()})
		$(this.el).html(personView.render().el)
	},

	swipe: function(e) {
		if (!(e.which == 37) && !(e.which == 39)) {
			return
		}
		else if (e.which == 37) {
			app.people.shift();
			app.appView.swipeScreen();
		}
		else if (e.which == 39) {
			$("#app").html(app.people.first().attributes.phoneNumber);
			console.log(app.people.first().attributes.phoneNumber);
		}
	},

	waitScreen: function() {
    		$('#wait').toggle();
    		$('#main').toggle();
	}
	
});

app.appView = new appView();

app.appView.swipeScreen();

app.appView.waitScreen();
