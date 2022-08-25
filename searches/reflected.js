const config = require('../config');
const swagger = require('../swagger.json');
const inflection = require('inflection');
const { flattenJSONAPI } = require('../helpers')

module.exports = (name, options = {}) => {
  const schema = swagger.components.schemas[`${name}_list`]
  const typeName = schema.properties.data.items.properties.type.enum[0];
  const apiPath = `/v1/${inflection.pluralize(name)}`

  const inputFields = swagger.paths[apiPath].get.parameters.map((paramSchema) => {
    return {
      key: paramSchema.name,
      label: paramSchema.name.replace("filter[", "").replace("]", ""),
      required: paramSchema.required,
      type: paramSchema.schema.type,
    };
  });

  return {
    key: name,
    noun: inflection.humanize(name),

    display: {
      label: `Get ${inflection.humanize(name)}`,
      description: `Searches ${inflection.humanize(name)}.`
    },

    operation: {
      inputFields: inputFields,
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
