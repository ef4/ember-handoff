import { test } from 'qunit';
import moduleForAcceptance from '../../tests/helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | linking');

test('following relative links from catch-all to catch-all', function(assert) {
  visit('/one');
  click('a:contains(two)');
  andThen(function() {
    assert.equal(currentURL(), '/two');
    assert.equal(find('h1').text().trim(), 'This is sample two.');
  });
});

test('following relative links from catch-all to index', function(assert) {
  visit('/one');
  click('a:contains(index)');
  andThen(function() {
    assert.equal(currentURL(), '/');
    assert.equal(find('h1').text().trim(), 'This is sample index.');
  });
});

test('following relative links from index to catch-all', function(assert) {
  visit('/');
  click('a:contains(two)');
  andThen(function() {
    assert.equal(currentURL(), '/two');
    assert.equal(find('h1').text().trim(), 'This is sample two.');
  });
});

test('following absolute links that stay within app', function(assert) {
  visit('/one');
  click('a:contains(absoluteLink2)');
  andThen(function() {
    assert.equal(currentURL(), '/two');
    assert.equal(find('h1').text().trim(), 'This is sample two.');
  });
});

test('following external links', function(assert) {
  var clickDidBubble = false;
  function topClick(event) {
    clickDidBubble = true;
    event.preventDefault();
  }

  visit('/one');

  andThen(function() {
    $('body').on('click', topClick);
  });

  click('a:contains(externalLink)');

  andThen(function() {
    assert.ok(clickDidBubble, 'should not have handled click on external link');
    $('body').off('click', topClick);
  });
});
