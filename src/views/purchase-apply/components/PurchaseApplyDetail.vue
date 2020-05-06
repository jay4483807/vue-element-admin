<template>
  <div>
    <el-form ref="form" label-width="140px" :inline="false" label-position="right" :model="form" :rules="rules" class="form-container">
      <sticky :z-index="10" class-name="sub-navbar draft" :sticky-top="84">
        <el-button :loading="loading" type="primary" @click="save">保存</el-button>
        <el-button type="primary" :disabled="!id" @click="submit">提交</el-button>
        <el-button type="success" @click="print">打印</el-button>
        <el-button type="info" @click="close">关闭</el-button>
      </sticky>
      <div class="form-main-container">
        <el-row :gutter="20" type="flex" justify="center">
          <el-col :span="12" class="span-1">
            <el-form-item label="申请单号"><el-input v-model="form.purchaseapplyno" disabled /></el-form-item>
          </el-col>
          <el-col :span="12" class="span-1">
            <el-form-item label="申请日期" prop="applydate"><el-date-picker v-model="form.applydate" type="date" /></el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" type="flex" justify="center">
          <el-col :span="12" class="span-1">
            <el-form-item label="采购申请凭证类型" class="line-feed"><el-select v-model="form.bsart">
              <el-option value="JSPR" label="Stock PR-JF" />
              <el-option value="BNPR" label="Non Stock PR-BJ" />
              <el-option value="JNPR" label="Non Stock PR-JF" />
              <el-option value="JPPR" label="Project Stock PR-JF" />
            </el-select></el-form-item>
          </el-col>
          <el-col :span="12" class="span-1">
            <el-form-item label="采购订单日期" prop="bedat"><el-date-picker v-model="form.bedat" type="date" /></el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" type="flex" justify="center">
          <el-col :span="12" class="span-1">
            <el-form-item label="采购组织"><el-select value="" /></el-form-item>
          </el-col>
          <el-col :span="12" class="span-1">
            <el-form-item label="公司代码"><el-input v-model="form.bukrs" /></el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" type="flex" justify="center">
          <el-col :span="12" class="span-1">
            <el-form-item label="状态"><el-input v-model="form.status" /></el-form-item>
          </el-col>
          <el-col :span="12" class="span-1">
            <el-form-item label="评估净值"><el-input v-model="form.assnetwr" /></el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" type="flex" justify="center">
          <el-col :span="12" class="span-1">
            <el-form-item label="采购员"><el-input v-model="form.purchasename" /></el-form-item>
          </el-col>
          <el-col :span="12" class="span-1">
            <el-form-item label="采购凭证编号"><el-input v-model="form.purchaseapplyno" /></el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" type="flex" justify="center">
          <el-col :span="12" class="span-1">
            <el-form-item label="是否急需"><el-select v-model="form.need"><el-option label="是" value="1" /><el-option label="否" value="0" /></el-select></el-form-item>
          </el-col>
          <el-col :span="12" class="span-1">
            <el-form-item label="推荐供应商"><el-input /></el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" type="flex" justify="center">
          <el-col :span="12" class="span-1">
            <el-form-item label="是否已打印"><el-checkbox v-model="form.isprint" /></el-form-item>
          </el-col>
          <el-col :span="12" class="span-1">
            <el-form-item label="打印次数"><el-input v-model="form.printnum" /></el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24" class="span-2">
            <el-form-item label="原因/用途" prop="memo"><el-input v-model="form.memo" /></el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" type="flex" justify="center">
          <el-col :span="12" class="span-1">
            <el-form-item label="创建人"><el-input v-model="form.creator" disabled /></el-form-item>
          </el-col>
          <el-col :span="12" class="span-1">
            <el-form-item label="创建日期"><el-input v-model="form.createtime" disabled /></el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" type="flex" justify="center">
          <el-col :span="12" class="span-1">
            <el-form-item label="最后修改人"><el-input v-model="form.lastmodifyer" disabled /></el-form-item>
          </el-col>
          <el-col :span="12" class="span-1">
            <el-form-item label="最后修改日期"><el-input v-model="form.lastmodifytime" disabled /></el-form-item>
          </el-col>
        </el-row>
      </div>
    </el-form>
    <el-tabs v-model="activeTag" class="tabs-container" @tab-click="handleTagClick">
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
import { fetchDetail, fetchProjectList } from '@/api/purchase-apply'
import Sticky from '@/components/Sticky/index'

const defaultForm = {
  // 是否急需
  need: 0
}

export default {
  name: 'PurchaseApplyDetail',
  components: { Sticky },
  props: {
    editable: {
      type: Boolean,
      default: false
    },
    id: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      form: Object.assign({}, defaultForm),
      loading: false,
      rules: {
        applydate: [
          { required: true, trigger: 'blur', message: '请输入申请日期' }
        ],
        bedat: [
          { required: true, trigger: 'blur', message: '请输入采购订单日期' }
        ],
        memo: [
          { required: true, trigger: 'blur', message: '请输入原因/用途' }
        ]
      },
      tempRoute: {},
      activeTag: 'project',
      tagData: {
        project: [],
        attachment: []
      }
    }
  },
  created() {
    if (this.id) {
      this.fetchData(this.id)
    }

    // Why need to make a copy of this.$route here?
    // Because if you enter this page and quickly switch tag, may be in the execution of the setTagsViewTitle function, this.$route is no longer pointing to the current page
    // https://github.com/PanJiaChen/vue-element-admin/issues/1221
    this.tempRoute = Object.assign({}, this.$route)
  },
  methods: {
    fetchData(id) {
      fetchDetail(id).then(rsp => {
        this.form = rsp.data
      })
      fetchProjectList(this.id).then(rsp => {
        this.tagData.project = rsp.data.items
      })
    },
    handleTagClick(tab, event) {

    },
    save() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.loading = true
          setTimeout(() => {
            this.loading = false
            this.$message({
              message: '保存成功',
              type: 'success',
              duration: 2000
            })
          }, 1000)
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
        .el-input {
          width: 300px;
        }
        .el-select {
          width: 300px;
        }
      }
    }
  }

  .tabs-container {
    padding: 0px 45px 20px 50px;
  }

  .el-button-group{
    margin-bottom: 10px;
  }
</style>
