'use strict';
const assert = require('assert');
const zapier = require('zapier-platform-core');
const config = require('../config');
const App = require('../index');
const appTester = zapier.createAppTester(App);

describe('create pulse', () => {
  zapier.tools.env.inject();

  it('should create a pulse', async () => {
    const response = await appTester(App.creates.pulse.operation.perform, {
      authData: { api_key: config.API_KEY },
      inputData: { summary: 'Test Pulse' },
    });
    assert.ok(response);
  });
});
