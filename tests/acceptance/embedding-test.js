import { test } from 'qunit';
import moduleForAcceptance from '../../tests/helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | embedding');

test('rendering a component embedded in server HTML', function(assert) {
  visit('/component-example');
  andThen(function() {
    assert.ok(find('.x-example').text().trim(), 'Hello World');
  });
});
