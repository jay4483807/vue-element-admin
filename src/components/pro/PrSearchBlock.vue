<template>
  <div v-if="quickSearchItems.length > 0" class="filter-container">
    <template v-for="(item,index) of quickSearchItems">
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
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="_clickSearch">查询</el-button>
      <el-button v-if="searchMoreItems.length > 0" class="filter-item" type="primary" @click="dialogSearchMoreVisible=true">更多</el-button>
      <el-button class="filter-item" type="primary" @click="clearSearch">清空</el-button>
    </div>
    <el-dialog title="高级查询" width="600px" :visible.sync="dialogSearchMoreVisible" class="search-more-dialog">
      <el-form :model="listQuery" label-width="120px">
        <el-form-item v-for="(item,index) of searchMoreItems" :key="index" :label="item.label">
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
        <el-button type="primary" @click="_clickDialogSearch">查 询</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import PrSearchHelper from '@/components/pro/PrSearchHelper'
import { UI_TYPE } from '@/constants'

export default {
  name: 'PrSearchBlock',
  components: { PrSearchHelper },
  props: {
    quickSearchItems: {
      type: Array,
      default() {
        return []
      }
    },
    searchMoreItems: {
      type: Array,
      default() {
        return []
      }
    }
  },
  data() {
    return {
      listQuery: {},
      dialogSearchMoreVisible: false
    }
  },
  watch: {
    quickSearchItems(items) {
      for (const item of items) {
        this.$set(this.listQuery, item.prop, '')
      }
    },
    searchMoreItems(items) {
      for (const item of items) {
        this.$set(this.listQuery, item.prop, '')
      }
    }
  },
  beforeCreate() {
    this.UI_TYPE = UI_TYPE
  },
  created() {
    this.$watch('listQuery', () => {
      this.$emit('search-params-changed', this.listQuery)
    }, {
      deep: true
    })
  },
  methods: {
    clearSearch() {
      for (const item of [...this.searchMoreItems, ...this.quickSearchItems]) {
        this.listQuery[item.prop] = undefined
      }
    },
    _clickSearch() {
      this.$emit('search-click')
    },
    _clickDialogSearch() {
      this._clickSearch()
      this.dialogSearchMoreVisible = false
    }
  }
}
</script>

<style lang="scss" scoped>

  .filter-container {
    .el-input {
      width: 200px;
    }
  }
</style>
