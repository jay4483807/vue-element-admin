<template>
  <div>
    <pr-bo-grid
      ref="grid"
      :bo-name="boName"
      v-bind="$attrs"
      :cell-class-name="cellClassName"
      :compute-grid-actions="computeGridActions"
      :compute-list-data="computeListData"
      :config-toolbar-items="_configToolbarItems"
      :height="400"
      :show-tags="$attrs.editable"
      :compute-row-tags="computeRowTags"
      v-on="$listeners"
      @toolbarClick="toolbarClick"
      @rowBtnClick="rowBtnClick"
      @row-change="_rowChange"
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
    <el-dialog v-if="isAttachment" title="上传附件" :visible.sync="showUpload" :show-close="true" :append-to-body="true" width="70%">
      <el-upload
        ref="upload"
        drag
        :action="uploadUrl"
        multiple
        :data="uploadData"
        name="upload"
        :with-credentials="true"
        :before-upload="beforeUpload"
        :on-change="onChange"
        :on-preview="onPreview"
        :on-success="onUploadSuccess"
      >
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
      </el-upload>
    </el-dialog>
  </div>
</template>

<script>
import PrBoGrid from '@/components/pro/PrBoGrid'
import PrBoForm from '@/components/pro/PrBoForm'
import boComponent from '@/components/pro/mixins/boComponent'
import grid from './mixins/grid'

import { ACTION } from '@/constants'
import { executeConfig, isBlank } from '@/utils/pan'
import request from '@/utils/request'
const ADD = '__add'
const RECOVER = '_recover' // 恢复
const ADD_LINE = '_addLine' // 添加行
const ORIGINAL_DATA = '__originalData'
export default {
  name: 'PrSubBoGrid',
  components: { PrBoForm, PrBoGrid },
  mixins: [boComponent, grid],
  props: {
    prop: {
      type: String,
      default: ''
    },
    parentBoName: {
      type: String,
      default: ''
    }, parentBoId: {
      type: String,
      default: ''
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
      showUpload: false,
      uploadUrl: process.env.VUE_APP_BASE_API + '/attachementController.spr?action=upload',
      uploadData: {}
    }
  },
  computed: {
    formTitle() {
      return this.boInfo.boText
    },
    isAttachment() {
      return this.boName === 'Attachement'
    }
  },
  methods: {
    reload() {
      this.modifyRows = []
      this.deleteRows = []
      this.addRows = []
      this.$refs.grid.load()
    },
    clear() {
      this.modifyRows = []
      this.deleteRows = []
      this.addRows = []
      this.$refs.grid.clear()
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
    cellClassName({ row, column, rowIndex, columnIndex }) {
      const originalData = row[ORIGINAL_DATA]
      const prop = column.property
      const className = []
      const col = this.getColumn(prop) || {}
      if (col.required && isBlank(row[prop])) {
        className.push('required-cell')
      }
      if (isBlank(row[ADD]) && prop && originalData && originalData[prop] !== row[prop]) {
        className.push('update-cell')
      }
      if (className.length > 0) {
        return className.join(' ')
      }
    },
    deleteRow(row) {
      if (!isBlank(row[ADD])) {
        this.addRows.splice(row[ADD], 1)
      } else {
        const index = this.deleteRows.findIndex((r) => {
          return this._getGrid().getRowKey(row) === this._getGrid().getRowKey(r)
        })
        if (index >= 0) {
          this.deleteRows.splice(index, 1, row)
        } else {
          this.deleteRows.push(row)
        }
      }
      this.toggleRowSelection(row, false)
    },
    toolbarClick({ item }) {
      if (item.callback) {
        // 如果有配置回调处理，就不执行默认处理了
        return
      }
      if (item.action === ACTION.CREATE) {
        this.form = {
          [ADD]: true
        }
        this.showForm = true
      } else if (item.action === ACTION.DELETES) {
        if (this.isAttachment) {
          request({
            url: 'attachementController.spr?action=delete',
            data: {
              attachementIdList: this.getSelectedRows().map(row => '\'' + row.attachementId + '\'').join(',') + ','
            }
          }).then(() => {
            this.$refs.grid.load()
          })
        }
        for (const row of this.getSelectedRows()) {
          this.deleteRow(row)
        }
      } else if (this.isAttachment && item.action === ACTION.UPLOAD) {
        if (this.$refs.upload) {
          this.$refs.upload.clearFiles()
        }
        this.showUpload = true
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
      } else if (item.action === ACTION.DOWNLOAD) {
        const a = document.createElement('a')
        a.download = row.fileName
        a.href = process.env.VUE_APP_BASE_API + '/attachementController.spr?action=download&attachementId=' + row.attachementId
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
      }
    },
    formConfirm() {
      this.$refs.form.validate(valid => {
        if (valid) {
          const row = this.$refs.form.getForm()
          this.processRowChange(row)
          this.showForm = false
        } else {
          this.$message({
            message: '数据校验失败，请检查',
            type: 'error'
          }, 2000)
        }
      })
    },
    _rowChange({ row, rowIndex, prop }) {
      this.processRowChange(row)
    },
    processRowChange(row) {
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
    },
    _configToolbarItems(items) {
      if (this.$attrs.editable) {
        items = [{
          action: ADD_LINE,
          label: '添加行',
          callback: () => {
            this.processRowChange({
              [ADD]: true
            })
          }
        },
        ...items]
      }
      return executeConfig(this.configToolbarItems, this, items)
    },
    computeGridActions({ actions, row, rowIndex }) {
      if (this.findRow(row, this.deleteRows) >= 0) {
        actions = actions.filter(item => item.action !== ACTION.DELETE)
        actions.push({
          action: RECOVER,
          label: '恢复',
          btnType: 'success'
        })
        return actions
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
    },
    beforeUpload(file) {
      return new Promise((resolve) => {
        this.uploadData = {
          boName: this.parentBoName,
          boId: this.parentBoId,
          attachementtype: '1',
          Upload: 'Submit Query',
          boProperty: this.prop,
          Filename: file.name,
          filepath: '',
          description: ''
        }
        this.$nextTick(() => {
          // 如果直接返回，uploadData参数设置无法立即生效，所以改动nextTick之后再执行上传
          resolve()
        })
      })
    },
    onPreview(file) {
    },
    onChange(file, fileList) {
    },
    onUploadSuccess(response, file, fileList) {
      const rows = response.attachement
      for (const row of rows) { // 上传成功后添加到add列表
        row[ADD] = this.addRows.length
        this.addRows.push(row)
      }
    },
    computeRowTags(row) {
      if (!isBlank(row[ADD])) {
        return [{
          type: 'success',
          label: '新增'
        }]
      }
      if (this.findRow(row, this.deleteRows) >= 0) {
        return [{
          type: 'danger',
          label: '删除'
        }]
      }
      const orgData = row[ORIGINAL_DATA]
      if (orgData) {
        let c = 0
        for (const key in orgData) {
          if (orgData[key] !== row[key]) {
            c++
          }
        }
        if (c > 0) {
          return [{
            type: 'primary',
            label: '修改'
          }]
        }
      }
      return []
    }
  }
}
</script>

<style lang="scss">
  @import '../../styles/element-variables.scss';

  .el-table .update-cell input{
    border: 1px solid $--color-primary;
  }

  .el-table .required-cell input {
    border: 1px solid $--color-danger;
  }

  .el-table input {
    background-color: rgba(255,255,255,0.3);
  }

</style>
