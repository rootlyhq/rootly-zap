exports.flattenJSONAPI = (item) => {
  const flattened = item.attributes;
  flattened.id = item.id
  return flattened;
}
