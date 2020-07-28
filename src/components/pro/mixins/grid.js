
export default {
  methods: {
    async load() {
      return this._getGrid().load()
    },
    getList() {
      return this._getGrid().getList()
    },
    clear() {
      return this._getGrid().clear()
    },
    clearSelection() {
      this._getGrid().clearSelection()
    },
    toggleRowSelection(row, selected) {
      this._getGrid().toggleRowSelection(row, selected)
    },
    getColumn(prop) {
      return this._getGrid().getColumn(prop)
    },
    getSelectedRows() {
      return this._getGrid().getSelectedRows()
    },
    getRowKey(row) {
      const rowKey = this._getGrid().rowKey
      if (typeof rowKey === 'function') { return rowKey(row) } else return row[rowKey]
    },
    findRow(row, rowArr) {
      return rowArr.findIndex((r) => this.getRowKey(r) === this.getRowKey(row))
    },
    _getGrid() {
      return this.$refs.grid
    }
  }
}
