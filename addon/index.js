import Service from 'ember-service';

export const HandoffService = Service.extend({
  // Extend this in your own app to receive the contents of <title>
  // tags that appear in the server rendered HTML. You can use the
  // ember-cli-head to stick them into your own <title> if you want
  // to.
  setPageTitle(/* title */) {},

  // Generic hook for doing something after server-generated HTML has
  // been inserted into the page.
  appendedServerContent(/* $elt */) {},

  injectComponents(descriptions) {
    this.set('embeddedComponents', descriptions);
  }
});
