import Layout from '@/layout'
import building from '@/views/error-page/building'

export function generateRoutesByMenusData(menusData) {
  const routes = []
  menusData.firstmenu.forEach(e => {
    const route = {
      path: '/' + e.MENUDESC,
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
  console.log('generateRoutesByMenusData:', routes)
  return routes
}

function generateSubRoutes(menuId, menuInfos) {
  const subRoutes = []
  const menus = findSubMenus(menuId, menuInfos)
  for (const menu of menus) {
    let route = {
      path: menu.NODEDESC,
      component: building,
      meta: { title: menu.NODEDESC, nodeId: menu.NODEID, url: menu.URL }
    }
    if (!menu.URL) {
      // 没有URL，说明是文件夹
      route.children = generateSubRoutes(menu.NODEID, menuInfos)
    } else {
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
  resUrl: 'MECSS/purchasemagt/purchaseapplyfrontmagt/purchaseApplyFrontController.spr?action=_manage',
  children: [
    {
      path: 'manage',
      component: () => import('@/views/purchase-apply/list'),
      name: 'PurchaseApplyList',
      meta: { title: '采购申请管理' }
    }, {
      path: 'create',
      component: () => import('@/views/purchase-apply/create'),
      name: 'PurchaseApplyCreate',
      meta: { title: '创建采购申请' },
      hidden: true
    }, {
      path: 'edit/:id',
      component: () => import('@/views/purchase-apply/edit'),
      name: 'PurchaseApplyEdit',
      meta: { title: '编辑采购申请', noCache: true },
      hidden: true
    }
  ]
}]

export default panRouters
