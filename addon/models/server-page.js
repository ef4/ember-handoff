import DS from 'ember-data';
import Ember from 'ember';
import isJavascript from '../lib/is-js';
import RSVP from 'rsvp';
import $ from 'jquery';

let scriptCounter = 0;


export default DS.Model.extend({
  htmlParser: Ember.inject.service(),
  text: DS.attr(),
  dom: DS.attr(),

  document: Ember.computed('text', function() {
    return this.get('htmlParser').parse(this.get('text'));
  }),

  pieces: Ember.computed('document', function() {
    return this._separateScripts();
  }),

  _separateScripts() {
    let doc = this.get('document');
    let body = importNode(doc.querySelector('body'));
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
        // Pull out of body and save for evaluation, leaving a marker
        // in the original spot in case we need to direct any
        // document.writes back there.
        let marker = document.createElement('script');
        marker.type = 'text/x-original-location';
        let id = scriptCounter++;
        marker.setAttribute('data-script-id', id);
        script.parentElement.insertBefore(marker, script);
        // TODO: compatability: http://developer.mozilla.org/en-US/docs/Web/API/ChildNode/remove.html
        script.remove();
        script.setAttribute('data-script-id', id);
        scripts.push(script);
      }
    });

    // Styles, both inline and external, with their relative order maintained.
    let styles = Array.from(doc.querySelectorAll('style, link[rel=stylesheet]')).map(element => importNode(element));

    // Remove the style tags from our imported body, because they will be handled separately.
    // TODO: compatability: http://developer.mozilla.org/en-US/docs/Web/API/ChildNode/remove.html
    Array.from(body.querySelectorAll('style, link[rel=stylesheet]')).forEach(element => element.remove());

    return { body, scripts, styles };
  },

  title: Ember.computed('document', function() {
    let titleTag = this.get('document').querySelector('title');
    if (titleTag) {
      return titleTag.innerHTML;
    }
  }),

  appendTo($element) {
    if (this.get('dom')) {
      this.get('dom').forEach(node => $element[0].appendChild(node));
      return RSVP.resolve();
    }
    return this._appendStyles($element, this.get('pieces.styles')).finally(() => {
      Array.from(this.get('pieces.body').childNodes).forEach(child => {
        $element[0].appendChild(importNode(child));
      });
    });
  },

  _appendStyles($element, styles) {
    let stylesLoaded = styles.map(s => styleLoaded(s));
    $element.append(styles);
    return RSVP.allSettled(stylesLoaded);
  },


  drupalAssets: Ember.computed('document', function() {
    return Array.from(
      this.get('document')
        .querySelectorAll('script[type="application/x-drupal-assets"]')
    ).map(script => JSON.parse(script.innerHTML))
      .reduce((a,b) => a.concat(b), []);
  }),

  drupalSettings: Ember.computed('drupalAssets', function() {
    let tag = this.get('assets').find(
      a =>
        a['#tag'] === 'script' &&
        a['#attributes'] &&
        a['#attributes']['data-drupal-selector'] === 'drupal-settings-json'
    );
    if (tag) {
      return JSON.parse(tag['#value']);
    }
  })
});

function importNode(node) {
  const DEEP_COPY = true;
  return window.document.importNode(node, DEEP_COPY);
}

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
