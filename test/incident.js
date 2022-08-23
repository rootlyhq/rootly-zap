'use strict';
const should = require('should');

const zapier = require('zapier-platform-core');

const config = require('../config');
const App = require('../index');
const appTester = zapier.createAppTester(App);

describe('create incident', () => {
  zapier.tools.env.inject();

  it('should create an incident', (done) => {
    const bundle = {
      authData: {
        api_key: config.API_KEY
      },
      inputData: {
        name: 'Test Incident',
      }
    };
    appTester(App.creates.incident.operation.perform, bundle)
      .then((response) => {

        done();
      })
      .catch(done);
  });
});
