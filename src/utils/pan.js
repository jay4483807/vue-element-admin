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

export function transBoolean(value, defaultValue) {
  return value === 'X' ? true : defaultValue
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

/**
 * 将configArr中的配置项合并到target中，会根据mergeKey指定的属性匹配配置项
 * @param target
 * @param configArr
 * @param mergeKey
 * @returns {Array}
 */
export function mergeConfig(target, configArr, mergeKey = 'prop') {
  if (target instanceof Array) {
    if (!(configArr instanceof Array)) {
      configArr = [configArr]
    }
    for (const configItem of configArr) {
      let found = false
      if (!isBlank(configItem[mergeKey])) {
        for (let i = 0; i < target.length; i++) {
          const item = target[i]
          if (configItem[mergeKey] === item[mergeKey]) {
            mergeObj(item, configItem)
            if (configItem.$index !== undefined) {
              target.splice(i, 1)
              target.splice(configItem.$index, 0, item)
            }
            found = true
          }
        }
      }
      if (!found) {
        // 如果没有找到匹配的配置就新增这个配置
        if (configItem.$index !== undefined) {
          target.splice(configItem.$index, 0, { ...configItem })
        } else {
          target.push({ ...configItem })
        }
      }
    }
  } else {
    throw new Error('暂时只支持Array类型的配置合并')
  }
  return target
}

export function mergeObj(target, options) {
  for (const key in options) {
    target[key] = options[key]
  }
}

export function executeConfig(configOption, _this, data) {
  if (configOption === undefined) { return data }
  if (typeof configOption === 'function') {
    return configOption.call(_this, data) || data
  } else {
    return configOption || data
  }
}
