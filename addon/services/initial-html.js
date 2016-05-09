import Service from 'ember-service';
import inject from 'ember-service/inject';
import $ from 'jquery';
import Ember from 'ember';

export default Service.extend({
  routing: inject(),
  handoff: inject(),
  init() {
    let nodes = Array.from(this._rootElement().contents()).filter(node => !($(node).is('.ember-view')));
    if (nodes.length > 0) {
      this.pageId = this._pageId();
      this.nodes = nodes;
    }
  },
  _pageId() {
    let url = this.get('routing').currentURL();
    let root = this.get('routing.rootURL');
    return url.replace(root, '/');
  },
  _rootElement() {
    return $(Ember.getOwner(this.get('handoff')).rootElement);
  },
  destroy() {
    if (!this.isDestroyed) {
      this._rootElement().empty();
    }
    this._super();
  },
  find(id) {
    let nodes = this.nodes;
    if (this.pageId === id && nodes) {
      this.nodes = null;
      return nodes;
    }
  }
});
