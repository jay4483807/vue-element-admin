<template>
  <edit-page ref="page" v-bind="bindProps" />
</template>

<script>
import edit from './components/edit'
export default {
  mixins: [edit]
}
</script>

<style scoped>

</style>
