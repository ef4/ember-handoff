import Ember from 'ember';
import { idFromUrl } from '../models/server-page';
import $ from 'jquery';

export default Ember.Service.extend({
  // Notes the initial HTML payload from the server, so that our first
  // render can defer to it as appropriate.
  recordInitialHtml() {
    this._interceptor = (event) => this.interceptLink(event);
    $('body')
      .on('click', 'a', this._interceptor)
      .attr('data-initial-render', idFromUrl(window.location.href));
  },

  willDestroy() {
    $('body').on('click', 'a', this._interceptor);
  },

  // Captures links in the HTML that was part of our initial page load
  // from the server.
  interceptLink(event) {
    let target = $(event.target);
    if (this.maybeTransition(target.attr('href'))) {
      event.preventDefault();
      return false;
    }
  },

  // Attempts to capture a server-created link as an Ember
  // transition. Returns true if we decided to transition within Ember
  // (at which point the caller should prevent any default navigation
  // action).
  maybeTransition(href) {
    let url = new URL(href, window.location.href);
    // Ensure that we only try to handle links that fall within the site.
    if (url.origin === window.location.origin && url.pathname.indexOf(ENV.baseURL) === 0) {
      let localPath = url.pathname.replace(ENV.baseUrl, '/');
      // Check the configuration for routes we're supposed to cede to
      // full page refreshes.
      if (!(ENV.cedeToServer || []).find(pattern => new RegExp(pattern).test(localPath))) {
        let router = this.get('router');
        let { routeName, params } = router.recognize(localPath);
        router.transitionTo(routeName, ...params);
        return true;
      }
    }

  },

  alreadyOnPage(pageId) {
    return pageId === $('body').attr('data-initial-render');
  },

  clearPage() {
    if ($('body').attr('data-initial-render')) {
      $('body').attr('data-initial-render', null);
      Array.from($('body').contents()).forEach(node => {
        let $node = $(node);
        if (!$node.is('.ember-view')) {
          $node.remove();
        }
      });
    }
  }


});
