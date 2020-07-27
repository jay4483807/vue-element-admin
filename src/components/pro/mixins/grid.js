
export default {
  methods: {
    async load() {
      return this._getGrid().load()
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
    _getGrid() {
      return this.$refs.grid
    }
  }
}
