<template>
  <div>
    <el-input
      prefix-icon="el-icon-search"
      :value="selectedLabel"
      v-bind="$attrs"
      :disabled="disabled"
      :clearable="true"
      v-on="$listeners"
      @focus="openSearchHelpDialog"
      @clear="clear"
    />
    <pr-search-helper-dialog
      ref="shDialog"
      :visible.sync="showDialog"
      v-bind="$attrs"
      :search-help-name="searchHelpName"
      :multi-select="multiSelect"
      :id-prop="valueField"
      @confirmSelected="confirmSelected"
    />
  </div>

</template>

<script>
import PrSearchHelperDialog from '@/components/pro/PrSearchHelperDialog'

export default {
  name: 'PrSearchHelper',
  components: { PrSearchHelperDialog },
  inheritAttrs: false,
  model: {
    prop: 'value',
    event: 'select'
  },
  props: {
    searchHelpName: {
      type: String,
      required: true
    },
    valueField: {
      type: String,
      required: true
    },
    displayField: {
      type: String,
      required: true
    },
    multiSelect: {
      type: Boolean,
      default: false
    },
    readonly: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    value: [String, Number, Array]
  },
  data() {
    return {
      showDialog: false,
      selectedRows: []
    }
  },
  computed: {
    selectedLabel() {
      if (this.multiSelect) {
        return this.selectedRows.map(row => row ? row[this.displayField] : '').join(', ')
      } else {
        const selectedRow = this.selectedRows && this.selectedRows[0]
        if (selectedRow) {
          return selectedRow[this.displayField]
        } else { // 如果有value值，但是没有找到匹配的选项，直接显示value值
          return this.value || ''
        }
      }
    }
  },
  watch: {
    async value(val, oldVal) {
      if (this.valueEquals(val, this.getValue())) { return }
      this.selectedRows = await this.$refs.shDialog.getRowByIds(val instanceof Array ? val : [val])
    }
  },
  methods: {
    async getDisplay(val) {
      if (!val) val = this.getValue()
      const rows = await this.$refs.shDialog.getRowByIds(val instanceof Array ? val : [val])
      return rows.length > 0 ? rows.map(row => row ? row[this.displayField] : '').join(', ') : ''
    },
    openSearchHelpDialog() {
      if (!this.readonly && !this.disabled) { this.showDialog = true }
    },
    confirmSelected(rows) {
      this.selectedRows = rows
      this.showDialog = false
      this.$emit('select', this.getValue(), this.selectedRows)
    },
    clear(val) {
      this.selectedRows = []
      this.$emit('select', this.getValue(), this.selectedRows)
    },
    valueEquals(val1, val2) {
      if (val1 === val2) { return true }
      if (val1 instanceof Array && val2 instanceof Array) {
        for (let i = 0; i < val1.length; i++) {
          if (val1[i] !== val2[i]) { return false }
        }
        return true
      }
      return false
    },
    getValue() {
      if (this.multiSelect) {
        return this.selectedRows.map(row => row[this.valueField])
      } else {
        return (this.selectedRows && this.selectedRows.length > 0 && this.selectedRows[0]) ? this.selectedRows[0][this.valueField] : undefined
      }
    }
  }
}
</script>

<style scoped>

</style>
