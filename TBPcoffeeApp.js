

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
          espresso: [],
          account: 0
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
      var users = Meteor.users.find().fetch();
      var sortedUsers = _.sortBy(users, function (user) {return -user.profile.espresso.length - user.profile.cappuccino.length} )
      return sortedUsers
    }
  });

  Template.coffeeTable.events({
    'click .coffee_btn': function (event, template) {
      var buttonName = event.target.name;
      var type_id = buttonName.split(",");
      var coffeetype = "profile."+type_id[0];
      var id = type_id[1];
      var name = Meteor.users.findOne( id ).profile.name;
      var obj = {};
      bootbox.confirm('You just ordered one ' + type_id[0] + ' for ' + name + '.\nIs that correct?', function(result){
        if (result) {
          consumedAt = new Date();
          obj[coffeetype] = consumedAt;
          Meteor.users.update(id, {$push: obj});
        }
      });
    },
    'click .account_btn': function (event, template) {
      bootbox.dialog({
        title: "How much do you want to add?",
        message: '<div class="row"> ' +
        '<div class="col-md-2"> ' +
        '<div class="col-md-2">' +
        '<div class="radio"> <label for="amount-10"> ' +
        '<input type="radio" name="amount" id="amount-10" value="10" checked="checked"> ' +
        '10,-€ </label>' + 
        '</div><div class="radio"> <label for="amount-20"> ' +
        '<input type="radio" name="amount" id="amount-20" value="20"> 20,-€ </label> ' +
        '</div><div class="radio"> <label for="amount-50"> ' +
        '<input type="radio" name="amount" id="amount-50" value="50"> 50,-€ </label> ' +
        '</div>' +
        '</div>' + 
        '</div>' +
        '</div>',
        buttons: {
          danger: {
            label: "Cancel",
            className: "btn-danger",
            callback: function() {
            }
          },
          success: {
            label: "Save",
            className: "btn-success",
            callback: function () {
              var amount = $("input[name='amount']:checked").val()
              bootbox.alert("You've chosen <b>" + amount + "€</b>");
            }  
          }
        }
      });
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
