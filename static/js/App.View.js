var appView = Backbone.View.extend({
	el: "#app",
	initialize: function() {
		$('body').keyup(this.swipe);
		app.people.reset();
		//app.users = $.ajax("/users");
		app.currentUser = new app.Person();
		console.log(app.currentUser);
		console.log(app.currentUser.toJSON());
		//$.ajax(app.currentUser.url, {"type": "POST", "data": app.currentUser.toJSON()});
		app.people.add(app.currentUser);
		
		
	},

	/*
		Mapping of events to functions
	*/

	events: {
	'click #have-swipes': 'swipeScreen',
	'click #need-swipes': 'waitScreen',
	'click #create-login' : 'createLogin',
	'keyup window': 'swipe',
	'click #cancel-search': 'initialize',
	'keypress .chat' : 'sendMessage',
	'click #star1' : 'sendRating1',
	'click #star2' : 'sendRating2',
	'click #star3' : 'sendRating3',
	'click #star4' : 'sendRating4',
	'click #star5' : 'sendRating5'
	},

	/*
		Request all users from server, adds them to frontend array representation
	*/

	getUsers: function() {
		var rawUsers = $.ajax("/users");
		rawUsers.done(function (data) {
			users = data.slice(2, data.length-2)
			users = users.split("\', \'");
			var people = [];
			for (var i = 0; i < users.length; i++) {
				console.log(users[i]);
				var personModel = new app.Person(JSON.parse(users[i]));
				people.push(personModel);
			}
			console.log(people);
		app.people.add(people);
		console.log(app.people);
		app.appView.swipeScreen();
		});
		
	},

	/*
		Logs in or creates new user, see "login" server class
	*/

	createLogin: function() {
		var checklogin = $.ajax("/login", {"type": "POST", "data": {"username": $("#username-input").val(), "password": $("#password-input").val()}, "picureURL": $("#picture-input").val()});
		checklogin.done(function(data){
			console.log(data);
			if(data != 'new-user' && data != 'false'){
				app.currentUser.set({"userID" : data});
				$('#need-have-screen').show();
				$('#main').hide();
			}
			else if (data == 'new-user') {
				app.currentUser.set({"name" : $("#username-input").val(), "password" : $("#password-input").val(), "picureURL" : $("#picture-input").val()});
				$.ajax("/users", {"type" : "POST", "data": app.currentUser.toJSON()});
				$('#need-have-screen').show();
				$('#main').hide();
			}
			else { 
					alert("Incorrect Username/Password!");
			}
		});
	},

	/*
		Renders new person on UI for users who are offering swipes
	*/

	swipeScreen: function() {
		$.ajax("/hungry", {"type": "POST", "data": {"userID": app.currentUser.attributes.userID, "hungry": "false"}});

		console.log("People collection: " + app.people);
		
		console.log(app.people.first());
		var personView = new app.PersonView({model: app.people.first()})

		$(this.el).html(personView.render().el)
	},

	/*
		Handles the swipe event, will either display a new user using swipeScreen() 
		or match a user and allow communication and rating between the two
	*/

	swipe: function(e) {
		if (!(e.which == 37) && !(e.which == 39)) {
			return
		}
		else if (e.which == 37) {
			
			app.people.shift();
			if (app.people.isEmpty()) {
				console.log("EMPTY");
				app.appView.getUsers();
			}
			else {
				app.appView.swipeScreen();
			}
		}
		else if (e.which == 39) {

			$.ajax("/match", {"type": "POST", "data": {"userID": app.currentUser.attributes.userID, "matchID": app.people.first().attributes.userID}});
			app.currentUser.set({"matchID": app.people.first().attributes.userID});
			//var personView = new app.PersonView({model: app.people.first()})
			//$("#app").html(app.people.first().attributes.phoneNumber + " " + app.people.first().attributes.userID);
			
			//$(".chat").show();
			//console.log(app.people.first().attributes.phoneNumber);
			app.appView.getMessage();
		}
	},

	/*
		Sends a message to the matched user, see "chat" server class
	*/

	sendMessage: function(e) {
		if (e.which == 13) {
			var message = $(".chatBox").val();
			app.currentUser.sendMessage(message, app.currentUser.attributes.matchID)
			$(".chatWindow").append("<div class='chat chatMessage'>" + 
									app.currentUser.get("name") + " " + message +
									"</div>");
		}
	},

	/*
		Polls every second for new chat messages, see "chat" server class
	*/

	getMessage: function() {
		setTimeout(function() {
			var messages = $.ajax("/chat", {"data": {"userID": app.currentUser.attributes.userID}});
			messages.done(function( data ) {
				//data = JSON.parse( data );
				console.log(data);
				if (data != "[]") {
					data = data.slice(1,data.length-1).split(",");
					for (var i = 0; i < data.length; i++) {
						$(".chatWindow").append("<div class='chat chatMessage'>" + 
										app.currentUser.get("name") + " " + data[i] +
										"</div>");
					}
				}
				app.appView.getMessage();
			});
		}, 1000);
	},

	/*
		Displays loading widget to a user requesting swipes
		Polls every 5 seconds for a match
	*/
	
	waitScreen: function() {
		$.ajax("/hungry", {"type": "POST", "data": {"userID": app.currentUser.attributes.userID, "hungry" : "true"}});
		setTimeout(function() {
			var rawMatch = $.ajax("/match", {"data": {"userID": app.currentUser.attributes.userID}});
			rawMatch.done(function( data ) {
				console.log(data);
				if (data != "None") {
					var matchPerson = new app.Person(JSON.parse( data ))
					var personView = new app.PersonView({model: matchPerson});
					$("#app").html(personView.render().el);
					app.currentUser.set({"matchID": matchPerson.attributes.userID});
					$.ajax("/hungry", {"type": "POST", "data": {"userID": app.currentUser.attributes.userID, "hungry" : "false"}});
					//$("#app").html(matchPerson.attributes.phoneNumber + " " +matchPerson.attributes.userID);
					app.appView.getMessage();
				}
				else {
					app.appView.waitScreen();
				}
			})
		}, 5000);
		$('#wait').show();
		$('#main').hide();
	},


	/*
		These 5 functions are used to rate users, see "rating" server class
	*/
	sendRating1: function() {
		var numratings = app.people.first().get("numratings");
		numratings++;
		app.people.first().set({"numratings" : numratings});
		$.ajax("/rating", {"type": "POST", "data": {"userID": app.people.first().attributes.userID, "rating": 1, "numratings": numratings}});
	},

	sendRating2: function() {
		var numratings = app.people.first().get("numratings");
		numratings++;
		app.people.first().set({"numratings" : numratings});
		$.ajax("/rating", {"type": "POST", "data": {"userID": app.people.first().attributes.userID, "rating": 2, "numratings": numratings}});
	},

	sendRating3: function() {
		var numratings = app.people.first().get("numratings");
		numratings++;
		app.people.first().set({"numratings" : numratings});
		$.ajax("/rating", {"type": "POST", "data": {"userID": app.people.first().attributes.userID, "rating": 3, "numratings": numratings}});
	},

	sendRating4: function() {
		var numratings = app.people.first().get("numratings");
		numratings++;
		app.people.first().set({"numratings" : numratings});
		$.ajax("/rating", {"type": "POST", "data": {"userID": app.people.first().attributes.userID, "rating": 4, "numratings": numratings}});
	},

	sendRating5: function() {
		var numratings = app.people.first().get("numratings");
		numratings++;
		app.people.first().set({"numratings" : numratings});
		$.ajax("/rating", {"type": "POST", "data": {"userID": app.people.first().attributes.userID, "rating": 5, "numratings": numratings}});
	}
	
});

app.appView = new appView();
