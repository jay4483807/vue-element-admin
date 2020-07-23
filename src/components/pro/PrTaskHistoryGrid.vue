<template>
  <pr-grid v-bind="$attrs" :grid-columns="taskHistoryColumns" :query-params="taskHistoryQueryParams" :selectable="false" :pageable="false" />
</template>

<script>
import PrGrid from '@/components/pro/PrGrid'

export default {
  name: 'PrTaskHistoryGrid',
  components: { PrGrid },
  props: {
    id: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      taskHistoryColumns: [{
        prop: 'TASKNAME',
        label: '任务名称'
      }, {
        prop: 'EXAMINERESULT',
        label: '执行动作'
      }, {
        prop: 'EXAMINE',
        label: '审批意见'
      }, {
        prop: 'EXAMINEPERSON',
        label: '审批人'
      }, {
        prop: 'NODEACTOR',
        label: '待审批人'
      }, {
        prop: 'TASKCREATETIME',
        label: '开始时间'
      }, {
        prop: 'WITHTIME',
        label: '审批用时'
      }, {
        prop: 'REFERENCETIME',
        label: '参考审批时间'
      }, {
        prop: 'CONTRASTTIME',
        label: '参考与用时时间差'
      }]
    }
  },
  computed: {
    taskHistoryQueryParams() {
      return {
        defaultCondition: ` (BUSINESSID='${this.id}' or PARENTBUSINESSID='${this.id}') `,
        orderSql: ' TASKCREATETIME DESC',
        handlerClass: 'com.panform.pan.businessprocess.engine.web.TaskHistoryGrid',
        tableName: 'V_WF_TASKINS'
      }
    }
  }
}
</script>

<style scoped>

</style>
