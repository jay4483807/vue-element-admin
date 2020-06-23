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
          :placeholder="item.label"
        />
        <el-date-picker
          v-else-if="item.uiType===UI_TYPE.DATE_TIME"
          :key="index"
          v-model="listQuery[item.prop]"
          type="datetime"
          class="filter-item"
          :placeholder="item.label"
        />
        <el-date-picker
          v-else-if="item.uiType===UI_TYPE.DATE_TIME_RANGE"
          :key="index"
          v-model="listQuery[item.prop]"
          type="datetimerange"
          class="filter-item"
          :start-placeholder="item.label+'开始日期'"
          range-separator="-"
          :end-placeholder="item.label+'结束日期'"
        />
        <pr-search-helper
          v-else-if="item.uiType===UI_TYPE.SEARCH_HELP"
          :key="index"
          v-model="listQuery[item.prop]"
          class="filter-item"
          style="width: 200px;"
          :placeholder="item.label"
          :multi-select="item.multiSelect"
          :search-help-name="item.searchHelpName || ''"
          :value-field="item.searchHelpValueField"
          :display-field="item.searchHelpDisplayFiled"
          :sort-columns="item.sortColumns"
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
          <el-option v-for="opt of item.selectOptions" :key="opt.value" :label="opt.text" :value="opt.value" />
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
        <el-button v-if="config.searchMoreItems.length > 0" v-waves class="filter-item" type="primary" @click="dialogSearchMoreVisible=true">更多</el-button>
        <el-button v-waves class="filter-item" type="primary" @click="clearSearch">清空</el-button>
      </div>
    </div>
    <pr-bo-grid
      ref="grid"
      :bo-name="boName"
      toolbar-class="filter-container"
      :config-grid-columns="configGridColumns"
      :config-toolbar-items="configToolbarItems"
      :config-grid-actions="configGridActions"
      :auto-load="false"
      :query-params="gridQueryParams"
      @selection-change="_handleSelectionChange"
      @rowBtnClick="_rowBtnClick"
      @configOver="gridConfigOver"
      @toolbarClick="_toolbarItemClick"
    />
    <el-dialog title="高级查询" width="600px" :visible.sync="dialogSearchMoreVisible" class="search-more-dialog">
      <el-form :model="listQuery" label-width="120px">
        <el-form-item v-for="(item,index) of config.searchMoreItems" :key="index" :label="item.label">
          <el-date-picker v-if="item.uiType===UI_TYPE.DATE_RANGE" :key="index" v-model="listQuery[item.prop]" type="daterange" class="filter-item" start-placeholder="开始日期" range-separator="-" end-placeholder="结束日期" />
          <el-date-picker v-else-if="item.uiType===UI_TYPE.DATE" :key="index" v-model="listQuery[item.prop]" type="date" class="filter-item" placeholder="选择日期" />
          <el-date-picker v-else-if="item.uiType===UI_TYPE.DATE_TIME_RANGE" :key="index" v-model="listQuery[item.prop]" type="datetimerange" class="filter-item" start-placeholder="开始日期" range-separator="-" end-placeholder="结束日期" />
          <el-date-picker v-else-if="item.uiType===UI_TYPE.DATE_TIME" :key="index" v-model="listQuery[item.prop]" type="datetime" class="filter-item" placeholder="选择日期" />
          <pr-search-helper
            v-else-if="item.uiType===UI_TYPE.SEARCH_HELP"
            :key="index"
            v-model="listQuery[item.prop]"
            :search-help-name="item.searchHelpName || ''"
            :value-field="item.searchHelpValueField"
            :display-field="item.searchHelpDisplayFiled"
            :sort-columns="item.sortColumns"
            class="filter-item"
          />
          <el-select v-else-if="item.uiType===UI_TYPE.SELECT" :key="index" v-model="listQuery[item.prop]" clearable class="filter-item">
            <el-option v-for="opt of item.selectOptions" :key="opt.value" :label="opt.text" :value="opt.value" />
          </el-select>
          <el-input v-else :key="index" v-model="listQuery[item.prop]" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogSearchMoreVisible = false">取 消</el-button>
        <el-button type="primary" @click="_search">查 询</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  buildQueryParams
} from '@/api/pan'
import waves from '@/directive/waves' // waves directive
import request from '@/utils/request'
import { UI_TYPE, ACTION } from '@/constants.js'
import PrSearchHelper from '@/components/pro/PrSearchHelper'
import PrBoGrid from '@/components/pro/PrBoGrid'
import { executeConfig } from '@/utils/pan'
import boComponent from '@/components/pro/mixins/boComponent'

