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
	'click #create-login' : 'createLogin',
	'keyup window': 'swipe',
	'click #cancel-search': 'initialize',
	'keypress .chat' : 'sendMessage'
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
		var check-login = $.ajax("/login-page",{"type": "POST", "data": {"username":username-input, "password":password-input}});
		check-login.done(function(data)){
		console.log(data);
		if(data == 'true'){
			$('#need-have-screen').show();
			$('#main').hide();
		} else { 
				alert("Incorrect Username/Password!");
			}
		}
	}

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
	}
	
});

app.appView = new appView();
