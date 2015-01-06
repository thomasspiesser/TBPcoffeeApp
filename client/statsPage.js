Template.diagram.rendered = function () {
	var data = collectBarData();
  plotStackedMultibar(data); 
};

Template.diagram2.rendered = function () {
	var data = collectLineData();
  plotLines(data); 
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


function collectLineData () {
	var users = Meteor.users.find().fetch();
	users = _.filter(users, function(user){ return user.emails[0].address != 'admin@admin.com'; });
	var sortedUsers = _.sortBy(users, function (user) {return -user.profile.espresso.length -user.profile.cappuccino.length} )	
	var colors = randomColor({hue: 'blue', count: users.length});
	var coffeeCounts = [];
	for (var i = 0; i < sortedUsers.length; i++) {
		var user = sortedUsers[i];
		var cappuccino = user.profile.cappuccino;
		var espresso = user.profile.espresso;
		var coffee = [];
		coffee = coffee.concat(espresso);
		coffee = coffee.concat(cappuccino);
		var coffeeArray = getCountsPerDay(coffee);
		var obj = {
      values: coffeeArray,
      key: user.profile.name,
      color: colors[i]
    };
		coffeeCounts.push(obj);
	}
	return coffeeCounts;
};


function getCountsPerDay (arr) {
	var results = {}, rarr = [], i;

	for (i=0; i<arr.length; i++) {
	  // get the date
	  var date = Date.UTC(arr[i].getFullYear(),arr[i].getMonth(),arr[i].getDate());
	  // var date = new Date(arr[i].getFullYear(),arr[i].getMonth(),arr[i].getDate(),0,0,0);
	  results[date] = results[date] || 0;
	  results[date]++;
	}
	// convert it into an array of objects
	var obj = {};
	for (i in results) {
	  if (results.hasOwnProperty(i)) {
	  	obj = {x: parseFloat(i), y: results[i]};
	    rarr.push(obj);
	  }
	};
	// sort by date
	rarr = _.sortBy(rarr, function (obj) {return obj.x});
	return rarr;
};


function plotStackedMultibar(data) {  
	nv.addGraph(function() {
		// var width = 800
		var margin = {top: 20, right: 20, bottom: 30, left: 50},
    // width = 960 - margin.left - margin.right,
    height = 40*data[0].values.length + margin.top + margin.bottom;
		
		var chart = nv.models.multiBarHorizontalChart()
		.x(function(d) { return d.name })
		.y(function(d) { return d.coffee })
		.margin(margin)
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
		.attr('height', height + margin.top + margin.bottom)
		.call(chart); 

		nv.utils.windowResize(chart.update);

		return chart;
	});
};

function plotLines(data) {  
	nv.addGraph(function() {
		var margin = {top: 20, right: 50, bottom: 30, left: 50},
    // width = 960 - margin.left - margin.right,
    height = 600 - margin.left - margin.right;

	  var chart = nv.models.lineChart()
	  // .useInteractiveGuideline(true)
		.margin(margin)
		.height(height);

  chart.xAxis
    .tickFormat(function(d) {
      return d3.time.format("%d.%m.%y")(new Date(d))
    });

	  chart.yAxis
	      .tickFormat(d3.format('d'));

	  d3.select('#coffeeChart2 svg')
	      .datum(data)
	      .transition().duration(500)
    		.attr('height', height)
	      .call(chart);

	  nv.utils.windowResize(chart.update);

	  return chart;
	});
};
