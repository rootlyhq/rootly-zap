const inflection = require('inflection');

const inputSchema = exports.inputSchema = (fieldsSchema, requiredSchema, options) => {
  return Object.keys(fieldsSchema).map((key) => {
    const fieldSchema = fieldsSchema[key];
    if (options.dynamic && options.dynamic[key]) {
      return inputDynamicDropdownSchema(key, fieldSchema, requiredSchema, options.dynamic[key]) 
    }
    switch (fieldSchema.type) {
      case "string":
        return inputScalarSchema(key, fieldSchema, requiredSchema);
      case "boolean":
        return inputScalarSchema(key, fieldSchema, requiredSchema);
      case "number":
        return inputScalarSchema(key, fieldSchema, requiredSchema);
      case "array":
        if (fieldSchema.items && fieldSchema.items.type === "string") {
          return inputStringArraySchema(key, fieldSchema, requiredSchema);
        } else if (fieldSchema.items && fieldSchema.items.type === "object") {
          if (fieldSchema.items.properties) {
            return inputObjectArraySchema(key, fieldSchema, requiredSchema);
          }
        }
      case "object":
        if (fieldSchema.properties) {
          return inputObjectSchema(key, fieldSchema, requiredSchema);
        } else {
          return inputDictSchema(key, fieldSchema, requiredSchema);
        }
      default:
        return null
    }
  }).filter((field) => field);
}

const inputScalarSchema = exports.inputScalarSchema = (key, fieldSchema, requiredSchema) => {
  return {
    key: key,
    type: key.match(/_at$/) ? 'datetime' : fieldSchema.type,
    label: inflection.humanize(key),
    required: requiredSchema.includes(key),
    choices: fieldSchema.enum,
  }
}

const inputDynamicDropdownSchema = exports.inputDynamicDropdownSchema = (key, fieldSchema, requiredSchema, dynamicRef) => {
  return {
    key: key,
    type: "string",
    label: inflection.humanize(key),
    required: requiredSchema.includes(key),
    list: fieldSchema.type === "array",
    dynamic: dynamicRef,
  }
}

const inputDictSchema = exports.inputDictSchema = (key, fieldSchema, requiredSchema) => {
  return {
    key: key,
    label: inflection.humanize(key),
    required: requiredSchema.includes(key),
    dict: true,
  }
}

const inputStringArraySchema = exports.inputStringArraySchema = (key, fieldSchema, requiredSchema) => {
  return {
    key: key,
    type: "string",
    label: inflection.humanize(key),
    required: requiredSchema.includes(key),
    list: true,
  }
}

const inputObjectSchema = exports.inputObjectSchema = (key, fieldSchema, requiredSchema) => {
  return {
    key: key,
    label: inflection.humanize(key),
    required: requiredSchema.includes(key),
    children: Object.keys(fieldSchema.properties).map((subKey) => {
      const subSchema = fieldSchema.properties[subKey];
      return inputScalarSchema(subKey, subSchema, subSchema.required || [])
    })
  }
}

// Zapier does not allow lists of maps. We have to flatten and then unflatten when making the API request.
const inputObjectArraySchema = exports.inputObjectArraySchema = (key, fieldSchema, requiredSchema) => {
  // array of { id: "foo", name: "foo" } we flatten to list of ids and unflatten by setting name to id
  if (fieldSchema.items.properties.id) {
    return inputDictSchema(key, fieldSchema, requiredSchema);
  } else if (fieldSchema.items.properties.key) {
    return inputStringArraySchema(key, fieldSchema, requiredSchema);
  } else {
    throw new Error("unsupported list of map schema");
  }
}

const unflattenInputs = exports.unflattenInputs = (inputData, fieldsSchema) => {
  const unflattened = {};
  Object.keys(inputData).forEach((key) => {
    const fieldSchema = fieldsSchema[key];
    if (fieldSchema && fieldSchema.type === 'array' && fieldSchema.items && fieldSchema.items.type === 'object') {
      unflattened[key] = unflattenObjectArrayInput(inputData[key], fieldSchema);
    } else {
      unflattened[key] = inputData[key];
    }
  })
  return unflattened;
}

const unflattenObjectArrayInput = exports.unflattenObjectArrayInput = (inputItem, fieldSchema) => {
  if (fieldSchema.items.properties.id) {
    return inputItem.map((id) => ({ id: id, name: id }));
  } else if (fieldSchema.items.properties.key) {
    return Object.keys(inputItem).map((key) => ({ key: key, value: inputItem[key] }));
  } else {
    throw new Error("unsupported list of map schema");
  }
}

const flattenResponseItem = exports.flattenResponseItem = (fieldsSchema, jsonApiItem) => {
  const item = flattenJSONAPI(jsonApiItem)
  const flattened = { id: item.id };
  Object.keys(item).forEach((key) => {
    const fieldSchema = fieldsSchema[key];
    if (fieldSchema) {
      if (fieldSchema.type === 'array' && fieldSchema.items && fieldSchema.items.type === 'object') {
        if (fieldSchema.items.properties && fieldSchema.items.properties.id) {
          flattened[key] = item[key].map((item) => item.id);
        } else if (fieldSchema.items.properties && fieldSchema.items.properties.key) {
          flattened[key] = item[key].reduce((b, pair) => {
            b[pair.key] = pair.value;
            return b;
          }, {})
        } else {
          throw new Error("unsupported list of map schema");
        }
      } else {
        flattened[key] = item[key];
      }
    }
  })
  return flattened;
}

const flattenJSONAPI = exports.flattenJSONAPI = (item) => {
  const flattened = item.attributes;
  flattened.id = item.id
  return flattened;
}
