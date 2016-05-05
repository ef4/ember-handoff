# Ember Handoff

This is an work-in-progress Ember Engine that lets you `mount` an existing server-rendered website inside an Ember application and begin enhancing it with Ember-defined behaviors.

Much like [pjax](https://github.com/defunkt/jquery-pjax), [TurboLinks](http://geekmonkey.org/2012/09/introducing-turbolinks-for-rails-4-0/), or [refreshless](https://www.drupal.org/project/refreshless), it inverts the normal control of web page loading and fetches HTML via the [fetch](https://fetch.spec.whatwg.org/) API. This can be good for performance. But more importantly, it creates a graceful upgrade path for enhancing an existing website with advanced user experienced that are only possible when you have a robust in-browser application.

