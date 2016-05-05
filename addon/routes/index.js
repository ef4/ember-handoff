import Route from 'ember-route';
import inject from 'ember-service/inject';

export default Route.extend({
  store: inject(),
  model() {
    return this.get('store').findRecord('server-page', '/');
  }
});
