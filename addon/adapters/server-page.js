import DS from 'ember-data';
import fetch from 'ember-network/fetch';
import inject from 'ember-service/inject';

export default DS.Adapter.extend({
  routing: inject(),

  findRecord(store, type, id /*, snapshot */) {
    let rootUrl = this.get('routing.rootUrl');
    return fetch(rootUrl.replace(/\/$/, '') + id, { headers: { 'X-Ember-Handoff-Request': 1 } }).then(response => response.text());
  }
});
