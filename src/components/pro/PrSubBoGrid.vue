<template>
  <div>
    <pr-bo-grid
      ref="grid"
      :bo-name="boName"
      v-bind="$attrs"
      :row-class-name="rowClassName"
      :cell-class-name="cellClassName"
      :compute-grid-actions="computeGridActions"
      :compute-list-data="computeListData"
      :height="400"
      v-on="$listeners"
      @toolbarClick="toolbarClick"
      @rowBtnClick="rowBtnClick"
      @selection-change="selectionChange"
    />
    <el-dialog :title="formTitle" :visible.sync="showForm" :show-close="true" :append-to-body="true" width="70%">
      <pr-bo-form
        ref="form"
        :bo-name="boName"
        label-width="120px"
        :model="form"
        :editable="formEditable"
        :compute-form-items="computeFormItems"
        :compute-form-data="computeFormData"
        :config-form-items="configFormItems"
      />
      <div slot="footer" class="dialog-footer">
        <el-button @click="showForm = false">取 消</el-button>
        <el-button type="primary" @click="formConfirm">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import PrBoGrid from '@/components/pro/PrBoGrid'
import PrBoForm from '@/components/pro/PrBoForm'
import boComponent from '@/components/pro/mixins/boComponent'

import { ACTION } from '@/constants'
import { isBlank } from '@/utils/pan'
const ADD = '__add'
const RECOVER = '_recover' // 恢复
const ORIGINAL_DATA = '__originalData'
export default {
  name: 'PrSubBoGrid',
  components: { PrBoForm, PrBoGrid },
  mixins: [boComponent],
  props: {
    configFormItems: {
      type: Function,
      default: (items) => {
        return items
      }
    },
    computeFormItems: {
      type: Function,
      default: ({ items, form }) => {
        return items
      }
    },
    computeFormData: {
      type: Function,
      default: (form) => {
        return form
      }
    }
  },
  data: function() {
    return {
      modifyRows: [],
      deleteRows: [],
      addRows: [],
      form: {},
      formEditable: true,
      showForm: false,
      selectedRows: []
    }
  },
  computed: {
    formTitle() {
      return this.boInfo.boText
    }
  },
  methods: {
    reload() {
      this.modifyRows = []
      this.deleteRows = []
      this.addRows = []
      this.$refs.grid.load()
    },
    getDeleteRows() {
      return this.deleteRows.filter(r => r).map(r => {
        const row = { ...r }
        delete row[ORIGINAL_DATA]
        return row
      })
    },
    getModifyRows() {
      return this.modifyRows.filter(r => r).map((r) => {
        const row = { ...r }
        delete row[ORIGINAL_DATA]
        return row
      })
    },
    getAddRows() {
      return this.addRows.filter(r => r)
    },
    rowClassName({ row, rowIndex }) {
      if (!isBlank(row[ADD])) {
        return 'new-row'
      } else if (this.findRow(row, this.deleteRows) >= 0) {
        return 'delete-row'
      }
    },
    cellClassName({ row, column, rowIndex, columnIndex }) {
      const originalData = row[ORIGINAL_DATA]
      const prop = column.property
      if (!isBlank(row[ADD]) || prop && originalData && originalData[prop] !== row[prop]) {
        return 'update-cell'
      }
    },
    deleteRow(row) {
      if (!isBlank(row[ADD])) {
        this.addRows.splice(row[ADD], 1)
      } else {
        const index = this.deleteRows.findIndex((r) => {
          return row[this.idProp] === r[this.idProp]
        })
        if (index >= 0) {
          this.deleteRows.splice(index, 1, row)
        } else {
          this.deleteRows.push(row)
        }
      }
    },
    toolbarClick({ item }) {
      if (item.action === ACTION.CREATE) {
        this.form = {
          [ADD]: true
        }
        this.showForm = true
      } else if (item.action === ACTION.DELETES) {
        for (const row of this.selectedRows) {
          this.deleteRow(row)
        }
      }
    },
    rowBtnClick({ item, row, rowIndex }) {
      if (item.action === ACTION.EDIT) {
        this.form = row
        this.formEditable = true
        this.showForm = true
        console.log('编辑子对象[' + this.boName + '],rowIndex=' + rowIndex, row)
      } else if (item.action === ACTION.DELETE) {
        this.deleteRow(row)
        // this.$refs.grid.load()
      } else if (item.action === RECOVER) {
        const i = this.findRow(row, this.deleteRows)
        this.deleteRows.splice(i, 1)
      } else if (item.action === ACTION.VIEW) {
        this.form = row
        this.formEditable = false
        this.showForm = true
      }
    },
    formConfirm() {
      this.$refs.form.validate(valid => {
        if (valid) {
          const row = this.$refs.form.getForm()
          if (row[ADD] === true) {
            // 没有在addRows数组中的情况
            row[ADD] = this.addRows.length
            this.addRows.push(row)
          } else if (typeof row[ADD] === 'number') {
            // 已在addRows数组中
            this.addRows.splice(row[ADD], 1, row)
          } else {
            const index = this.findRow(row, this.modifyRows)
            if (index >= 0) {
              this.modifyRows.splice(index, 1, row)
            } else {
              this.modifyRows.push(row)
            }
          }
          this.showForm = false
        } else {
          this.$message({
            message: '数据校验失败，请检查',
            type: 'error'
          }, 2000)
        }
      })
    },
    selectionChange(rows) {
      this.selectedRows = rows
    },
    findRow(row, rowArr) {
      return rowArr.findIndex((r) => r[this.idProp] === row[this.idProp])
    },
    computeGridActions({ actions, row, rowIndex }) {
      if (this.findRow(row, this.deleteRows) >= 0) {
        return actions.map((item) => {
          if (item.action === ACTION.DELETE) {
            item = {
              ...item,
              action: RECOVER,
              label: '恢复',
              btnType: 'success'
            }
          }
          return item
        })
      }
      return actions
    },
    computeListData(list) {
      if (list) {
        list = list.map(row => {
          if (!row[ORIGINAL_DATA]) {
            row[ORIGINAL_DATA] = { ...row }
          }
          const i = this.findRow(row, this.modifyRows)
          if (i >= 0) {
            row = this.modifyRows[i]
          }
          return row
        })
        if (this.addRows.length > 0) {
          list = [...this.addRows, ...list]
        }
      }
      return list
    }
  }
}
</script>

<style>

  .el-table .delete-row {
    background-color: #FDE2E2;
  }

  .el-table .update-cell {
    color: #F56C6C;
  }

  .el-table .new-row {
    background-color: #E9E9EB;
  }

</style>
