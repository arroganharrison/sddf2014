var appView = Backbone.View.extend({
	el: "#app",
	initialize: function() {
		$('body').keyup(this.swipe);
		app.people.reset();
		app.users = $.ajax("/users");
		app.currentUser = new app.Person();
		console.log(app.currentUser);
		console.log(app.currentUser.toJSON());
		$.ajax(app.currentUser.url, {"type": "POST", "data": app.currentUser.toJSON()});
		app.people.add(app.currentUser);
		
		
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
			console.log(users[i]);
			var personModel = new app.Person(JSON.parse(users[i]));
			people.push(personModel);
		}
		app.people.add(people);
	},

	swipeScreen: function() {
		console.log("People collection: " + app.people);
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
			$.ajax("/match", {"type": "POST", "data": {"userID": app.currentUser.attributes.userID, "matchID": app.people.first().attributes.userID}});
			$("#app").html(app.people.first().attributes.phoneNumber + " " + app.people.first().attributes.userID);
			console.log(app.people.first().attributes.phoneNumber);
		}
	},

	waitScreen: function() {
			setTimeout(function() {
				var rawMatch = $.ajax("/match", {"data": {"userID": app.currentUser.attributes.userID}});
				rawMatch.done(function( data ) {
					console.log(data);
					if (data != "None") {
						var matchPerson = new app.Person(JSON.parse( data ))
						$("#app").html(matchPerson.attributes.phoneNumber + " " +matchPerson.attributes.userID);
						return
					}
					else {
						app.appView.waitScreen();
					}
				})
			}, 5000);
    		$('#wait').show();
    		$('#main').hide();
	}
	
});

app.appView = new appView();
