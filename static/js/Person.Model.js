

app.Person = Backbone.Model.extend({
	url: "/users",
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
		if (this.userID == null) {
			this.userID = this.generateUUID();
		}
	},
	defaults: {
		name: "John Doe",
		phoneNumber: "000-000-0000",
		year: "SuperSeniorz",
		rating: 5,
		karma: 0,
		userID: null
	}

});

app.PersonView = Backbone.View.extend({
	
	tagName: "div",
	className: "feed-holder",
	
	template: _.template(
		'<span class="thumbnail"> </span>'+
		'<span class="name feed"><%= name %></a></span> &emsp;' +
		'<span class="year feed"><%= year %></span> &emsp;' +
		'<span class="rating feed"><%= rating %></span>'
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
for (var i = 0; i < 10; i++) {
	//app.people.create({year: i});
	var tmp = new app.Person({year: i});
	$.ajax(tmp.url, {"type": "POST", "data": tmp.toJSON() })
}
console.log(app.people);
