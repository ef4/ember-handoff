import Service from 'ember-service';
import $ from 'jquery';
import RSVP from 'rsvp';


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

  ensureScript(script) {
    // this needs to happen first so that script.src resolves relative URLs.
    script = this.cloneOrImport(script);

    if (script.src && !this.scripts[script.src]) {
      script = this.cloneOrImport(script);
      script.async = false;
      document.querySelector('body').appendChild(script);
      this.scripts[script.src] = true;
      console.log('appended', script);
    }
  },

  applyStyles(styles, element) {
    return RSVP.allSettled(styles.map(style => {
      if (style.href && this.styles[style.media] && this.styles[style.media][style.href]) {
        console.log("skipping style", style);
        return RSVP.resolve();
      }
      style = this.cloneOrImport(style);
      let promise = styleLoaded(style);
      console.log('appended style', style);
      element.appendChild(style);
      return promise;
    }));
  },


  cloneOrImport(node) {
    const DEEP = true;
    if (node.ownerDocument === document) {
      return node.cloneNode(DEEP);
    } else {
      return document.importNode(node, DEEP);
    }
  }

});

// <link> tags do not reliably produce load events, particularly if
// the CSS is already cached.
function styleLoaded(element) {
  if (element.tagName !== 'LINK') {
    return RSVP.resolve();
  }
  return new RSVP.Promise((resolve, reject) => {
    $(element)
      .on('load', resolve)
      .on('error', reject);
    let started = Date.now();
    let interval = setInterval(() => {
      if (Date.now() - started > 1000) {
        clearInterval(interval);
        reject();
      } else if (Array.from(document.styleSheets).find(s => s.ownerNode === element)) {
        clearInterval(interval);
        resolve();
      }
    }, 20);

  });
}
