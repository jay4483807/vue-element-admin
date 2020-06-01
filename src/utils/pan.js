export function isBlank(str) {
  if (typeof str === 'string') {
    return str === '' || str.match(/^\s*$/)
  } else {
    return str === null || str === undefined
  }
}

export function transBlank(str, replaceValue) {
  return isBlank(str) ? replaceValue : str
}

export function transBoolean(value) {
  return value === 'X'
}

export function transNumber(value, defaultValue = 0) {
  return typeof value === 'number' ? value : (isBlank(value) ? defaultValue : Number(value))
}

export function parseDate(dateStr) {
  if (isBlank(dateStr)) { return null }
  return new Date(dateStr.substr(0, 4), dateStr.substr(4, 2), dateStr.substr(6, 2))
}

export function parseDateTime(dateStr) {
  if (isBlank(dateStr)) { return null }
  return new Date(dateStr.substr(0, 4), dateStr.substr(4, 2), dateStr.substr(6, 2), dateStr.substr(8, 2), dateStr.substr(10, 2), dateStr.substr(12, 2))
}

