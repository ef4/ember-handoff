import Component from 'ember-component';
import inject from 'ember-service/inject';
import layout from '../templates/components/component-injector';

export default Component.extend({
  layout,
  handoff: inject()
});
