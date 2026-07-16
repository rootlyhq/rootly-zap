'use strict';
const assert = require('assert');
const zapier = require('zapier-platform-core');
const config = require('../config');
const App = require('../index');
const appTester = zapier.createAppTester(App);

describe('create incident', () => {
  zapier.tools.env.inject();

  it('should create an incident', async () => {
    const severities = await appTester(App.triggers.severity.operation.perform, {
      authData: { api_key: config.API_KEY },
      inputData: { "filter[name]": "SEV1" },
    });

    const services = await appTester(App.triggers.service.operation.perform, {
      authData: { api_key: config.API_KEY },
      inputData: { "filter[name]": "" },
    });

    const response = await appTester(App.creates.incident.operation.perform, {
      authData: { api_key: config.API_KEY },
      inputData: {
        name: 'Test Incident',
        severity_id: severities[0].id,
        service_ids: services.map((item) => item.id),
      },
    });
    assert.ok(response);
  });
});
