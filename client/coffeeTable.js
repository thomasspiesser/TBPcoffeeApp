Template.coffeeTable.helpers({
	users: function () {
		var users = Meteor.users.find().fetch();
		users = _.filter(users, function(user){ return user.emails[0].address != 'admin@admin.com';});
		var sortedUsers = _.sortBy(users, function (user) {return -user.profile.espresso.length -user.profile.cappuccino.length} ) // FIXME: sort users according to current month
		return sortedUsers;
	},
	getMonthYear: function () {
		var currentMonth = new Date().getMonth();
		var currentYear = new Date().getFullYear();
		var monthArray=new Array("January","February","March",
			"April","May","June","July","August","September",
			"October","November","December");
		return monthArray[currentMonth]+" "+currentYear;
	},
	getCoffeeCount: function () {
		var currentMonth = new Date().getMonth();
		var espressoCount = _.filter(this.profile.espresso, function(date){ return date.getMonth() == currentMonth; }).length;
		var cappuccinoCount = _.filter(this.profile.cappuccino, function(date){ return date.getMonth() == currentMonth; }).length;
		return {espresso:espressoCount, cappuccino:cappuccinoCount};
	},
	getAccount: function () {
		var espressoAmount = this.profile.espresso.length * 0.3; // FIXME: get price from DB
		var cappuccinoAmount = this.profile.cappuccino.length * 0.4; // FIXME: get price from DB
		var creditArray = _.pluck(this.profile.account, 'amount');
		var account = - espressoAmount - cappuccinoAmount;
		for (var i = 0; i < creditArray.length; i++) {
			account += creditArray[i];
		};
		return account.toFixed(2);
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