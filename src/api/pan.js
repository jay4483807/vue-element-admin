import request from '@/utils/request'
import { isBlank, transBlank, transBoolean, transNumber } from '@/utils/pan'
import { UI_TYPE, FORMAT } from '@/constants.js'
import moment from 'moment'

const uiTypeMapping = {
  '04': UI_TYPE.DATE,
  '05': UI_TYPE.DATE_TIME,
  '01': UI_TYPE.TEXT,
  '11': UI_TYPE.SEARCH_HELP,
  '06': UI_TYPE.SELECT,
  '12': UI_TYPE.TEXT_AREA
}

const boInfos = new Map()
const boIdMap = new Map()
const gridMeta = new Map()
const toolbarMeta = new Map()
const formMeta = new Map()
const formToolbarMeta = new Map()
const boMethods = new Map()

function boQueryGrid(boName, defaultCondition, orderSql) {
  return request({
    url: '/gridQueryController.spr?action=queryGrid',
    data: {
      boName,
      defaultCondition,
      editable: true,
      needAuthentication: false,
      orderSql,
      groupBySql: null,
      distinctSupport: false,
      start: 0,
      limit: 1000
    }
  })
}

export async function getBoInfo(boName) {
  let boInfo = boInfos.get(boName)
  if (!boInfo) {
    const { coustom } = await request({
      url: '/vueController.spr?action=getBusinessObject',
      data: {
        boname: boName
      }
    })
    boInfo = {
      boName: coustom.boname,
      boId: coustom.boid,
      description: coustom.description
    }
    boInfos.set(boName, boInfo)
  }
  return boInfo
}

export async function getBoMetadata(boName) {
  return getOrFetch(boIdMap, boName, async(boName) => {
    const { boId } = await getBoInfo(boName)
    const proArr = await fetchBoProperties(boId)
    const boMetadata = {}
    for (const pro of proArr) {
      boMetadata[pro.prop] = pro
    }
    return boMetadata
  })
}

export async function getGridMetadata(boName) {
  return getOrFetch(gridMeta, boName, fetchGridMetadata)
}

export async function getToolbarMetadata(boName) {
  return getOrFetch(toolbarMeta, boName, fetchToolbarMetadata)
}

export async function getFormColumns(boName) {
  return getOrFetch(formMeta, boName, fetchFormColumns)
}

export async function getFormToolbar(boName) {
  return getOrFetch(formToolbarMeta, boName, (boName) => {
    return getBoInfo(boName).then(({ boId }) => {
      return boQueryGrid('BizFormToolbar', "%20YFORMTOOLBAR.BOID='" + boId + "'", 'ORDERNO')
    }).then(rsp => {
      return getBoMethod(boName).then(methods => {
        return rsp.data.map(item => {
          return {
            ...(methods[item.methodname] || {}),
            action: item.methodname,
            label: item.methoddesc
          }
        })
      })
    })
  })
}

export async function getBoMethod(boName) {
  return getOrFetch(boMethods, boName, (boName) => {
    return getBoInfo(boName).then(({ boId }) => {
      return boQueryGrid('BizMethod', "%20YMETHOD.BOID='" + boId + "'", null)
    }).then(rsp => {
      const methods = {}
      for (const method of rsp.data) {
        methods[method.methodname] = {
          action: method.methodname,
          label: method.methoddesc,
          url: method.url
        }
      }
      return methods
    })
  })
}

async function getOrFetch(map, key, fetchFunc) {
  let result = map.get(key)
  if (!result) {
    result = await fetchFunc(key)
    map.set(key, result)
  }
  return result
}

