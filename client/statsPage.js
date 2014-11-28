Template.diagram.rendered = function () {
	var data = collectData();
  visualizeData(data); 
};

function collectData () {
	var coffeeData = [];
	coffeeData[0] = {
		key: "Cappuccino",
		color: "#4f99b4",
		values: [],
	};
	coffeeData[1] = {
		key: "Espresso",
		color: "#d67777",
		values: [],
	};
	
	var users = Meteor.users.find().fetch();
	users = _.filter(users, function(user){ return user.emails[0].address != 'admin@admin.com'; });
	
	var sortedUsers = _.sortBy(users, function (user) {return -user.profile.espresso.length -user.profile.cappuccino.length} )
	
	for (var i = 0; i < sortedUsers.length; i++) {
		var user = sortedUsers[i];
		var userData = {
			name: user.profile.name,
			coffee: user.profile.cappuccino.length
		};
		coffeeData[0].values.push(userData);
	};

	for (var i = 0; i < sortedUsers.length; i++) {
		var user = sortedUsers[i];
		var userData = {
			name: user.profile.name,
			coffee: user.profile.espresso.length
		};
		coffeeData[1].values.push(userData);
	};
	return coffeeData;
};

function visualizeData(data) {  
	nv.addGraph(function() {
		// var width = 800
		var height = 70+ 40*data[0].values.length;
		var chart = nv.models.multiBarHorizontalChart()
		.x(function(d) { return d.name })
		.y(function(d) { return d.coffee })
		.margin({top: 20, right: 20, bottom: 20, left: 120})
		.showValues(true)           //Show bar value next to each bar.
		.tooltips(true)             //Show tooltips on hover.
		.transitionDuration(350)
		.stacked(true)
		.showControls(true)        //Allow user to switch between "Grouped" and "Stacked" mode.
		// .width(width)
		.height(height);
		
		chart.yAxis
		.tickFormat(d3.format(',f'));

		d3.select('#coffeeChart svg')
		.datum(data)
		.call(chart) 
		// .attr('width', width)
		.attr('height', height);
		console.log(height)

		nv.utils.windowResize(chart.update);

		return chart;
	});
};
