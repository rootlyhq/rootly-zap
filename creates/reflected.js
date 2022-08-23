const config = require('../config');
const swagger = require('../swagger.json');
const inflection = require('inflection');

function inputScalar(key, fieldSchema, requiredSchema) {
  return {
    key: key,
    type: fieldSchema.type,
    label: inflection.humanize(key),
    description: fieldSchema.description,
    required: requiredSchema.includes(key),
    choices: fieldSchema.enum,
  }
}

function inputDict(key, fieldSchema, requiredSchema) {
  return {
    key: key,
    label: inflection.humanize(key),
    description: fieldSchema.description,
    required: requiredSchema.includes(key),
    dict: true,
  }
}

function inputStringArray(key, fieldSchema, requiredSchema) {
  return {
    key: key,
    type: fieldSchema.type,
    label: inflection.humanize(key),
    description: fieldSchema.description,
    required: requiredSchema.includes(key),
    list: true,
  }
}

function inputObjectArray(key, fieldSchema, requiredSchema) {
  return {
    key: key,
    label: inflection.humanize(key),
    description: fieldSchema.description,
    required: requiredSchema.includes(key),
    children: Object.keys(fieldSchema.items.properties).map((subKey) => {
      const subSchema = fieldSchema.items.properties[subKey]
      return inputScalar(subKey, subSchema, Object.keys(fieldSchema.items.properties))
    })
  }
}

module.exports = (name) => {
  const schema = swagger.components.schemas[`new_${name}`]
  const typeName = schema.properties.data.properties.type.enum[0];
  const fieldsSchema = schema.properties.data.properties.attributes.properties
  const requiredSchema = schema.properties.data.properties.attributes.required || []
  const apiPath = `/v1/${typeName}`

  const inputFields = Object.keys(fieldsSchema).map((key) => {
    const fieldSchema = fieldsSchema[key];
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
      inputFields: [
        {key: 'name', label: 'Name', required: false},
      ],
      perform: (z, bundle) => {
        return z.request({
          method: 'POST',
          url: `${config.API_URL}${apiPath}`,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            data: {
              type: typeName,
              attributes: bundle.inputData,
            },
          })
        }).then(res => JSON.parse(res.content));
      },
      sample: swagger.paths[apiPath].post.responses["201"].content["application/vnd.api+json"].example,
    }
  };
}
