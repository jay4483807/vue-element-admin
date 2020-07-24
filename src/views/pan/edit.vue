<template>
  <edit-page ref="page" v-bind="bindProps" />
</template>

<script>
import edit from '@/views/pan/components/edit'
export default {
  name: 'Edit',
  mixins: [edit]
}
</script>

<style scoped>

</style>
