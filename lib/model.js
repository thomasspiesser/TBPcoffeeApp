Meteor.users.allow({
	insert: function (userId, doc) {
		return Roles.userIsInRole(userId, ['admin']);
	},
	update: function (userId, doc, fields, modifier) {
		return true
	},
	remove: function (userId, doc) {
		return Roles.userIsInRole(userId, ['admin']);
	}
});

Meteor.methods({
	createConsumer: function (options) {
		options = _.extend({ password: 'TPBMember' }, options)
		var user = Accounts.createUser(options);
		return user;
	}
});