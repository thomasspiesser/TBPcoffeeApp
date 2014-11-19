Router.route('/', function () {
  // render the Home template with a custom data context
  // this.render('Home', {data: {title: 'My Title'}});
  this.render('home');
});

Router.route('/stats');

// Router.plugin('dataNotFound', {notFoundTemplate: 'DataNotFound'});
// Router.plugin('loading', {loadingTemplate: 'Loading'});