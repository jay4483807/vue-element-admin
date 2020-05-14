<template>
  <div class="app-container">
    <div class="filter-container">
      <el-autocomplete v-model="listQuery.orderNo" :fetch-suggestions="queryOrderNo" placeholder="申请单号" style="width: 200px;" class="filter-item" />
      <el-input v-model="listQuery.purchaseUser" placeholder="采购员" style="width: 200px" class="filter-item" suffix-icon="el-icon-search" @focus="openSearchHelper" />
      <el-date-picker v-model="listQuery.applyDateStart" type="daterange" class="filter-item" start-placeholder="申请日期开始" range-separator="-" end-placeholder="申请日期结束" />
      <div class="el-button-group">
        <el-button v-waves class="filter-item" type="primary" icon="el-icon-search">查询</el-button>
        <el-button v-waves class="filter-item" type="primary" @click="dialogSearchMoreVisible=true">更多</el-button>
        <el-button v-waves class="filter-item" type="primary" @click="clearSearch">清空</el-button>
      </div>
    </div>
    <el-input v-if="false" class="quick-search" placeholder="快速查询关键字">
      <el-button slot="prepend" icon="el-icon-more" @click="dialogSearchMoreVisible=true" />
      <el-button slot="append" icon="el-icon-search" />
    </el-input>

    <div class="filter-container">
      <el-button v-waves class="filter-item" type="primary" @click="clickCreate">创建</el-button>
      <el-button v-waves class="filter-item" type="primary">复制创建</el-button>
      <el-button v-waves class="filter-item" type="danger">删除</el-button>
      <el-button v-waves class="filter-item" type="success">导出申请单</el-button>
      <el-button v-waves class="filter-item" type="success">导出Excel</el-button>
    </div>
    <el-table v-if="config.gridColumns.length>0" v-loading="listLoading" :data="list" header-cell-class-name="table-header" fit style="width: 100%" height="600">
      <el-table-column type="selection" width="45" />
      <el-table-column v-slot="{row}" width="30" type="expand">
        <el-form label-position="left" inline class="table-expand">
          <el-form-item label="打印次数">
            <span>{{ row.printnum }}</span>
          </el-form-item>
          <el-form-item label="是否已打印">
            <span>{{ row.isprint }}</span>
          </el-form-item>
          <el-form-item label="原因/用途">
            <span>{{ row.memo }}</span>
          </el-form-item>
          <el-form-item label="打印次数">
            <span>{{ row.printnum }}</span>
          </el-form-item>
          <el-form-item label="打印次数">
            <span>{{ row.printnum }}</span>
          </el-form-item>
        </el-form>
      </el-table-column>
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
          <el-button type="primary" size="small">查看</el-button>
          <el-button type="primary" size="small">流程状态</el-button>
          <el-button type="primary" size="small">变更</el-button>
          <el-button type="primary" size="small" @click="clickEdit(row.purchaseapplyid)">编辑</el-button>
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
        <el-form-item label="申请单号">
          <el-input v-model="listQuery.orderNo" />
        </el-form-item>
        <el-form-item label="采购员">
          <el-input v-model="listQuery.purchaseUser" class="filter-item" suffix-icon="el-icon-search" @focus="openSearchHelper" />
        </el-form-item>
        <el-form-item label="采购申请凭证类型">
          <el-select v-model="listQuery.purchaseType" />
        </el-form-item>
        <el-form-item label="单据状态">
          <el-select v-model="listQuery.purchaseStatus" clearable class="filter-item">
            <el-option label="作废" value="1" />
            <el-option label="新增" value="2" />
            <el-option label="在途" value="3" />
            <el-option label="审批通过" value="4" />
            <el-option label="审批不通过" value="5" />
            <el-option label="单据处理" value="6" />
          </el-select>
        </el-form-item>
        <el-form-item label="申请日期">
          <el-date-picker v-model="listQuery.applyDateStart" type="daterange" class="filter-item" start-placeholder="申请日期开始" range-separator="-" end-placeholder="申请日期结束" />
        </el-form-item>
        <el-form-item label="是否已打印">
          <el-select v-model="listQuery.printed" clearable class="filter-item">
            <el-option label="是" value="1" />
            <el-option label="否" value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="采购凭证编号">
          <el-input v-model="listQuery.purchaseNo" class="filter-item" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogSearchMoreVisible = false">取 消</el-button>
        <el-button type="primary" @click="dialogSearchMoreVisible = false">查 询</el-button>
      </div>
    </el-dialog>
    <pr-search-helper-dialog :visible.sync="dialogPurchaseUserSearchHelperVisible" @selected="purchaseUserSelected" />
  </div>
