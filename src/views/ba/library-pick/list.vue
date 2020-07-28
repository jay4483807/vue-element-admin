<template>
  <list-page ref="page" v-bind="bindProps" />
</template>

<script>
import list from '@/views/pan/components/list'
import { mergeConfig } from '@/utils/pan'
import request from '@/utils/request'
import { ACTION } from '@/constants'

export default {
  mixins: [list],
  methods: {
    configGridActions(actions) {
      return mergeConfig(actions.filter(item => item.action !== ACTION.EDIT), [{
        action: '_openPost',
        callback: ({ item, row, rowIndex }) => {
          request({
            url: '/HA/librarypick/libraryPickController.spr?action=_updateCharg',
            data: {
              ordnum: row.ordnum,
              werks: row.werks
            }
          }).then(() => {
            this.$router.push('edit/' + row[this.page().idProp])
          }).catch(() => {
            this.$router.push('edit/' + row[this.page().idProp])
          })
        }
      }])
    }
  }
}
</script>

