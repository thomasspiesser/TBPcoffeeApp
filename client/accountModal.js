Template.changeAccountModal.events({
	'click #radioInput': function (event, template) {
		template.$('input').focus();       
	},
	'keypress .accountForm': function (event, template) {
		if(event.key == "Enter") {
			saveAccountChanges(event, template);
			$("#changeAccountModal").modal("hide");
			return false;
		}
	},
	'click #saveAccount': function (event, template) {
		saveAccountChanges(event, template);
		return false;
	}
});

Template.changeAccountModal.helpers({
	user: function () {
		var user = Meteor.users.findOne( Session.get("changeAccountUser") );
		if (typeof(user) !== 'undefined') {
			return user.profile.name;
		}
	}
});

saveAccountChanges = function (event, template) {
	var id = Session.get("changeAccountUser");
	var radioAmount = template.find('input[name=radioAmount]:checked').value;
	if (radioAmount == "input") {
		var inputAmount = template.find('input[name=inputAmount]').value;
		inputAmount = inputAmount.replace(',','.');
		if (inputAmount == "") {inputAmount = 0};
		var amount = parseFloat(inputAmount);
	} else {
		var amount = parseFloat(radioAmount);
	};
	var rechargedAt = new Date();
	var obj = {};
	obj["profile.account"] = {rechargedAt: rechargedAt, amount: amount};
	Meteor.users.update(id, {$push: obj});
	$('.accountForm')[0].reset();
}