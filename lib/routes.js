// Routes.js
// App routes used by Iron router

Router.configure({layoutTemplate: 'main'}); // in scoretto.html

Router.route('/', function() {
  this.render('loading', {to: 'header'});
  this.render('errorsuggest', {to: 'body'}); // see meteor issue #4038
});
Router.route('/setup', function() {
  animateInShell();
  this.render('', {to: 'header'});
  this.render('nameprompt', {to: 'body'});
  this.render('aboutline', {to: 'footer'});
});
Router.route('/setup/room', function() {
  this.render('setroom', {to: 'footer'});
});
Router.route('/about', function() {
  animateInShell();
  this.render('', {to: 'header'});
  this.render('about', {to: 'body'});
  this.render('', {to: 'footer'});
});
Router.route('/reset', function() {
  Session.clear();
  Router.go('/setup');
});
Router.route('/tutorial', function() {
  animateInShell();
  this.render('', {to: 'header'});
  this.render('howitworks', {to: 'body'});
  this.render('howitworksactions', {to: 'footer'});
  Meteor.setTimeout(animateInTutorialSteps, 0); // to trigger after DOM elements render
});
Router.route('/game', function() {
  animateInShell();
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

// transition animations leveraging animate.css
animateInShell = function() {
  var el = $('#shell');
  el.addClass('animated fadeInUp');
  el.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend',
    function() {el.removeClass('animated fadeInUp');}
  );
};
animateInTutorialSteps = function() {
  var els = $('#tutorialsteps > li');
  els.each(function(i) {
    Meteor.setTimeout(
      () => {$(this).removeClass('invisible').addClass('animated fadeInUp');},
      i * 1000);
  });
};