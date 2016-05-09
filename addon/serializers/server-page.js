import DS from 'ember-data';

export default DS.Serializer.extend({
  normalizeResponse(store, primaryModelClass, payload, id /*, requestType */) {
    let attributes;

    // Our adapter loads pages two difference ways -- either by
    // fetching the HTML string from the server, or by discovering
    // that we already have the relevant DOM in the page.

    if (typeof payload === 'string') {
      attributes = { text: payload };
    } else {
      attributes = { dom: payload };
    }

    return { data: {
        id,
        type: 'server-page',
        attributes
    }};
  }
});
