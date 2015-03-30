Router.route('/', {
  action: function () {
  	if (this.ready())
  		this.render('home');
  }
});

Router.route('/stats');
Router.route('/help');

Router.configure({
  layoutTemplate: 'coffeeAppLayout'
});