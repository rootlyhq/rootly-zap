const config = require('../config');
const swagger = require('../swagger.json');
const inflection = require('inflection');
const { flattenResponseItem } = require('../helpers')

module.exports = (name, options = {}) => {
  const schema = swagger.components.schemas[`${name}_list`]
  const fieldsSchema = swagger.components.schemas[`new_${name}`].properties.data.properties.attributes.properties
  const typeName = schema.properties.data.items.properties.type.enum[0];
  const apiPath = `/v1/${inflection.pluralize(name)}`

  const inputFields = swagger.paths[apiPath].get.parameters.filter((paramSchema) => {
    return paramSchema.name !== "page[size]" && paramSchema.name !== "page[number]"
  }).map((paramSchema) => {
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
          params: Object.assign({}, bundle.inputData, {
            "page[size]": 1
          }),
        }).then((response) => JSON.parse(response.content).data.map((item) => flattenResponseItem(fieldsSchema, item)));
      },
      sample: flattenResponseItem(fieldsSchema, swagger.paths[apiPath].post.responses["201"].content["application/vnd.api+json"].example.data),
    }
  };
}
