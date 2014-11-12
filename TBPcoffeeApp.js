

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
  Meteor.subscribe('TBPCoffeeCollection');
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
          cappuccino: [],
          espresso: []
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
      var name = Meteor.users.findOne( id ).profile.name;
      var obj = {};
      var confirmation = confirm('You just ordered one ' + type_id[0] + ' for ' + name + '.\nIs that correct?');
      if (confirmation) {
        consumedAt = new Date();
        obj[coffeetype] = consumedAt;
        Meteor.users.update(id, {$push: obj});
      }
    }
  });
}

if (Meteor.isServer) {
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
  Meteor.methods({
    createConsumer: function (options) {
      options = _.extend({ password: 'TPBMember' }, options)
      var user = Accounts.createUser(options);
      return user;
    }
  });
}
