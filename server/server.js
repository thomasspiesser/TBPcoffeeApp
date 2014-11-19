Meteor.startup(function () {
	if ( Meteor.users.find().count() === 0 ) {
		var user = Accounts.createUser({
			email: 'admin@admin.com',
			password: 'asdfasdf',
			profile: {
				name: 'Admin'
			}
		});
		Roles.addUsersToRoles(user, ['admin']);
	}
});

Meteor.publish('TBPCoffeeCollection', 
	function () {
		return Meteor.users.find({ }, { emails:0, profile: 1});
	} 
);