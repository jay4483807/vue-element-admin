<template>
  <div>
    <sticky :z-index="10" class-name="sub-navbar draft" :sticky-top="84">
      <el-button
        v-for="(item,index) of computedToolbarItems"
        :key="index"
        :type="item.btnType"
        :loading="item.loading"
        :disabled="item.disabled"
        @click="_toolbarItemClick(item)"
      >{{ item.label }}</el-button>
    </sticky>
    <div v-if="taskId">
      <div class="small-title">
        <span>流程审批信息</span>
        <el-button type="text" @click="showTaskHistory=true">审批历史</el-button>
        <el-divider />
      </div>
      <el-form label-width="140px" label-position="right" :inline="false" class="form-container">
        <el-row type="flex">
          <el-col><el-form-item label="当前状态"><el-input v-model="taskForm.taskName" :disabled="true" /></el-form-item></el-col>
          <el-col><el-form-item label="上一节点审批意见"><el-input v-model="taskForm.lastApprovalOpinion" :disabled="true" /></el-form-item></el-col>
          <el-col><el-form-item label="当前办理人"><el-input v-model="taskForm.currentActorName" :disabled="true" /></el-form-item></el-col>
        </el-row>
        <el-row type="flex">
          <el-col><el-form-item label="下一步操作"><el-select v-model="taskForm.nextOperation">
            <el-option v-for="(opt,index) of taskNextOption" :key="index" :value="opt.value">{{ opt.text }}</el-option>
          </el-select></el-form-item></el-col>
          <el-col><el-form-item label="审批意见"><el-input v-model="taskForm.approvalOpinion" /></el-form-item></el-col>
          <el-col><el-form-item label="处理时间"><el-input v-model="taskForm.currentTime" :disabled="true" /></el-form-item></el-col>
        </el-row>
      </el-form>
      <el-drawer title="审批历史" :visible.sync="showTaskHistory" direction="btt" :modal-append-to-body="false" size="">
        <div style="margin-bottom: 20px">
          <pr-grid :grid-columns="taskHistoryColumns" :query-params="taskHistoryQueryParams" :height="300" :selectable="false" :pageable="false" />
        </div>
      </el-drawer>
    </div>
    <div class="small-title">
      <span>{{ boInfo.boText }}信息</span>
      <el-divider />
    </div>
    <pr-bo-form
      ref="form"
      :model="form"
      :editable="editable"
      :bo-name="boName"
      :config-form-items="configFormItems"
      :compute-form-items="computeFormItems"
      :compute-form-data="computeFormData"
      @update="formUpdate"
    />
    <el-tabs v-model="activeTag" class="tabs-container">
      <el-tab-pane v-for="(subConfig,index) of subBos" :key="index" :label="subConfig.label" :name="'tag_'+index">
        <slot v-if="subConfig.slot" name="subBo" :subConfig="subConfig" :index="index" />
        <pr-sub-bo-grid
          v-else
          :ref="'grid_'+subConfig.boName"
          class="tab-main-container"
          toolbar-class="el-button-group"
          :bo-name="subConfig.boName"
          :query-params="subConfig.queryParams"
          :parent-bo-name="boName"
          :parent-bo-id="id"
          :prop="subConfig.prop"
          :auto-load="!!id"
          :selectable="editable"
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
import { executeConfig, isBlank } from '@/utils/pan'
import PrGrid from '@/components/pro/PrGrid'

