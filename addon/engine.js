import Engine from 'ember-engines/engine';
import Resolver from 'ember-engines/resolver';
import loadInitializers from 'ember-load-initializers';

const modulePrefix = 'ember-handoff';
const Eng = Engine.extend({
  modulePrefix,
  Resolver,
  dependencies: {
    services: [
      'handoff'
    ]
  }
});
loadInitializers(Eng, modulePrefix);
export default Eng;
