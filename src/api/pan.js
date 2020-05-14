import request from '@/utils/request'
import { isBlank } from '@/utils'

export function fetchMetadata(boId) {
  return fetchGridMetadata(boId).then(columns => {
    return {
      columns
    }
  })
}

export function fetchGridMetadata(boId) {
  return request({
    url: 'http://58.16.168.92:8400/pan/gridQueryController.spr?action=queryGrid',
    data: {
      boName: 'BizGridColumn',
      defaultCondition: "%20YGRIDCOLUMN.BOID='" + boId + "'",
      editable: true,
      needAuthentication: false,
      orderSql: 'COLUMNNO',
      groupBySql: null,
      distinctSupport: false,
      start: 0,
      limit: 1000
    }}).then(rsp => {
    return rsp.data.filter(col => {
      return col.visibility === 'X'
    }).map((col) => {
      return {
        // 列名
        label: col.fieldtext,
        // 对应属性名
        prop: col.proname,
        // 指定列宽（可选）
        width: isBlank(col.width) ? undefined : Math.max(40, Number(col.width)),
        // 列显示顺序
        columnNo: (col.columnno || '').trim()
      }
    }).sort((c1, c2) => { return (c1.columnNo || '').localeCompare(c2.columnNo || '') })
  })
}
