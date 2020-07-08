
export default {
  data() {
    return {
      // 列表查询扩展查询条件
      queryParams: {}
    }
  },
  created() {
    this.bindProps = {
      configQuickSearchItems: this.configQuickSearchItems,
      configSearchMoreItems: this.configSearchMoreItems,
      configToolbarItems: this.configToolbarItems,
      configGridColumns: this.configGridColumns,
      configGridActions: this.configGridActions,
      computeToolbarItems: this.computeToolbarItems,
      computeGridActions: this.computeGridActions,
      gridQueryParams: this.queryParams
    }
  },
  methods: {
    configQuickSearchItems(items) {
      return items
    },
    configSearchMoreItems(items) {
      return items
    },
    configToolbarItems(items) {
      return items
    },
    configGridColumns(columns) {
      return columns
    },
    configGridActions(actions) {
      return actions
    },
    computeToolbarItems(items) {
      return items
    },
    computeGridActions({ actions, row, rowIndex }) {
      return actions
    }
  }
}
