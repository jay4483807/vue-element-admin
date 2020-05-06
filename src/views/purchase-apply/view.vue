<template>
  <purchase-apply-detail :id="id" :editable="false" />
</template>

<script>
import PurchaseApplyDetail from './components/PurchaseApplyDetail'

export default {
  name: 'View',
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
