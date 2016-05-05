import buildRoutes from 'ember-engines/routes';

export default buildRoutes(function() {
  this.route('catch-all', { path: '*upstream_url' });
});
