import Ember from 'ember';

export default Ember.Service.extend({
  parse(string) {
    return this.get('_parser')(string);
  },

  _parser: Ember.computed(function() {
    // Browsers back through IE9 support DOMParser, although not
    // necessarily with html support.
    let parser = new DOMParser();

    // Firefox/Opera/IE throw errors on unsupported types
    try {
      // WebKit returns null on unsupported types
      if (parser.parseFromString("", "text/html")) {
        // text/html parsing is natively supported
        return (htmlString) => parser.parseFromString(htmlString, 'text/html');
      }
    } catch (ex) {}

    return function(htmlString) {
      var doc = document.implementation.createHTMLDocument("");
      if (htmlString.toLowerCase().indexOf('<!doctype') > -1) {
        doc.documentElement.innerHTML = htmlString;
      }
      else {
        doc.body.innerHTML = htmlString;
      }
      return doc;
    };
  })
});
