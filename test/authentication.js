'use strict';
const assert = require('assert');

const zapier = require('zapier-platform-core');

const config = require('../config');
const App = require('../index');
const appTester = zapier.createAppTester(App);

describe('access token authentication', () => {
  zapier.tools.env.inject();

  it('should authenticate', (done) => {
    const bundle = {
      authData: {
        api_key: config.API_KEY,
      }
    };

    appTester(App.authentication.test, bundle)
      .then((response) => {
        assert.ok(response.data.id);
        done();
      })
      .catch(done);
  });
});
