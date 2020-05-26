<template>
  <div>
    <el-input prefix-icon="el-icon-search" :value="selectedLabel" v-bind="$attrs" :readonly="true" v-on="$listeners" @focus="openSearchHelpDialog" />
    <pr-search-helper-dialog ref="shDialog" :visible.sync="showDialog" v-bind="$attrs" :search-help-name="searchHelpName" :multi-select="multiSelect" :id-prop="valueField" @confirmSelected="confirmSelected" />
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
        return this.selectedRows.map(row => row[this.displayField]).join(', ')
      } else {
        return (this.selectedRows && this.selectedRows.length > 0) ? this.selectedRows[0][this.displayField] : ''
      }
    }
  },
  watch: {
    async value(val, oldVal) {
      if (this.valueEquals(val, this.getValue())) { return }
      this.selectedRows = await this.$refs.shDialog.getRowByIds((val instanceof Array ? val : [val]))
    }
  },
  methods: {
    openSearchHelpDialog() {
      this.showDialog = true
    },
    confirmSelected(rows) {
      this.selectedRows = rows
      this.showDialog = false
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
        return (this.selectedRows && this.selectedRows.length > 0) ? this.selectedRows[0][this.valueField] : undefined
      }
    }
  }
}
</script>

<style scoped>

</style>
