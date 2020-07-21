
export default {
  methods: {
    async load() {
      return this._getGrid().load()
    },
    clear() {
      return this._getGrid().clear()
    },
    toggleRowSelection(row, selected) {
      this._getGrid().toggleRowSelection(row, selected)
    },
    _getGrid() {
      return this.$refs.grid
    }
  }
}
