trimInput = function(val) {
	return val.replace(/^\s*|\s*$/g, "");
}

Template.adminTemplate.helpers({
	// check if user is an admin
	isAdminUser: function () {
		return Roles.userIsInRole(Meteor.user(), ['admin']);
	}
});

Template.adminCreateUser.events({
	'click #createUserButton': function (event, template) {
		var email = template.find('#account-email').value;
		var name = template.find('#name').value;
		var email = trimInput(email);
		var options = {
			email: email,
			profile: {
				name: name,
				cappuccino: [],
				espresso: [],
				account: []
			}
		};
		Meteor.call('createConsumer', options, function (error, result) {
			if (error){
				alert(error.reason + '\n' + error.detail);
			} else {
				console.log(result);
			}
		});
		return false;
	}
});