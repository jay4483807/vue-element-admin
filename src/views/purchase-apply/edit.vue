<template>
  <purchase-apply-detail :id="id" :editable="true" bo-id="000000000500" />
</template>

<script>
import PurchaseApplyDetail from './components/PurchaseApplyDetail'

export default {
  name: 'Edit',
  components: { PurchaseApplyDetail },
  data() {
    return { id: '' }
  },
  created() {
    this.id = this.$route.params && this.$route.params.id
  }
}
</script>

<style scoped>

</style>
