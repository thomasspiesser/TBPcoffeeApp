var _ = lodash;

Template.diagram.rendered = function () {
	var data = collectBarDataMonth();
	plotStackedMultibar(data); 
}

function collectBarDataMonth () {

	var users = Meteor.users.find().fetch();
	users = _.filter(users, function(user){ return user.emails[0].address != 'admin@admin.com'; });
	var sortedUsers = _.sortBy(users, function (user) {return -user.profile.espresso.length -user.profile.cappuccino.length} )
	var monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];

	// collect all coffee dates in one array
	var coffee = [];
	var consumers = [];
	for (var i = 0; i < sortedUsers.length; i++) {
		var user = sortedUsers[i];	
		coffee = coffee.concat(user.profile.espresso);
		coffee = coffee.concat(user.profile.cappuccino);
		if (user.profile.espresso.length > 0 | user.profile.cappuccino.length > 0) {
			consumers.push(user);
		}
	}

	// find all year month combinations where data exists
	var yearMonth = {};
	for (var i in coffee) {
		var year = coffee[i].getFullYear();
		var month = coffee[i].getMonth();
		if (yearMonth.hasOwnProperty(year)) {
			yearMonth[year].push(month);
		}
		else {
			yearMonth[year] = [];
			yearMonth[year].push(month);
		}
	}
	var count = 0;
	for (var y in yearMonth) {
		yearMonth[y] = _.uniq(yearMonth[y])
		count += yearMonth[y].length;
	}

	// collect the data in the right format for a nvd3 multibar stacked plot
	var coffeeData = [];
	var colors = randomColor({hue: 'blue', count: count});
	
	// iterate over all years and month
	var l = 0;
	for (var year in yearMonth) {
		if (yearMonth.hasOwnProperty(year)) {
			var month = yearMonth[year];
			for (var k = 0; k < month.length; k++) {		
				coffeeData[l] = {
					key: monthNames[month[k]]+" "+year,
					color: colors[l],
					values: []
				}
				l++;
			}
		}
	}

	// iterate over all consumers
	for (var i = 0; i < consumers.length; i++) {
		var user = consumers[i];
		var l = 0;
		for (var year in yearMonth) {
			if (yearMonth.hasOwnProperty(year)) {
				var month = yearMonth[year];
				for (var k = 0; k < month.length; k++) {
					var coffee = _.filter(user.profile.espresso, function(date){return date.getFullYear() == year && date.getMonth() == month[k]}).length;
					coffee += _.filter(user.profile.cappuccino, function(date){return date.getFullYear() == year && date.getMonth() == month[k]}).length;
					var userData = {
						name: user.profile.name,
						coffee: coffee
					}
					coffeeData[l].values.push(userData);
					l++;
				}
			}
		}
	}

	return coffeeData;
}

function plotStackedMultibar(data) {  
	if (data.length > 0){
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
	}
}
