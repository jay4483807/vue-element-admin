<template>
  <list-page
    :config-quick-search-items="configQuickSearchItems"
    :config-search-more-items="[]"
    :grid-query-params="gridQueryParams"
  />
</template>

<script>
import ListPage from '@/views/pan/components/listPage'
import { mergeConfig } from '@/utils/pan'
import { UI_TYPE } from '@/constants'
export default {
  name: 'PerLocatCardManage',
  components: { ListPage },
  data: function() {
    return {
      gridQueryParams: {
        whereSql: '',
        orderSql: '',
        defaultCondition: ' 1=1  AND STATUS=\'0\''
      }
    }
  },
  methods: {
    configQuickSearchItems(items) {
      return mergeConfig(items, [{
        prop: 'emergency',
        uiType: UI_TYPE.SELECT,
        selectOptions: [{
          value: '1',
          text: '正常'
        }, {
          value: '2',
          text: '重要'
        }, {
          value: '3',
          text: '紧急'
        }]
      }])
    }
  }
}
</script>

<style scoped>

</style>
