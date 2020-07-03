<template>
  <div class="pr-bo-grid">
    <el-row :class="toolbarClass">
      <el-button
        v-for="(item,index) of computeToolbarItems(config.toolbarItems)"
        :key="index"
        class="filter-item"
        :type="item.btnType || 'primary'"
        @click="_toolbarItemClick(item)"
      >{{ item.label }}</el-button>
    </el-row>
    <el-table
      v-if="config.gridColumns.length>0"
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
      <el-table-column type="selection" width="45" :reserve-selection="true" />
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
      <el-table-column v-if="config.gridActions.length>0" v-slot="{row,$index}" :width="68*config.gridActions.length+60" align="center" label="操作" fixed="right">
        <div class="el-button-group">
          <el-button
            v-for="(act,index) of computeGridActions(config.gridActions, row, $index)"
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
      v-show="total>0"
      :show-selected-only="showSelectedOnly"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      :selected-size="selectedRows.length"
      :selected-size-clickable="true"
      @changeShowSelectedOnly="showSelectedOnly = !showSelectedOnly"
      @pagination="load"
    />
  </div>
</template>

<script>
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import { buildGridConfig, queryList } from '@/api/pan'
import boComponent from '@/components/pro/mixins/boComponent'

export default {
  name: 'PrBoGrid',
  components: { Pagination },
  mixins: [boComponent],
  props: {
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
    /**
     * 配置grid列表项
     */
    configGridColumns: {
      type: [Function, Array],
      default(items) {
        return items
      }
    },
    /**
     * 配置grid操作列
     */
    configGridActions: {
      type: [Function, Array],
      default(items) {
        return items
      }
    },
    /**
     * 配置工具栏
     */
    configToolbarItems: {
      type: [Function, Array],
      default(items) {
        return items
      }
    },
    autoLoad: {
      type: Boolean,
      default: true
    },
    rowDataFilter: {
      type: Function,
      default: undefined
    },
    /**
     * 加载数据前对请求参数的处理
     */
    beforeLoad: {
      type: Function,
      default(params) {
        return params
      }
    },
    /**
     * 加载数据后对返回结果的处理
     */
    afterLoad: {
      type: Function,
      default({ list, total, params }) {
        return { list, total, params }
      }
    },
    /**
     * 动态计算每一行的gridActions
     * 不同于configGridActions是在渲染前统一配置所有行，这里是在渲染每一行时调用一次
     */
    computeGridActions: {
      type: Function,
      default(gridActions, row, rowIndex) {
        return gridActions
      }
    },
    computeListData: {
      type: Function,
      default(list) {
        return list
      }
    },
    computeToolbarItems: {
      type: Function,
      default(items) {
        return items
      }
    }
  },
  data() {
    return {
      config: {
        idProp: '',
        gridColumns: [],
        gridActions: [],
        toolbarItems: [],
        searchItems: []
      },
      list: [],
      total: 0,
      listLoading: false,
      listQuery: {
        page: 1,
        limit: 20
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
  async created() {
    this.config = {
      ...this.config,
      ...await buildGridConfig(this.boName, this)
    }
    this.$emit('configOver', this.config)
    console.log('构造Grid配置：', this.config)
  },
  mounted() {
    if (this.autoLoad) {
      console.log('auto load grid data:' + this.boName)
      this.load()
    }
  },
  methods: {
    async load(queryParams = {}) {
      let loading = true
      try {
        setTimeout(() => { // 延迟一秒后再出现loading动画
          if (loading) {
            this.listLoading = true
          }
        }, 1000)
        let params = {
          ...(this.listQuery || {}),
          ...(this.queryParams || {}),
          ...queryParams
        }
        params = this.beforeLoad(params)
        const response = await queryList(params, this.boName)
        // eslint-disable-next-line prefer-const
        let { list, total } = this.afterLoad({ list: response.data.items, total: response.data.total, params })
        if (this.rowDataFilter) {
          list = list.map(this.rowDataFilter).filter((r) => r)
          // const resultList = []
          // for (let r of list) {
          //   r = this.rowDataFilter(r)
          //   if (r) {
          //     resultList.push(r)
          //   }
          // }
          // list = resultList
        }
        this.list = list
        this.total = total
      } catch (err) {
        console.log('拉取列表数据发生错误', err)
      } finally {
        loading = false
        this.listLoading = false
      }
    },
    getPage() {
      return this.listQuery.page
    },
    getLimit() {
      return this.listQuery.limit
    },
    updateRow(row, rowIndex) {
      if (this.rowDataFilter) { row = this.rowDataFilter(row) }
      if (row) {
        if (rowIndex < 0) {
          this.list.unshift(row)
        } else {
          this.list.splice(rowIndex, 1, row)
        }
      } else if (rowIndex >= 0) { // 如果row为空，表示删除指定下标的元素
        this.list.splice(rowIndex, 1)
      }
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
    }
  }
}
</script>

<style scoped>

</style>
