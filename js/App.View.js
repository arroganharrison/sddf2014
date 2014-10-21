var appView = Backbone.View.extend({
	el: "#app",
	initialize: function() {
		
	},

	swipeScreen: function() {
		app.people = new app.PersonList();
		app.people.fetch();
		var personView = new app.PersonView({model: app.temp})
		$("#main").html(personView.render().el)
		//$("#main").html("alkfdjadsf")
		while (!app.people.isEmpty()) {
			$(this.el).html(people[0].render().el)
		}  
	},

	waitScreen: function() {

	}
});

app.appView = new appView();
app.appView.swipeScreen();