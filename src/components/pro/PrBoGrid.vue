<template>
  <div class="pr-bo-grid">
    <el-row :class="toolbarClass">
      <el-button
        v-for="(item,index) of config.toolbarItems"
        :key="index"
        class="filter-item"
        :type="item.btnType||'primary'"
        @click="_toolbarItemClick(item)"
      >{{ item.label }}</el-button>
    </el-row>
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
      <el-table-column v-if="config.gridActions.length>0" v-slot="{row}" :width="68*config.gridActions.length+60" align="center" label="操作" fixed="right">
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
      @pagination="load"
    />
  </div>
</template>

<script>
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import { buildGridConfig, queryList } from '@/api/pan'

export default {
  name: 'PrBoGrid',
  components: { Pagination },
  props: {
    boName: {
      type: String,
      required: true
    },
    defaultCondition: {
      type: String,
      default: ''
    },
    whereSql: {
      type: String,
      default: ''
    },
    orderSql: {
      type: String,
      default: ''
    },
    queryParams: {
      type: Object,
      default() {
        return {}
      }
    },
    toolbarClass: {
      type: String,
      default: 'el-button-group'
    },
    autoLoad: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      config: {
        idProp: '',
        gridColumns: [],
        gridActions: [],
        toolbarItems: []
      },
      list: null,
      total: 0,
      listLoading: false,
      listQuery: {
        page: 1,
        limit: 20
      },
      selectedRows: []
    }
  },
  async created() {
    this.config = {
      ...this.config,
      ...await buildGridConfig(this.boName, this)
    }
    if (this.autoLoad) {
      this.load()
    }
    console.log('构造Grid配置：', this.config)
  },
  methods: {
    async load(queryParams = {}) {
      this.listLoading = true
      try {
        const params = {
          ...this.listQuery,
          ...this.queryParams,
          defaultCondition: this.defaultCondition,
          whereSql: this.whereSql,
          orderSql: this.orderSql,
          ...queryParams
        }
        const response = await queryList(params, this.boName)
        this.list = response.data.items
        this.total = response.data.total
        this.listLoading = false
      } catch (err) {
        console.log('拉取列表数据发生错误', err)
        this.listLoading = false
      }
    },
    _handleSelectionChange(rows) {
      this.selectedRows = rows
      this.$emit('selectionChange', [...this.selectedRows])
    },
    _toolbarItemClick(item) {
      this.$emit('toolbarClick', item)
    },
    _gridAction(action, row) {
      this.$emit('rowClick', [action, row])
    }
  }
}
</script>

<style scoped>

</style>
