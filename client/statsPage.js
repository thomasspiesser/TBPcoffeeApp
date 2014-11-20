Template.diagram.rendered = function () {
	var coffeeData = {
		key: "Total",
		color: "#4f99b4",
		values: [],
	};
	var users = Meteor.users.find().fetch();
	users = _.filter(users, function(user){ return user.emails[0].address != 'admin@admin.com'; });

	var sortedUsers = _.sortBy(users, function (user) {return -user.profile.espresso.length - user.profile.cappuccino.length} )
	for (var i = 0; i < sortedUsers.length; i++) {
		var user = sortedUsers[i];
		var coffee = user.profile.espresso.length + user.profile.cappuccino.length;
		var name = user.profile.name;

		var userData = {
			name: name,
			coffee: coffee
		};

		coffeeData.values.push(userData);
	};

	nv.addGraph(function() {
		var chart = nv.models.multiBarHorizontalChart()
		.x(function(d) { return d.name })
		.y(function(d) { return d.coffee })
		.margin({top: 20, right: 20, bottom: 50, left: 200})
		.showValues(true)           //Show bar value next to each bar.
		.tooltips(true)             //Show tooltips on hover.
		.transitionDuration(350)
		// .stacked(true)
		.showControls(false);        //Allow user to switch between "Grouped" and "Stacked" mode.

		chart.yAxis
		.tickFormat(d3.format(',.2f'));

		d3.select('#coffeeChart svg')
		.datum([coffeeData])
		.call(chart);

		nv.utils.windowResize(chart.update);

		return chart;
	});
};

