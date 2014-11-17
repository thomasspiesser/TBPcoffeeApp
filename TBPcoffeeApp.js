

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
          account: 0.00
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
    },
    isAdmin: function () {
      return this.emails[0].address === 'admin@admin.com' ? true : false;
    }
  });

  Template.coffeeTable.events({
    'click .coffee_btn': function (event, template) {
      var buttonName = event.target.name;
      var coffeetype = "profile." + buttonName;
      var id = this._id;
      var name = Meteor.users.findOne( id ).profile.name;
      var obj = {};
      bootbox.confirm('You just ordered one ' + buttonName + ' for ' + name + '.\nIs that correct?', function(result){
        if (result) {
          consumedAt = new Date();
          obj[coffeetype] = consumedAt;
          Meteor.users.update(id, {$push: obj});
        }
      });
    },
    'click .account_btn': function(event, template) {
      $("#changeAccountModal").modal("show");
      Session.set("addMoneyUser", this._id);
    }
  });

  Template.changeAccountModal.events({
    'click #radio-free': function (event, template) {
      template.$('input').focus();       
    },
    'keydown .account_form': function (event, template) {
      if(event.keyCode == 13) {
        console.log("enter pressed");
        saveAccountChanges();
      }
    },
    'click #saveAccount': function (event, template) {
      saveAccountChanges();
    }
  });

  Template.changeAccountModal.helpers({
        user: function() {
          var user = Meteor.users.findOne( Session.get("addMoneyUser") );
          if (typeof(user) !== 'undefined') {
            return user.profile.name;
          }
        }
      }
  )
}

function saveAccountChanges(){
  var id = Session.get("addMoneyUser");
  var radio_amount;
  $('input[name=radio-amount]:checked').each(function() {
      radio_amount = $(this).val();
  });
  if (radio_amount == "free") {
    var free_amount = $('input[name=free-amount]').val();
    free_amount = free_amount.replace(',','.');
    var amount = parseFloat(free_amount);
  } else {
    var amount = parseFloat(radio_amount);
  };
  var obj = {};
  var user = Meteor.users.findOne(id);
  var old_amount = user.profile.account;
  obj["profile.account"] = old_amount + amount;
  Meteor.users.update(id, {$set: obj});
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
