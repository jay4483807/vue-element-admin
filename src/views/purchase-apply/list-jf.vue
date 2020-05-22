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
          placeholder="选择日期"
        />
        <el-input
          v-else-if="item.uiType===UI_TYPE.SEARCH_HELP"
          :key="index"
          v-model="listQuery[item.prop]"
          class="filter-item"
          suffix-icon="el-icon-search"
          style="width: 200px;"
          :placeholder="item.label"
          @focus="openSearchHelper"
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
          <el-option v-for="opt of item.options" :key="opt.value" :label="opt.label" :value="opt.value" />
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

    <div class="filter-container">
      <el-button
        v-for="(item,index) of config.toolbarItems"
        :key="index"
        v-waves
        class="filter-item"
        :type="item.btnType||'primary'"
        @click="_toolbarItemClick(item)"
      >{{ item.label }}</el-button>
    </div>
    <el-table v-if="config.gridColumns.length>0" v-loading="listLoading" :data="list" header-cell-class-name="table-header" fit style="width: 100%" height="600" @selection-change="_handleSelectionChange">
      <el-table-column type="selection" width="45" />
      <el-table-column
        v-for="(col,index) of config.gridColumns"
        :key="index"
        :prop="col.prop"
        :show-overflow-tooltip="true"
        :min-width="col.width || ''"
        align="center"
        :label="col.label"
        :formatter="col.formatter"
      />
      <el-table-column v-slot="{row}" width="300" align="center" label="操作" fixed="right">
        <div class="el-button-group">
          <el-button
            v-for="(act,index) of config.gridActions"
            :key="index"
            type="primary"
            size="small"
            @click="_gridAction(act.action, row)"
          >{{ act.label }}</el-button>
        </div>
      </el-table-column>
    </el-table>
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="getList"
    />
    <el-dialog title="高级查询" width="600px" :visible.sync="dialogSearchMoreVisible" class="search-more-dialog">
      <el-form :model="listQuery" label-width="120px">
        <el-form-item v-for="(item,index) of config.searchMoreItems" :key="index" :label="item.label">
          <el-date-picker v-if="item.uiType===UI_TYPE.DATE_RANGE" :key="index" v-model="listQuery[item.prop]" type="daterange" class="filter-item" start-placeholder="开始日期" range-separator="-" end-placeholder="结束日期" />
          <el-date-picker v-else-if="item.uiType===UI_TYPE.DATE" :key="index" v-model="listQuery[item.prop]" type="date" class="filter-item" placeholder="选择日期" />
          <el-input v-else-if="item.uiType===UI_TYPE.SEARCH_HELP" :key="index" v-model="listQuery[item.prop]" class="filter-item" suffix-icon="el-icon-search" @focus="openSearchHelper" />
          <el-select v-else-if="item.uiType===UI_TYPE.SELECT" :key="index" v-model="listQuery[item.prop]" clearable class="filter-item">
            <el-option v-for="opt of item.options" :key="opt.value" :label="opt.label" :value="opt.value" />
          </el-select>
          <el-input v-else :key="index" v-model="listQuery[item.prop]" />
        </el-form-item>
        <el-form-item label="采购凭证编号">
          <el-input v-model="listQuery.purchaseNo" class="filter-item" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogSearchMoreVisible = false">取 消</el-button>
        <el-button type="primary" @click="getList(), dialogSearchMoreVisible = false">查 询</el-button>
      </div>
    </el-dialog>
    <pr-search-helper-dialog :visible.sync="dialogPurchaseUserSearchHelperVisible" @selected="purchaseUserSelected" />
  </div>
</template>

<script>
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import { fetchGridMetadata, fetchToolbarMetadata, fetchList } from '@/api/pan'
import waves from '@/directive/waves' // waves directive
import PrSearchHelperDialog from '@/components/pro/PrSearchHelperDialog'
import { isBlank } from '@/utils'
import request from '@/utils/request'
import { UI_TYPE, ACTION } from '@/constants.js'