// 获取业务对象属性
export function fetchBoProperties(boId) {
  return boQueryGrid('BizProperty', "%20YPROPERTIES.BOID='" + boId + "'", 'PROTYPE,COLUMNNO').then(rsp => {
    return rsp.data.map(col => {
      return {
        // 对应属性名
        prop: col.proname,
        // 列名
        label: col.fieldtext,
        dataType: col.datatype,
        searchHelpName: col.searchhelp,
        searchHelpText: col.searchhelp_text,
        searchHelpDisplayFiled: col.shtextcolumn,
        searchHelpValueField: col.shsourcecolumn,
        tabname: col.tabname,
        colname: col.colname,
        dictName: col.dictablename,
        idProp: transBoolean(col.keyflag) && col.proname !== 'client'
      }
    })
  })
}

async function fetchGridMetadata(boName) {
  const { boId } = await getBoInfo(boName)
  const { data } = await boQueryGrid('BizGridColumn', "%20YGRIDCOLUMN.BOID='" + boId + "'", 'COLUMNNO')
  return data.filter(col => {
    return true
  }).map((col) => {
    return {
      // 对应属性名
      prop: col.proname,
      // 列名
      label: col.fieldtext,
      visibility: transBoolean(col.visibility),
      // 指定列宽（可选）
      width: isBlank(col.width) ? undefined : Math.max(40, Number(col.width)),
      // 列显示顺序
      columnNo: (col.columnno || '').trim(),
      // 动作，一般对应成操作按钮（可选）
      action: transBlank(col.methodname),
      isCondition: transBoolean(col.iscondition),
      uiType: uiTypeMapping[col.uitype] || UI_TYPE.TEXT
    }
  }).sort((c1, c2) => { return (c1.columnNo || '').localeCompare(c2.columnNo || '') })
}

async function fetchToolbarMetadata(boName) {
  const { boId } = await getBoInfo(boName)
  const { data } = await boQueryGrid('BizGridToolbar', "%20YGRIDTOOLBAR.BOID='" + boId + "'", 'ORDERNO')
  return data.map(item => {
    return {
      action: item.methodname,
      label: item.methoddesc
    }
  })
}

async function fetchFormColumns(boName) {
  const { boId } = await getBoInfo(boName)
  const { data } = await boQueryGrid('BizFormColumn', "%20YFORMCOLUMN.BOID='" + boId + "'", 'ROWNO,COLUMNNO')
  return data.map(col => {
    return {
      // 对应属性名
      prop: col.proname,
      // 列名
      label: col.fieldtext,
      uiType: uiTypeMapping[col.uitype] || UI_TYPE.TEXT,
      defaultValue: transBlank(col.defaultvalue),
      visibility: transBoolean(col.visibility),
      required: transBoolean(col.nullable),
      readOnly: transBoolean(col.readonly),
      colNo: transNumber(col.columnno),
      rowNo: transNumber(col.rowno)
    }
  })
}

export async function buildQueryParams(items, listQuery, boMeta) {
  const params = {
    ...listQuery
  }
  for (const item of items) {
    buildQueryParamsOfItem(item, params[item.prop], params, boMeta)
  }
  for (const item of items) {
    // 不能在前面先删除属性，否则遇到重复的item会丢失数据
    delete params[item.prop]
  }
  return params
}

