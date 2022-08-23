'use strict';
const should = require('should');

const zapier = require('zapier-platform-core');

const config = require('../config');
const App = require('../index');
const appTester = zapier.createAppTester(App);

describe('create alert', () => {
  zapier.tools.env.inject();

  it('should create an alert', (done) => {
    const bundle = {
      authData: {
        api_key: config.API_KEY
      },
      inputData: {
        summary: 'Test Alert',
        source: 'Test Source',
      }
    };
    appTester(App.creates.alert.operation.perform, bundle)
      .then((response) => {

        done();
      })
      .catch(done);
  });
});
