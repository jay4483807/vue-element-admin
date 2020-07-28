<template>
  <edit-page ref="page" v-bind="bindProps" />
</template>

<script>
import edit from '@/views/pan/components/edit'
import { mergeConfig } from '@/utils/pan'
import request from '../../../utils/request'

const POST_LIBRARY = '_postLibraryTest'

export default {
  mixins: [edit],
  data() {
    return {
      form: {}
    }
  },
  methods: {
    configToolbarItems(items) {
      return mergeConfig(items, [{
        action: POST_LIBRARY,
        callback: (item) => {
          const saveData = this.page().getFormForSave()
          const subBoGrid = this.page().getSubBoGrid('pickList')
          saveData.subObject = [JSON.stringify({
            objectName: 'PickList',
            operType: 'modify',
            values: [...subBoGrid.getSelectedRows()]
          })]
          item.loading = true
          request({
            url: '/HA/librarypick/libraryPickController.spr?action=_postLibraryTest',
            data: saveData
          }).then(rsp => {
            item.loading = false
            this.$message({
              message: '操作成功',
              type: 'success',
              duration: 2000
            })
            this.openPrintPage()
          }).catch(err => {
            item.loading = false
            console.log('save error:', err)
          })
        }
      }, {
        action: '_printLibrary',
        callback: () => {
          this.openPrintPage()
        }
      }])
    },
    computeToolbarItems({ items, form }) {
      if (form.mblnr) {
        mergeConfig(items, [{
          action: '_printLibrary',
          disabled: false
        }, {
          action: POST_LIBRARY,
          disabled: true
        }])
      } else {
        mergeConfig(items, [{
          action: '_printLibrary',
          disabled: true
        }, {
          action: POST_LIBRARY,
          disabled: false
        }])
      }
    },
    configSubBos(subBos) {
      return mergeConfig(subBos, [{
        prop: 'pickList',
        gridEditable: true,
        multiSelect: false,
        pageable: false,
        rowKey: 'zzpos' // 修改grid识别行唯一标识的属性，默认取的是业务对象的idProp
      }])
    },
    configSubBoGridColumns({ boName, prop, items }) {
      if (prop === 'pickList') {
        return mergeConfig(items, [{
          prop: 'zzpos',
          width: 200
        }])
      }
    },
    configSubBoToolbarItems({ boName, prop, items }) {
      if (prop === 'pickList') {
        return mergeConfig(items, [{
          action: '_splitrow',
          callback: () => {
            const grid = this.page().getSubBoGrid('pickList')
            const list = grid.getList()
            console.log('>>>>>>>getSelectedRows', grid.getSelectedRows())
            const selectedRow = grid.getSelectedRows()[0]
            if (selectedRow) {
              const index = grid.findRow(selectedRow, list)
              list.splice(index + 1, 0, { ...selectedRow, zzpos: selectedRow.zzpos + '-' + Date.now() })
            }
          }
        }])
      }
    },
    openPrintPage() {
      const form = this.page().getForm()
      window.open(`${process.env.VUE_APP_BASE_API}/HA/librarypick/libraryPickController.spr?action=_printLibrary&zzorder=${form.zzorder}&ordnum=${form.ordnum}`)
    }
  }
}
</script>

<style scoped>

</style>
