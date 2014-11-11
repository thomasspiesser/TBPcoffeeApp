Coffees = new Meteor.Collection("coffees");

Meteor.users.allow({
  insert: function (userId, doc) {
    //...
  },
  update: function (userId, doc, fields, modifier) {
    return true
  },
  remove: function (userId, doc) {
    //...
  }
});

trimInput = function(val) {
  return val.replace(/^\s*|\s*$/g, "");
}

if (Meteor.isClient) {
  Template.adminTemplate.helpers({
    // check if user is an admin
    isAdminUser: function() {
      return Roles.userIsInRole(Meteor.user(), ['admin']);
    }
  });

  Template.adminCreateUser.helpers({
    foo: function () {
      // ...
    }
  });

  Template.adminCreateUser.events({
    'click #createUserButton': function (event, t) {
      var email = t.find('#account-email').value;
      var name = t.find('#name').value;
      var email = trimInput(email);
      var options = {
        email: email,
        profile: {
          name: name,
          cappuccino: 0,
          espresso: 0
        }
      };
      Meteor.call('createConsumer', options, function (error, result) {
        if (error){
          Notifications.error(error.reason, error.detail, {timeout: 5000});
        } else {
          console.log(result);
        }
      });
      return false;
    }
  });

  Template.coffeeTable.helpers({
    users: function () {
      return Meteor.users.find();
    }
  });

  Template.coffeeTable.events({
    'click button': function (event, template) {
      var buttonName = event.target.name;
      var type_id = buttonName.split(",");
      var coffeetype = "profile."+type_id[0];
      var id = type_id[1];
      var obj = {};
      obj[coffeetype] = 1;
      Meteor.users.update(id, {$inc: obj});
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // bootstrap the admin user if they exist -- You'll be replacing the id later
    if (Meteor.users.findOne("WD6C6grk76aa3TqwM"))
      Roles.addUsersToRoles("WD6C6grk76aa3TqwM", ['admin']);
  });
  Meteor.methods({
    createConsumer: function (options) {
      _.extend({ password: 'TPBMember' }, options)
      var user = Accounts.createUser(options);
      return user;
    }
  });
}
