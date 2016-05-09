import Service from 'ember-service';
import $ from 'jquery';


export default Service.extend({

  // At boot, we record which external scripts and stylesheet are
  // already on the page.
  init() {
    let scripts = {};
    Array.from($(document).find('script[src]')).forEach(elt => {
      scripts[elt.src] = true;
    });
    this.scripts = scripts;

    let styles = {};
    Array.from($(document).find('link[rel=stylesheet]')).forEach(elt => {
      if (!styles[elt.media]) {
        styles[elt.media] = {};
      }
      styles[elt.media][elt.href] = true;
    });
    this.styles = styles;
  },

  ensureScript(src) {
    if (!this.styles[src]) {
      let s = document.createElement('script');
      s.src = src;
      s.async = false;
      document.querySelector('body').appendChild(s);
      this.styles[src] = true;
    }
  },

  insertStylesheets(styles) {

  }
});
