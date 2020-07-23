<template>
  <list-page
    ref="page"
    v-bind="bindProps"
    @selection-change="selectedRows = $event"
  />
</template>

<script>
import { mergeConfig } from '../../utils/pan'
import { ACTION, UI_TYPE } from '../../constants'
import list from '../pan/components/list'

export default {
  mixins: [list],
  data() {
    return {
      // 扩展列表查询条件
      queryParams: {
        whereSql: '',
        orderSql: 'CREATETIME DESC',
        defaultCondition: ''
      },
      selectedRows: []
    }
  },
  methods: {
    // 配置快速查询选项
    configQuickSearchItems(items) {
      // 过滤查询项，只显示指定的选项
      items = items.filter(item => ['businessstate', 'purchaseapplyno', 'applydate'].includes(item.prop))
      // 修改查询选项
      mergeConfig(items, [{
        prop: 'applydate',
        uiType: UI_TYPE.DATE_RANGE
      }, {
        prop: 'businessstate',
        uiType: UI_TYPE.SELECT,
        selectOptions: [{
          value: '-1',
          text: '作废'
        }, {
          value: '0',
          text: '新增'
        }, {
          value: '1',
          text: '在途'
        }, {
          value: '8',
          text: '审批通过'
        }, {
          value: '9',
          text: '审批不通过'
        }, {
          value: '2',
          text: '单据处理'
        }]
      }])
      console.log('配置快速查询配置选项:', items)
      return items
    },
    // 配置更多查询选项
    configSearchMoreItems(items) {
      // 移除指定查询选项
      items = items.filter(item => !['creator'].includes(item.prop))
      // 增加查询选项
      items.push({
        prop: 'purchasename',
        label: '采购员',
        uiType: UI_TYPE.SEARCH_HELP,
        searchHelpName: 'YHUSERALL',
        searchHelpDisplayFiled: 'BYNAME',
        searchHelpValueField: 'USERID'
      }, {
        prop: 'isprint',
        label: '是否已打印',
        uiType: UI_TYPE.SELECT,
        selectOptions: [{ value: 'Y', text: '是' }, { value: 'N', text: '否' }]
      })
      console.log('配置更多查询配置选项:', items)
      return items
    },
    // 配置工具栏按钮
    configToolbarItems(items) {
      mergeConfig(items, [{
        action: '_printApply',
        callback: ({ item }) => {
          const list = this.$refs.page.getList() // 获取当前查询到的记录
          alert('导出申请单...，已选中 ' + this.selectedRows.length + ' 条记录，当前页有 ' + list.length + ' 条记录：\n' + item.url)
        }
      }], 'action')
      console.log('配置工具栏按钮:', items)
      return items
    },
    // 配置grid列
    configGridColumns(columns) {
      console.log('配置Grid列:', columns)
      mergeConfig(columns, [{
        prop: 'bedat',
        width: 120 // 调整列宽
      }, {
        prop: 'isprint',
        // 格式化显示的内容
        formatter(row, column, cellValue, index) {
          return { 'Y': '是', 'N': '否' }[cellValue] || cellValue
        }
      }, { // 增加列
        prop: 'businessstate',
        label: '单据状态',
        $index: 0 // 明确指定在数组中的位置，mergeConfig会根据此值调整位置
      }])
      return columns
    },
    // 配置grid操作
    configGridActions(actions) {
      mergeConfig(actions, {
        action: '_changeApply',
        // 操按钮点击回调处理
        callback: ({ item, row, rowIndex }) => {
          alert('点击变更，对象id:' + row[this.$refs.page.idProp])
        }
      }, 'action')
      console.log('配置Grid操作:', actions)
      return actions
    },
    // 动态计算工具栏
    computeToolbarItems(items) {
      mergeConfig(items, {
        action: '_printApply',
        label: '导出申请单（' + this.selectedRows.length + '）'
      }, 'action')
      return items
    },
    // 动态计算每一行的按钮项
    computeGridActions({ actions, row, rowIndex }) {
      return actions.map(item => {
        if (item.action === ACTION.EDIT) {
          // 注意这里每一行的配置项值可能不同，需要构造一个新的对象返回
          return {
            ...item,
            // 设置特定的记录不可编辑
            disabled: row.bsart === 'NB'
          }
        }
        return item
      })
    }
  }
}
</script>

