import { getBoInfo } from '@/store/action-types'
import { mapActions } from 'vuex'

export default {
  props: {
    boName: {
      type: String,
      default: ''
    }
  },
  computed: {
    boInfo() {
      return this.$store.getters.boInfo(this.boName) || {}
    },
    idProp() {
      return this.boInfo && this.boInfo.idProp || ''
    }
  },
  watch: {
    boName(boName) {
      if (boName) {
        this.getBoInfo(boName)
      }
    }
  },
  methods: {
    ...mapActions({ getBoInfo: getBoInfo })
  }
}
