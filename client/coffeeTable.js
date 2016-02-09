var _ = lodash;

/*
Template.coffeeTable.rendered = function () {
	$.fn.snow({
		minSize: 5, // Minimumsize of the snowflake (px)
		maxSize: 35, // Maximum size of the snowflake (px)
		newOn: 250, // Frequency they fall (ms)
		flakeColor: '#000' // Colour of the snowflake
	});
}
*/

Template.coffeeTable.helpers({
	users: function () {
		var users = getUsers();
		var sortedUsers = _.sortBy(users, function (user) {
			return -(_.filter(user.profile.espresso, function(date){return (date.getMonth() == new Date().getMonth()) && (date.getFullYear() == new Date().getFullYear())}).length 
				+_.filter(user.profile.cappuccino, function(date){return (date.getMonth() == new Date().getMonth()) && (date.getFullYear() == new Date().getFullYear())}).length)
		});
		sortedUsers.map(function(user, index, cursor) {
			user._index = index+1;
			return user;
		})
		return sortedUsers;
	},
	getMonthYear: function () {
		var monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
		return monthNames[new Date().getMonth()]+" "+new Date().getFullYear();
	},
	getCoffeeCount: function () {
		var espressoCount = _.filter(this.profile.espresso, function(date){ return (date.getMonth() == new Date().getMonth()) && (date.getFullYear() == new Date().getFullYear()); }).length;
		var cappuccinoCount = _.filter(this.profile.cappuccino, function(date){ return (date.getMonth() == new Date().getMonth()) && (date.getFullYear() == new Date().getFullYear()); }).length;
		return {espresso:espressoCount, cappuccino:cappuccinoCount}
	},
	getAccount: function () {
		var espressoAmount = this.profile.espresso.length * 0.3; // FIXME: get price from DB
		var cappuccinoAmount = this.profile.cappuccino.length * 0.4; // FIXME: get price from DB
		var creditArray = _.mapValues(this.profile.account, 'amount');
		var account = - espressoAmount - cappuccinoAmount;
		for (var i = 0; i < _.size(creditArray); i++) {
			account += creditArray[i];
		}
		return account.toFixed(2);
	},
	setAccountColor: function () {
		var espressoAmount = this.profile.espresso.length * 0.3; // FIXME: get price from DB
		var cappuccinoAmount = this.profile.cappuccino.length * 0.4; // FIXME: get price from DB
		var creditArray = _.mapValues(this.profile.account, 'amount');
		var account = - espressoAmount - cappuccinoAmount;
		for (var i = 0; i < _.size(creditArray); i++) {
			account += creditArray[i];
		}
		return account >= 0 ? "black": "red";
	},
	getTotalCount: function () {
		var users = getUsers();
		var totalCount = 0;
		for(var i = 0; i < users.length; i++) {
			totalCount = totalCount + users[i].profile.espresso.length + users[i].profile.cappuccino.length;
		}
		return totalCount;
	},
	getMonthlyCount: function () {
		var users = getUsers();
		var monthlyCount = 0;
		for(var i = 0; i < users.length; i++) {
            monthlyCount += _.filter(users[i].profile.espresso,
					function(date){
						return (date.getMonth() == new Date().getMonth()) && (date.getFullYear() == new Date().getFullYear());
					}).length
				+ _.filter(users[i].profile.cappuccino, function(date){
					return (date.getMonth() == new Date().getMonth()) && (date.getFullYear() == new Date().getFullYear()); }).length;
		}
		return monthlyCount;
	},
	getAchievements: function() {
		// Emojis from http://emojione.com/demo/
		var achievements = "";
        var coffee_today = _.filter(this.profile.espresso,
                function(date){
                    return (date.getDate() == new Date().getDate() &&
					date.getYear() == new Date().getYear() &&
						date.getMonth() == new Date().getMonth()); }).length +
            _.filter(this.profile.cappuccino,
                function(date){
                    return (date.getDate() == new Date().getDate()) &&
						date.getYear() == new Date().getYear() &&
						date.getMonth() == new Date().getMonth(); }).length;
		var user_total = this.profile.espresso.length + this.profile.cappuccino.length;

		if(user_total >= 1000) achievements += ":trophy:"
        if(user_total >= 500) achievements += ":medal:";
        if(user_total >= 250) achievements += ":military_medal:";
        if(user_total >= 100) achievements += ":star:";
        if(user_total < 10) achievements += ":baby_tone1:";
        if(coffee_today > 0) achievements += ":coffee:";

		return achievements;
	}
});

Template.coffeeTable.events({
	'click .coffeeBtn': function (event, template) {
		var buttonName = event.target.name;
		var coffeetype = "profile." + buttonName;
		var id = this._id;
		var name = Meteor.users.findOne( id ).profile.name;
		var obj = {};
		bootbox.confirm('You just ordered one <b>' + buttonName + '</b> for <b>' + name + '</b>.\nIs that correct?', function(result){
			if (result) {
				var consumedAt = new Date();
				obj[coffeetype] = consumedAt;
				Meteor.users.update(id, {$push: obj});
			}
		});
	},
	'click .accountBtn': function(event, template) {
		$("#changeAccountModal").modal("show");
		Session.set("changeAccountUser", this._id);
	}
});

getUsers = function () {
	var users = Meteor.users.find( {$where: function() { return true;} } ).fetch();
	return _.filter(users, function(user){ return user.emails[0].address != 'admin@admin.com';});
};