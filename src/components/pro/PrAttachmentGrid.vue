<template>
  <pr-sub-bo-grid v-bind="$attrs" :config-toolbar-items="_configToolbarItems" v-on="$listeners">
    <el-dialog title="上传附件" :visible="showDialog" :show-close="true" :append-to-body="true" width="70%">
      <el-upload drag :action="uploadUrl" multiple :file-list="uploadFileList" :data="uploadData">
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
      </el-upload>
    </el-dialog>
  </pr-sub-bo-grid>
</template>

<script>
import PrSubBoGrid from '@/components/pro/PrSubBoGrid'
import { ACTION } from '@/constants'
import { executeConfig } from '@/utils/pan'
export default {
  name: 'PrAttachmentGrid',
  components: { PrSubBoGrid },
  props: {
    parentBoName: {
      type: String,
      default: ''
    },
    boId: {
      type: String,
      default: ''
    },
    /**
     * 配置工具栏
     */
    configToolbarItems: {
      type: [Function, Array],
      default(items) {
        return items
      }
    }
  },
  data() {
    return {
      showDialog: false,
      uploadFileList: []
    }
  },
  methods: {
    _configToolbarItems(items) {
      const uploadItem = items.find(item => item.action === ACTION.UPLOAD)
      if (uploadItem && !uploadItem.callback) {
        uploadItem.callback = (event) => {
          this.showDialog = true
        }
      }
      executeConfig(this.configToolbarItems, this, items)
    }
  }
}
</script>

<style scoped>

</style>
