import DS from 'ember-data';
import fetch from 'ember-network/fetch';
import inject from 'ember-service/inject';

export default DS.Adapter.extend({
  routing: inject(),

  findRecord(store, type, id /*, snapshot */) {
    let rootURL = this.get('routing.rootURL');
    return fetch(rootURL.replace(/\/$/, '') + id, { headers: { 'X-Ember-Handoff-Request': 1 } }).then(response => response.text());
  }
});
