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
          <el-col v-for="(item,colIndex) of row" :key="colIndex" :span="item.uiType===UI_TYPE.TEXT_AREA?24:12">
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
                :editable="item.readOnly"
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
                :readonly="item.readOnly"
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
      <el-tab-pane label="项目预览" name="project">
        <div class="tab-main-container">
          <el-row class="el-button-group">
            <el-button>创建</el-button>
            <el-button>复制创建</el-button>
            <el-button>删除</el-button>
            <el-button>导入模板下载</el-button>
            <el-button>导入</el-button>
          </el-row>
          <el-table :data="tagData.project" border highlight-current-row height="200">
            <el-table-column type="selection" width="55" />
            <el-table-column prop="bnfpo" label="请求的项目" :show-overflow-tooltip="true" min-width="100px" />
            <el-table-column label="物料" :show-overflow-tooltip="true" />
            <el-table-column prop="orderno" label="订单号" :show-overflow-tooltip="true" />
            <el-table-column label="订单号名称" :show-overflow-tooltip="true" min-width="100px" />
            <el-table-column prop="txz01" label="品名描述" :show-overflow-tooltip="true" />
            <el-table-column prop="mpotext" label="物料采购文本" :show-overflow-tooltip="true" min-width="110px" />
            <el-table-column prop="menge" label="申请数量" :show-overflow-tooltip="true" />
            <el-table-column prop="meins" label="基本计量单位" :show-overflow-tooltip="true" min-width="110px" />
            <el-table-column prop="preis" label="评估价格" :show-overflow-tooltip="true" />
            <el-table-column prop="matkl" label="物料组" :show-overflow-tooltip="true" />
            <el-table-column label="删除标识" :show-overflow-tooltip="true" />
            <el-table-column prop="ekgrp" label="采购组" :show-overflow-tooltip="true" />
            <el-table-column prop="ekgrp_text" label="采购组名称" :show-overflow-tooltip="true" min-width="100px" />
            <el-table-column width="90px" prop="lfdatfront" label="交货日期" :show-overflow-tooltip="true" />
            <el-table-column label="操作" width="240px">
              <div class="el-button-group">
                <el-button type="primary">编辑</el-button>
                <el-button type="primary">查看</el-button>
                <el-button type="primary">删除</el-button>
              </div>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>
      <el-tab-pane label="附件" name="attachment">
        <div class="tab-main-container">
          <el-row class="el-button-group">
            <el-button>上传</el-button>
            <el-button>删除</el-button>
          </el-row>
          <el-table :data="tagData.attachment" border highlight-current-row height="200">
            <el-table-column type="selection" width="55" />
            <el-table-column label="原文件名" />
            <el-table-column label="附件描述" />
            <el-table-column label="创建人" />
            <el-table-column label="创建日期" />
            <el-table-column label="最后修改人" />
            <el-table-column label="最后修改日期" />
          </el-table>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import Sticky from '@/components/Sticky/index'
import { fetchFormData, getBoMetadata, getFormColumns, getFormToolbar } from '@/api/pan'
import PrSearchHelper from '@/components/pro/PrSearchHelper'
import { ACTION, UI_TYPE } from '@/constants'
import { buildFormItemConfig, parseDate, parseDateTime } from '@/utils/pan'
import request from '@/utils/request'

export default {
  name: 'PurchaseApplyDetail',
  components: { Sticky, PrSearchHelper },
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
      activeTag: 'project',
      tagData: {
        project: [],
        attachment: []
      },
      config: {
        formRowColumns: [],
        toolbarItems: []
      }
    }
  },
  beforeCreate() {
    this.UI_TYPE = UI_TYPE
  },
  created() {
    getBoMetadata(this.boName).then(boMeta => {
      this.boMeta = boMeta
      for (const prop of Object.keys(boMeta)) {
        if (boMeta[prop].idProp === true) {
          this.idProp = prop
          break
        }
      }
      if (!this.idProp) {
        console.warn('未找到业务对象[' + this.boName + ']的id属性')
      }
      console.log('获取业务对象属性信息:', this.boMeta)
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
      return getFormColumns(this.boName)
    }).then(async columns => {
      columns = columns.filter(col => col.visibility).sort((col1, col2) => col1.rowNo - col2.rowNo || col1.colNo - col2.colNo)
      const rowCols = []
      const noPosColumns = []
      const rules = {}
      const formItems = {}
      for (const col of columns) {
        const item = await buildFormItemConfig(col, this.boMeta)
        if (item.required) {
          rules[item.prop] = [
            { required: true, trigger: 'blur', message: '请输入' + item.label }
          ]
        }
        formItems[item.prop] = item
        if (item.rowNo > 0 && item.colNo > 0) {
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
        const colSize = col.uiType === UI_TYPE.TEXT_AREA ? 2 : 1
        let row = rowCols[rowCols.length - 1]
        if (row.length + colSize > 2) {
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
    fetchData(id) {
      fetchFormData(this.boName, id).then(formData => {
        this.form = this.formatFormData(formData)
      })
      return
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
    handleTagClick(tab, event) {

    },
    save(item) {
      this.$refs.form.validate(valid => {
        if (valid) {
          item.loading = true
          const submitData = {}
          for (const prop of Object.keys(this.form)) {
            submitData[this.boName + '.' + prop] = this.form[prop]
          }
          request({
            url: item.url,
            data: submitData
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
    }
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