</template>

<script>
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import { fetchList } from '@/api/purchase-apply'
import { fetchGridMetadata } from '@/api/pan'
import waves from '@/directive/waves' // waves directive
import PrSearchHelperDialog from '@/components/pro/PrSearchHelperDialog'
import { isBlank } from '@/utils'

export default {
  name: 'PurchaseApplyList',
  components: { Pagination, PrSearchHelperDialog },
  directives: { waves },
  data() {
    return {
      // 业务对象id
      boId: '000000000500',
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        orderNo: undefined,
        purchaseUser: undefined,
        purchaseType: undefined,
        purchaseStatus: undefined,
        applyDateStart: undefined,
        applyDateEnd: undefined,
        printed: undefined,
        purchaseNo: undefined,
        whereSql: ''
      },
      dialogSearchMoreVisible: false,
      dialogPurchaseUserSearchHelperVisible: false,
      config: {
        gridColumns: [],
        // gridColumns: [
        //   { 'label': '打印次数', 'prop': 'printnum', 'width': null, 'columnNo': '' },
        //   { 'label': '是否已打印', 'prop': 'isprint', 'width': null, 'columnNo': '' },
        //   { 'label': '流程状态', 'prop': 'processstate', 'width': 100, 'columnNo': '0001' },
        //   { 'label': '申请单号', 'prop': 'purchaseapplyno', 'width': 100, 'columnNo': '0002' },
        //   { 'label': '申请日期', 'prop': 'applydate', 'width': 100, 'columnNo': '0003' },
        //   { 'label': '采购订单日期', 'prop': 'bedat', 'width': 100, 'columnNo': '0004' },
        //   { 'label': '公司代码', 'prop': 'bukrs', 'width': 80, 'columnNo': '0005' },
        //   { 'label': '状态', 'prop': 'status', 'width': 80, 'columnNo': '0005' },
        //   { 'label': '采购组', 'prop': 'ekgrp', 'width': 80, 'columnNo': '0006' },
        //   { 'label': '评估净值', 'prop': 'assnetwr', 'width': 80, 'columnNo': '0006' },
        //   { 'label': '原因/用途', 'prop': 'memo', 'width': 255, 'columnNo': '0007' },
        //   { 'label': '创建对象的人员名称', 'prop': 'creator', 'width': 90, 'columnNo': '0008' },
        //   { 'label': '创建日期', 'prop': 'createtime', 'width': 150, 'columnNo': '0009' },
        //   { 'label': '最后修改者', 'prop': 'lastmodifyer', 'width': 150, 'columnNo': '0010' },
        //   { 'label': '最后修改日期', 'prop': 'lastmodifytime', 'width': 90, 'columnNo': '0011' }],
        toolBarItems: []
      }
    }
  },
  created() {
    fetchGridMetadata(this.boId).then(columns => {
      if (this.postConfigGridColumns) {
        columns = this.postConfigGridColumns(columns)
      }
      console.log(JSON.stringify(columns))
      this.config.gridColumns = columns
    }).then(() => {
      this.getList()
    })
  },
  methods: {
    // 对Grid的列表配置数据二次处理
    postConfigGridColumns(columns) {
      console.log('fetchGridMetadata:', columns)
      return columns.filter(col => {
        if (col.prop === 'purchaseapplyid' || isBlank(col.label)) return false
        return true
      }).map(col => {
        if (col.prop === 'bedat' || col.prop === 'bsart') {
          col.width = 100
        } else if (col.prop === 'memo') {
          col.label = '原因/用途'
        } else if (col.prop === 'isprint') {
          // 对列增加自定义处理
          col.formatter = this.columnFormatter
        }
        col.width = Math.max(80, col.width)

        return col
      })
    },
    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
        this.list = response.data.items
        this.total = response.data.total
        this.listLoading = false
      }).catch(() => {
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
    clickEdit(id) {
      this.$router.push('edit/' + id)
    },
    clickCreate() {
      this.$router.push('create')
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
