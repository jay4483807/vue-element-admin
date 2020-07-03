<template>
  <div>
    <pr-bo-form
      ref="form"
      :model="form"
      :editable="editable"
      :bo-name="boName"
      :config-form-items="configFormItems"
      :compute-form-items="computeFormItems"
      :compute-form-data="computeFormData"
      @update="formUpdate"
    >
      <template slot="top">
        <sticky :z-index="10" class-name="sub-navbar draft" :sticky-top="84">
          <el-button
            v-for="(item,index) of computeToolbarItems(toolbarItems)"
            :key="index"
            :type="item.btnType"
            :loading="item.loading"
            :disabled="item.disabled"
            @click="_toolbarItemClick(item)"
          >{{ item.label }}</el-button>
        </sticky>
      </template>
    </pr-bo-form>
    <el-tabs v-model="activeTag" class="tabs-container">
      <el-tab-pane v-for="(subConfig,index) of subBos" :key="index" :label="subConfig.label" :name="'tag_'+index">
        <pr-sub-bo-grid
          :ref="'grid_'+subConfig.boName"
          class="tab-main-container"
          toolbar-class="el-button-group"
          :bo-name="subConfig.boName"
          :query-params="subConfig.queryParams"
          :auto-load="!!id"
          :config-grid-actions="configSubBoGridActions(subConfig)"
          :config-toolbar-items="_configSubBoToolbarItems(subConfig)"
          :config-form-items="_configSubBoFormItems(subConfig)"
          :compute-form-items="_computeSubBoFormItems(subConfig)"
          :compute-form-data="_computeFormData(subConfig)"
          @selection-change="_subBoSelectionChange(subConfig, $event)"
        />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import Sticky from '@/components/Sticky/index'
import {
  fetchFormData
} from '@/api/pan'
import { ACTION } from '@/constants'
import request from '@/utils/request'
import PrBoForm from '@/components/pro/PrBoForm'
import PrSubBoGrid from '@/components/pro/PrSubBoGrid'
import boComponent from '@/components/pro/mixins/boComponent'
import { getFormToolbar } from '@/store/action-types'
import { mapActions } from 'vuex'
import { executeConfig } from '@/utils/pan'

