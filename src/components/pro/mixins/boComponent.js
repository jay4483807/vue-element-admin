import { getBoInfo } from '@/api/pan'

export default {
  props: {
    boName: {
      type: String,
      default: ''
    }
  },
  data: function() {
    return {
      boInfo: {}
    }
  },
  computed: {
    idProp() {
      return this.boInfo && this.boInfo.idProp || ''
    }
  },
  async created() {
    this.boInfo = await getBoInfo(this.boName)
  }
}
