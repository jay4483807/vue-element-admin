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

export function fetchDetail(id, boId = '000000000500', userId = '1') {
  return request({
    url: '/vueController.spr?action=getBusinessObjectInfo&language=ZH',
    params: { businessid: id, boid: boId, userid: userId }
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
