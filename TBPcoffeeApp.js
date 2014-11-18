

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
    'click .coffeeBtn': function (event, template) {
      var buttonName = event.target.name;
      var coffeetype = "profile." + buttonName;
      var id = this._id;
      var name = Meteor.users.findOne( id ).profile.name;
      var obj = {};
      bootbox.confirm('You just ordered one <b>' + buttonName + '</b> for <b>' + name + '</b>.\nIs that correct?', function(result){
        if (result) {
          consumedAt = new Date();
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

  Template.changeAccountModal.events({
    'click #radio-free': function (event, template) {
      template.$('input').focus();       
    },
    'keydown .accountForm': function (event, template) {
      if(event.keyCode == 13) {
        saveAccountChanges();
        $("#changeAccountModal").modal("hide");
        return false;
      }
    },
    'click #saveAccount': function (event, template) {
      saveAccountChanges();
      return false;
    }
  });

  Template.changeAccountModal.helpers({
    user: function() {
      var user = Meteor.users.findOne( Session.get("addMoneyUser") );
      if (typeof(user) !== 'undefined') {
        return user.profile.name;
      }
    }
  });
}

function saveAccountChanges(){
  var id = Session.get("addMoneyUser");
  var radioAmount;
  $('input[name=radio-amount]:checked').each(function() {
      radioAmount = $(this).val();
  });
  if (radioAmount == "free") {
    var freeAmount = $('input[name=free-amount]').val();
    if (freeAmount == "") {freeAmount = 0};
    freeAmount = freeAmount.replace(',','.');
    var amount = parseFloat(freeAmount);
  } else {
    var amount = parseFloat(radioAmount);
  };
  var obj = {};
  var user = Meteor.users.findOne(id);
  var oldAmount = user.profile.account;
  obj["profile.account"] = oldAmount + amount;
  Meteor.users.update(id, {$set: obj});
  $('.accountForm')[0].reset();
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
