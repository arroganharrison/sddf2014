var appView = Backbone.View.extend({
	el: "#app",
	initialize: function() {
		$('body').keyup(this.swipe);
		app.people.reset();
		app.users = $.ajax("/users");
		app.currentUser = new app.Person();
		
		
	},
	
	events: {
	'click #have-swipes': 'swipeScreen',
	'click #need-swipes': 'waitScreen',
	'keyup window': 'swipe',
	'click #cancel-search': 'waitScreen'
	},

	getUsers: function() {
		var users = app.users.responseText.slice(2, app.users.responseText.length-2);
		users = users.split("\', \'");
		var people = [];
		for (var i = 0; i < users.length; i++) {
			var personModel = new app.Person(JSON.parse(users[i]));
			people.push(personModel);
		}
		app.people.add(people);
	},

	swipeScreen: function() {
		if (app.people.isEmpty()) {
			this.getUsers();
		}
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
			$.ajax("/match", {"type": "POST", "data": app.people.first().attributes.userID})
			$("#app").html(app.people.first().attributes.phoneNumber);
			console.log(app.people.first().attributes.phoneNumber);
		}
	},

	waitScreen: function() {
			setTimeout(function() {
				var rawMatch = $.ajax("/match");
				rawMatch.done(function( data ) {
					if (data) {
						var matchPerson = new app.Person(JSON.parse( data ))
						$("#app").html(app.people.first().attributes.phoneNumber);
					}
				})
			}, 5000);
    		$('#wait').toggle();
    		$('#main').toggle();
	}
	
});

app.appView = new appView();
