import { HandoffService } from 'ember-handoff';
import inject from 'ember-service/inject';

export default HandoffService.extend({
  headData: inject(),
  setPageTitle(title) {
    this.set('headData.title', title);
  }
});
