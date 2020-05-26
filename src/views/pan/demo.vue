<template>
  <div>
    <el-form ref="form" label-width="140px" :inline="false" label-position="right" class="form-container">
      <sticky :z-index="10" class-name="sub-navbar draft" :sticky-top="84">
        <el-button type="primary">Create data for OUTB DN</el-button>
        <el-button type="primary">Create data for manual</el-button>
        <el-button type="primary">Return PO</el-button>
        <el-button type="primary">Import PO</el-button>
        <el-button type="success">Further processing</el-button>
        <el-button type="primary">Upload</el-button>
      </sticky>
      <div class="form-main-container">
        <el-row :gutter="20" type="flex">
          <el-col :span="12"><el-form-item label="关区"><el-input value="3711" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="公司代码"><el-input value="1100" /></el-form-item></el-col>
        </el-row>
        <el-row :gutter="20" type="flex">
          <el-col :span="12"><el-form-item label="出口号码"><el-input disabled /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="出口状态"><el-select disabled value="1" /></el-form-item></el-col>
        </el-row>
        <el-row :gutter="20" type="flex">
          <el-col :span="12"><el-form-item label="目前状态"><el-select disabled /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="删除"><el-checkbox /></el-form-item></el-col>
        </el-row>
        <el-row :gutter="20" type="flex">
          <el-col :span="12"><el-form-item label="Sold-to party"><el-input disabled /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="Ship-to party"><el-input disabled /></el-form-item></el-col>
        </el-row>
        <el-row :gutter="20" type="flex">
          <el-col :span="12"><el-form-item label="区内报送行"><el-input /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="Forwarder"><el-input /></el-form-item></el-col>
        </el-row>
        <el-row :gutter="20" type="flex">
          <el-col :span="12"><el-form-item label="卡车公司"><el-input prefix-icon="el-icon-search" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="区内储运中心"><el-input /></el-form-item></el-col>
        </el-row>
        <el-row :gutter="20" type="flex">
          <el-col :span="12"><el-form-item label="报单号码"><el-input /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="贸易方式"><el-input value="0615" /></el-form-item></el-col>
        </el-row>
        <el-row :gutter="20" type="flex">
          <el-col :span="12"><el-form-item label="征免性质"><el-select /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="提运单号"><el-input /></el-form-item></el-col>
        </el-row>
        <el-row :gutter="20" type="flex">
          <el-col :span="12"><el-form-item label="大提单"><el-input /></el-form-item></el-col>
        </el-row>
        <el-row :gutter="20" type="flex">
          <el-col :span="12"><el-form-item label="建立日期"><el-date-picker disabled /> </el-form-item></el-col>
          <el-col :span="12"><el-form-item label="建立者"><el-input disabled /></el-form-item></el-col>
        </el-row>
        <el-row :gutter="20" type="flex">
          <el-col :span="12"><el-form-item label="更改日期"><el-date-picker disabled /> </el-form-item></el-col>
          <el-col :span="12"><el-form-item label="更改者"><el-input disabled /></el-form-item></el-col>
        </el-row>
      </div>
    </el-form>
    <el-tabs value="item" class="tabs-container">
      <el-tab-pane label="报单资料" name="item">
        <el-form label-width="140px" :inline="false" label-position="right" class="form-container">
          <div class="form-main-container">
            <el-row :gutter="20" type="flex">
              <el-col :span="12"><el-form-item label="数据中心统一编号"><el-input /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="出口日期"><el-input /></el-form-item></el-col>
            </el-row>
            <el-row :gutter="20" type="flex">
              <el-col :span="12"><el-form-item label="申报日期"><el-input /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="许可证号"><el-input /></el-form-item></el-col>
            </el-row>
            <el-row :gutter="20" type="flex">
              <el-col :span="12"><el-form-item label="批准文号"><el-input /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="境内货源地"><el-input /></el-form-item></el-col>
            </el-row>
            <el-row :gutter="20" type="flex">
              <el-col :span="12"><el-form-item label="目的地"><el-input /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="出口口岸"><el-input /></el-form-item></el-col>
            </el-row>
            <el-row :gutter="20" type="flex">
              <el-col :span="12"><el-form-item label="运输方式"><el-input /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="付款条件"><el-input /></el-form-item></el-col>
            </el-row>
            <el-row :gutter="20" type="flex">
              <el-col :span="12"><el-form-item label="结汇方式"><el-input /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="运抵国（地区）"><el-input /></el-form-item></el-col>
            </el-row>
            <el-row :gutter="20" type="flex">
              <el-col :span="12"><el-form-item label="指运港"><el-input /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="合同协议号"><el-input /></el-form-item></el-col>
            </el-row>
            <el-row :gutter="20" type="flex">
              <el-col :span="12"><el-form-item label="备案号"><el-input /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="运输工具名称"><el-input /></el-form-item></el-col>
            </el-row>
            <el-row :gutter="20" type="flex">
              <el-col :span="12"><el-form-item label="条件"><el-input /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="件数"><el-input /></el-form-item></el-col>
            </el-row>
            <el-row :gutter="20" type="flex">
              <el-col :span="12"><el-form-item label="包装种类"><el-input /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="制造商代码"><el-input /></el-form-item></el-col>
            </el-row>
          </div>
        </el-form>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import Sticky from '@/components/Sticky/index'

export default {
  name: 'Demo',
  components: { Sticky }
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