export default {
  name: 'EditPage',
  components: { PrGrid, PrSubBoGrid, PrBoForm, Sticky },
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
    /**
     * 是否可编辑
     */
    editable: {
      type: Boolean,
      default: function() {
        return true
      }
    },
    /**
     * 编辑的主对象id
     */
    id: {
      type: String,
      default: function() {
        return ''
      }
    },
    /**
     * 如果页面作为待办任务页面，会带上任务id
     */
    taskId: {
      type: String,
      default: function() {
        return ''
      }
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
    configSubBos: {
      type: [Function, Array],
      default(subBos) {
        return subBos
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
      subBos: [],
      showTaskHistory: false,
      taskForm: {
        // 当前状态
        taskName: '',
        // 当前处理人
        currentActor: '',
        currentActorName: '',
        // 上一节点审批意见
        lastApprovalOpinion: '',
        // 下一步操作
        nextOperation: '',
        // 处理时间
        currentTime: '',
        // 审批意见
        approvalOpinion: ''
      },
      // 下一步操作选项
      taskNextOption: [],
      taskHistoryColumns: [{
        prop: 'TASKNAME',
        label: '任务名称'
      }, {
        prop: 'EXAMINERESULT',
        label: '执行动作'
      }, {
        prop: 'EXAMINE',
        label: '审批意见'
      }, {
        prop: 'EXAMINEPERSON',
        label: '审批人'
      }, {
        prop: 'NODEACTOR',
        label: '待审批人'
      }, {
        prop: 'TASKCREATETIME',
        label: '开始时间'
      }, {
        prop: 'WITHTIME',
        label: '审批用时'
      }, {
        prop: 'REFERENCETIME',
        label: '参考审批时间'
      }, {
        prop: 'CONTRASTTIME',
        label: '参考与用时时间差'
      }]
    }
  },
  computed: {
    computedToolbarItems() {
      for (const item of this.toolbarItems) {
        if (item.action === ACTION.SUBMIT_PROCESS) {
          if (!this.taskId) { // 创建状态或已经提交过的对象不能进行提交
            item.disabled = !this.id || !isBlank(this.form.processstate)
          }
        } else if (item.action === ACTION.SAVE) { // 已提交流程的对象不能进行保存
          item.disabled = !isBlank(this.form.processstate)
        }
      }
      return this.computeToolbarItems(this.toolbarItems).filter(item => item.hidden !== true)
    },
    taskHistoryQueryParams() {
      return {
        defaultCondition: ` (BUSINESSID='${this.id}' or PARENTBUSINESSID='${this.id}') `,
        orderSql: ' TASKCREATETIME DESC',
        handlerClass: 'com.panform.pan.businessprocess.engine.web.TaskHistoryGrid',
        tableName: 'V_WF_TASKINS'
      }
    }
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
      switch (item.action) {
        case ACTION.CANCEL: {
          item.btnType = 'info'
          break
        }
        case ACTION.SAVE: {
          if (!this.editable) { // 不可编辑状态隐藏保存按钮
            item.hidden = true
          }
          break
        }
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
        prop: property.prop,
        queryParams: this.buildSubBoGridQueryParams(boInfo, subBoInfo)
      })
    }
    this.subBos = executeConfig(this.configSubBos, this, subBos)
    if (subBos.length > 0) {
      this.activeTag = 'tag_0'
    }

    if (this.taskId) {
      this._getTaskInfo()
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
        defaultCondition = ' YATTACHEMENT.BUSINESSID=\'' + this.id + '\''
      } else {
        defaultCondition = ' ' + subBoInfo.tableName + '.' + boInfo.props[boInfo.idProp].colname + '=\'' + this.id + '\''
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
          request({
            url: item.url,
            data: this.buildSaveData()
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
    async submitProcess(item) {
      item.loading = true
      let data = this.buildSaveData()
      if (this.taskId) {
        data = {
          ...data,
          upWorkflowExamine: this.taskForm.lastApprovalOpinion,
          workflowLeaveTransitionName: this.taskForm.nextOperation,
          workflowExamine: this.taskForm.approvalOpinion,
          workflowTaskId: this.taskId,
          workflowCurrentTaskName: this.taskForm.taskName
        }
      }
      try {
        await request({
          url: item.url,
          data: data
        })
        this.$message({
          message: '提交成功',
          iconClass: 'el-icon-finished',
          type: 'success'
        }, 2000)
        this.close()
      } finally {
        item.loading = false
      }
    },
    buildSaveData() {
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
      return { ...saveData, subObject }
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
        case ACTION.SUBMIT_PROCESS: {
          this.submitProcess(item)
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
    },
    async _getTaskInfo() {
      const { coustom } = await request({
        url: '/vueController.spr?action=getTaskApprInfo',
        data: {
          taskid: this.taskId,
          businessid: this.id,
          nodeid: this.$route.query.nodeId || ''
        }
      })
      this.taskForm.taskName = coustom.taskname
      this.taskForm.currentActorName = coustom.currentactorname
      this.taskForm.currentActor = coustom.currentactor
      this.taskForm.currentTime = coustom.currenttime
      this.taskForm.lastApprovalOpinion = coustom.upexamine
      this.taskNextOption = (coustom.leavetransitions || []).map(opt => ({
        value: opt.extendTransitionId,
        text: opt.transitionName || ''
      }))
      this.$watch('taskForm.nextOperation', (newVal, oldVal) => {
        const newOpt = this.taskNextOption.find(opt => opt.value === newVal)
        const oldOpt = this.taskNextOption.find(opt => opt.value === oldVal)
        if (!oldOpt || this.taskForm.approvalOpinion === oldOpt.text) {
          // 如果用户没有手动修改审批意见，自动填写新增
          this.taskForm.approvalOpinion = newOpt.text
        }
      })
      if (this.taskNextOption[0]) {
        this.taskForm.nextOperation = this.taskNextOption[0].value
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  @import "~@/styles/mixin.scss";

  .small-title {
    padding: 0 45px 0 40px;
    width: 100%;

    span {
      padding: 0 20px;
      height: 40px;
      line-height: 40px;
      display: inline-block;
      font-size: 14px;
      font-weight: 500;
      color: #303133;
      position: relative;
    }

    .el-button {
      float: right;
      margin-right: 20px;
    }

    /deep/ .el-divider--horizontal {
      margin: 0
    }
  }

  .tabs-container {
    padding: 0px 45px 20px 50px;
  }

  .el-button-group{
    margin-bottom: 10px;
  }
</style>
