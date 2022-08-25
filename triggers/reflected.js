const config = require('../config');
const swagger = require('../swagger.json');
const inflection = require('inflection');
const { flattenJSONAPI } = require('../helpers')

module.exports = (name, options = {}) => {
  const schema = swagger.components.schemas[`${name}_list`]
  const typeName = schema.properties.data.items.properties.type.enum[0];
  const apiPath = `/v1/${inflection.pluralize(name)}`

  return {
    key: name,
    noun: inflection.humanize(name),

    display: {
      label: `Get ${inflection.humanize(name)}`,
      hidden: !!options.hidden,
      description: `Triggers when ${inflection.humanize(name)} created.`
    },

    operation: {
      inputFields: [],
      perform: (z, bundle) => {
        return z.request({
          method: 'GET',
          url: `${config.API_URL}${apiPath}`,
          headers: { "Accept": "application/json" },
          params: bundle.inputData,
        }).then((response) => JSON.parse(response.content).data.map(flattenJSONAPI));
      },
      sample: swagger.paths[apiPath].post.responses["201"].content["application/vnd.api+json"].example.data,
    }
  };
}
