Router.route('/', {
  // render the Home template with a custom data context
  // this.render('Home', {data: {title: 'My Title'}});
  waitOn: function () {
  	return IRLibLoader.load('//static.aljtmedia.com/uploads/javascript/jQuery.snow.min.js')
  },
  action: function () {
  	if (this.ready())
  		this.render('home');
  }
  
});

Router.route('/stats');
Router.route('/stats2');


Router.configure({
  layoutTemplate: 'coffeeAppLayout'
});