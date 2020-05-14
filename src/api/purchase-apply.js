import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/gridQueryController.spr?action=queryGrid',
    method: 'post',
    params: {
      ...query,
      start: (query.page - 1) * query.limit,
      limit: query.limit,
      boName: 'PurchaseApplyFront',
      defaultCondition: ' 1=1 AND FORMTYPE=\'PR\'',
      orderSql: 'APPLYDATE DESC',
      distinctSupport: false
    }
  }).then(rsp => {
    return {
      data: {
        total: rsp.totalSize,
        items: rsp.data || []
      }}
  })
}

export function fetchDetail(id) {
  return request({
    url: '/vue-element-admin/purchase-apply/detail.api',
    params: { id }
  })
}

export function fetchProjectList(purchaseApplyId) {
  return request({
    url: '/vue-element-admin/project/list.api',
    params: {
      id: purchaseApplyId
    }
  })
}
