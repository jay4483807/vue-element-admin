<template>
  <div class="app-container">
    <div class="filter-container">
      <template v-for="(item,index) of config.quickSearchItems">
        <el-date-picker
          v-if="item.uiType===UI_TYPE.DATE_RANGE"
          :key="index"
          v-model="listQuery[item.prop]"
          type="daterange"
          class="filter-item"
          :start-placeholder="item.label+'开始日期'"
          range-separator="-"
          :end-placeholder="item.label+'结束日期'"
        />
        <el-date-picker
          v-else-if="item.uiType===UI_TYPE.DATE"
          :key="index"
          v-model="listQuery[item.prop]"
          type="date"
          class="filter-item"
          :placeholder="item.label"
        />
        <el-date-picker
          v-else-if="item.uiType===UI_TYPE.DATE_TIME"
          :key="index"
          v-model="listQuery[item.prop]"
          type="datetime"
          class="filter-item"
          :placeholder="item.label"
        />
        <el-date-picker
          v-else-if="item.uiType===UI_TYPE.DATE_TIME_RANGE"
          :key="index"
          v-model="listQuery[item.prop]"
          type="datetimerange"
          class="filter-item"
          :start-placeholder="item.label+'开始日期'"
          range-separator="-"
          :end-placeholder="item.label+'结束日期'"
        />
        <pr-search-helper
          v-else-if="item.uiType===UI_TYPE.SEARCH_HELP"
          :key="index"
          v-model="listQuery[item.prop]"
          class="filter-item"
          style="width: 200px;"
          :placeholder="item.label"
          :multi-select="item.multiSelect"
          :search-help-name="item.searchHelpName || ''"
          :value-field="item.searchHelpValueField"
          :display-field="item.searchHelpDisplayFiled"
          :default-condition="item.defaultCondition"
          :sort-columns="item.sortColumns"
        />
        <el-select
          v-else-if="item.uiType===UI_TYPE.SELECT"
          :key="index"
          v-model="listQuery[item.prop]"
          :placeholder="item.label"
          clearable
          class="filter-item"
          style="width: 200px;"
        >
          <el-option v-for="opt of item.options" :key="opt.value" :label="opt.text" :value="opt.value" />
        </el-select>
        <el-input
          v-else
          :key="index"
          v-model="listQuery[item.prop]"
          :placeholder="item.label"
          style="width: 200px;"
          class="filter-item"
        />
      </template>
      <div class="el-button-group">
        <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="getList">查询</el-button>
        <el-button v-waves class="filter-item" type="primary" @click="dialogSearchMoreVisible=true">更多</el-button>
        <el-button v-waves class="filter-item" type="primary" @click="clearSearch">清空</el-button>
      </div>
    </div>
    <pr-bo-grid
      ref="grid"
      :bo-name="boName"
      toolbar-class="filter-container"
      :default-condition="listQuery.defaultCondition"
      :order-sql="listQuery.orderSql"
      :where-sql="listQuery.whereSql"
      :auto-load="false"
      @selectionChange="_handleSelectionChange"
      @rowClick="_rowClick"
    />
    <el-dialog title="高级查询" width="600px" :visible.sync="dialogSearchMoreVisible" class="search-more-dialog">
      <el-form :model="listQuery" label-width="120px">
        <el-form-item v-for="(item,index) of config.searchMoreItems" :key="index" :label="item.label">
          <el-date-picker v-if="item.uiType===UI_TYPE.DATE_RANGE" :key="index" v-model="listQuery[item.prop]" type="daterange" class="filter-item" start-placeholder="开始日期" range-separator="-" end-placeholder="结束日期" />
          <el-date-picker v-else-if="item.uiType===UI_TYPE.DATE" :key="index" v-model="listQuery[item.prop]" type="date" class="filter-item" placeholder="选择日期" />
          <el-date-picker v-else-if="item.uiType===UI_TYPE.DATE_TIME_RANGE" :key="index" v-model="listQuery[item.prop]" type="datetimerange" class="filter-item" start-placeholder="开始日期" range-separator="-" end-placeholder="结束日期" />
          <el-date-picker v-else-if="item.uiType===UI_TYPE.DATE_TIME" :key="index" v-model="listQuery[item.prop]" type="datetime" class="filter-item" placeholder="选择日期" />
          <pr-search-helper
            v-else-if="item.uiType===UI_TYPE.SEARCH_HELP"
            :key="index"
            v-model="listQuery[item.prop]"
            :search-help-name="item.searchHelpName || ''"
            :value-field="item.searchHelpValueField"
            :display-field="item.searchHelpDisplayFiled"
            :default-condition="item.defaultCondition"
            :sort-columns="item.sortColumns"
            class="filter-item"
          />
          <el-select v-else-if="item.uiType===UI_TYPE.SELECT" :key="index" v-model="listQuery[item.prop]" clearable class="filter-item">
            <el-option v-for="opt of item.options" :key="opt.value" :label="opt.text" :value="opt.value" />
          </el-select>
          <el-input v-else :key="index" v-model="listQuery[item.prop]" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogSearchMoreVisible = false">取 消</el-button>
        <el-button type="primary" @click="getList(), dialogSearchMoreVisible = false">查 询</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  buildQueryParams,
  buildGridConfig, getBoProperties
} from '@/api/pan'
import waves from '@/directive/waves' // waves directive
import request from '@/utils/request'
import { UI_TYPE, ACTION } from '@/constants.js'
import PrSearchHelper from '@/components/pro/PrSearchHelper'
import PrBoGrid from '@/components/pro/PrBoGrid'

