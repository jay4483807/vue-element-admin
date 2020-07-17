<template>
  <div>
    <el-row :class="toolbarClass">
      <el-button
        v-for="(item,index) of toolbarItems"
        :key="index"
        class="filter-item"
        :type="item.btnType || 'primary'"
        @click="_toolbarItemClick(item)"
      >{{ item.label }}</el-button>
    </el-row>
    <el-table
      v-if="gridColumns.length>0"
      ref="grid"
      v-loading="listLoading"
      v-bind="$attrs"
      :data="tableRows"
      :row-key="getRowKey"
      header-cell-class-name="table-header"
      fit
      style="width: 100%"
      v-on="$listeners"
      @selection-change="_selectionChange"
    >
      <el-table-column v-if="selectable" type="selection" width="45" :reserve-selection="true" />
      <el-table-column
        v-for="(col,index) of gridColumns"
        :key="index"
        :prop="col.prop"
        :show-overflow-tooltip="true"
        :width="col.width || ''"
        :min-width="col.minWidth || ''"
        align="center"
        :label="col.label"
        :formatter="col.formatter"
      />
      <el-table-column v-if="gridActions.length>0" v-slot="{row,$index}" :width="68*gridActions.length+60" align="center" label="操作" fixed="right">
        <div class="el-button-group">
          <el-button
            v-for="(act,index) of _computeGridActions(gridActions, row, $index)"
            :key="index"
            :type="act.btnType || 'primary'"
            size="small"
            :disabled="act.disabled"
            @click="_gridAction(act, row, $index)"
          >{{ act.label }}</el-button>
        </div>
      </el-table-column>
    </el-table>
    <pagination
      v-show="pageable && total>0"
      :show-selected-only="showSelectedOnly"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      :selected-size="selectedRows.length"
      :show-selected-size="selectable"
      @changeShowSelectedOnly="showSelectedOnly = !showSelectedOnly"
      @pagination="load"
    />
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import { queryList } from '@/api/pan' // Secondary package based on el-pagination
import grid from './mixins/grid'

export default {
  name: 'PrGrid',
  components: { Pagination },
  mixins: [grid],
  props: {
    toolbarItems: {
      type: Array,
      default() {
        return []
      }
    },
    gridActions: {
      type: Array,
      default() {
        return []
      }
    },
    gridColumns: {
      type: Array,
      default() {
        return []
      }
    },
    selectable: {
      type: Boolean,
      default: true
    },
    pageable: {
      type: Boolean,
      default: true
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
    },
    rowDataFilter: {
      type: Function,
      default: undefined
    },
    rowKeyProp: {
      type: String,
      default: undefined
    },
    computeListData: {
      type: Function,
      default(list) {
        return list
      }
    },
    /**
     * 动态计算每一行的gridActions
     * 不同于configGridActions是在渲染前统一配置所有行，这里是在渲染每一行时调用一次
     */
    computeGridActions: {
      type: Function,
      default({ actions, row, rowIndex }) {
        return actions
      }
    }
  },
  data() {
    return {
      list: [],
      total: 0,
      listLoading: false,
      listQuery: {
        page: 1,
        limit: 100
      },
      selectedRows: [],
      showSelectedOnly: false
    }
  },
  computed: {
    tableRows() {
      return this.showSelectedOnly ? this.selectedRows : this.computeListData(this.list)
    }
  },
  mounted() {
    if (this.autoLoad) {
      this.load()
    }
  },
  activated() {
    if (this.autoLoad) {
      this.load()
    }
  },
  methods: {
    async load() {
      if (this._loading) { return }
      this._loading = true
      try {
        setTimeout(() => { // 延迟一秒后再出现loading动画
          if (this._loading) {
            this.listLoading = true
          }
        }, 1000)
        const params = {
          ...(this.listQuery || {}),
          ...(this.queryParams || {})
        }
        const response = await queryList(params)
        // eslint-disable-next-line prefer-const
        let { list, total } = { list: response.data.items, total: response.data.total, params }
        if (this.rowDataFilter) {
          list = list.map(this.rowDataFilter).filter(r => r !== undefined)
        }
        this.list = list
        this.total = total
      } catch (err) {
        console.log('拉取列表数据发生错误', err)
      } finally {
        this._loading = false
        this.listLoading = false
      }
    },
    getRowKey(row) {
      if (this.rowKeyProp) {
        return row[this.rowKeyProp]
      } else {
        let key = ''
        for (const col of this.gridColumns) {
          key += (row[col.prop] || '') + '|'
        }
        return key
      }
    },
    _toolbarItemClick(item) {
      const event = { item }
      this.$emit('toolbarClick', event)
      if (item.callback) {
        item.callback.apply(this, [event])
      }
    },
    _gridAction(item, row, rowIndex) {
      const event = {
        item,
        row,
        rowIndex
      }
      this.$emit('rowBtnClick', event)
      if (item.callback) {
        item.callback.apply(this, [event])
      }
    },
    _selectionChange(rows) {
      this.selectedRows = rows
      this.$emit('selection-change', rows)
    },
    _computeGridActions(actions, row, rowIndex) {
      return this.computeGridActions({ actions, row, rowIndex })
    }
  }
}
</script>

<style scoped>

</style>
