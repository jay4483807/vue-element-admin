<template>
  <div>
    <pr-bo-form ref="form" :bo-name="boName" :model="form" :pre-config-form-columns="preConfigFormColumns">
      <template slot="top">
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
      </template>
    </pr-bo-form>
    <el-tabs v-model="activeTag" class="tabs-container">
      <el-tab-pane v-for="(subConfig,index) of config.subBos" :key="index" :label="subConfig.label" :name="'tag_'+index">
        <pr-sub-bo-grid
          :ref="'grid_'+subConfig.boName"
          class="tab-main-container"
          toolbar-class="el-button-group"
          :bo-name="subConfig.boName"
          :default-condition="subConfig.defaultCondition || ''"
        />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import Sticky from '@/components/Sticky/index'
import {
  fetchFormData,
  getBoInfo,
  getBoProperties,
  getFormToolbar
} from '@/api/pan'
import { ACTION, UI_TYPE } from '@/constants'
import request from '@/utils/request'
import PrBoForm from '@/components/pro/PrBoForm'
import PrSubBoGrid from '@/components/pro/PrSubBoGrid'

export default {
  name: 'PurchaseApplyDetail',
  components: { PrSubBoGrid, PrBoForm, Sticky },
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
      config: {
        toolbarItems: [],
        subBos: []
      },
      idProp: ''
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
        this.$nextTick(() => {
          this.fetchData(this.id)
        })
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
        this.form = formData
      })
      for (const subConfig of this.config.subBos) {
        this.getSubBoGrid(subConfig.boName).reload()
      }
    },
    handleTagClick(tab, event) {

    },
    save(item) {
      this.$refs.form.validate(valid => {
        if (valid) {
          item.loading = true
          const saveData = this.$refs.form.getFormForSave()
          const subObject = []
          for (const { boName } of this.config.subBos) {
            subObject.push(JSON.stringify({
              objectName: boName,
              operType: 'modify',
              values: [...this.getSubBoGrid(boName).getModifyRows(), ...this.getSubBoGrid(boName).getAddRows()]
            }))
          }
          for (const { boName } of this.config.subBos) {
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
            this.id = rsp['coustom'][this.idProp]
            this.fetchData(this.id)
            // TODO 子对象列表没有刷新
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
    preConfigFormColumns(formColumns) {
      return formColumns.filter(col => {
        if (col.prop === 'emergency') { return false }
        return true
      })
    },
    getSubBoGrid(subBoName) {
      let grid = this.$refs['grid_' + subBoName]
      if (grid instanceof Array) {
        grid = grid[0]
      }
      return grid
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
