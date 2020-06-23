import Layout from '@/layout'
import Menu from '@/layout/menu'
import { mergeConfig } from '@/utils/pan'

const PAGE = {
  MANAGE: 'manage',
  CREATE: 'create',
  EDIT: 'edit',
  VIEW: 'view'
}

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
    if (!menu.URL) {
      // 没有URL，说明是文件夹
      subRoutes.push({
        path: '/' + menu.NODEID,
        component: Menu,
        name: menu.NODEID,
        meta: {
          title: menu.NODEDESC,
          nodeId: menu.NODEID
        },
        children: generateSubRoutes(menu.NODEID, menuInfos)
      })
    } else {
      const routeConfig = panRouters.find(r => r.resUrl === menu.URL)
      if (routeConfig && routeConfig.children) {
        subRoutes.push(...routeConfig.children)
      } else {
        const path = menu.NODEID
        const boName = menu.BONAME
        const boText = menu.DESCRIPTION
        const routes = [
          {
            page: PAGE.MANAGE,
            path: path + '/manage',
            component: () => import('@/views/pan/list'),
            name: boName + 'List',
            meta: { title: menu.NODEDESC, boName: boName }
          }, {
            page: PAGE.CREATE,
            path: path + '/create',
            component: () => import('@/views/purchase-apply/create'),
            name: boName + 'Create',
            meta: { title: '创建' + boText, boName: boName },
            hidden: true
          }, {
            page: PAGE.EDIT,
            path: path + '/edit/:id',
            component: () => import('@/views/purchase-apply/edit'),
            name: boName + 'Edit',
            meta: { title: '编辑' + boText, boName: boName, noCache: true },
            hidden: true
          }, {
            page: PAGE.VIEW,
            path: path + '/view/:id',
            component: () => import('@/views/purchase-apply/view'),
            name: boName + 'View',
            meta: { title: '查看' + boText, boName: boName, noCache: true },
            hidden: true
          }
        ]
        if (routeConfig && routeConfig.merge) {
          mergeConfig(routes, routeConfig.merge, 'page')
        }
        subRoutes.push(...routes)
      }
    }
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
  // 采购订单申请抬头
  resUrl: 'MECSS/purchasemagt/purchaseapplymagt/purchaseApplyController.spr?action=_manage',
  merge: [{
    page: PAGE.MANAGE,
    component: () => import('@/views/purchase-apply/manage')
  }]
}, {
  // 采购申请管理
  resUrl: 'MECSS/purchasemagt/purchaseapplyfrontmagt/purchaseApplyFrontController.spr?action=_manage',
  merge: [{
    page: PAGE.MANAGE,
    component: () => import('@/views/purchase-apply-front/manage')
  }, {
    path: 'purchase-apply-front/manage-demo',
    name: 'PurchaseApplyFrontManageDemo',
    component: () => import('@/views/pan/list-demo'),
    meta: { title: '采购申请管理Demo', boName: 'PurchaseApplyFront' }
  }]
}, {
  // 人员定位卡申请
  resUrl: 'MECSS/administration/perlocatcard/perLocatCardController.spr?action=_manage',
  children: [
    {
      path: 'per-locat-card/manage',
      component: () => import('@/views/per-locat-card/manage'),
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
