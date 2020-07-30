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
      :row-key="rowKey"
      :select-on-indeterminate="$attrs.selectOnIndeterminate === undefined ? multiSelect : $attrs.selectOnIndeterminate"
      header-cell-class-name="table-header"
      fit
      style="width: 100%"
      v-on="$listeners"
      @selection-change="_selectionChange"
      @select="_rowSelect"
      @select-all="_selectAll"
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
      >
        <template v-if="editable && col.editable !== false" #default="{row,$index}">
          <el-input v-model="row[col.prop]" @change="_rowChanged(row, $index, col.prop)" />
        </template>
      </el-table-column>
      <el-table-column v-if="showTags" v-slot="{row,$index}" :width="tagsColumnWidth" align="right" fixed="right">
        <el-tag v-for="(tag,index) of computeRowTags(row,$index)" :key="index" :type="tag.type || 'danger'" size="mini">{{ tag.label }}</el-tag>
      </el-table-column>
      <el-table-column v-if="gridActions.length>0" v-slot="{row,$index}" :width="actionColumnWidth" align="center" label="操作" fixed="right">
        <el-dropdown v-if="actionType === 'dropdown' && gridActions.length > 1" @command="_dropdownGridAction($event,row,$index)">
          <span class="el-dropdown-link">
            更多<i class="el-icon-arrow-down el-icon--right" />
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item
              v-for="(act,index) of _computeGridActions(gridActions, row, $index)"
              :key="index"
              :command="act.action"
              :disabled="act.disabled"
              @click="_gridAction(act, row, $index)"
            >{{ act.label }}</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <el-button v-else-if="actionType === 'dropdown'" type="text" @click="_gridAction(gridActions[0], row, $index)">{{ gridActions[0].label }}</el-button>
        <div v-else class="el-button-group">
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
import { callValue, executeCallback } from '@/utils/pan'

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
    // 是否显示标签列
    showTags: {
      type: Boolean,
      default: false
    },
    tagsColumnWidth: {
      type: Number,
      default: 60
    },
    selectable: {
      type: Boolean,
      default: true
    },
    multiSelect: {
      type: Boolean,
      default: true
    },
    pageable: {
      type: Boolean,
      default: true
    },
    editable: {
      type: Boolean,
      default: false
    },
    // grid查询参数,可以是一个参数对象或是一个回调函数，每次查询前都会调用回调获取最新的查询参数
    queryParams: {
      type: [Object, Function],
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
    rowKey: {
      type: [String, Function],
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
    },
    computeRowTags: {
      type: Function,
      default({ row, rowIndex }) {
        return []
      }
    },
    actionType: {
      type: String,
      default: 'dropdown'
    }
  },
  data() {
    return {
      list: [],
      total: 0,
      listLoading: false,
      listQuery: {
        page: 1,
        limit: 10
      },
      selectedRows: [],
      showSelectedOnly: false
    }
  },
  computed: {
    tableRows() {
      return this.showSelectedOnly ? this.selectedRows : this.computeListData(this.list)
    },
    actionColumnWidth() {
      if (this.actionType === 'dropdown') { return 80 } else {
        return 68 * this.gridActions.length + 60
      }
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
          ...callValue(this.queryParams, {})
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
    getList() {
      return this.list
    },
    clear() {
      this.list = []
      this.total = 0
      this.listLoading = false
      this.listQuery = {
        page: 1,
        limit: 10
      }
      this.selectedRows = []
      this.showSelectedOnly = false
    },
    getColumn(prop) {
      return this.gridColumns.find(item => item.prop === prop)
    },
    getSelectedRows() {
      return this.selectedRows || []
    },
    _toolbarItemClick(item) {
      const event = { item }
      this.$emit('toolbarClick', event)
      executeCallback(item.callback, this, event)
    },
    _gridAction(item, row, rowIndex) {
      const event = {
        item,
        row,
        rowIndex
      }
      this.$emit('rowBtnClick', event)
      executeCallback(item.callback, this, event)
    },
    _dropdownGridAction(action, row, rowIndex) {
      this._gridAction(this.gridActions.find(item => item.action === action) || { action }, row, rowIndex)
    },
    _selectionChange(rows) {
      this.selectedRows = rows
      if (this.multiSelect) { // 单选的情况在_rowSelect触发selection-change事件，以免多次重复触发事件
        this.$emit('selection-change', rows)
      }
    },
    _rowSelect(selection, row) {
      if (!this.multiSelect) {
        const selected = this.findRow(row, selection) >= 0
        this.$nextTick(() => {
          this._getGrid().clearSelection()
          this._getGrid().toggleRowSelection(row, selected)
          this.$emit('selection-change', selected ? [row] : [])
        })
      }
    },
    _computeGridActions(actions, row, rowIndex) {
      return this.computeGridActions({ actions, row, rowIndex })
    },
    _rowChanged(row, rowIndex, prop) {
      this.$emit('row-change', { row, rowIndex, prop })
    },
    _selectAll(rows) {
      if (!this.multiSelect) {
        this.$nextTick(() => {
          this._getGrid().clearSelection()
          this.$emit('selection-change', [])
        })
      }
    }
  }
}
</script>

<style scoped>

</style>
