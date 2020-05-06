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
    <el-table v-loading="listLoading" :data="list" header-cell-class-name="table-header" fit style="width: 100%" height="600">
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
      <el-table-column prop="purchaseapplyno" :show-overflow-tooltip="true" width="120" align="center" label="申请单号" />
      <el-table-column prop="applydate" :show-overflow-tooltip="true" width="124px" align="center" label="申请日期" />
      <el-table-column prop="processstate" :show-overflow-tooltip="true" width="120" align="center" label="流程状态" />
      <el-table-column prop="bsart" align="center" :show-overflow-tooltip="true" label="采购申请凭证类型" />
      <el-table-column prop="bsart_text" width="120" :show-overflow-tooltip="true" align="center" label="采购申请凭证类型名称" />
      <el-table-column prop="bedat" width="124px" align="center" :show-overflow-tooltip="true" label="采购订单日期" />
      <el-table-column prop="bukrs" :show-overflow-tooltip="true" align="center" label="公司代码" />
      <el-table-column prop="status" :show-overflow-tooltip="true" align="center" label="状态" />
      <el-table-column prop="purchasename" :show-overflow-tooltip="true" width="120" align="center" label="采购员名称" />
      <el-table-column prop="assnetwr" :show-overflow-tooltip="true" width="120" align="center" label="评估净值" />
      <el-table-column prop="creator" :show-overflow-tooltip="true" align="center" label="创建人" />
      <el-table-column prop="createtime" :show-overflow-tooltip="true" width="120" align="center" label="创建日期" />
      <el-table-column prop="lastmodifyer" :show-overflow-tooltip="true" align="center" label="最后修改者" />
      <el-table-column prop="lastmodifytime" :show-overflow-tooltip="true" width="120" align="center" label="最后修改日期" />
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
import waves from '@/directive/waves' // waves directive
import PrSearchHelperDialog from '@/components/pro/PrSearchHelperDialog'

export default {
  name: 'PurchaseApplyList',
  components: { Pagination, PrSearchHelperDialog },
  directives: { waves },
  data() {
    return {
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
        purchaseNo: undefined
      },
      dialogSearchMoreVisible: false,
      dialogPurchaseUserSearchHelperVisible: false
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
        this.list = response.data.items
        this.total = response.data.total
        this.listLoading = false
      })
    },
    clickEdit(id) {
      this.$router.push('/pan/purchase-apply-edit/' + id)
    },
    clickCreate() {
      this.$router.push('/pan/purchase-apply-create')
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
