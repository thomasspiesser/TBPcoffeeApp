if (Meteor.isClient) {
  Template.adminTemplate.helpers({
    // check if user is an admin
    isAdminUser: function() {
      return Roles.userIsInRole(Meteor.user(), ['admin']);
    }
  })
  // counter starts at 0
  Session.setDefault("counter", 0);

  Template.coffeeTable.helpers({
    counter: function () {
      return Session.get("counter");
    }
  });

  Template.coffeeTable.events({
    'click button': function () {
      // increment the counter when button is clicked
      Session.set("counter", Session.get("counter") + 1);
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // bootstrap the admin user if they exist -- You'll be replacing the id later
    if (Meteor.users.findOne("WD6C6grk76aa3TqwM"))
      Roles.addUsersToRoles("WD6C6grk76aa3TqwM", ['admin']);
  });
}
