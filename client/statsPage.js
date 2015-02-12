var _ = lodash;

Template.diagram.rendered = function () {
	var data = collectBarDataMonth();
  plotStackedMultibar(data); 
};

function collectBarData () {
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

function collectBarDataMonth () {
	
	var users = Meteor.users.find().fetch();
	users = _.filter(users, function(user){ return user.emails[0].address != 'admin@admin.com'; });
	var sortedUsers = _.sortBy(users, function (user) {return -user.profile.espresso.length -user.profile.cappuccino.length} )
	
	/// collect coffee per Month
	var monthArray = [0,1,2,3,4,5,6,7,8,9,10,11];
	var yearArray = [2013,2014,2015,2016,2017,2018,2019];
	var monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];

	// collect all coffee dates in one array
	var coffee = []
	for (var i = 0; i < sortedUsers.length; i++) {
		var user = sortedUsers[i];	
		coffee = coffee.concat(user.profile.espresso);
		coffee = coffee.concat(user.profile.cappuccino);
	};
	
	var years = {};
	var count = 0;
	// find years 
	for (var i = 0; i < yearArray.length; i++) {
		var yearCount = _.filter(coffee, function (date) {return date.getFullYear() == yearArray[i]}).length;
		if (yearCount > 0) {
			var month = [];
			// find month
			for (var j = 0; j < monthArray.length; j++) {
				var monthCount = _.filter(coffee, function (date) {return date.getFullYear() == yearArray[i] && date.getMonth() == monthArray[j]}).length;
				if (monthCount > 0) {
					month.push(monthArray[j])
					count ++
				};
			};
			// write year and month to object
			years[yearArray[i]] = month
		};
	};

	var coffeeData = [];
	var colors = randomColor({hue: 'blue', count: count});
	
	var l = 0;
	for (var year in years) {
		if (years.hasOwnProperty(year)) {
			var month = years[year];
			for (var k = 0; k < month.length; k++) {		
				coffeeData[l] = {
					key: monthNames[k]+" "+year,
					color: colors[l],
					values: []
				}
				l++;
			}
		};
	};

	for (var i = 0; i < sortedUsers.length; i++) {
		var user = sortedUsers[i];
		var l = 0;
		for (var year in years) {
			if (years.hasOwnProperty(year)) {
				var month = years[year];
				for (var k = 0; k < month.length; k++) {
					var coffee = _.filter(user.profile.espresso, function(date){return date.getFullYear() == year && date.getMonth() == month[k]}).length;
					coffee += _.filter(user.profile.cappuccino, function(date){return date.getFullYear() == year && date.getMonth() == month[k]}).length;
					var userData = {
						name: user.profile.name,
						coffee: coffee
					};
					coffeeData[l].values.push(userData);
					l++;
				}
			};
		}
	};

	return coffeeData;
};

function plotStackedMultibar(data) {  
	nv.addGraph(function() {
		var margin = {top: 30, right: 0, bottom: 30, left: 150},
	    width = $(window).width() -margin.left -margin.right,
	    height = 40*data[0].values.length;// -margin.top -margin.bottom;
		
		var chart = nv.models.multiBarHorizontalChart()
		.x(function(d) { return d.name })
		.y(function(d) { return d.coffee })
		.margin(margin)
		.showValues(true)           //Show bar value next to each bar.
		.tooltips(true)             //Show tooltips on hover.
		.stacked(true)
		.showControls(true)        //Allow user to switch between "Grouped" and "Stacked" mode.
		.width(width)
		.height(height);
		
		chart.yAxis
		.tickFormat(d3.format(',f'));

		d3.select('#coffeeChart svg')
		.datum(data)		
		.transition().duration(500)
		.attr('height', height)
		.attr('width', width)
		.call(chart); 

		nv.utils.windowResize(chart.update);

		return chart;
	});
};
