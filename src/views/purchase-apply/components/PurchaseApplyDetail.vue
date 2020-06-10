<template>
  <div>
    <el-form ref="form" label-width="140px" :inline="false" label-position="right" :model="form" :rules="rules" class="form-container">
      <sticky :z-index="10" class-name="sub-navbar draft" :sticky-top="84">
        <el-button
          v-for="(item,index) of config.toolbarItems"
          :key="index"
          :type="item.btnType"
          :loading="item.loading"
          :disabled="item.disabled"
          @click="_toolbarItemClick(item)"
        >{{ item.label }}</el-button>
      </sticky>
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
                :readonly="item.readOnly"
              />
              <el-date-picker
                v-else-if="item.uiType===UI_TYPE.DATE"
                v-model="form[item.prop]"
                type="date"
                :readonly="item.readOnly"
              />
              <el-date-picker
                v-else-if="item.uiType===UI_TYPE.DATE_TIME"
                v-model="form[item.prop]"
                type="datetime"
                :readonly="item.readOnly"
              />
              <el-date-picker
                v-else-if="item.uiType===UI_TYPE.DATE_TIME_RANGE"
                v-model="form[item.prop]"
                type="datetimerange"
                start-placeholder="i开始时间"
                range-separator="-"
                end-placeholder="结束日期"
                :readonly="item.readOnly"
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
                :readonly="item.readOnly"
              />
              <el-select
                v-else-if="item.uiType===UI_TYPE.SELECT"
                v-model="form[item.prop]"
                clearable
                :disabled="item.readOnly"
              >
                <el-option v-for="opt of item.options" :key="opt.value" :label="opt.text" :value="opt.value" />
              </el-select>
              <el-input
                v-else
                v-model="form[item.prop]"
                :readonly="item.readOnly"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </div>
    </el-form>
    <el-tabs v-model="activeTag" class="tabs-container">
      <el-tab-pane v-for="(subConfig,index) of config.subBos" :key="index" :label="subConfig.label" :name="'tag_'+index">
        <pr-bo-grid
          class="tab-main-container"
          toolbar-class="el-button-group"
          :bo-name="subConfig.boName"
          :default-condition="subConfig.defaultCondition || ''"
          @toolbarClick="subBoToolbarClick(subConfig,$event)"
          @rowClick="subBoRowClick(subConfig,$event)"
        />
      </el-tab-pane>
    </el-tabs>
    <el-dialog :title="subBoFormDialog.title" :visible.sync="subBoFormDialog.show" :show-close="true" :append-to-body="true" width="70%">
      <pr-bo-form :bo-name="subBoFormDialog.boName" />
      <div slot="footer" class="dialog-footer">
        <el-button @click="subBoFormDialog.show = false">取 消</el-button>
        <el-button type="primary" @click="subBoFormDialogConfirm">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Sticky from '@/components/Sticky/index'
import {
  buildFormItemConfig,
  fetchFormData,
  getBoInfo,
  getBoProperties,
  getFormColumns,
  getFormToolbar
} from '@/api/pan'
import PrSearchHelper from '@/components/pro/PrSearchHelper'
import { ACTION, UI_TYPE } from '@/constants'
import { isBlank, parseDate, parseDateTime, toDateStr, toDateTimeStr } from '@/utils/pan'
import request from '@/utils/request'
import PrBoGrid from '@/components/pro/PrBoGrid'
import PrBoForm from '@/components/pro/PrBoForm'

