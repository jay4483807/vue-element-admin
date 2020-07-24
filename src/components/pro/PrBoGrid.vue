<template>
  <pr-grid
    ref="grid"
    v-bind="$attrs"
    :row-key-prop="idProp"
    :query-params="_queryParams"
    :grid-actions="gridActions"
    :grid-columns="gridColumns"
    :compute-grid-actions="computeGridActions"
    :toolbar-items="computedToolbarItems"
    :compute-list-data="computeListData"
    :row-data-filter="rowDataFilter"
    v-on="$listeners"
  />
</template>

<script>
import { buildFormItemConfig, getBoMethods, getDict, getGridColumns, getToolbarItems } from '@/api/pan'
import boComponent from '@/components/pro/mixins/boComponent'
import PrGrid from '@/components/pro/PrGrid'
import { callValue, executeConfig, isBlank } from '@/utils/pan'
import { ACTION, UI_TYPE } from '@/constants'
import i18n from 'vue-i18n'
import grid from './mixins/grid'

export default {
  name: 'PrBoGrid',
  components: { PrGrid },
  mixins: [boComponent, grid],
  props: {
    queryParams: {
      type: [Object, Function],
      default() {
        return {}
      }
    },
    toolbarClass: {
      type: String,
      default: 'el-button-group'
    },
    /**
     * 配置grid列表项
     */
    configGridColumns: {
      type: [Function, Array],
      default(items) {
        return items
      }
    },
    /**
     * 配置grid操作列
     */
    configGridActions: {
      type: [Function, Array],
      default(items) {
        return items
      }
    },
    /**
     * 配置工具栏
     */
    configToolbarItems: {
      type: [Function, Array],
      default(items) {
        return items
      }
    },
    rowDataFilter: {
      type: Function,
      default: undefined
    },
    /**
     * 动态计算每一行的gridActions
     * 不同于configGridActions是在渲染前统一配置所有行，这里是在渲染每一行时调用一次
     */
    computeGridActions: {
      type: Function,
      default({ actions, row, rowIndex }) {
        return actions
      }
    },
    computeListData: {
      type: Function,
      default(list) {
        return list
      }
    },
    computeToolbarItems: {
      type: Function,
      default(items) {
        return items
      }
    }
  },
  data() {
    return {
      gridColumns: [],
      gridActions: [],
      toolbarItems: [],
      dicts: {}
    }
  },
  computed: {
    computedToolbarItems() {
      return this.computeToolbarItems(this.toolbarItems)
    },
    computedGridActions() {
      return this.computeGridActions(this.gridActions)
    }
  },
  async created() {
    const config = {}
    const boInfo = await this.getBoInfo(this.boName)
    const boProps = boInfo.props
    const boMethods = await getBoMethods(this.boName)
    if (!this.idProp) {
      console.error('未找到业务对象[' + this.boName + ']的id属性')
    }
    const columns = (await getGridColumns(this.boName)).flatMap(col => {
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
    config.gridColumns = columns.filter(col => {
      return col.visibility && !col.action
    }).map(col => {
      col.width = Math.max(80, col.width)
      return col
    })
    config.gridColumns = executeConfig(this.configGridColumns, this, config.gridColumns)
    for (const column of config.gridColumns) {
      if (column.uiType === UI_TYPE.SELECT && !column.formatter) {
        // 自动添加字典表的formatter
        const options = await getDict(column.dictName)
        column.formatter = (row, column, cellValue, index) => {
          if (options) {
            return options.find(opt => opt.value === cellValue) || cellValue
          }
        }
      }
    }
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
    config.gridActions = executeConfig(this.configGridActions, this, config.gridActions)
    // 列表查询选项
    const searchItems = []
    for (const col of columns.filter(col => col.isCondition)) {
      searchItems.push(await buildFormItemConfig(col, boProps))
    }
    config.searchItems = searchItems

    config.toolbarItems = (await getToolbarItems(this.boName)).map(item => {
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
    config.toolbarItems = executeConfig(this.configToolbarItems, this, config.toolbarItems)
    this.toolbarItems = config.toolbarItems
    this.gridColumns = config.gridColumns
    this.gridActions = config.gridActions
    this.$emit('configOver', config)
    console.log('构造Grid配置：', config)
  },
  mounted() {

  },
  methods: {
    _queryParams() {
      return { boName: this.boName, ...callValue(this.queryParams) }
    }
  }
}
</script>

<style scoped>

</style>
