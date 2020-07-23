
export default {
  data() {
    return {
      id: this.$route.params.id || '',
      editable: this.$route.query.editable || this.$route.meta.editable || false,
      taskId: this.$route.params.taskId || ''
    }
  },
  created() {
    this.bindProps = {
      configFormItems: this.configFormItems,
      computeFormData: this.computeFormData,
      computeFormItems: this.computeFormItems,
      configToolbarItems: this.configToolbarItems,
      configSubBoFormItems: this.configSubBoFormItems,
      computeSubBoFormItems: this.computeSubBoFormItems,
      computeSubBoFormData: this.computeSubBoFormData,
      configSubBos: this.configSubBos,
      id: this.id,
      editable: this.editable,
      taskId: this.taskId,
      ...this.$attrs
    }
  },
  methods: {
    page() {
      const page = this.$refs.page
      if (!page) {
        throw new Error('edit-page组件未挂载完成或是ref值没有设置为page')
      }
      return page
    },
    configFormItems(items) {
      return items
    },
    computeFormData(form) {
      return form
    },
    computeFormItems({ items, form }) {
      return items
    },
    configToolbarItems(items) {
      return items
    },
    configSubBoFormItems({ boName, items }) {
      return items
    },
    computeSubBoFormItems({ boName, items, form }) {
      return items
    },
    computeSubBoFormData({ boName, form }) {
      return form
    },
    computeSubToolbarItems() {
      // TODO
    },
    configSubBos(subBos) {
      return subBos
    }
  }
}