export default {
  name: 'ListPage',
  components: { PrBoGrid, PrSearchHelper },
  directives: { waves },
  mixins: [boComponent],
  props: {
    /**
     * 业务对象名，默认会读取当前页面路由信息里的业务对象名，可以不配
     * 此属性目前暂不支持动态修改，在页面初始化后不可改动
     */
    boName: {
      type: String,
      default: function() {
        return this.$route && this.$route.meta && this.$route.meta.boName || ''
      }
    },
    /**
     * 配置查询“更多”的搜索项
     */
    configSearchMoreItems: {
      type: [Function, Array],
      default(items) {
        return items
      }
    },
    /**
     * 配置快速查询的搜索项
     */
    configQuickSearchItems: {
      type: [Function, Array],
      default(items) {
        return items
      }
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
     * 配置grid操作
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
    /**
     * grid默认查询条件
     */
    gridQueryParams: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      listQuery: {
      },
      selectedRows: [],
      dialogSearchMoreVisible: false,
      config: {
        searchMoreItems: [],
        quickSearchItems: []
      }
    }
  },
  beforeCreate() {
    this.UI_TYPE = UI_TYPE
  },
  created() {
    if (!this.boName) {
      throw new Error('未指定当前页面对应的业务对象名')
    }
    console.log('创建list页面：' + this.boName)
  },
  methods: {
    gridConfigOver(config) {
      this.config.searchMoreItems = executeConfig(this.configSearchMoreItems, this, config.searchItems) || []
      this.config.quickSearchItems = executeConfig(this.configQuickSearchItems, this, config.searchItems) || []
      for (const item of [...this.config.searchMoreItems, ...this.config.quickSearchItems]) {
        this.$set(this.listQuery, item.prop, '')
      }
      console.log('config.searchMoreItems', this.config.searchMoreItems)
      console.log('config.quickSearchItems', this.config.quickSearchItems)
      this.getList() // grid配置完成后立即拉取一次grid数据
    },
    async getList() {
      const queryParams = await buildQueryParams([...this.config.searchMoreItems, ...this.config.quickSearchItems], this.listQuery, this.boName)
      this.$refs.grid.load(queryParams)
    },
    _search() {
      this.getList()
      this.dialogSearchMoreVisible = false
    },
    _rowBtnClick(event) {
      const { item, row } = event
      const action = item.action
      if (item.callback) {
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
          if (action.url) {
            const data = {}
            data[this.idProp] = row[this.idProp]
            request({
              url: action.url,
              data: data
            })
          } else {
            console.error('未指定方法[' + action + ']的url，无法自动完成删除动作', action)
          }
          break
        }
      }
    },
    _toolbarItemClick({ item }) {
      if (item.callback) {
        // 如果有配置回调，就不执行默认处理
        return
      }
      switch (item.action) {
        case ACTION.CREATE:
          this.$router.push('create')
          break
        case ACTION.DELETES:
          if (item.url) {
            // 处理批量删除动作
            const idsParamName = this.boName.substr(0, 1).toLowerCase() + this.boName.substr(1) + 'Ids'
            const data = {}
            data[idsParamName] = this.selectedRows.map(row => row[this.idProp]).join('|')
            request({
              url: item.url,
              data
            }).then(() => {
              this.$message({
                type: 'success',
                message: '操作成功'
              })
            })
          } else {
            console.error('未指定方法[' + item.action + ']的url，无法自动完成删除动作', item)
          }
          break
      }
    },
    _handleSelectionChange(rows) {
      this.selectedRows = rows
    },
    clearSearch() {
      for (const item of [...this.config.searchMoreItems, ...this.config.quickSearchItems]) {
        this.listQuery[item.prop] = undefined
      }
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

</style>
