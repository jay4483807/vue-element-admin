export function isBlank(str) {
  return str === null || str === undefined || str === '' || str.match(/^\s*$/)
}

export function tranBlank(str, replaceValue) {
  return isBlank(str) ? replaceValue : str
}

export function tranBoolean(value) {
  return value === 'X'
}
