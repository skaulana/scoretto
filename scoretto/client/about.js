// About.js
// Client logic for about page

Template.about.helpers({
  version: function() {
    return appSemVer;
  }
});