export default {
  name: 'PurchaseApplyList',
  components: { PrBoGrid, PrSearchHelper },
  directives: { waves },
  data() {
    return {
      // 业务对象名
      boName: this.$route.meta && this.$route.meta.boName || '',
      list: null,
      total: 0,
      listQuery: {
        whereSql: '',
        defaultCondition: '( 1=1 AND FORMTYPE IN (\'PO\',\'PRPO\'))',
        orderSql: 'CREATETIME DESC'
      },
      selectedRows: [],
      dialogSearchMoreVisible: false,
      config: {
        idProp: '',
        gridColumns: [],
        gridActions: [],
        toolbarItems: [],
        searchMoreItems: [],
        quickSearchItems: [],
        deleteUrl: '/MECSS/purchasemagt/purchaseapplyfrontmagt/purchaseApplyFrontController.spr?action=_delete'
      }
    }
  },
  beforeCreate() {
    this.UI_TYPE = UI_TYPE
  },
  created() {
    getBoProperties(this.boName).then(boProps => {
      this.boProps = boProps
      return buildGridConfig(this.boName, this)
    }).then(config => {
      config.searchMoreItems = this.postConfigSearchMoreItems(config.searchItems)
      config.quickSearchItems = this.postConfigQuickSearchItems(config.searchItems)
      this.config = {
        ...this.config,
        ...config
      }
      for (const item of [...this.config.searchMoreItems, ...this.config.quickSearchItems]) {
        this.$set(this.listQuery, item.prop, '')
      }
      console.log('config.gridColumns', this.config.gridColumns)
      console.log('config.gridActions', this.config.gridActions)
      console.log('config.searchMoreItems', this.config.searchMoreItems)
      console.log('config.quickSearchItems', this.config.quickSearchItems)
      console.log('config.toolbarItems', this.config.toolbarItems)
    }).then(() => {
      this.getList()
    }).catch(err => {
      console.log('渲染Grid发生错误', err)
    })
  },
  methods: {
    // 对Grid的列表配置数据二次处理
    postConfigGridColumns(columns) {
      console.log('fetchGridMetadata:', columns)
      columns.push({
        prop: 'lifnr_text',
        label: '采购供应商名称',
        width: 120
      })
      return columns.filter(col => {
        return true
      }).map(col => {
        if (col.prop === 'bedat' || col.prop === 'bsart') {
          col.width = 100
        } else if (col.prop === 'memo') {
          col.label = '原因/用途'
        } else if (col.prop === 'isprint') {
          // 对列增加自定义处理
          col.formatter = this.columnFormatter
        } else if (col.action === '_viewProcessState') {
          col.label = '流程状态'
        } else if (col.action === '_changeApply') {
          col.label = '变更'
        }
        col.width = Math.max(80, col.width)

        return col
      })
    },
    postConfigSearchMoreItems(items, columns) {
      return items
    },
    postConfigQuickSearchItems(items, columns) {
      for (const item of items) {
        if (item.uiType === UI_TYPE.SEARCH_HELP) {
          // TODO 测试需要，强制设置为多选的搜索帮助
          item.multiSelect = true
        }
      }
      return items
    },
    postConfigToolbarItems(items) {
      items.push({
        action: '_exportExcel',
        label: '导出Excel',
        btnType: 'success'
      })
      return items
    },
    async getList() {
      const queryParams = await buildQueryParams([...this.config.searchMoreItems, ...this.config.quickSearchItems], this.listQuery, this.boProps || {})
      this.$refs.grid.load(queryParams)
    },
    columnFormatter(row, column, cellValue, index) {
      if (cellValue === 'Y') {
        return '是'
      } else if (cellValue === 'N') {
        return '否'
      }
      return cellValue
    },
    gridAction(action, row) {
      if (action === '_viewProcessState') {
        // 自定义处理流程状态
        return true
      } else if (action === '_changeApply') {
        // 自定义处理变更动作
        return true
      }
    },
    _rowClick([action, row]) {
      if (this.gridAction(action, row)) {
        return
      }
      // grid 动作默认处理逻辑
      switch (action) {
        case ACTION.VIEW:
          this.$router.push('view/' + row[this.config.idProp])
          break
        case ACTION.EDIT:
          this.$router.push('edit/' + row[this.config.idProp])
          break
        case ACTION.DELETE: {
          const data = {}
          data[action.prop] = row[action.prop]
          request({
            url: this.config.deleteUrl,
            data: data
          })
          break
        }
      }
    },
    toolbarItemClick(item) {
      if (item.action === '_printApply') {
        // 处理导出申请单
        return true
      } else if (item.action === ACTION.DELETES) {
        // 处理批量删除动作
        request({
          url: '/MECSS/purchasemagt/purchaseapplyfrontmagt/purchaseApplyFrontController.spr?action=_deletes',
          data: {
            purchaseApplyFrontIds: this.selectedRows.map(row => row.purchaseapplyid).join('|')
          }
        }).then(() => {
          this.$message({
            type: 'success',
            message: '操作成功'
          })
        })
        return true
      }
    },
    _toolbarItemClick(item) {
      if (this.toolbarItemClick(item)) {
        return
      }
      switch (item.action) {
        case ACTION.CREATE:
          this.$router.push('create')
          break
        case ACTION.DELETES:
          break
      }
      if (item.action === ACTION.CREATE) {
        this.$router.push('create')
      }
    },
    _handleSelectionChange(rows) {
      this.selectedRows = rows
    },
    queryOrderNo(queryString, cb) {
      const result = this.list.map((row) => { return { value: row.purchaseapplyno } }).filter(({ value }) => {
        return value && (!queryString || value.toLowerCase().indexOf(queryString.toLowerCase()) === 0)
      })
      console.log(queryString, result)
      cb(result)
    },
    clearSearch() {
      for (const item of [...this.config.searchMoreItems, ...this.config.quickSearchItems]) {
        this.listQuery[item.prop] = undefined
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .table-expand .el-form-item{
    margin-right: 0;
    margin-bottom: 0;
    width: 50%;
  }

  .table-expand label{
    width: 90px;
    color: #99a9bf;
  }

  .quick-search {
    float: right;
    width: 300px;
    vertical-align: middle;
    margin-bottom: 10px;
    margin-right: 20px;
  }

  .search-more-dialog {
    min-width: 660px;

    .el-form-item {
      max-width: 600px;
      width: 100%;
      padding-left: 20px;
      padding-right: 40px;

      /deep/ .el-select,.el-date-editor {
        width: 100%;
      }

      /deep/ label {
        overflow: hidden;
        /*text-overflow: ellipsis;*/
        white-space: nowrap;
      }
    }
  }

  /*/deep/ .table-header .cell {*/
    /*overflow: hidden;*/
    /*text-overflow: ellipsis;*/
    /*white-space: nowrap;*/
  /*}*/

</style>
