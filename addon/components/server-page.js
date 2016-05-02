import Ember from 'ember';
import RSVP from 'rsvp';
import $ from 'jquery';

export default Ember.Component.extend({
  handoff: Ember.inject.service(),

  didReceiveAttrs() {
    // If we have a new page model, we want to clear any overlaid
    // content when we rerender.
    let page = this.get('page');
    if (page !== this._lastPage) {
      this.set('showingOverlay', false);
    }
  },

  didRender() {
    let page = this.get('page');
    if (page !== this._lastPage) {
      this._lastPage = page;
      let elt = this.$('.server-content');
      if (!page.prerendered) {
        this.get('handoff').clearPage();
      }
      elt.empty();
      this.appendPage(elt, this.get('page')).then(() => {
        // After the server-rendered page has been inserted, we
        // re-enable any overlaid content so that it can wormhole
        // itself into the server-rendered DOM.
        this.set('embeddedComponents', findEmbeddedComponents(page.prerendered ? $(document) : elt));
        this.set('showingOverlay', true);
        this.sendAction("appendedServerContent");
      });
    }
  },

  appendPage($elt, page) {
    if (page.prerendered) {
      return RSVP.resolve();
    }
    return this.appendStyles($elt, page.get('styles')).finally(() => {
      page.get('content').forEach(node => $elt[0].appendChild(node));
    });
  },

  appendStyles($element, styles) {
    let stylesLoaded = styles.map(s => styleLoaded(s));
    $element.append(styles);
    return RSVP.allSettled(stylesLoaded);
  },

  click(event) {
    let target = $(event.target).closest('a');
    if (target.length > 0) {
      if (this.get('handoff').maybeTransition(target.attr('href'))) {
        event.preventDefault();
        return false;
      }
    }
  }
});

// <link> tags do not reliably produce load events, particularly if
// the CSS is already cached.
function styleLoaded(element) {
  if (element.tagName !== 'LINK') {
    return RSVP.resolve();
  }
  return new RSVP.Promise((resolve, reject) => {
    $(element)
      .on('load', resolve)
      .on('error', reject);
    let started = Date.now();
    let interval = setInterval(() => {
      if (Date.now() - started > 1000) {
        clearInterval(interval);
        reject();
      } else if (Array.from(document.styleSheets).find(s => s.ownerNode === element)) {
        clearInterval(interval);
        resolve();
      }
    }, 20);

  });
}

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
