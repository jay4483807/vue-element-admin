import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/pan/purchase-apply/list.api',
    method: 'get',
    params: query
  })
}

export function fetchDetail(id) {
  return request({
    url: '/pan/purchase-apply/detail.api',
    params: { id }
  })
}

export function fetchProjectList(purchaseApplyId) {
  return request({
    url: '/pan/project/list.api',
    params: {
      id: purchaseApplyId
    }
  })
}
