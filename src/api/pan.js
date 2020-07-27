import request from '@/utils/request'
import { executeConfig, isBlank, transBlank, transBoolean, transNumber } from '@/utils/pan'
import { UI_TYPE, FORMAT } from '@/constants.js'
import moment from 'moment'
import { ACTION } from '@/constants'
import i18n from '@/lang'

const uiTypeMapping = {
  '04': UI_TYPE.DATE,
  '05': UI_TYPE.DATE_TIME,
  '01': UI_TYPE.TEXT,
  '11': UI_TYPE.SEARCH_HELP,
  '06': UI_TYPE.SELECT,
  '12': UI_TYPE.TEXT_AREA,
  '14': UI_TYPE.SYS_USER
}

const boInfos = new Map()
const gridMeta = new Map()
const toolbarMeta = new Map()
const formMeta = new Map()
const formToolbarMeta = new Map()
const boMethods = new Map()

// 业务对象信息
export const BoInfo = {
  boName: String,
  boId: String,
  // 业务对象的id属性名
  idProp: String,
  boText: String,
  tableName: String,
  // 业务对象属性的key-value结果，key为属性名，value为BoProperty
  props: Object
}
// 业务对象属性
export const BoProperty = {
  prop: String,
  label: String,
  dataType: String,
  // 对应搜索帮助信息（可选）
  searchHelpName: String,
  searchHelpDisplayFiled: String,
  searchHelpValueField: String,
  tabname: String,
  colname: String,
  // 对应字典表名(可选）
  dictName: String,
  // 是否是id属性
  idProp: Boolean,
  subBoName: String
}
// 业务对象方法/工具栏按钮
export const BoMethod = {
  action: String,
  label: String,
  url: String,
  // 是否隐藏此按钮
  hidden: Boolean
}
// 列表项
export const GridColumns = {
  ...BoProperty,
  visibility: Boolean,
  // 指定列宽（可选）
  width: Number,
  // 列显示顺序
  columnNo: String,
  // 动作，一般对应成操作按钮（可选）
  action: String,
  isCondition: Boolean,
  // 可编辑grid上此列是否可编辑
  editable: Boolean,
  // 可编辑grid上是否为必填
  required: Boolean,
  // 详见UI_TYPE
  uiType: String
}
// 表单项
export const FormItem = {
  prop: String,
  // 显示文本
  label: String,
  // 详见UI_TYPE
  uiType: String,
  // 默认值
  defaultValue: String,
  // 是否可见
  visibility: Boolean,
  // 是否隐藏，默认false，与visibility区别是hide的表单项还会占据位置，而visibility=false的不会
  hidden: Boolean,
  // 是否必填
  required: Boolean,
  // 是否可编辑
  editable: Boolean,
  // 表单上行位置，从1开始，0表示自动排列
  rowNo: Number,
  // 表单上列位置，从1开始，如果rowNo=0，则作为自动排列的排序号
  colNo: Number
}

export function boQueryGrid(boName, defaultCondition, orderSql, queryParams) {
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
      limit: 1000,
      ...queryParams
    }
  })
}

export async function getBoInfo(boName) {
  return getOrFetch(boInfos, boName, async boName => {
    const { coustom } = await request({
      url: '/vueController.spr?action=getBusinessObject',
      data: {
        boname: boName
      }
    })
    const boInfo = {
      boName: coustom.boname,
      boId: coustom.boid,
      boText: coustom.description,
      tableName: coustom.tablename,
      routePath: coustom.vueroute,
      appModel: coustom.appmodel
    }
    const { data } = await boQueryGrid('BizProperty', "%20YPROPERTIES.BOID='" + boInfo.boId + "'", 'PROTYPE,COLUMNNO')
    const boProps = {}
    const proArr = data.map(col => {
      return {
        // 对应属性名
        prop: col.proname,
        // 列名
        label: col.fieldtext,
        dataType: col.datatype,
        searchHelpName: col.searchhelp,
        searchHelpDisplayFiled: col.shtextcolumn,
        searchHelpValueField: col.shsourcecolumn,
        tabname: col.tabname,
        colname: col.colname,
        dictName: col.dictablename,
        idProp: transBoolean(col.keyflag) && col.proname !== 'client',
        subBoName: transBlank(col.subboname)
      }
    })
    for (const pro of proArr) {
      boProps[pro.prop] = pro
      if (pro.idProp === true) {
        if (boInfo.idProp) {
          console.error('业务对象[' + boName + ']存在重复的id属性')
        } else {
          boInfo.idProp = pro.prop
        }
      }
    }
    boInfo.props = boProps
    console.log('抓取业务对象信息：' + boName, boInfo)
    return boInfo
  })
}

