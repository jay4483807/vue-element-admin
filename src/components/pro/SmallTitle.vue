<template>
  <div class="small-title">
    <span>{{ title }}</span>
    <div class="right-content">
      <slot />
    </div>
    <el-divider />
  </div>
</template>

<script>
export default {
  name: 'SmallTitle',
  props: {
    title: {
      type: String,
      default: ''
    }
  }
}
</script>

<style lang="scss" scoped>

  .small-title {
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

    .right-content {
      float: right;
      margin-right: 20px;
      margin-top: 2px;
    }

    /deep/ .el-divider--horizontal {
      margin: 0
    }
  }
</style>
