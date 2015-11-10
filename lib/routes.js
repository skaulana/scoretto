// Routes.js
// App routes used by Iron router

Router.configure({layoutTemplate: 'main'}); // in scoretto.html

Router.route('/', function() {
  this.render('loading', {to: 'header'});
  this.render('errorsuggest', {to: 'body'}); // see meteor issue #4038
});
Router.route('/setup', function() {
  this.render('', {to: 'header'});
  this.render('nameprompt', {to: 'body'});
  this.render('aboutline', {to: 'footer'});
});
Router.route('/about', function() {
  this.render('', {to: 'header'});
  this.render('about', {to: 'body'});
  this.render('', {to: 'footer'});
});
Router.route('/reset', function() {
  Session.clear();
  Router.go('/setup');
});
Router.route('/tutorial', function() {
  this.render('', {to: 'header'});
  this.render('howitworks', {to: 'body'});
  this.render('howitworksactions', {to: 'footer'});  
});
Router.route('/game', function() {
  Session.set('playerid', '');
  this.render('gametitle', {to: 'header'});
  this.render('userlist', {to: 'body'});
  this.render('gameactions', {to: 'footer'});
});
Router.route('/game/:playerid', function() {
  Session.set('playerid', this.params.playerid);
  this.render('useractions', {to: 'footer',
    data: function() {
       return ScoreboardStore.findOne({client: this.params.playerid});
    }
  });
});
Router.route('/score', function() {
  this.render('scoretitle', {to: 'header'});
  this.render('scoreprompt', {to: 'body'});
  this.render('', {to: 'footer'});
});