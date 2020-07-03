import { SET_BO_INFO, SET_FORM_TOOLBAR } from '@/store/mutation-types'
import Vue from 'vue'
import { getBoInfo, getFormToolbar } from '@/api/pan'

const state = {
  boInfos: {},
  formToolbars: {}
}

const getters = {
  boInfo: state => boName => {
    const boInfo = state.boInfos[boName]
    if (!boInfo) {
      getBoInfo(boName).then(boInfo => {
        Vue.set(state.boInfos, boName, boInfo)
      })
    }
    return boInfo
  }
}

const mutations = {
  [SET_BO_INFO](state, payload) {
    Vue.set(state.boInfos, payload.boName, payload.boInfo)
  },
  [SET_FORM_TOOLBAR](state, payload) {
    Vue.set(state.formToolbars, payload.boName, payload.items)
  }
}

const actions = {
  async getBoInfo({ commit, state }, boName) {
    let boInfo = state.boInfos[boName]
    if (!boInfo) {
      boInfo = await getBoInfo(boName)
      commit(SET_BO_INFO, { boName, boInfo })
    }
    return boInfo
  },
  async getFormToolbar({ commit, state }, boName) {
    let items = state.formToolbars[boName]
    if (!items) {
      items = await getFormToolbar(boName)
      commit(SET_FORM_TOOLBAR, { boName, items })
    }
    return items
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
