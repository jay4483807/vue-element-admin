<template>
  <el-dialog title="搜索帮助" v-bind="$attrs" top="7vh" v-on="$listeners">
    <el-form label-width="120px" class="condition-form">
      <el-form-item v-for="(qc,i) of queryConditions" :key="i" :label="qc.label" style="margin-bottom: 12px;">
        <el-input v-model="listQuery[qc.key]">
          <el-select slot="prepend" v-model="listQuery[qc.key+'_condition']" style="width: 70px">
            <el-option v-for="(c,index) in conditions" :key="index" :value="c" />
          </el-select>
        </el-input>
      </el-form-item>
    </el-form>
    <el-row type="flex" justify="center">
      <el-button type="primary" icon="el-icon-search">查询</el-button>
      <el-button type="info" icon="el-icon-close">清空</el-button>
    </el-row>
    <el-table highlight-current-row max-height="600px" :data="list" @row-click="rowClick">
      <el-table-column label="用户名" width="120px" :show-overflow-tooltip="true" prop="USERNAME" />
      <el-table-column label="姓名" width="200px" :show-overflow-tooltip="true" prop="BYNAME" />
      <el-table-column label="描述" :show-overflow-tooltip="true" prop="POST_DESC" />
      <el-table-column label="部门组织名" width="200px" :show-overflow-tooltip="true" prop="ORGANIZATIONNAME" />
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />
  </el-dialog>
</template>

<script>
import Pagination from '@/components/Pagination'
import request from '@/utils/request'

export default {
  name: 'PrSearchHelperDialog',
  components: { Pagination },
  props: {
    queryConditions: {
      type: Array,
      default() {
        return [{
          label: '用户名',
          key: 'userName'
        }, {
          label: '姓名',
          key: 'name'
        }, {
          label: '部门组织名',
          key: 'orgName'
        }]
      }
    }
  },
  data() {
    return {
      listQuery: {
        page: 1,
        limit: 10,
        userName: '',
        userName_condition: '*',
        name: '',
        name_condition: '*',
        orgName: '',
        orgName_condition: '*'
      },
      conditions: ['*', '>', '=', '<>', '<', '>=', '<='],
      list: null,
      total: 0,
      listLoading: true
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      request({
        url: '/vue-element-admin/search-help/list.api',
        params: this.listQuery
      }).then(response => {
        this.list = response.data.items
        this.total = response.data.total
        this.listLoading = false
      })
    },
    rowClick(row) {
      this.$emit('selected', row)
    }
  }
}
</script>

<style type="scss" scoped>

  /deep/ .el-dialog__body {
    padding-top: 10px;
    padding-bottom: 20px;
  }

  /deep/ .el-dialog {
    min-width: 800px;
  }

  .condition-form {
    max-width: 600px;
    margin: 0 auto;
    padding-right: 60px;
  }

</style>
