var appView = Backbone.View.extend({
	el: "#app",
	initialize: function() {
		$('body').keyup(this.swipe);
		app.people.reset();
		app.users = $.ajax("/users");
		app.currentUser = new app.Person();
		console.log(app.currentUser);
		console.log(app.currentUser.toJSON());
		//$.ajax(app.currentUser.url, {"type": "POST", "data": app.currentUser.toJSON()});
		app.people.add(app.currentUser);
		
		
	},
	
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

	swipeScreen: function() {

		console.log("People collection: " + app.people);
		
		console.log(app.people.first());
		var personView = new app.PersonView({model: app.people.first()})

		$(this.el).html(personView.render().el)
		$(".phoneNumber").hide();
	},

	swipe: function(e) {
		if (!(e.which == 37) && !(e.which == 39)) {
			return
		}
		else if (e.which == 37) {
			$(".phoneNumber").hide();
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
			$(".phoneNumber").show();
			//$(".chat").show();
			console.log(app.people.first().attributes.phoneNumber);
			app.appView.getMessage();
		}
	},

	sendMessage: function(e) {
		if (e.which == 13) {
			var message = $(".chatBox").val();
			app.currentUser.sendMessage(message, app.currentUser.attributes.matchID)
			$(".chatWindow").append("<div class='chat chatMessage'>" + 
									app.currentUser.get("name") + " " + message +
									"</div>");
		}
	},

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

	waitScreen: function() {
		setTimeout(function() {
			var rawMatch = $.ajax("/match", {"data": {"userID": app.currentUser.attributes.userID}});
			rawMatch.done(function( data ) {
				console.log(data);
				if (data != "None") {
					var matchPerson = new app.Person(JSON.parse( data ))
					var personView = new app.PersonView({model: matchPerson});
					$("#app").html(personView.render().el);
					$(".phoneNumber").show();
					app.currentUser.set({"matchID": matchPerson.attributes.userID});
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

	sendRating1: function() {
		$.ajax("/rating", {"type": "POST", "data": {"userID": app.people.first().attributes.userID, "rating": 1}});
	},

	sendRating2: function() {
		$.ajax("/rating", {"type": "POST", "data": {"userID": app.people.first().attributes.userID, "rating": 2}});
	},

	sendRating3: function() {
		$.ajax("/rating", {"type": "POST", "data": {"userID": app.people.first().attributes.userID, "rating": 3}});
	},

	sendRating4: function() {
		$.ajax("/rating", {"type": "POST", "data": {"userID": app.people.first().attributes.userID, "rating": 4}});
	},

	sendRating5: function() {
		$.ajax("/rating", {"type": "POST", "data": {"userID": app.people.first().attributes.userID, "rating": 5}});
	}
	
});

app.appView = new appView();
