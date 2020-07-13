<template>
  <div class="app-container">
    <pr-search-block :quick-search-items="quickSearchItems" @search-params-changed="search=$event" @search-click="load" />
    <pr-grid
      ref="grid"
      :grid-columns="gridColumns"
      :query-params="computedQueryParams"
      :toolbar-items="toolbarItems"
      :grid-actions="gridActions"
      :selectable="false"
    />
  </div>
</template>

<script>
import PrGrid from '@/components/pro/PrGrid'
import PrSearchBlock from '@/components/pro/PrSearchBlock'
import { UI_TYPE } from '@/constants'
import { buildQueryParams } from '@/api/pan'
import request from '@/utils/request'
export default {
  components: { PrSearchBlock, PrGrid },
  data() {
    return {
      quickSearchItems: [{
        prop: 'businessNote',
        label: '事务信息'
      }, {
        prop: 'name_',
        label: '待办任务'
      }, {
        prop: 'creatorName',
        label: '提交人'
      }, {
        prop: 'creatorId',
        label: '待办接收人',
        uiType: UI_TYPE.SEARCH_HELP,
        searchHelpName: 'YHUSERALL',
        searchHelpValueField: 'USERID',
        searchHelpDisplayFiled: 'BYNAME'
      }, {
        prop: 'taskCreateTime',
        label: '送达时间',
        uiType: UI_TYPE.DATE_RANGE
      }],
      gridColumns: [{
        prop: 'businessNote',
        label: '事务信息',
        minWidth: 400
      }, {
        prop: 'name_',
        label: '待办任务',
        minWidth: 110
      }, {
        prop: 'dept',
        label: '部门'
      }, {
        prop: 'organizationname',
        label: '提交人'
      }, {
        prop: 'taskCreateTime',
        label: '送达时间',
        minWidth: 110
      }, {
        prop: 'insCreateTime',
        label: '开始时间',
        minWidth: 110
      }],
      toolbarItems: [{
        action: 'taskMore',
        label: '待办转移'
      }, {
        action: 'exportExcel',
        label: '导出Excel'
      }],
      gridActions: [{
        action: 'task',
        label: '办理',
        callback: this.clickTask
      }, {
        action: 'process',
        label: '查看流程图'
      }],
      queryParams: {
        handlerClass: 'com.panform.pan.basicApp.sysConsole.workbench.task.web.grid.TaskGrid',
        tableName: 'V_WF_CURRENT_JOB T',
        whereSql: '',
        orderSql: ' taskCreateTime desc',
        boName: 'null'
      },
      search: {
      }
    }
  },
  computed: {
    computedQueryParams() {
      return { ...buildQueryParams(this.quickSearchItems, this.search), ...this.queryParams }
    }
  },
  created() {
    const user = this.$store.state.user
    this.queryParams.whereSql = ` and MANDT='${user.clientId}' and (ACTORID = '${user.userId}' )`
  },
  mounted() {
    this._timer = setInterval(() => {
      // 每隔5分钟刷新一次任务列表
      this.load()
    }, 300000)
  },
  beforeDestroy() {
    clearInterval(this._timer)
  },
  methods: {
    load() {
      this.$refs.grid.load()
    },
    clearSearch() {

    },
    async clickTask({ row }) {
      const { coustom } = await request({
        url: '/vueController.spr?action=getTaskApprInfo',
        data: {
          taskid: row.task_id,
          businessid: row.businessId,
          nodeid: row.nodeId
        }
      })
      this.$router.push({
        name: coustom.boname + 'Task',
        params: {
          taskId: row.task_id,
          id: row.businessId
        },
        query: {
          nodeId: row.nodeId
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
