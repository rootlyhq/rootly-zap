'use strict';
const should = require('should');

const zapier = require('zapier-platform-core');

const config = require('../config');
const App = require('../index');
const appTester = zapier.createAppTester(App);

describe('create pulse', () => {
  zapier.tools.env.inject();

  it('should create an pulse', (done) => {
    const bundle = {
      authData: {
				api_key: config.API_KEY
      },
      inputData: {
        summary: 'Test Pulse',
      }
    };
    appTester(App.creates.pulse.operation.perform, bundle)
      .then((response) => {

        done();
      })
      .catch(done);
  });
});
