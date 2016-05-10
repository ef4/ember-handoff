import DS from 'ember-data';
import isJavascript from '../lib/is-js';
import RSVP from 'rsvp';
import computed from 'ember-computed';
import inject from 'ember-service/inject';

export default DS.Model.extend({
  htmlParser: inject(),
  assets: inject(),
  text: DS.attr(),
  dom: DS.attr(),

  document: computed('text', function() {
    return this.get('htmlParser').parse(this.get('text'));
  }),

  pieces: computed('document', function() {
    return this._separateScripts();
  }),

  _separateScripts() {
    let doc = this.get('document');
    let body = doc.querySelector('body');
    let scripts = [];

    // First handle <script> in the <head>
    Array.from(doc.querySelectorAll('head script')).forEach(script => {
      if (isJavascript(script)) {
        // Save for later evaluation
        scripts.push(script);
      } else {
        // Non-javascript script tags (templates, for example) get
        // moved from head to body so they will get added to our
        // rendered output (we only output the contents of body, since
        // it doesn't make sense to add a new head to the existing
        // page).
        body.appendChild(script);
      }
    });

    // Then handle <script> in <body>
    Array.from(body.querySelectorAll('script')).forEach(script => {
      if (isJavascript(script)) {
        // TODO: compatability: http://developer.mozilla.org/en-US/docs/Web/API/ChildNode/remove.html
        script.remove();
        scripts.push(script);
      }
    });

    // Styles, both inline and external, with their relative order maintained.
    let styles = Array.from(doc.querySelectorAll('style, link[rel=stylesheet]')).map(element => element);

    // Remove the style tags from our imported body, because they will be handled separately.
    // TODO: compatability: http://developer.mozilla.org/en-US/docs/Web/API/ChildNode/remove.html
    Array.from(body.querySelectorAll('style, link[rel=stylesheet]')).forEach(element => element.remove());

    return { body, scripts, styles };
  },

  title: computed('document', function() {
    let titleTag = this.get('document').querySelector('title');
    if (titleTag) {
      return titleTag.innerHTML;
    }
  }),

  bodyClasses: computed('document', function() {
    return this.get('document').querySelector('body').className;
  }),

  appendTo($element) {
    let assets = this.get('assets');

    if (this.get('dom')) {
      this.get('dom').forEach(node => {
        node.remove();
        $element[0].appendChild(assets.cloneOrImport(node));
      });
      return RSVP.resolve();
    }

    let scriptsPromise = assets.applyScripts(this.get('pieces.scripts'));
    Array.from(this.get('pieces.body').childNodes).forEach(child => {
      $element[0].appendChild(assets.cloneOrImport(child));
    });
    return RSVP.allSettled([assets.applyStyles(this.get('pieces.styles'), $element[0]), scriptsPromise]);
  }
});
