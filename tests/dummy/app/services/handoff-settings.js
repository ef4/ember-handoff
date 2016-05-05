import Service from 'ember-service';
import inject from 'ember-service/inject';

export default Service.extend({
  headData: inject(),
  setPageTitle(title) {
    this.set('headData.title', title);
  }
});
