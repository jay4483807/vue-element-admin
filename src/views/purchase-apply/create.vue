<template>
  <purchase-apply-detail :editable="true" :bo-name="boName" />
</template>

<script>
import PurchaseApplyDetail from './components/PurchaseApplyDetail'
export default {
  name: 'Create',
  components: { PurchaseApplyDetail },
  data() {
    return {
      boName: this.$route.meta.boName || ''
    }
  }
}
</script>

<style scoped>

</style>
