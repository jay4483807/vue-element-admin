<template>
  <el-form ref="form" :label-width="labelWidth" :inline="false" label-position="right" :model="form" :rules="rules" class="form-container">
    <slot name="top" />
    <div class="form-main-container">
      <el-row v-for="(row,rowIndex) of formRowColumns" :key="rowIndex" type="flex">
        <el-col v-for="(item,colIndex) of row" :key="colIndex" :span="item && item.span || 24/colSize">
          <el-form-item v-if="item" v-show="!item.hide" :label="item.label" :prop="item.prop">
            <el-date-picker
              v-if="item.uiType===UI_TYPE.DATE_RANGE"
              :ref="'item_'+item.prop"
              v-model="form[item.prop]"
              type="daterange"
              start-placeholder="开始日期"
              range-separator="-"
              end-placeholder="结束日期"
              :disabled="!(editable && item.editable)"
            />
            <el-date-picker
              v-else-if="item.uiType===UI_TYPE.DATE"
              :ref="'item_'+item.prop"
              v-model="form[item.prop]"
              type="date"
              :disabled="!(editable && item.editable)"
            />
            <el-date-picker
              v-else-if="item.uiType===UI_TYPE.DATE_TIME"
              :ref="'item_'+item.prop"
              v-model="form[item.prop]"
              type="datetime"
              :disabled="!(editable && item.editable)"
            />
            <el-date-picker
              v-else-if="item.uiType===UI_TYPE.DATE_TIME_RANGE"
              :ref="'item_'+item.prop"
              v-model="form[item.prop]"
              type="datetimerange"
              start-placeholder="i开始时间"
              range-separator="-"
              end-placeholder="结束日期"
              :disabled="!(editable && item.editable)"
            />
            <pr-search-helper
              v-else-if="item.uiType===UI_TYPE.SEARCH_HELP"
              :ref="'item_'+item.prop"
              v-model="form[item.prop]"
              :multi-select="item.multiSelect"
              :search-help-name="item.searchHelpName || ''"
              :value-field="item.searchHelpValueField"
              :display-field="item.searchHelpDisplayFiled"
              :query-params="item.queryParams"
              :sort-columns="item.sortColumns"
              :disabled="!(editable && item.editable)"
            />
            <el-select
              v-else-if="item.uiType===UI_TYPE.SELECT"
              :ref="'item_'+item.prop"
              v-model="form[item.prop]"
              clearable
              :disabled="!(editable && item.editable)"
            >
              <el-option v-for="opt of item.selectOptions" :key="opt.value" :label="opt.text" :value="opt.value" />
            </el-select>
            <el-input
              v-else
              :ref="'item_'+item.prop"
              v-model="form[item.prop]"
              :disabled="!(editable && item.editable)"
              :clearable="true"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </div>
  </el-form>
</template>

<script>
import PrSearchHelper from '@/components/pro/PrSearchHelper'
import { UI_TYPE } from '@/constants'
import { buildFormItemConfig, getBoInfo, getFormItems } from '@/api/pan'
import { isBlank, parseDate, parseDateTime, toDateStr, toDateTimeStr } from '@/utils/pan'

