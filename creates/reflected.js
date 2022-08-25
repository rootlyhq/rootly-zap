const config = require('../config');
const swagger = require('../swagger.json');
const inflection = require('inflection');
const { flattenJSONAPI } = require('../helpers')

function inputScalar(key, fieldSchema, requiredSchema) {
  return {
    key: key,
    type: key.match(/_at$/) ? 'datetime' : fieldSchema.type,
    label: inflection.humanize(key),
    required: requiredSchema.includes(key),
    choices: fieldSchema.enum,
  }
}

function inputDict(key, fieldSchema, requiredSchema) {
  return {
    key: key,
    label: inflection.humanize(key),
    required: requiredSchema.includes(key),
    dict: true,
  }
}

function inputStringArray(key, fieldSchema, requiredSchema) {
  return {
    key: key,
    type: "string",
    label: inflection.humanize(key),
    required: requiredSchema.includes(key),
    list: true,
  }
}

function inputObjectArray(key, fieldSchema, requiredSchema) {
  return {
    key: key,
    label: inflection.humanize(key),
    required: requiredSchema.includes(key),
    children: Object.keys(fieldSchema.items.properties).map((subKey) => {
      const subSchema = fieldSchema.items.properties[subKey]
      return inputScalar(subKey, subSchema, Object.keys(fieldSchema.items.properties))
    })
  }
}

function inputDynamicDropdown(key, fieldSchema, requiredSchema, dynamicRef) {
  return {
    key: key,
    type: "string",
    label: inflection.humanize(key),
    required: requiredSchema.includes(key),
    list: fieldSchema.type === "array",
    dynamic: dynamicRef,
  }
}

module.exports = (name, options = {}) => {
  const schema = swagger.components.schemas[`new_${name}`]
  const typeName = schema.properties.data.properties.type.enum[0];
  const fieldsSchema = schema.properties.data.properties.attributes.properties
  const requiredSchema = schema.properties.data.properties.attributes.required || []
  const apiPath = `/v1/${typeName}`

  const inputFields = Object.keys(fieldsSchema).map((key) => {
    const fieldSchema = fieldsSchema[key];
    if (options.dynamic && options.dynamic[key]) {
      return inputDynamicDropdown(key, fieldSchema, requiredSchema, options.dynamic[key]) 
    }
    switch (fieldSchema.type) {
      case "string":
        return inputScalar(key, fieldSchema, requiredSchema);
      case "boolean":
        return inputScalar(key, fieldSchema, requiredSchema);
      case "number":
        return inputScalar(key, fieldSchema, requiredSchema);
      case "array":
        if (fieldSchema.items && fieldSchema.items.type === "string") {
          return inputStringArray(key, fieldSchema, requiredSchema);
        } else if (fieldSchema.items && fieldSchema.items.type === "object") {
          if (fieldSchema.items.properties) {
            return inputObjectArray(key, fieldSchema, requiredSchema);
          }
        }
      case "object":
        return inputDict(key, fieldSchema, requiredSchema);
      default:
        return null
    }
  }).filter((field) => field);

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
              attributes: bundle.inputData,
            },
          })
        }).then((response) => flattenJSONAPI(JSON.parse(response.content).data));
      },
      sample: flattenJSONAPI(swagger.paths[apiPath].post.responses["201"].content["application/vnd.api+json"].example.data),
    }
  };
}
