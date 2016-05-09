import Component from 'ember-component';
import $ from 'jquery';
import inject from 'ember-service/inject';
import layout from '../templates/components/server-page';

export default Component.extend({
  layout,
  routing: inject(),
  handoff: inject(),

  didReceiveAttrs() {
    // If we have a new page model, we want to clear any overlaid
    // content when we rerender.
    let page = this.get('page');
    if (page !== this._lastPage) {
      this.get('handoff').injectComponents([]);
    }
  },

  didRender() {
    let settings = this.get('handoff');
    let page = this.get('page');
    if (page !== this._lastPage) {
      this._lastPage = page;
      let elt = this.$('.server-content');
      settings.setPageTitle(page.get('title'));
      elt.empty();
      page.appendTo(elt).then(() => {
        // After the server-rendered page has been inserted, we
        // re-enable any overlaid content so that it can wormhole
        // itself into the server-rendered DOM.
        settings.injectComponents(findEmbeddedComponents(elt));
        settings.appendedServerContent(page, elt);
      });
    }
  },

  click(event) {
    let target = $(event.target).closest('a[href]');
    if (target.length > 0 && this.maybeTransition(target.attr('href'))) {
      event.preventDefault();
      return false;
    }
  },

  maybeTransition(href) {
    let router = this.get('routing');
    let rootURL = router.get('rootURL');
    let here = new URL(
      rootURL.replace(/\/$/, '') + router.currentURL(),
      window.location.origin
    );
    let destination = new URL(href, here);


    // Ensure that we only try to handle links that fall within the site.
    if (destination.origin === here.origin && destination.pathname.indexOf(rootURL) === 0) {
      let { routeName, params } = router.recognize(destination.pathname);
      router.transitionTo(routeName, ...params);
      return true;
    }
  }

});

let counter = 0;
function findEmbeddedComponents($context) {
  return Array.from($context.find('[data-ember-component]')).map(elt => {
    if (elt.getAttribute('id') == null) {
      elt.setAttribute('id', `embedded-component-marker-${counter++}`);
    }
    return {
      target: elt.getAttribute('id'),
      name: elt.getAttribute('data-ember-component'),
      serverArgs: $(elt).data()
    };
  });
}
