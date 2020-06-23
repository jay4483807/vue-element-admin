<template>
  <list-page
    :config-quick-search-items="configQuickSearchItems"
    :config-search-more-items="configSearchMoreItems"
    :config-toolbar-items="configToolbarItems"
    :config-grid-columns="configGridColumns"
    :config-grid-actions="configGridActions"
    :grid-query-params="queryParams"
  />
</template>

<script>
import ListPage from '@/views/pan/components/listPage'
import { mergeConfig } from '@/utils/pan'
import { UI_TYPE } from '@/constants'

export default {
  components: { ListPage },
  data() {
    return {
      queryParams: {
        whereSql: '',
        orderSql: 'CREATETIME DESC',
        defaultCondition: ''
      }
    }
  },
  methods: {
    // 配置快速查询选项
    configQuickSearchItems(items) {
      console.log('配置快速查询配置选项:', items)
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
      return items
    },
    // 配置更多查询选项
    configSearchMoreItems(items) {
      console.log('配置更多查询配置选项:', items)
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
      })
      return items
    },
    // 配置工具栏按钮
    configToolbarItems(items) {
      console.log('配置工具栏按钮:', items)
      mergeConfig(items, [{
        action: '_printApply',
        callback: ({ item }) => {
          alert('导出申请单...\n' + item.url)
        }
      }], 'action')
      return items
    },
    // 配置grid列
    configGridColumns(columns) {
      console.log('配置Grid列:', columns)
      return columns
    },
    // 配置grid操作
    configGridActions(actions) {
      console.log('配置Grid操作:', actions)
      mergeConfig(actions, {
        action: '_viewProcessState',
        // 操按钮点击回调处理
        callback: ({ item, row, rowIndex }) => {
          alert('打开流程图:' + item.url + '&perlocatcardid=' + row.perlocatcardid)
        }
      }, 'action')
      return actions
    }
  }
}
</script>

