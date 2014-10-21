

app.Person = Backbone.Model.extend({
	initialize: function() {
		console.log("New Person instatiated.");
		//this.updateGame();
	},
	defaults: {
		name: "John Doe",
		phoneNumber: "000-000-0000",
		year: "SuperSeniorz",
		rating: 5,
		karma: 0
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
		this.model.on('change:rank', this.render, this);
	}
});

app.PersonList = Backbone.Collection.extend({
	model: app.Person,
	localStorage: new Store("robin-food-people")
});

app.temp = new app.Person();