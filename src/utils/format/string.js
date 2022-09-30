const CAMEL_CASE_EDGES_REGEXP = /([A-Z](?=[A-Z][a-z])|[^A-Z](?=[A-Z])|[a-zA-Z](?=[^a-zA-Z]))/g
/* From https://stackoverflow.com/a/34680912 */

export function camelCaseToTitleCase(str) {
  const spaced = str.replace(CAMEL_CASE_EDGES_REGEXP, " $1")
  return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}
