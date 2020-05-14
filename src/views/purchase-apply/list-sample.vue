<template>
  <div class="app-container">
    <pr-search-area v-model="listQuery" :bo-id="boId" />
    <pr-tool-bar :bo-id="boId" :items="config.toolBarItems" />
    <pr-grid v-model="listQuery" :bo-id="boId" :columns="config.gridColumns">
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
    </pr-grid>
  </div>
</template>
<script>
import { fetchMetadata } from '@/api/pan'

export default {
  name: 'PurchaseApplyListSample',
  data() {
    return {
      // 业务对象id
      boId: '000000000500',
      // 列表数据
      list: null,
      // 分页-总记录数
      total: 0,
      listLoading: true,
      // 列表查询条件
      listQuery: {
        // 当前页数，从1开始
        page: 1,
        // 每页显示记录数
        limit: 20
      },
      // 页面配置
      config: {
        // 搜索区域配置
        searchAreas: [],
        // grid 列表配置
        gridColumns: [],
        // grid 工具栏配置
        toolBarItems: []
      }
    }
  },
  created() {
    fetchMetadata(this.boId).then(meta => {
      console.log('fetchMetadata:', meta)
      this.config.gridColumns = this.postConfigGridColumns(meta.columns, meta)
      this.config.toolBarItems = this.postConfigToolBarItems(meta.toolBarItems, meta)
      this.config.searchAreas = this.postConfigSearchAreas(meta.searchAreas, meta)
    }).then(() => {
      this.getList()
    })
  },
  methods: {
    // 对Grid列表配置数据二次处理
    postConfigGridColumns(columns, meta) {
      return columns
    },
    postConfigToolBarItems(toolBarItems, meta) {
      return toolBarItems
    },
    postConfigSearchAreas(searchAreas, meta) {
      return searchAreas
    }
  }
}
</script>
