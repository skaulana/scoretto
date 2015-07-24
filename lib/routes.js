// Routes.js
// App routes used by Iron router

Router.configure({layoutTemplate: 'main'}); // in scoretto.html

Router.route('/', function() {
  this.render('loading', {to: 'header'});
});
Router.route('/setup', function() {
  this.render('hello', {to: 'header'});
  this.render('nameprompt', {to: 'body'});
  this.render('', {to: 'footer'});
});
Router.route('/game', function() {
  this.render('gametitle', {to: 'header'});
  this.render('userlist', {to: 'body'});
  this.render('gameactions', {to: 'footer'});
});
Router.route('/score', function() {
  this.render('scoretitle', {to: 'header'});
  this.render('scoreprompt', {to: 'body'});
  this.render('', {to: 'footer'});
});