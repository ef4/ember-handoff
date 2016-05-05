import DS from 'ember-data';
import Ember from 'ember';

export default DS.Model.extend({
  htmlParser: Ember.inject.service(),
  text: DS.attr(),

  document: Ember.computed('text', function() {
    return this.get('htmlParser').parse(this.get('text'));
  }),

  assets: Ember.computed('document', function() {
    return Array.from(
      this.get('document')
        .querySelectorAll('script[type="application/x-drupal-assets"]')
    ).map(script => JSON.parse(script.innerHTML))
      .reduce((a,b) => a.concat(b), []);
  }),

  title: Ember.computed('document', function() {
    let titleTag = this.get('document').querySelector('title');
    if (titleTag) {
      return titleTag.innerHTML;
    }
  }),

  content: Ember.computed('document', function() {
    let body = importNode(this.get('document').querySelector('body'));
    return Array.from(body.childNodes);
  }),

  styles: Ember.computed('assets', function() {
    return this.get('assets').filter(
      a => a['#tag'] === 'link' && a['#attributes'] && a['#attributes'].rel === 'stylesheet'
    ).map(a => {
      let attrs = a['#attributes'];
      let link = document.createElement('link');
      link.setAttribute('media', attrs.media);
      link.setAttribute('href', attrs.href);
      link.setAttribute('rel', attrs.rel);
      return link;
    });
  }),

  drupalSettings: Ember.computed('assets', function() {
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
