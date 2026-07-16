const config = require('../config');
const swagger = require('../swagger.json');
const inflection = require('inflection');
const { inputSchema, unflattenInputs, flattenResponseItem, generateSample } = require('../helpers')

module.exports = (name, options = {}) => {
  const schema = swagger.components.schemas[`new_${name}`]
  const typeName = schema.properties.data.properties.type.enum[0];
  const fieldsSchema = schema.properties.data.properties.attributes.properties
  const requiredSchema = schema.properties.data.properties.attributes.required || []
  const apiPath = `/v1/${typeName}`

  const inputFields = inputSchema(fieldsSchema, requiredSchema, options);

  return {
    key: name,
    noun: inflection.humanize(name),

    display: {
      label: `Create ${inflection.humanize(name)}`,
      description: `Creates ${inflection.humanize(name)}.`
    },

    operation: {
      inputFields: inputFields,
      perform: (z, bundle) => {
        return z.request({
          method: 'POST',
          url: `${config.API_URL}${apiPath}`,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            data: {
              type: typeName,
              attributes: unflattenInputs(bundle.inputData, fieldsSchema),
            },
          })
        }).then((response) => flattenResponseItem(fieldsSchema, JSON.parse(response.content).data));
      },
      sample: flattenResponseItem(fieldsSchema, swagger.paths[apiPath].post.responses["201"].content["application/vnd.api+json"].example?.data || generateSample(fieldsSchema)),
    }
  };
}
