import Route from 'ember-route';
import inject from 'ember-service/inject';

export default Route.extend({
  assets: inject(),
  initialHTML: inject(),
  beforeModel() {
    this.get('assets');
    this.get('initialHTML');
  }
});