/**
 * 获取业务对象属性
 * @param boName
 * @returns {Promise<*>}
 */
export async function getBoProperties(boName) {
  return (await getBoInfo(boName)).props
}

export async function getGridColumns(boName) {
  return getOrFetch(gridMeta, boName, async boName => {
    const { boId, props } = await getBoInfo(boName)
    const { data } = await boQueryGrid('BizGridColumn', "%20YGRIDCOLUMN.BOID='" + boId + "'", 'COLUMNNO')
    return data.filter(col => {
      return true
    }).map((col) => {
      const readonly = transBoolean(col.readonly, undefined)
      return {
        ...props[col.proname] || {},
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
        editable: readonly !== undefined ? !readonly : undefined,
        required: transBoolean(col.nullable),
        uiType: uiTypeMapping[col.uitype] || UI_TYPE.TEXT
      }
    }).sort((c1, c2) => { return (c1.columnNo || '').localeCompare(c2.columnNo || '') })
  })
}

export async function getToolbarItems(boName) {
  return getOrFetch(toolbarMeta, boName, async boName => {
    const { boId } = await getBoInfo(boName)
    const { data } = await boQueryGrid('BizGridToolbar', "%20YGRIDTOOLBAR.BOID='" + boId + "'", 'ORDERNO')
    const methods = await getBoMethods(boName)
    return data.sort((c1, c2) => { return (c1.orderno || '').localeCompare(c2.orderno || '') }).map(item => {
      return methods[item.methodname] || {
        action: item.methodname,
        label: item.methoddesc
      }
    })
  })
}

export async function getFormItems(boName) {
  return getOrFetch(formMeta, boName, async boName => {
    const { boId } = await getBoInfo(boName)
    const { data } = await boQueryGrid('BizFormColumn', "%20YFORMCOLUMN.BOID='" + boId + "'", 'ROWNO,COLUMNNO')
    return data.map(col => {
      const readonly = transBoolean(col.readonly, undefined)
      return {
        // 对应属性名
        prop: col.proname,
        // 列名
        label: col.fieldtext,
        uiType: uiTypeMapping[col.uitype] || UI_TYPE.TEXT,
        defaultValue: transBlank(col.defaultvalue),
        visibility: transBoolean(col.visibility),
        required: transBoolean(col.nullable),
        editable: readonly !== undefined ? !readonly : undefined,
        colNo: transNumber(col.columnno),
        rowNo: transNumber(col.rowno)
      }
    })
  })
}

export async function getFormToolbar(boName) {
  return getOrFetch(formToolbarMeta, boName, (boName) => {
    return getBoInfo(boName).then(({ boId }) => {
      return boQueryGrid('BizFormToolbar', "%20YFORMTOOLBAR.BOID='" + boId + "'", 'ORDERNO')
    }).then(rsp => {
      return getBoMethods(boName).then(methods => {
        return rsp.data.sort((c1, c2) => { return (c1.orderno || '').localeCompare(c2.orderno || '') }).map(item => {
          return methods[item.methodname] || {
            action: item.methodname,
            label: item.methoddesc
          }
        })
      })
    })
  })
}

