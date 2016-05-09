import DS from 'ember-data';
import fetch from 'ember-network/fetch';
import inject from 'ember-service/inject';
import RSVP from 'rsvp';

export default DS.Adapter.extend({
  routing: inject(),
  initialHTML: inject(),

  findRecord(store, type, id /*, snapshot */) {
    let nodes = this.get('initialHTML').find(id);
    if (nodes) {
      return RSVP.resolve(nodes);
    }

    let rootURL = this.get('routing.rootURL');
    return fetch(rootURL.replace(/\/$/, '') + id, { headers: { 'X-Ember-Handoff-Request': 1 } }).then(response => response.text());
  }
});