function buildQueryParamsOfItem(item, value, listQuery, boMeta) {
  const property = boMeta[item.prop]
  if (!property) {
    console.log('找不到属性[' + item.prop + ']对应的属性', item)
    return
  }
  value = value || ''
  listQuery[item.prop + '.option'] = item.option || 'like'
  switch (item.uiType) {
    case UI_TYPE.DATE: {
      listQuery[item.prop + '.fieldValue'] = value && moment(value).format(FORMAT.DATE)
      listQuery[item.prop + '.fieldName'] = property.tabname + '.' + property.colname
      listQuery[item.prop + '.dataType'] = item.dataType || 'D'
      break
    }
    case UI_TYPE.DATE_TIME: {
      listQuery[item.prop + '.fieldValue'] = value && moment(value).format(FORMAT.DATE_TIME)
      listQuery[item.prop + '.fieldName'] = property.tabname + '.' + property.colname
      listQuery[item.prop + '.dataType'] = item.dataType || 'D'
      break
    }
    case UI_TYPE.DATE_RANGE: {
      listQuery[item.prop + '.isRangeValue'] = true
      listQuery[item.prop + '.minValue'] = value && moment(value[0]).format(FORMAT.DATE)
      listQuery[item.prop + '.maxValue'] = value && moment(value[1]).format(FORMAT.DATE)
      listQuery[item.prop + '.fieldName'] = property.tabname + '.' + property.colname
      listQuery[item.prop + '.dataType'] = item.dataType || 'D'
      break
    }
    case UI_TYPE.DATE_TIME_RANGE: {
      listQuery[item.prop + '.isRangeValue'] = true
      listQuery[item.prop + '.minValue'] = value && moment(value[0]).format(FORMAT.DATE_TIME)
      listQuery[item.prop + '.maxValue'] = value && moment(value[1]).format(FORMAT.DATE_TIME)
      listQuery[item.prop + '.fieldName'] = property.tabname + '.' + property.colname
      listQuery[item.prop + '.dataType'] = item.dataType || 'D'
      break
    }
    case UI_TYPE.SELECT:
    case UI_TYPE.TEXT:
    default: {
      listQuery[item.prop + '.fieldValue'] = value
      listQuery[item.prop + '.fieldName'] = property.tabname + '.' + property.colname
      listQuery[item.prop + '.dataType'] = item.dataType || 'S'
    }
  }
}

export async function queryList(query, boName = '') {
  return pageQuery('/gridQueryController.spr?action=queryGrid', {
    boName,
    defaultCondition: ' 1=1',
    orderSql: 'CREATETIME DESC',
    distinctSupport: false,
    needAuthentication: false,
    editable: false,
    groupBySql: null,
    ...query
  })
}

function pageQuery(url, query) {
  return request({
    url,
    method: 'post',
    params: {
      start: (query.page - 1) * query.limit,
      limit: query.limit,
      ...query
    }
  }).then(rsp => {
    return {
      data: {
        total: rsp.totalSize,
        items: rsp.data || []
      }
    }
  })
}

export function getDict(dictName) {
  return request({
    url: '/vueController.spr?action=getDictonaryInfo',
    data: {
      dictname: dictName
    }
  }).then(rsp => {
    return (rsp.coustom.dictlist || []).map(item => {
      return {
        value: item.CODE,
        text: item.CODETEXT
      }
    })
  })
}

export function fetchSearchHelpInfo(searchHelpName) {
  return request({
    url: '/vueController.spr?action=getSearchhelpInfo',
    data: {
      searchhelpname: searchHelpName
    }
  }).then(rsp => {
    return rsp.coustom.scinfo.map(item => {
      return {
        prop: item.fieldname,
        label: item.ddtext,
        isCondition: transBoolean(item.shlpinput),
        columnNo: item.shlplispos,
        // 列是否可见
        visibility: transBoolean(item.shlpoutput),
        // 查询条件顺序
        conditionNo: item.shlpselpos
      }
    })
  })
}

export function querySearchHelpList(query, searchHelpName) {
  return pageQuery('/searchHelpQueryController.spr?action=queryShlpGrid', {
    ...query,
    shlpName: searchHelpName
  })
}

export function querySearchHelpDataByIds(searchHelpName, idProp, ids) {
  return request({
    url: '/vueController.spr?action=getSearchhelpText',
    data: {
      searchhelpname: searchHelpName,
      shsourcecolumn: idProp,
      shtextcolumn: idProp,
      sourcevalue: ids.join(','),
      isqueryall: 'Y'
    }
  }).then(rsp => {
    const result = rsp.coustom.rowinfo
    return (result instanceof Array) ? result : [result]
  })
}

export function fetchFormData(boName, id) {
  return getBoInfo(boName).then(({ boId }) => {
    return request({
      url: '/vueController.spr?action=getBusinessObjectInfo&language=ZH',
      params: { businessid: id, boid: boId }
    })
  }).then(rsp => {
    return rsp.coustom.billinfo
  })
}