export default {
  name: 'PrBoForm',
  components: { PrSearchHelper },
  props: {
    editable: {
      type: Boolean,
      default: true
    },
    id: {
      type: String,
      default: ''
    },
    boName: {
      type: String,
      required: true
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
    },
    labelWidth: {
      type: String,
      default: '140px'
    },
    model: {
      type: Object,
      default: function() {
        return {}
      }
    }
  },
  data() {
    return {
      colSize: 3,
      form: {},
      formItems: [],
      useRowColNo: true
    }
  },
  computed: {
    computedFormItems() {
      return this.computeFormItems({ items: this.formItems, form: this.form }) || []
    },
    formItemMap() {
      const formItemMap = {}
      for (const item of this.computedFormItems) {
        formItemMap[item.prop] = item
      }
      return formItemMap
    },
    formRowColumns() {
      const items = this.computedFormItems.filter(col => col.visibility).sort((col1, col2) => col1.rowNo - col2.rowNo || col1.colNo - col2.colNo)
      const rowCols = []
      const noPosColumns = []
      for (const item of items) {
        if (!item.span) { item.span = item.uiType === UI_TYPE.TEXT_AREA ? 24 : 24 / this.colSize }
        if (this.useRowColNo && item.rowNo > 0 && item.colNo > 0) {
          let row = rowCols[item.rowNo - 1]
          if (!row) {
            row = []
            rowCols[item.rowNo - 1] = row
          }
          let col = item.colNo - 1
          while (row[col]) {
            col++
          }
          row[col] = item
        } else {
          noPosColumns.push(item)
        }
      }
      let rowP = 0; let colP = 0
      for (const col of noPosColumns) {
        let row
        for (;;rowP++) {
          row = rowCols[rowP]
          if (!row) {
            rowCols[rowP] = row = []
          }
          let totalSpan = 0
          for (const c of row) {
            if (c) { totalSpan += c.span }
          }
          if (totalSpan + col.span > 24) {
            colP = 0
            continue
          }
          for (; colP < this.colSize; colP++) {
            if (!row[colP]) {
              break
            }
          }
          if (colP >= this.colSize) {
            colP = 0
            continue
          }
          break
        }
        row[colP] = col
      }
      return rowCols
    },
    rules() {
      const rules = {}
      for (const item of this.computedFormItems) {
        if (item.rule) { rules[item.prop] = item.rule } else if (item.required) {
          rules[item.prop] = [
            { required: true,
              validator: (rule, value, callback) => {
                if (isBlank(value)) {
                  callback(new Error('请输入' + item.label))
                } else {
                  callback()
                }
              }
            }
          ]
        }
      }
      return rules
    }
  },
  watch: {
    model(model) {
      this.form = this.toFormData(model)
    },
    rules() {
      this.$refs.form.clearValidate()
    },
    computedFormItems() {
      for (const item of this.computedFormItems) {
        if (this.form[item.prop] === undefined) {
          this.$set(this.form, item.prop, item.defaultValue || '')
        }
      }
    }
  },
  beforeCreate() {
    this.UI_TYPE = UI_TYPE
  },
  async created() {
    const boInfo = await getBoInfo(this.boName)
    this.idProp = boInfo.idProp
    if (!this.idProp) {
      console.warn('未找到业务对象[' + this.boName + ']的id属性')
    }
    let items = await getFormItems(this.boName)
    for (let i = 0; i < items.length; i++) {
      items[i] = await buildFormItemConfig(items[i], boInfo.props)
    }
    items = this.configFormItems(items) || items
    this.formItems = items
    console.log('表单字段配置:', items)
    this.$watch('form', (newVal, oldVal) => {
      if (!this._computingFormData) {
        this._computingFormData = true
        this.computeFormData(this.form)
        this.$nextTick(() => {
          this._computingFormData = false
        })
      }
    }, {
      deep: true
    })
    // 初始化时并不会监听到model变更，这里手动调用一次
    this.form = this.toFormData(this.model)
  },
  methods: {
    getForm() {
      return this.formatFormData(this.form)
    },
    getFormForSave() {
      return this.formatFormDataForSave(this.form)
    },
    validate() {
      this.$refs.form.validate(...arguments)
    },
    toFormData(data) {
      const result = { ...data }
      for (const prop of Object.keys(data)) {
        const item = this.formItemMap[prop]
        if (!item) { continue }
        switch (item.uiType) {
          case UI_TYPE.DATE: {
            result[prop] = parseDate(data[prop])
            break
          }
          case UI_TYPE.DATE_TIME: {
            result[prop] = parseDateTime(data[prop])
            break
          }
        }
      }
      return result
    },
    formatFormData(formData) {
      const result = { ...formData }
      for (const prop of Object.keys(formData)) {
        const item = this.formItemMap[prop]
        if (!item) { continue }
        switch (item.uiType) {
          case UI_TYPE.DATE: {
            result[prop] = toDateStr(formData[prop])
            break
          }
          case UI_TYPE.DATE_TIME: {
            result[prop] = toDateTimeStr(formData[prop])
            break
          }
        }
      }
      return result
    },
    formatFormDataForSave(formData) {
      const resultData = {}
      for (const prop of Object.keys(formData)) {
        let value = formData[prop]
        const item = this.formItemMap[prop]
        if (item) {
          switch (item.uiType) {
            case UI_TYPE.DATE: {
              value = toDateStr(formData[prop])
              break
            }
            case UI_TYPE.DATE_TIME: {
              value = toDateTimeStr(formData[prop])
              break
            }
          }
        }
        resultData[this.boName + '.' + prop] = value
      }
      return resultData
    },
    getFormItem(prop) {
      let item = this.$refs['item_' + prop]
      if (item instanceof Array) {
        item = item[0]
      }
      return item
    }
  }
}
</script>

<style lang="scss" scoped>
  @import "~@/styles/mixin.scss";

  .form-container {
    position: relative;

    .form-main-container {
      padding: 40px 45px 20px 50px;
      max-width: 1200px;
      margin: 0 auto;

      .line-feed /deep/ label {
        line-height: 18px;
      }

      .el-col {
        max-width: 900px;
      }
    }
  }

  .el-form-item {
    /deep/ label {
      overflow: hidden;
      /*text-overflow: ellipsis;*/
      white-space: nowrap;
    }
  }

  .el-form-item__content>div {
    width: 100%;
  }

  .tabs-container {
    padding: 0 45px 20px 50px;
  }

  .el-button-group{
    margin-bottom: 10px;
  }
</style>
