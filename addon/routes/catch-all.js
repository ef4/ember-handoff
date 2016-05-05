import Route from 'ember-route';
import inject from 'ember-service/inject';

export default Route.extend({
  store: inject(),
  model({ upstream_url }) {
    return this.get('store').findRecord('server-page', '/' + upstream_url);
  }
});
