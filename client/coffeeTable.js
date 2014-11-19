Template.coffeeTable.helpers({
	users: function () {
		var users = Meteor.users.find().fetch();
		var sortedUsers = _.sortBy(users, function (user) {return -user.profile.espresso.length - user.profile.cappuccino.length} )
		return sortedUsers
	},
	isAdmin: function () {
		return this.emails[0].address === 'admin@admin.com' ? true : false;
	},
	getAccount: function () {
		var espressoAmount = this.profile.espresso.length * 0.4; // FIXME: get price from DB
		var cappuccinoAmount = this.profile.cappuccino.length * 0.5; // FIXME: get price from DB
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