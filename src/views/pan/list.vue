<template>
  <list-page ref="page" v-bind="bindProps" />
</template>

<script>
import list from '@/views/pan/components/list'

export default {
  mixins: [list]
}
</script>

