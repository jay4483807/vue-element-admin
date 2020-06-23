<template>
  <list-page
    :config-quick-search-items="configQuickSearchItems"
    :config-search-more-items="configSearchMoreItems"
    :config-toolbar-items="[]"
    :grid-query-params="gridQueryParams"
  />
</template>

<script>
import ListPage from '@/views/pan/components/listPage'
import { UI_TYPE } from '@/constants'
export default {
  name: 'PurchaseApplyManage',
  components: { ListPage },
  data: function() {
    return {
      gridQueryParams: {
        whereSql: '',
        orderSql: '',
        defaultCondition: ''
      }
    }
  },
  methods: {
    configQuickSearchItems(items) {
      return items.filter(item => {
        // 快速查询只显示部分搜索项
        return ['businessstate', 'purchaseapplyno', 'applydate'].includes(item.prop)
      })
    },
    configSearchMoreItems(items) {
      items.push({
        prop: 'ekorg',
        label: '采购组织',
        uiType: UI_TYPE.SEARCH_HELP,
        searchHelpName: 'YHEKORG',
        searchHelpDisplayFiled: 'EKORG',
        searchHelpValueField: 'EKORG'
      })
      return items
    }
  }
}
</script>

<style scoped>

</style>
