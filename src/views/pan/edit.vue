<template>
  <edit-page
    :id="id"
    ref="page"
    :editable="editable"
  />
</template>

<script>
import EditPage from '@/views/pan/components/editPage'
export default {
  components: { EditPage },
  data() {
    return {
      id: this.$route.params.id || '',
      editable: this.$route.meta.editable || false
    }
  }
}
</script>

<style scoped>

</style>