export default {
  name: 'EditPage',
  components: { PrSubBoGrid, PrBoForm, Sticky },
  mixins: [boComponent],
  props: {
    /**
     * 业务对象名，默认会读取当前页面路由信息里的业务对象名，可以不配
     * 此属性目前暂不支持动态修改，在页面初始化后不可改动
     */
    boName: {
      type: String,
      default: function() {
        return this.$route && this.$route.meta && this.$route.meta.boName || ''
      }
    },
    editable: {
      type: Boolean,
      default: false
    },
    id: {
      type: String,
      default: ''
    },
    configFormItems: {
      type: [Function, Array],
      default(items) {
        return items
      }
    },
    computeFormItems: {
      type: Function,
      default({ items, form }) {
        return items
      }
    },
    computeFormData: {
      type: Function,
      default(form) {
        return form
      }
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
    computeToolbarItems: {
      type: Function,
      default(items) {
        return items
      }
    },
    configSubBoToolbarItems: {
      type: [Function, Array],
      default(items) {
        return items
      }
    },
    configSubBoFormItems: {
      type: Function,
      default({ boName, items }) {
        return items
      }
    },
    computeSubBoFormItems: {
      type: Function,
      default({ boName, items }) {
        return items
      }
    },
    computeSubBoFormData: {
      type: Function,
      default({ boName, form }) {
        return form
      }
    }
  },
  data() {
    return {
      form: {},
      rules: {},
      tempRoute: {},
      activeTag: '',
      toolbarItems: [],
      subBos: []
    }
  },
  computed: {

  },
  async created() {
    const boInfo = await this.getBoInfo(this.boName)
    let items = await this.getFormToolbar(this.boName)
    if (!items) {
      return []
    }
    items = items.filter(item => {
      // 不可编辑状态过滤掉保存按钮
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
    this.toolbarItems = executeConfig(this.configToolbarItems, this, items)
    console.log('获取工具栏配置:', items)

    const { props } = boInfo
    if (!props) { return [] }
    const subBos = []
    for (const property of Object.values(props)) {
      if (!property.subBoName) { continue }
      const subBoInfo = await this.getBoInfo(property.subBoName)
      if (!subBoInfo) { continue }
      subBos.push({
        boName: property.subBoName,
        label: subBoInfo.boText,
        queryParams: this.buildSubBoGridQueryParams(boInfo, subBoInfo)
      })
    }
    this.subBos = subBos
    if (subBos.length > 0) {
      this.activeTag = 'tag_0'
    }

    if (this.id) {
      this.fetchData()
    }

    // Why need to make a copy of this.$route here?
    // Because if you enter this page and quickly switch tag, may be in the execution of the setTagsViewTitle function, this.$route is no longer pointing to the current page
    // https://github.com/PanJiaChen/vue-element-admin/issues/1221
    this.tempRoute = Object.assign({}, this.$route)
  },
  mounted() {

  },
  methods: {
    ...mapActions({ getFormToolbar: getFormToolbar }),
    configSubBoGridActions(subConfig) {
      return items => {
        if (!this.editable) {
          return items.filter(item => {
          // 不可编辑状态过滤编辑、删除按钮
            return ![ACTION.EDIT, ACTION.DELETE].includes(item.action)
          })
        } else return items
      }
    },
    _configSubBoToolbarItems(subConfig) {
      return items => {
        if (!this.editable) {
          items = items.filter(item => {
          // 不可编辑状态过滤创建、删除按钮
            return ![ACTION.CREATE, ACTION.DELETES].includes(item.action)
          })
        }
        return executeConfig(this.configSubBoToolbarItems, this, items)
      }
    },
    _configSubBoFormItems(subConfig) {
      return items => {
        return this.configSubBoFormItems({ boName: subConfig.boName, subConfig, items })
      }
    },
    _computeSubBoFormItems(subConfig) {
      return ({ items, form }) => {
        return this.computeSubBoFormItems({ boName: subConfig.boName, subConfig, items, form })
      }
    },
    _computeFormData(subConfig) {
      return form => {
        return this.computeSubBoFormData({ boName: subConfig.boName, subConfig, form })
      }
    },
    fetchData() {
      fetchFormData(this.boName, this.id).then(formData => {
        this.form = formData
      })
      for (const subConfig of this.subBos) {
        const subBoGrid = this.getSubBoGrid(subConfig.boName)
        if (subBoGrid) {
          this.getBoInfo(subConfig.boName).then(subBoInfo => {
            subConfig.queryParams = this.buildSubBoGridQueryParams(this.boInfo, subBoInfo)
            subBoGrid.reload()
          })
        }
      }
    },
    buildSubBoGridQueryParams(boInfo, subBoInfo) {
      let defaultCondition
      if (subBoInfo.boName === 'Attachement') { // 附件特殊处理
        defaultCondition = '%20YATTACHEMENT.BUSINESSID=\'' + this.id + '\''
      } else {
        defaultCondition = '%20' + subBoInfo.tableName + '.' + boInfo.props[boInfo.idProp].colname + '=\'' + this.id + '\''
      }
      return {
        defaultCondition
      }
    },
    handleTagClick(tab, event) {

    },
    setForm(form) {
      this.form = form || {}
    },
    getForm() {
      return this.$refs.form.getForm()
    },
    save(item) {
      this.$refs.form.validate(valid => {
        if (valid) {
          item.loading = true
          const saveData = this.$refs.form.getFormForSave()
          const subObject = []
          for (const { boName } of this.subBos) {
            subObject.push(JSON.stringify({
              objectName: boName,
              operType: 'modify',
              values: [...this.getSubBoGrid(boName).getModifyRows(), ...this.getSubBoGrid(boName).getAddRows()]
            }))
          }
          for (const { boName } of this.subBos) {
            subObject.push(JSON.stringify({
              objectName: boName,
              operType: 'delete',
              values: this.getSubBoGrid(boName).getDeleteRows()
            }))
          }
          request({
            url: item.url,
            data: { ...saveData, subObject }
          }).then(rsp => {
            item.loading = false
            this.$message({
              message: '保存成功',
              type: 'success',
              duration: 2000
            })
            if (!this.id) {
              // 创建页面保存的话，先更新子对象grid的查询条件
              this.id = rsp['coustom'][this.idProp]
              const arr = []
              for (const subConfig of this.subBos) {
                const subBoGrid = this.getSubBoGrid(subConfig.boName)
                if (subBoGrid) {
                  arr.push(this.getBoInfo(subConfig.boName).then(subBoInfo => {
                    subConfig.queryParams = this.buildSubBoGridQueryParams(this.boInfo, subBoInfo)
                  }))
                }
              }
              Promise.all(arr).then(() => {
                this.fetchData(this.id)
              })
            } else {
              this.fetchData(this.id)
            }
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
    getFormItem(prop) {
      return this.$refs.form.getFormItem(prop)
    },
    getSubBoFormItem(subBoName, prop) {
      const grid = this.getSubBoGrid(subBoName)
      if (grid) {
        return grid.$refs['form'].getFormItem(prop)
      }
    },
    getSubBoGrid(subBoName) {
      let grid = this.$refs['grid_' + subBoName]
      if (grid instanceof Array) {
        grid = grid[0]
      }
      return grid
    },
    _subBoSelectionChange(subConfig, selectedRows) {
      this.$emit('sub-bo-selection-change', {
        boName: subConfig.boName,
        selectedRows
      })
    },
    formUpdate(form) {
      this.$emit('form-update', form)
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
