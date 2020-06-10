import moment from 'moment'
import { FORMAT } from '@/constants'

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
  return moment(dateStr, FORMAT.DATE)
}

export function parseDateTime(dateStr) {
  if (isBlank(dateStr)) { return null }
  return moment(dateStr, FORMAT.DATE_TIME)
}

export function toDateStr(date) {
  return moment(date).format(FORMAT.DATE)
}

export function toDateTimeStr(date) {
  return moment(date).format(FORMAT.DATE_TIME)
}

