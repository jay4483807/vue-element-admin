import Layout from '@/layout'
import Menu from '@/layout/menu'
import building from '@/views/error-page/building'

export function generateRoutesByMenusData(menusData) {
  const routes = []
  menusData.firstmenu.forEach(e => {
    const route = {
      path: '/' + e.MENUID,
      component: Layout,
      name: e.MENUID,
      meta: {
        title: e.MENUDESC,
        nodeId: e.MENUID
      }
    }
    route.children = generateSubRoutes(e.MENUID, menusData.menuinfo)
    routes.push(route)
  })
  console.log('生成菜单数据:', routes)
  return routes
}

function generateSubRoutes(menuId, menuInfos) {
  const subRoutes = []
  const menus = findSubMenus(menuId, menuInfos)
  for (const menu of menus) {
    let route
    if (!menu.URL) {
      // 没有URL，说明是文件夹
      route = {
        path: '/' + menu.NODEID,
        component: Menu,
        name: menu.NODEID,
        meta: {
          title: menu.NODEDESC,
          nodeId: menu.NODEID
        },
        children: generateSubRoutes(menu.NODEID, menuInfos)
      }
    } else {
      route = {
        path: menu.NODEDESC,
        component: building,
        meta: { title: menu.NODEDESC, nodeId: menu.NODEID, url: menu.URL }
      }
      for (const r of panRouters) {
        if (r.resUrl === menu.URL) {
          subRoutes.push(...r.children)
          route = undefined
          break
        }
      }
    }
    if (route) { subRoutes.push(route) }
  }
  return subRoutes
}

function findSubMenus(nodeId, menuInfos) {
  const arr = []
  for (const menu of menuInfos) {
    if (menu.PARENTNODEID === nodeId || menu.PARENTNODEID === '-1' && menu.MENUID === nodeId) { arr.push(menu) }
  }
  return arr
}

export const panRouters = [{
  // 管理页权限资源url
  resUrl: 'MECSS/purchasemagt/purchaseapplymagt/purchaseApplyController.spr?action=_manage',
  children: [
    {
      path: 'purchase-apply/manage',
      component: () => import('@/views/purchase-apply/list'),
      name: 'PurchaseApplyList',
      meta: { title: '采购订单查询', boName: 'PurchaseApply' }
    }, {
      path: 'purchase-apply/create',
      component: () => import('@/views/purchase-apply/create'),
      name: 'PurchaseApplyCreate',
      meta: { title: '创建采购订单', boName: 'PurchaseApply' },
      hidden: true
    }, {
      path: 'purchase-apply/edit/:id',
      component: () => import('@/views/purchase-apply/edit'),
      name: 'PurchaseApplyEdit',
      meta: { title: '编辑采购订单', boName: 'PurchaseApply', noCache: true },
      hidden: true
    }, {
      path: 'purchase-apply/view/:id',
      component: () => import('@/views/purchase-apply/view'),
      name: 'PurchaseApplyView',
      meta: { title: '查看采购订单', boName: 'PurchaseApply', noCache: true },
      hidden: true
    }
  ]
}, {
  // 管理页权限资源url
  resUrl: 'MECSS/purchasemagt/purchaseapplyfrontmagt/purchaseApplyFrontController.spr?action=_manage',
  children: [
    {
      path: 'purchase-apply-front/manage',
      component: () => import('@/views/purchase-apply/list'),
      name: 'PurchaseApplyFrontList',
      meta: { title: '采购申请管理', boName: 'PurchaseApplyFront' }
    }, {
      path: 'purchase-apply-front/create',
      component: () => import('@/views/purchase-apply/create'),
      name: 'PurchaseApplyFrontCreate',
      meta: { title: '创建采购申请', boName: 'PurchaseApplyFront' },
      hidden: true
    }, {
      path: 'purchase-apply-front/edit/:id',
      component: () => import('@/views/purchase-apply/edit'),
      name: 'PurchaseApplyFrontEdit',
      meta: { title: '编辑采购申请', boName: 'PurchaseApplyFront', noCache: true },
      hidden: true
    }, {
      path: 'purchase-apply-front/view/:id',
      component: () => import('@/views/purchase-apply/view'),
      name: 'PurchaseApplyFrontView',
      meta: { title: '查看采购申请', boName: 'PurchaseApplyFront', noCache: true },
      hidden: true
    }
  ]
}, {
  // 人员定位卡申请
  resUrl: 'MECSS/administration/perlocatcard/perLocatCardController.spr?action=_manage',
  children: [
    {
      path: 'per-locat-card/manage',
      component: () => import('@/views/purchase-apply/list'),
      name: 'PerLocatCardList',
      meta: { title: '人员定位卡申请', boName: 'PerLocatCard' }
    }, {
      path: 'per-locat-card/create',
      component: () => import('@/views/purchase-apply/create'),
      name: 'PerLocatCardCreate',
      meta: { title: '创建人员定位卡申请', boName: 'PerLocatCard' },
      hidden: true
    }, {
      path: 'per-locat-card/edit/:id',
      component: () => import('@/views/purchase-apply/edit'),
      name: 'PerLocatCardEdit',
      meta: { title: '编辑人员定位卡申请', boName: 'PerLocatCard', noCache: true },
      hidden: true
    }, {
      path: 'per-locat-card/view/:id',
      component: () => import('@/views/purchase-apply/view'),
      name: 'PerLocatCardView',
      meta: { title: '查看人员定位卡申请', boName: 'PerLocatCard', noCache: true },
      hidden: true
    }
  ]
}, {
  // 一般文件使用公司印章申请
  resUrl: 'MECSS/administration/generalstamp/generalStampController.spr?action=_manage',
  children: [
    {
      path: 'general-stamp/manage',
      component: () => import('@/views/purchase-apply/list'),
      name: 'GeneralStamp',
      meta: { title: '一般文件使用公司印章申请', boName: 'GeneralStamp' }
    }, {
      path: 'general-stamp/create',
      component: () => import('@/views/purchase-apply/create'),
      name: 'GeneralStampCreate',
      meta: { title: '创建一般文件使用公司印章申请', boName: 'GeneralStamp' },
      hidden: true
    }, {
      path: 'general-stamp/edit/:id',
      component: () => import('@/views/purchase-apply/edit'),
      name: 'GeneralStampEdit',
      meta: { title: '编辑一般文件使用公司印章申请', boName: 'GeneralStamp', noCache: true },
      hidden: true
    }, {
      path: 'general-stamp/view/:id',
      component: () => import('@/views/purchase-apply/view'),
      name: 'GeneralStampView',
      meta: { title: '查看一般文件使用公司印章申请', boName: 'GeneralStamp', noCache: true },
      hidden: true
    }
  ]
}]

export default panRouters