export async function getBoMethods(boName) {
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

export function buildQueryParams(items, queryParams, boProps) {
  const params = {}
  for (const item of items) {
    buildQueryParamsOfItem(item, queryParams[item.prop], params, boProps)
  }
  return params
}

function buildQueryParamsOfItem(item, value, params, boProps) {
  if (isBlank(value)) { return }
  const property = boProps && boProps[item.prop] || undefined
  params[item.prop + '.fieldName'] = property && (property.tabname + '.' + property.colname) || item.prop
  params[item.prop + '.option'] = item.option || 'like'
  switch (item.uiType) {
    case UI_TYPE.DATE: {
      params[item.prop + '.fieldValue'] = value && moment(value).format(FORMAT.DATE)
      params[item.prop + '.dataType'] = 'D'
      break
    }
    case UI_TYPE.DATE_TIME: {
      params[item.prop + '.fieldValue'] = value && moment(value).format(FORMAT.DATE_TIME)
      params[item.prop + '.dataType'] = 'D'
      break
    }
    case UI_TYPE.DATE_RANGE: {
      params[item.prop + '.isRangeValue'] = true
      params[item.prop + '.minValue'] = value && moment(value[0]).format(FORMAT.DATE)
      params[item.prop + '.maxValue'] = value && moment(value[1]).format(FORMAT.DATE)
      params[item.prop + '.dataType'] = 'D'
      break
    }
    case UI_TYPE.DATE_TIME_RANGE: {
      params[item.prop + '.isRangeValue'] = true
      params[item.prop + '.minValue'] = value && moment(value[0]).format(FORMAT.DATE_TIME)
      params[item.prop + '.maxValue'] = value && moment(value[1]).format(FORMAT.DATE_TIME)
      params[item.prop + '.dataType'] = 'D'
      break
    }
    case UI_TYPE.SELECT:
    case UI_TYPE.TEXT:
    default: {
      params[item.prop + '.fieldValue'] = value
      params[item.prop + '.dataType'] = 'S'
    }
  }
}

export async function queryList(query, boName = 'null') {
  return pageQuery('/gridQueryController.spr?action=queryGrid', {
    boName,
    defaultCondition: '',
    orderSql: '',
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
      start: (typeof query.start === 'number') ? query.start : (query.page - 1) * query.limit,
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

export async function buildGridConfig(boName, option = {}) {
  const config = {}
  const boInfo = await getBoInfo(boName)
  config.idProp = boInfo.idProp
  const boProps = await getBoProperties(boName)
  const boMethods = await getBoMethods(boName)
  if (!config.idProp) {
    console.error('未找到业务对象[' + boName + ']的id属性')
  }
  let columns = (await getGridColumns(boName)).flatMap(col => {
    // 复制一份配置，避免多处配置发生冲突
    const column = {
      ...col
    }
    if (column.uiType === UI_TYPE.SEARCH_HELP) {
      // 搜索帮助，自动补一个搜索帮助名称列
      return [column, {
        ...column,
        prop: column.prop + '_text',
        label: column.label + '名称',
        visibility: true,
        action: undefined,
        isCondition: false,
        uiType: UI_TYPE.TEXT
      }]
    } else {
      return [column]
    }
  })
  columns = executeConfig(option.preConfigColumns, option, columns)
  config.gridColumns = columns.filter(col => {
    return col.visibility && !col.action
  }).map(col => {
    if (!col.minWdith) { col.minWdith = 80 }
    return col
  })
  config.gridColumns = executeConfig(option.configGridColumns, option, config.gridColumns)
  config.gridActions = columns.filter(col => {
    return col.visibility && col.action
  }).map(col => {
    if (boMethods[col.action]) {
      col.label = boMethods[col.action].label || col.label
      col.url = boMethods[col.action].url
    }
    if (isBlank(col.label)) {
      switch (col.action) {
        case ACTION.CREATE:
        case ACTION.EDIT:
        case ACTION.VIEW:
        case ACTION.DELETE:
          col.label = i18n.t('pan.' + col.action)
      }
    }
    return col
  })
  config.gridActions = executeConfig(option.configGridActions, option, config.gridActions)
  // 列表查询选项
  const searchItems = []
  for (const col of columns.filter(col => col.isCondition)) {
    searchItems.push(await buildFormItemConfig(col, boProps))
  }
  config.searchItems = searchItems

  config.toolbarItems = (await getToolbarItems(boName)).map(item => {
    item = { ...item } // 复制一份配置，避免多处配置发生冲突
    if (item.action === ACTION.DELETES) {
      item.btnType = 'danger'
    }
    if (boMethods[item.action]) {
      item.label = boMethods[item.action].label
      item.url = boMethods[item.action].url
    }
    return item
  })
  config.toolbarItems = executeConfig(option.configToolbarItems, option, config.toolbarItems)
  return config
}

export async function buildFormItemConfig(col, boProperties) {
  const property = boProperties[col.prop] || {}
  const item = { ...property, ...col }
  if (item.uiType === UI_TYPE.SELECT) {
    item.selectOptions = await getDict(boProperties[item.prop].dictName)
  }
  return item
}

export async function getBoBaseUrl(boName) {
  const boInfo = await getBoInfo(boName)
  if (!boInfo.routePath) {
    throw new Error('未配置业务对象[' + boName + ']的vue路径')
  }
  return boInfo.appModel + '/' + boInfo.routePath
}
