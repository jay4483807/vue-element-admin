<template>
  <el-table-column align="center" :label="label" :width="width" :min-width="minWidth">
    <template slot-scope="scope">
      <slot>
        <span>{{ scope.row[prop] }}</span>
      </slot>
    </template>
  </el-table-column>
</template>
<script>
export default {
  name: 'PrTableColumn',
  props: {
    prop: {
      type: String,
      default: ''
    },
    label: {
      type: String,
      default: ''
    },
    width: {},
    minWidth: {}
  }
}
</script>

<style scoped>

</style>
