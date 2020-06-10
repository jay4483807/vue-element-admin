<template>
  <el-form ref="form" label-width="140px" :inline="false" label-position="right" :model="form" :rules="rules" class="form-container">
    <div class="form-main-container">
      <el-row v-for="(row,rowIndex) of config.formRowColumns" :key="rowIndex" :gutter="20" type="flex">
        <el-col v-for="(item,colIndex) of row" :key="colIndex" :span="item.span">
          <el-form-item :label="item.label" :prop="item.prop">
            <el-date-picker
              v-if="item.uiType===UI_TYPE.DATE_RANGE"
              v-model="form[item.prop]"
              type="daterange"
              start-placeholder="开始日期"
              range-separator="-"
              end-placeholder="结束日期"
              :readonly="!editable || item.readOnly"
            />
            <el-date-picker
              v-else-if="item.uiType===UI_TYPE.DATE"
              v-model="form[item.prop]"
              type="date"
              :readonly="!editable || item.readOnly"
            />
            <el-date-picker
              v-else-if="item.uiType===UI_TYPE.DATE_TIME"
              v-model="form[item.prop]"
              type="datetime"
              :readonly="!editable || item.readOnly"
            />
            <el-date-picker
              v-else-if="item.uiType===UI_TYPE.DATE_TIME_RANGE"
              v-model="form[item.prop]"
              type="datetimerange"
              start-placeholder="i开始时间"
              range-separator="-"
              end-placeholder="结束日期"
              :readonly="!editable || item.readOnly"
            />
            <pr-search-helper
              v-else-if="item.uiType===UI_TYPE.SEARCH_HELP"
              v-model="form[item.prop]"
              :multi-select="item.multiSelect"
              :search-help-name="item.searchHelpName || ''"
              :value-field="item.searchHelpValueField"
              :display-field="item.searchHelpDisplayFiled"
              :default-condition="item.defaultCondition"
              :sort-columns="item.sortColumns"
              :readonly="!editable || item.readOnly"
            />
            <el-select
              v-else-if="item.uiType===UI_TYPE.SELECT"
              v-model="form[item.prop]"
              clearable
              :disabled="!editable || item.readOnly"
            >
              <el-option v-for="opt of item.options" :key="opt.value" :label="opt.text" :value="opt.value" />
            </el-select>
            <el-input
              v-else
              v-model="form[item.prop]"
              :readonly="!editable || item.readOnly"
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
import { buildFormItemConfig, getBoInfo, getFormColumns } from '@/api/pan'
import { isBlank } from '@/utils/pan'

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
    preConfigFormColumns: {
      type: Function,
      default: (columns) => {
      }
    }
  },
  data() {
    return {
      form: {},
      rules: {},
      config: {
        colSize: 3,
        formRowColumns: []
      },
      useRowColNo: false
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
    let columns = await getFormColumns(this.boName)
    columns = this.preConfigFormColumns(columns) || columns
    columns = columns.filter(col => col.visibility).sort((col1, col2) => col1.rowNo - col2.rowNo || col1.colNo - col2.colNo)
    const rowCols = []
    const noPosColumns = []
    const rules = {}
    const formItems = {}
    for (const col of columns) {
      const item = await buildFormItemConfig(col, boInfo.props)
      if (item.required) {
        rules[item.prop] = [
          { required: true, trigger: 'blur',
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
      if (!item.span) { item.span = item.uiType === UI_TYPE.TEXT_AREA ? 24 : 24 / this.config.colSize }
      formItems[item.prop] = item
      if (this.useRowColNo && item.rowNo > 0 && item.colNo > 0) {
        let row = rowCols[item.rowNo - 1]
        if (!row) {
          row = []
          rowCols[item.rowNo - 1] = row
        }
        row.push(item)
      } else {
        noPosColumns.push(item)
      }
    }
    for (const col of noPosColumns) {
      let row = rowCols[rowCols.length - 1]
      if (row) {
        let totalSpan = 0
        for (const c of row) {
          totalSpan += c.span
        }
        if (totalSpan + col.span > 24) {
          row = null // 超过24就换行
        }
      }
      if (!row) {
        row = []
        rowCols[rowCols.length] = row
      }
      row.push(col)
    }
    this.formItems = formItems
    console.log('获取表单字段信息:', formItems)
    this.rules = rules
    this.config.formRowColumns = rowCols
    console.log('get formRowColumns', rowCols, rules)
  },
  methods: {

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
