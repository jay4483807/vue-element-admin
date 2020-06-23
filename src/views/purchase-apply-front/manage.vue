<template>
  <list-page
    :config-quick-search-items="configQuickSearchItems"
    :config-search-more-items="configSearchMoreItems"
    :grid-query-params="queryParams"
  />
</template>

<script>
import ListPage from '@/views/pan/components/listPage'
import { UI_TYPE } from '@/constants'
import { mergeConfig } from '@/utils/pan'

export default {
  components: { ListPage },
  data() {
    return {
      queryParams: {
        orderSql: ' CREATETIME DESC'
      }
    }
  },
  methods: {
    configQuickSearchItems(items) {
      items = items.filter(item => ['purchaseapplyno'].includes(item.prop))
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
    configSearchMoreItems(items) {
      items = items.filter(item => !['creator'].includes(item.prop))
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
      items.push({
        prop: 'purchasename',
        label: '采购员',
        uiType: UI_TYPE.SEARCH_HELP,
        searchHelpName: 'YHUSERALL',
        searchHelpDisplayFiled: 'BYNAME',
        searchHelpValueField: 'USERID'
      })
      return items
    }
  }
}
</script>

