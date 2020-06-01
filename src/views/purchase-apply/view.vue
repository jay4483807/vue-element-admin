<template>
  <purchase-apply-detail :id="id" :editable="false" :bo-name="boName" />
</template>

<script>
import PurchaseApplyDetail from './components/PurchaseApplyDetail'

export default {
  name: 'View',
  components: { PurchaseApplyDetail },
  data() {
    return {
      id: this.$route.params && this.$route.params.id || '',
      boName: this.$route.meta.boName || ''
    }
  },
  created() {
  }
}
</script>

<style scoped>

</style>