export default {
  name: 'PurchaseApplyDetail',
  components: { PrBoForm, Sticky, PrSearchHelper, PrBoGrid },
  props: {
    editable: {
      type: Boolean,
      default: false
    },
    id: {
      type: String,
      default: ''
    },
    boName: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      form: {},
      rules: {},
      tempRoute: {},
      activeTag: '',
      subBoData: [],
      tagData: {
        project: [],
        attachment: []
      },
      config: {
        formRowColumns: [],
        colSize: 3,
        toolbarItems: [],
        subBos: []
      },
      subBoFormDialog: {
        boName: '',
        title: '',
        show: false
      },
      useRowColNo: false
    }
  },
  watch: {
    'subBoFormDialog.boName': async function(boName, oldBoName) {
      const boInfo = await getBoInfo(boName)
      this.subBoFormDialog.title = boInfo.boText
    }
  },
  beforeCreate() {
    this.UI_TYPE = UI_TYPE
  },
  created() {
    getBoProperties(this.boName).then(boProps => {
      this.boProps = boProps
      console.log('获取业务对象属性信息:', this.boProps)
      return getBoInfo(this.boName)
    }).then(boInfo => {
      this.idProp = boInfo.idProp
      if (!this.idProp) {
        console.warn('未找到业务对象[' + this.boName + ']的id属性')
      }
      return getFormToolbar(this.boName)
    }).then((items) => {
      this.config.toolbarItems = items.filter(item => {
        if (!this.editable && item.action === ACTION.SAVE) { return false }
        return true
      }).map(item => {
        item = {
          btnType: 'primary',
          disabled: false,
          loading: false,
          ...item
        }
        if (item.action === ACTION.CANCEL) {
          item.btnType = 'info'
        }
        return item
      })
      console.log('获取工具栏配置:', this.config.toolbarItems)
      return getFormColumns(this.boName)
    }).then(async columns => {
      columns = this.preConfigFormColumns(columns) || columns
      columns = columns.filter(col => col.visibility).sort((col1, col2) => col1.rowNo - col2.rowNo || col1.colNo - col2.colNo)
      const rowCols = []
      const noPosColumns = []
      const rules = {}
      const formItems = {}
      for (const col of columns) {
        const item = await buildFormItemConfig(col, this.boProps)
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
        if (this.editable === false) {
          item.readOnly = true
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
    }).then(() => {
      // 查找子业务对象
      const arr = []
      for (const property of Object.values(this.boProps)) {
        if (property.subBoName) {
          arr.push(this.buildSubBoConfig(property.subBoName))
        }
      }
      return Promise.all(arr)
    }).then((subBoConfigs) => {
      this.config.subBos = subBoConfigs
      this.activeTag = 'tag_0'
      if (this.id) {
        this.fetchData(this.id)
      }
    })

    // Why need to make a copy of this.$route here?
    // Because if you enter this page and quickly switch tag, may be in the execution of the setTagsViewTitle function, this.$route is no longer pointing to the current page
    // https://github.com/PanJiaChen/vue-element-admin/issues/1221
    this.tempRoute = Object.assign({}, this.$route)
  },
  methods: {
    async buildSubBoConfig(subBoName) {
      const subBoInfo = await getBoInfo(subBoName)
      const boInfo = await getBoInfo(this.boName)
      let defaultCondition
      if (subBoName === 'Attachement') { // 附件特殊处理
        defaultCondition = '%20YATTACHEMENT.BUSINESSID=\'' + this.id + '\''
      } else {
        defaultCondition = '%20' + subBoInfo.tableName + '.' + boInfo.props[boInfo.idProp].colname + '=\'' + this.id + '\''
      }
      return {
        boName: subBoName,
        label: (await getBoInfo(subBoName)).boText,
        defaultCondition
      }
    },
    fetchData(id) {
      fetchFormData(this.boName, id).then(formData => {
        this.form = this.formatFormData(formData)
      })
      // fetchProjectList(this.id).then(rsp => {
      //   this.tagData.project = rsp.data.items
      // })
    },
    formatFormData(formData) {
      for (const prop of Object.keys(formData)) {
        const item = this.formItems[prop]
        if (!item) { continue }
        switch (item.uiType) {
          case UI_TYPE.DATE: {
            formData[prop] = parseDate(formData[prop])
            break
          }
          case UI_TYPE.DATE_TIME: {
            formData[prop] = parseDateTime(formData[prop])
            break
          }
        }
      }
      return formData
    },
    formatFormDataForSave(formData) {
      const saveData = {}
      for (const prop of Object.keys(formData)) {
        let value = formData[prop]
        const item = this.formItems[prop]
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
        saveData[this.boName + '.' + prop] = value
      }
      console.log('>>>>>>>>>>>>', saveData, formData, this.formItems)
      return saveData
    },
    handleTagClick(tab, event) {

    },
    save(item) {
      this.$refs.form.validate(valid => {
        if (valid) {
          item.loading = true
          const saveData = this.formatFormDataForSave(this.form)
          request({
            url: item.url,
            data: saveData
          }).then(rsp => {
            item.loading = false
            this.$message({
              message: '保存成功',
              type: 'success',
              duration: 2000
            })
          }).catch(err => {
            item.loading = false
            console.log('save error:', err)
          })
        } else {
          this.$message({
            message: '数据校验失败，请检查',
            type: 'error'
          }, 2000)
        }
      })
    },
    submit() {
      this.$message({
        message: '工程物资模拟购买(写入SAP错误：物料88000013在工厂C005中未被维护。)',
        type: 'error'
      }, 2000)
    },
    print() {
      this.$message({
        message: '打印成功',
        type: 'success',
        duration: 2000
      })
    },
    close() {
      // 调用全局挂载的方法
      this.$store.dispatch('tagsView/delView', this.$route)
      // 返回上一步路由
      this.$router.go(-1)
    },
    _toolbarItemClick(item) {
      if (item.clickFunc) {
        item.clickMethod.apply(this, item)
        return
      }
      // 默认点击处理逻辑
      switch (item.action) {
        case ACTION.SAVE: {
          this.save(item)
          break
        }
        case ACTION.CANCEL: {
          this.close(item)
          break
        }
        default: {
          console.warn('按钮[' + item.label + ']未配置对应的处理方法')
        }
      }
    },
    subBoToolbarClick(subConfig, item) {
      if (item.action === ACTION.CREATE) {
        this.subBoFormDialog.boName = subConfig.boName
        this.subBoFormDialog.show = true
      }
    },
    subBoRowClick(subConfig, [action, row]) {

    },
    preConfigFormColumns(formColumns) {
      return formColumns.filter(col => {
        if (col.prop === 'emergency') { return false }
        return true
      })
    },
    subBoFormDialogCancel() {
      this.subBoFormDialog.show = false
    },
    subBoFormDialogConfirm() {}
  }
}
</script>

<style lang="scss" scoped>
  @import "~@/styles/mixin.scss";

  .form-container {
    position: relative;

    /*.top-btn-sticky {*/
      /*padding-top: 84px;*/
    /*}*/

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

      .span-1 {
        /*.el-input {*/
          /*width: 300px;*/
        /*}*/
        /*.el-select {*/
          /*width: 300px;*/
        /*}*/
      }
    }
  }

  .el-form-item__content>div {
    width: 100%;
  }

  .tabs-container {
    padding: 0px 45px 20px 50px;
  }

  .el-button-group{
    margin-bottom: 10px;
  }
</style>
