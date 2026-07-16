const reflectedCreate = require('./creates/reflected');
const reflectedSearch = require('./searches/reflected');
const reflectedTrigger = require('./triggers/reflected');

const { authentication, addApiKeyToHeader } = require('./authentication');

const handleHTTPError = (response, z) => {
  if (response.status >= 400) {
    throw new Error(`Unexpected status code ${response.status}`);
  }
  return response;
};

const App = {
  version: require('./package.json').version,
  platformVersion: require('zapier-platform-core').version,
  authentication: authentication,
  beforeRequest: addApiKeyToHeader,

  afterResponse: [
    handleHTTPError
  ],

  flags: {
    cleanInputData: false,
  },

  resources: {
  },

  // If you want your trigger to show up, you better include it here!
  triggers: {
    alert: reflectedTrigger("alert"),
    incident: reflectedTrigger("incident"),
    pulse: reflectedTrigger("pulse"),

    severity: reflectedTrigger("severity", { hidden: true }),
    service: reflectedTrigger("service", { hidden: true }),
    environment: reflectedTrigger("environment", { hidden: true }),
    incident_type: reflectedTrigger("incident_type", { hidden: true }),
    functionality: reflectedTrigger("functionality", { hidden: true }),
    team: reflectedTrigger("team", { hidden: true }),
  },

  // If you want your searches to show up, you better include it here!
  searches: {
    alert: reflectedSearch("alert"),
    incident: reflectedSearch("incident"),
    pulse: reflectedSearch("pulse"),
  },

  // If you want your creates to show up, you better include it here!
  creates: {
    alert: reflectedCreate("alert"),
    incident: reflectedCreate("incident", {
      dynamic: {
        severity_id: "severity.id.name",
        service_ids: "service.id.name",
        environment_ids: "environment.id.name",
        incident_type_ids: "incident_type.id.name",
        functionality_ids: "functionality.id.name",
        group_ids: "team.id.name",
      }
    }),
    pulse: reflectedCreate("pulse"),
  }
};

// Finally, export the app.
module.exports = App;
