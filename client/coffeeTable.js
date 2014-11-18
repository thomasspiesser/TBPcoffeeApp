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
		var account = 0;
		for (var i = this.profile.account.length - 1; i >= 0; i--) {
			account += this.profile.account[i]["amount"];
		};
		return account;
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
		Session.set("addMoneyUser", this._id);
	}
});