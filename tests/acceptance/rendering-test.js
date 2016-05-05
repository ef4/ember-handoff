import { test } from 'qunit';
import moduleForAcceptance from '../../tests/helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | rendering');

test('catch all route renders correctly', function(assert) {
  visit('/one');
  andThen(function() {
    assert.equal(currentURL(), '/one');
    assert.equal(find('h1').text().trim(), 'This is sample one.');
  });
});

test('index route renders correctly', function(assert) {
  visit('/');
  andThen(function() {
    assert.equal(currentURL(), '/');
    assert.equal(find('h1').text().trim(), 'This is sample index.');
  });
});
