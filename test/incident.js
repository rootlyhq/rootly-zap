'use strict';
const assert = require('assert');

const zapier = require('zapier-platform-core');

const config = require('../config');
const App = require('../index');
const appTester = zapier.createAppTester(App);

describe('create incident', () => {
  zapier.tools.env.inject();

  it('should create an incident', (done) => {
    appTester(App.triggers.severity.operation.perform, {
      authData: {
        api_key: config.API_KEY
      },
      inputData: {
        "filter[name]": "SEV1"
      }
    }).then((response) => {
      const severity_id = response[0].id;
      return appTester(App.triggers.service.operation.perform, {
        authData: {
          api_key: config.API_KEY
        },
        inputData: {
          "filter[name]": ""
        }
      }).then((response) => {
        const service_ids = response.map((item) => item.id);
        appTester(App.creates.incident.operation.perform, {
          authData: {
            api_key: config.API_KEY
          },
          inputData: {
            name: 'Test Incident',
            severity_id: severity_id,
            service_ids: service_ids,
          }
        }).then((response) => {
          assert.ok(response);
          done();
        }).catch(done);
      });
    });
  });
});
