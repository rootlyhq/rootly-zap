'use strict';
const assert = require('assert');
const zapier = require('zapier-platform-core');
const config = require('../config');
const App = require('../index');
const appTester = zapier.createAppTester(App);

describe('access token authentication', () => {
  zapier.tools.env.inject();

  it('should authenticate', async () => {
    const response = await appTester(App.authentication.test, {
      authData: { api_key: config.API_KEY },
    });
    assert.ok(response.data.id);
  });
});
