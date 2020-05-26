<template>
  <purchase-apply-detail :editable="true" bo-name="PurchaseApply" />
</template>

<script>
import PurchaseApplyDetail from './components/PurchaseApplyDetail'
export default {
  name: 'Create',
  components: { PurchaseApplyDetail }
}
</script>

<style scoped>

</style>
