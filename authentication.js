const config = require('./config');

const authentication = {
  type: 'custom',
  connectionLabel: "rootly",
  test: {
    url: `${config.API_URL}/v1/users/me.json`,
  },
  fields: [
    {
      key: 'api_key',
      type: 'string',
      required: true,
      helpText: 'Found on Manage Api Keys page: https://rootly.com/account/api-keys.',
    },
  ],
};

const addApiKeyToHeader = (request, z, bundle) => {
  request.headers.Authorization = `Bearer ${bundle.authData.api_key}`;
  return request;
};

module.exports = { authentication, addApiKeyToHeader };
