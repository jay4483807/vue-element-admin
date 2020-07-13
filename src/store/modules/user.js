import { login, panLogin, logout, getInfo } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import router, { resetRouter } from '@/router'
import md5 from 'js-md5'
import request from '@/utils/request'

const state = {
  token: getToken(),
  name: '',
  avatar: '',
  introduction: '',
  roles: [],
  userId: '',
  menus: [],
  clientId: process.env.VUE_APP_CLIENT
}

const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_INTRODUCTION: (state, introduction) => {
    state.introduction = introduction
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles
  },
  SET_USER_ID: (state, userId) => {
    state.userId = userId
  },
  SET_MENUS: (state, menus) => {
    state.menus = menus || []
  }
}

const actions = {
  // user login
  login({ commit }, userInfo) {
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      login({ username: username.trim(), password: password }).then(response => {
        const { data } = response
        commit('SET_TOKEN', data.token)
        setToken(data.token)
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  panLogin({ commit, state }, userInfo) {
    const { username, password, client, language } = userInfo
    return new Promise((resolve, reject) => {
      panLogin({ userName: username.trim(), passWord: md5(password).toUpperCase(), client: client || process.env.VUE_APP_CLIENT, languageIso: language || 'zh' }).then(response => {
        console.log('登录成功', response)
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // get user info
  async getInfo({ commit, state }) {
    let res = await request({ url: '/vueController.spr?action=getPersonnelInfo', ignoreError: true })
    if (res.type !== 'info') {
      throw res
    }
    commit('SET_USER_ID', res.coustom.personnelinfo.USERID)
    commit('SET_NAME', res.coustom.personnelinfo.PERSONNELNAME)

    res = await request({ url: '/vueController.spr?action=getAuthMenu', data: {
      userid: state.userId
    }})
    const { data } = await getInfo(state.token)
    if (!data) { throw new Error('Verification failed, please Login again.') }
    const { roles, name, avatar, introduction } = data

    // roles must be a non-empty array
    if (!roles || roles.length <= 0) {
      throw new Error('getInfo: roles must be a non-null array!')
    }

    commit('SET_ROLES', roles)
    commit('SET_NAME', name)
    commit('SET_AVATAR', avatar)
    commit('SET_INTRODUCTION', introduction)
    commit('SET_MENUS', res.coustom)
    return { ...data, menuData: res.coustom }
  },

  // user logout
  logout({ commit, state, dispatch }) {
    return new Promise((resolve, reject) => {
      logout(state.token).then(() => {
        commit('SET_USER_ID', '')
        commit('SET_TOKEN', '')
        commit('SET_ROLES', [])
        removeToken()
        resetRouter()

        // reset visited views and cached views
        // to fixed https://github.com/PanJiaChen/vue-element-admin/issues/2485
        dispatch('tagsView/delAllViews', null, { root: true })

        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      commit('SET_TOKEN', '')
      commit('SET_ROLES', [])
      commit('SET_USER_ID', '')
      removeToken()
      resolve()
    })
  },

  // dynamically modify permissions
  changeRoles({ commit, dispatch }, role) {
    return new Promise(async resolve => {
      const token = role + '-token'

      commit('SET_TOKEN', token)
      setToken(token)

      const { roles } = await dispatch('getInfo')

      resetRouter()

      // generate accessible routes map based on roles
      const accessRoutes = await dispatch('permission/generateRoutes', roles, { root: true })

      // dynamically add accessible routes
      router.addRoutes(accessRoutes)

      // reset visited views and cached views
      dispatch('tagsView/delAllViews', null, { root: true })

      resolve()
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
