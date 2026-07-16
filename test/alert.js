'use strict';
const assert = require('assert');
const zapier = require('zapier-platform-core');
const config = require('../config');
const App = require('../index');
const appTester = zapier.createAppTester(App);

describe('create alert', () => {
  zapier.tools.env.inject();

  it('should create an alert', async () => {
    const response = await appTester(App.creates.alert.operation.perform, {
      authData: { api_key: config.API_KEY },
      inputData: { summary: 'Test Alert', source: 'Test Source' },
    });
    assert.ok(response);
  });
});
