import router from './router'
import store from './store'
import { Message } from 'element-ui'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import getPageTitle from '@/utils/get-page-title'
import { generateRoutesByMenusData } from './router/modules/pan'

NProgress.configure({ showSpinner: false }) // NProgress Configuration

router.beforeEach(async(to, from, next) => {
  // start progress bar
  NProgress.start()
  // set page title
  document.title = getPageTitle(to.meta.title)
  if (to.path === '/login') {
    // if is logged in, redirect to the home page
    next()
    NProgress.done()
    return
  }
  if (!store.getters.isLogin) {
    try {
      // get user info
      // note: roles must be a object array! such as: ['admin'] or ,['developer','editor']
      const { menuData } = await store.dispatch('user/getInfo')

      // generate accessible routes map based on roles
      // const accessRoutes = await store.dispatch('permission/generateRoutes', roles)
      const accessRoutes = generateRoutesByMenusData(menuData)
      store.commit('permission/SET_ROUTES', accessRoutes)
      // dynamically add accessible routes
      router.addRoutes(accessRoutes)

      // hack method to ensure that addRoutes is complete
      // set the replace: true, so the navigation will not leave a history record
      next({ ...to, replace: true })
    } catch (error) {
      if (error && error.type === 'nologin') {
        // remove token and go to login page to re-login
        await store.dispatch('user/resetToken')
        Message.error(error.message || 'Has Error')
        next(`/login?redirect=${to.path}`)
      } else {
        Message.error(error.message || 'Has Error')
      }
      NProgress.done()
    }
  } else {
    next()
  }
})

router.afterEach(() => {
  // finish progress bar
  NProgress.done()
})