export default {
  name: 'PurchaseApplyList',
  components: { Pagination, PrSearchHelperDialog },
  directives: { waves },
  data() {
    return {
      UI_TYPE,
      // 业务对象id
      boId: '000000000500',
      boName: 'PurchaseApplyFront',
      idProp: 'purchaseapplyid',
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        whereSql: '',
        defaultCondition: '%201=1%20%20%20AND%20FORMTYPE%20IN%20(\'PO\',\'PRPO\')',
        orderSql: 'APPLYDATE DESC'
      },
      selectedRows: [],
      dialogSearchMoreVisible: false,
      dialogPurchaseUserSearchHelperVisible: false,
      config: {
        gridColumns: [],
        gridActions: [],
        toolbarItems: [],
        searchMoreItems: [],
        quickSearchItems: [],
        deleteUrl: '/MECSS/purchasemagt/purchaseapplyfrontmagt/purchaseApplyFrontController.spr?action=_delete'
      }
    }
  },
  created() {
    fetchGridMetadata(this.boId).then(columns => {
      if (this.postConfigGridColumns) {
        columns = this.postConfigGridColumns(columns)
      }
      console.log(JSON.stringify(columns))
      this.config.gridColumns = columns.filter(col => {
        return !col.action
      })
      this.config.gridActions = columns.filter(col => {
        return col.action
      }).map(col => {
        if (isBlank(col.label)) {
          switch (col.action) {
            case ACTION.CREATE:
            case ACTION.EDIT:
            case ACTION.VIEW:
            case ACTION.DELETE:
              col.label = this.$t('pan.' + col.action)
          }
        }
        return col
      })
      this.config.searchMoreItems = this.postConfigSearchMoreItems(columns.filter(col => col.isCondition), columns)
      this.config.quickSearchItems = this.postConfigQuickSearchItems(columns.filter(col => col.isCondition), columns)
      console.log('config.gridColumns', this.config.gridColumns)
      console.log('config.gridActions', this.config.gridActions)
      console.log('config.searchMoreItems', this.config.searchMoreItems)
    }).then(() => {
      this.getList()
    }).catch(err => {
      console.log('渲染Grid发生错误', err)
    })
    fetchToolbarMetadata(this.boId).then(items => {
      items.map(item => {
        if (item.action === ACTION.DELETES) {
          item.btnType = 'danger'
        }
      })
      this.config.toolbarItems = this.postConfigToolbarItems(items)
    })
  },
  methods: {
    // 对Grid的列表配置数据二次处理
    postConfigGridColumns(columns) {
      console.log('fetchGridMetadata:', columns)
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
      items = items.map(item => {
        if (item.prop === 'applydate') {
          item.uiType = UI_TYPE.DATE_RANGE
        }
        return item
      })
      items.push({
        prop: 'businessstate',
        label: '单据状态',
        uiType: UI_TYPE.SELECT,
        options: [
          { label: '作废', value: '-1' },
          { label: '新增', value: '0' },
          { label: '在途', value: '1' },
          { label: '审批通过', value: '2' },
          { label: '审批不通过', value: '3' },
          { label: '单据处理', value: '4' }
        ]
      }, {
        prop: 'isprint',
        label: '是否已打印',
        uiType: UI_TYPE.SELECT,
        options: [
          { label: '是', value: 'Y' },
          { label: '否', value: 'N' }
        ]
      }, {
        prop: 'ebeln',
        label: '采购凭证编号'
      })
      return items
    },
    postConfigQuickSearchItems(items, columns) {
      const quickProps = ['purchaseapplyno', 'applydate', 'bsart']
      return items.filter(item => quickProps.includes(item.prop)).map(item => {
        if (item.prop === 'applydate') {
          item.uiType = UI_TYPE.DATE_RANGE
        }
        return item
      })
    },
    postConfigToolbarItems(items) {
      items.push({
        action: '_exportExcel',
        label: '导出Excel',
        btnType: 'success'
      })
      return items
    },
    getList() {
      this.listLoading = true
      fetchList(this.listQuery, this.boName, this.boId).then(response => {
        this.list = response.data.items
        this.total = response.data.total
        this.listLoading = false
      }).catch(err => {
        console.log('拉取列表数据发生错误', err)
        this.listLoading = false
      })
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
    _gridAction(action, row) {
      if (this.gridAction(action, row)) {
        return
      }
      // grid 动作默认处理逻辑
      switch (action) {
        case ACTION.VIEW:
          this.$router.push('view/' + row[this.idProp])
          break
        case ACTION.EDIT:
          this.$router.push('edit/' + row[this.idProp])
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
    openSearchHelper() {
      this.dialogPurchaseUserSearchHelperVisible = true
    },
    purchaseUserSelected(row) {
      this.listQuery.purchaseUser = row.USERNAME
      this.dialogPurchaseUserSearchHelperVisible = false
    },
    clearSearch() {
      Object.keys(this.listQuery).forEach((key) => {
        if (key === 'page' || key === 'limit') { return }
        this.listQuery[key] = undefined
      })
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
