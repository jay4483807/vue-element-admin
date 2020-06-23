<template>
  <el-dialog title="搜索帮助" v-bind="$attrs" top="7vh" :append-to-body="true" v-on="$listeners" @open="getList">
    <el-form label-width="160px" class="condition-form">
      <el-form-item v-for="(qc,i) of config.queryConditions" :key="i" :label="qc.label" style="margin-bottom: 12px;">
        <el-input v-model="listQuery[qc.prop]">
          <el-select slot="prepend" v-model="listQuery[qc.prop+'_option']" style="width: 70px">
            <el-option v-for="c in selectItems" :key="c.value" :value="c.value" :label="c.text" />
          </el-select>
        </el-input>
      </el-form-item>
    </el-form>
    <el-row type="flex" justify="center">
      <el-button type="primary" icon="el-icon-search" @click="getList">查询</el-button>
      <el-button type="info" icon="el-icon-close" @click="clearConditions">清空</el-button>
      <el-button v-if="multiSelect" type="success" icon="el-icon-finished" @click="confirm">确定</el-button>
    </el-row>
    <el-table ref="grid" highlight-current-row max-height="600px" :data="tableRows" :row-key="getRowKey" @selection-change="handleSelectionChange" @row-click="rowClick">
      <el-table-column v-if="multiSelect" type="selection" width="45" :reserve-selection="true" />
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
    </el-table>
    <pagination
      v-show="total>0"
      :show-selected-only="showSelectedOnly"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      :selected-size="selectedRows.length"
      :selected-size-clickable="true"
      @changeShowSelectedOnly="changeShowSelectedOnly"
      @pagination="getList"
    />
  </el-dialog>
</template>

<script>
import Pagination from '@/components/Pagination'
import { fetchSearchHelpInfo, querySearchHelpDataByIds, querySearchHelpList } from '@/api/pan'

const selectItems = [{ value: 'like', text: '*' },
  { value: 'greater', text: '>' },
  { value: 'equal', text: '=' },
  { value: 'notequal', text: '<>' },
  { value: 'less', text: '<' },
  { value: 'greaterequal', text: '>=' },
  { value: 'lessequal', text: '<=' }]

export default {
  name: 'PrSearchHelperDialog',
  components: { Pagination },
  props: {
    searchHelpName: {
      type: String,
      required: true
    },
    /**
     * 是否多选
     */
    multiSelect: {
      type: Boolean,
      default: false
    },
    /**
     * 每页显示行数
     */
    pageSize: {
      type: Number,
      default: 10
    },
    queryParams: {
      type: Object,
      default() {
        return {}
      }
    },
    sortColumns: {
      type: String,
      default: ''
    },
    idProp: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      listQuery: {
        page: 1,
        limit: 10
      },
      list: [],
      total: 0,
      listLoading: true,
      selectedRows: [],
      showSelectedOnly: false,
      config: {
        gridColumns: [],
        queryConditions: []
      }
    }
  },
  computed: {
    tableRows() {
      return this.showSelectedOnly ? this.selectedRows : this.list
    }
  },
  beforeCreate() {
    this.selectItems = selectItems
  },
  created() {
    fetchSearchHelpInfo(this.searchHelpName).then(columns => {
      this.config.gridColumns = columns.filter(col => col.visibility).sort((col1, col2) => {
        return (col1.columnNo || '').localeCompare(col2.columnNo || '')
      })
      this.config.queryConditions = columns.filter(col => col.isCondition).sort((col1, col2) => {
        return (col1.conditionNo || '').localeCompare(col2.conditionNo || '')
      })
      for (const col of this.config.queryConditions) {
        // 参数名带点号，v-model绑定会失效，故改为下划线
        this.listQuery[col.prop + '_option'] = 'like'
      }
    })
  },
  mounted() {
    console.log(this.searchHelpName + ';mounted')
  },
  methods: {
    getList() {
      this.listLoading = true
      const params = {
        ...this.listQuery,
        ...(this.queryParams || {})
      }
      for (const col of this.config.queryConditions) {
        params[col.prop + '.fieldName'] = col.prop
        params[col.prop + '.fieldValue'] = this.listQuery[col.prop] || ''
        params[col.prop + '.option'] = this.listQuery[col.prop + '_option']
        params[col.prop + '.dataType'] = 'S'
        delete params[col.prop]
        delete params[col.prop + '_option']
      }
      params.sortColumns = this.sortColumns
      querySearchHelpList(params, this.searchHelpName).then(rsp => {
        this.list = rsp.data.items
        this.total = rsp.data.total
        this.listLoading = false
      }).catch(() => {
        this.listLoading = false
      })
    },
    handleSelectionChange(rows) {
      console.log('handleSelectionChange:', rows)
      this.selectedRows = rows
    },
    rowClick(row) {
      if (!this.multiSelect) { this.$emit('confirmSelected', [row]) }
    },
    confirm() {
      this.$emit('confirmSelected', this.selectedRows)
    },
    clearConditions() {
      for (const col of this.config.queryConditions) {
        this.listQuery[col.prop] = ''
        this.listQuery[col.prop + '_option'] = 'like'
      }
      this.getList()
    },
    getRowKey(row) {
      if (this.idProp) {
        return row[this.idProp]
      } else {
        let key = ''
        for (const col of this.config.gridColumns) {
          key += (row[col.prop] || '') + '|'
        }
        return key
      }
    },
    changeShowSelectedOnly() {
      this.showSelectedOnly = !this.showSelectedOnly
    },
    async getRowByIds(ids) {
      if (!this.idProp) {
        throw new Error('未指定idProp，无法通过getRowById查询记录')
      }
      return querySearchHelpDataByIds(this.searchHelpName, this.idProp, ids)
    }
  }
}
</script>

<style lang="scss" scoped>

  /deep/ .el-dialog__body {
    padding-top: 10px;
    padding-bottom: 20px;
  }

  /deep/ .el-dialog {
    min-width: 880px;
  }

  .condition-form {
    max-width: 640px;
    margin: 0 auto;
    padding-right: 60px;

    /deep/ label {
      overflow: hidden;
      white-space: nowrap;
    }
  }

</style>
