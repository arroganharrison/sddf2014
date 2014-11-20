

app.Person = Backbone.Model.extend({
	url: "/users",
	chatUrl: "/chat",
	generateUUID: function() {
		var d = new Date().getTime();
		var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = (d + Math.random()*16)%16 | 0;
			d = Math.floor(d/16);
			return (c=='x' ? r : (r&0x7|0x8)).toString(16);
		});
		return uuid;
	},
	initialize: function() {
		console.log("New Person instatiated.");
		if (this.attributes.userID == null) {
			this.attributes.userID = this.generateUUID();
			console.log(this.attributes.userID);
		}
	},
	sendMessage: function(message, matchID) {

		$.ajax(this.chatUrl, {"type" : "POST", "data": { "message":  message , "userID" : this.attributes.userID , "matchID" : matchID }});
	},
	defaults: {
		name: "John Doe",
		password: null,
		phoneNumber: "000-000-0000",
		year: "Superseniorz",
		rating: 5,
		karma: 0,
		userID: null,
		picureURL: null
	}

});

app.PersonView = Backbone.View.extend({
	
	tagName: "div",
	className: "person-div",
	
	template: _.template(
		'<div class="center">' +
		'  <img src="<%= picureURL %>" class="thumbnail" width="300" height="300" />' +
		'  <div class="name"><%= name %></a></div>' +
		'  <div class="year"><%= year %></div>' +
		'  <div class="rating_label"> <%= rating %></div>' +
		'  <div class="rating">Rating:' +
		'    <span id="star1"><%= rating >= 1 ? ☆ : ★ %></span>' +
		'    <span id="star2"><%= rating >= 2 ? ☆ : ★ %></span>' +
		'    <span id="star3"><%= rating >= 3 ? ☆ : ★ %></span>' +
		'    <span id="star4"><%= rating >= 4 ? ☆ : ★ %></span>' +
		'    <span id="star5"><%= rating == 5 ? ☆ : ★ %></span>' +
		'  </div>' +
		'  <div class="userID"><%= userID %></div>' +
		'  <div class="phoneNumber style="display:none"><%= phoneNumber %></div>' +
		'  <div class="chat chatWindow"></div>' +
		'  <input type="text" class="chat chatBox"</input>' + 
		'</div>'
		),

	events: {
		'click .vote': 'upRank',
	},

	render: function() {
		this.$el.html(this.template(this.model.toJSON()));
        return this;
	},

	initialize: function() {
		//this.model.on('change:rank', this.render, this);
	}
});

app.PersonList = Backbone.Collection.extend({
	model: app.Person,
	url: "/users"
	//localStorage: new Store("robin-food-people")
});

app.people = new app.PersonList();
// for (var i = 0; i < 10; i++) {
// 	//app.people.create({year: i});
// 	var tmp = new app.Person({year: i});
// 	$.ajax(tmp.url, {"type": "POST", "data": tmp.toJSON() })
// }
console.log(app.people);
