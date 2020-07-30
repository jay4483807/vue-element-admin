import axios from 'axios'
import { MessageBox, Message } from 'element-ui'
import store from '@/store'
import { getToken } from '@/utils/auth'

// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  withCredentials: true, // send cookies when cross-domain requests
  timeout: 30000, // request timeout,
  method: 'post',
  transformRequest: [function(data) {
    if (data instanceof Object) {
      let ret = ''
      for (const it in data) {
        if (data[it] instanceof Array) {
          // 编辑页保存时，多个子对象信息使用相同的参数subObject，此处扩展支持这种特殊情况的处理
          for (const v of data[it]) {
            if (ret) { ret += '&' }
            ret += encodeURIComponent(it) + '=' + encodeURIComponent(v)
          }
        } else {
          if (ret) { ret += '&' }
          ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it])
        }
      }
      return ret
    } else {
      return data
    }
  }]

})

// request interceptor
service.interceptors.request.use(
  config => {
    // do something before request is sent

    if (config.url.startsWith('/vue-element-admin/')) {
      // TODO 兼容demo请求的特殊处理
      config.url = process.env.VUE_APP_DEMO_API + config.url
      if (store.getters.token) {
        // let each request carry token
        // ['X-Token'] is a custom headers key
        // please modify it according to the actual situation
        config.headers['X-Token'] = getToken()
      }
      return config
    }
    return config
  },
  error => {
    // do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
  */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  response => {
    let res = response.data
    console.log('got response', response)
    if (res['panform-json']) { res = res['panform-json'] }
    if (!response.config.ignoreError && (res.success !== undefined && !res.success || res.type !== undefined && res.type !== 'info')) {
      if (res.message !== 'There is a cycle in the hierarchy!') {
        Message({
          message: res.message || 'Error',
          type: res.type || 'error',
          duration: 5 * 1000
        })
      }
      if (res.type === 'nologin') {
        MessageBox.confirm('您已退出登录，点击取消留在当前页面，点击确定返回登录页重新登录。', '退出登录', {
          confirmButtonText: '重新登录',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          store.dispatch('user/resetToken').then(() => {
            location.reload()
          })
        })
      }
      return Promise.reject(new Error(res.message || 'Error'))
    } else {
      return res
    }
  },
  error => {
    console.error('请求错误：', error) // for debug
    Message({
      message: error.message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

export default function(options) {
  return service(options).catch(err => {
    console.log('got error', err.name, err.message)
    const tryTime = options._tryTime || 0
    if (tryTime <= 5 && (err.message === 'Network Error' || err.message === 'There is a cycle in the hierarchy!')) {
      // 开发环境调用VPN，经常出现网络错误，这里试着重新发起请求
      console.log('尝试重新发起请求：' + tryTime, options)
      return service({ ...options, _tryTime: tryTime + 1 })
    } else {
      return new Promise((resolve, reject) => {
        reject(err)
      })
    }
  })
}
