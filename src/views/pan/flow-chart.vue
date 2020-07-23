<template>
  <div class="app-container">
    <small-title title="审批历史" />
    <pr-task-history-grid :id="id" :height="600" />
  </div>
</template>

<script>
import PrTaskHistoryGrid from '@/components/pro/PrTaskHistoryGrid'
import SmallTitle from '@/components/pro/SmallTitle'
export default {
  name: 'FlowChart2',
  components: { SmallTitle, PrTaskHistoryGrid },
  props: {
    id: {
      type: String,
      default() {
        return this.$route.params.id || ''
      }
    }
  }
}
</script>

<style scoped>

</style>
