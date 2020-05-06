import Layout from '@/layout'
import building from '@/views/error-page/building'

export const panRouterArr = [
  {
    path: '/quote',
    component: Layout,
    name: 'Quote',
    meta: { title: '询报价管理' },
    children: [
      {
        path: 'supplyquote-agreementprice',
        component: building,
        meta: { title: '供应商协议价格' }
      },
      {
        path: 'supplyquote-quotesupplydata',
        component: building,
        meta: { title: '报价供应商主数据管理' }
      },
      {
        path: 'supplyquote-supplyquote',
        component: building,
        meta: { title: '物资类采购询报价管理' }
      },
      {
        path: 'supplyquote-supplyquoteeng',
        component: building,
        meta: { title: '工程类询报价管理' }
      }
    ]
  }, {
    path: '/purchasemagt',
    component: Layout,
    name: 'Purchasemagt',
    meta: { title: '采购管理' },
    children: [
      {
        path: 'materialinfobat',
        component: building,
        meta: { title: '物料批量管理' }
      }, {
        path: 'material',
        component: building,
        meta: { title: '物料管理行项目查询' }
      }, {
        path: 'materieldelete',
        component: building,
        meta: { title: '物料主数据删除' }
      }, {
        path: 'suppliermagt',
        component: building,
        meta: { title: '供应商主数据管理' }
      }, {
        path: 'librarypick',
        component: building,
        meta: { title: '出库领料管理' }
      }, {
        path: 'librarypick-item',
        component: building,
        meta: { title: '出库领料行项目查询' }
      }, {
        path: 'purchaseapplyfrontmagt',
        redirect: '/pan/purchase-apply-list',
        meta: { title: '采购申请管理' }
      }, {
        path: 'purchaseapplyfrontmagtdetail',
        component: building,
        meta: { title: '采购申请行项目查询' }
      }, {
        path: 'purchaseapplymagt',
        component: building,
        meta: { title: '采购订单查询' }
      }, {
        path: 'purchaseapplymagtdetail',
        component: building,
        meta: { title: '采购订单行项目查询' }
      }
    ]
  }, {
    path: '/basicApp',
    component: Layout,
    name: 'BasicApp',
    meta: { title: '报表管理' },
    children: [
      {
        path: 'costCenterOrg',
        component: building,
        meta: { title: '成本中心组织' }
      }, {
        path: 'purchaseapplyfrontmagt-oas',
        component: building,
        meta: { title: '采购申请查询(OAS)' }
      }, {
        path: 'purchaseapplyfrontmagt-wo',
        component: building,
        meta: { title: '采购申请查询(WO)' }
      }, {
        path: 'purchaseapplyfrontmagt-mrp',
        component: building,
        meta: { title: '采购申请查询(MRP)' }
      }, {
        path: 'task-todo',
        component: building,
        meta: { title: '待办任务统计' }
      }, {
        path: 'task-approved-info',
        component: building,
        meta: { title: '审批信息统计' }
      }, {
        path: 'role-user',
        component: building,
        meta: { title: '角色用户查询' }
      }, {
        path: 'user',
        component: building,
        meta: { title: '用户信息查询' }
      }
    ]
  }, {
    path: '/commuter',
    component: Layout,
    name: 'Commuter',
    meta: { title: '旅行与食宿管理' },
    children: [
      {
        path: 'travelapply',
        component: building,
        meta: { title: '员工旅行申请' }
      }, {
        path: 'travelvisitor',
        component: building,
        meta: { title: '访客访问申请' }
      }, {
        path: 'fetebook',
        component: building,
        meta: { title: '宴请预定申请' }
      }, {
        path: 'mealticket',
        component: building,
        meta: { title: '餐卡/餐券/外带餐申请' }
      }, {
        path: 'commuterinfocx',
        component: building,
        meta: { title: '通勤信息查询' }
      }, {
        path: 'airhotelbookcx',
        component: building,
        meta: { title: '航班酒店预订查询' }
      }, {
        path: 'lodgingarrangecx',
        component: building,
        meta: { title: '现场住宿安排信息查询' }
      }, {
        path: 'commutervalid',
        component: building,
        meta: { title: '通勤主数据管理' }
      }, {
        path: 'airbookcx',
        component: building,
        meta: { title: '航班预定管理' }
      }, {
        path: 'hotelbookcx',
        component: building,
        meta: { title: '酒店预定管理' }
      }
    ]
  }, {
    path: '/budgetapply',
    component: Layout,
    name: 'Budgetapply',
    meta: { title: '预算管理' },
    children: [
      {
        path: 'budgetTemplateInfo',
        component: building,
        meta: { title: '预算模版管理' }
      }, {
        path: 'budgetmaking',
        component: building,
        meta: { title: '预算编制管理' }
      }, {
        path: 'orgBudgetMaking',
        component: building,
        meta: { title: '预算填报及审批管理' }
      }, {
        path: 'rollbudget',
        component: building,
        meta: { title: '滚动预算生成' }
      }
    ]
  }, {
    path: '/wms',
    component: Layout,
    name: 'Wms',
    meta: { title: '库存管理' },
    children: [
      {
        path: 'personnellibrary',
        component: building,
        meta: { title: '领料人信息管理' }
      }, {
        path: 'materialck-1',
        component: building,
        meta: { title: '物料标签打印' }
      }, {
        path: 'pomaterialck',
        component: building,
        meta: { title: '入库标签打印' }
      }, {
        path: 'materialck-2',
        component: building,
        meta: { title: '退库标签打印' }
      }, {
        path: 'prelibrarypick',
        component: building,
        meta: { title: '预领料管理' }
      }, {
        path: 'inventory',
        component: building,
        meta: { title: '盘点信息管理' }
      }, {
        path: 'purchasereceive',
        component: building,
        meta: { title: '采购定单收货' }
      }
    ]
  }, {
    path: '/contract',
    component: Layout,
    name: 'Contract',
    meta: { title: '合同管理' },
    children: [
      {
        path: 'contractdata',
        component: building,
        meta: { title: '合同管理' }
      }
    ]
  }, {
    path: '/oa',
    component: Layout,
    name: 'Oa',
    meta: { title: '行政管理' },
    children: [
      {
        path: 'administration',
        component: building,
        meta: { title: '消耗品管理' },
        children: [
          {
            path: 'materialtypeerp',
            component: building,
            meta: { title: '物料类型管理' }
          }, {
            path: 'consumables',
            component: building,
            meta: { title: '消耗品主数据管理' }
          }, {
            path: 'consumablesout',
            component: building,
            meta: { title: '消耗品出库管理' }
          }, {
            path: 'consumablesindetailcx',
            component: building,
            meta: { title: '消耗品入库明细查询' }
          }, {
            path: 'consumablesoutdetailcx-2',
            component: building,
            meta: { title: '消耗品出库明细查询' }
          }, {
            path: 'inventoryerp',
            component: building,
            meta: { title: '消耗品盘点管理' }
          }
        ]
      }, {
        path: '办公用品管理',
        component: building,
        meta: { title: '办公用品管理' },
        children: [
          {
            path: '办公用品采购申请',
            component: building,
            meta: { title: '办公用品采购申请' }
          }, {
            path: '办公用品领用申请',
            component: building,
            meta: { title: '办公用品领用申请' }
          }
        ]
      }, {
        path: '数据填报与查询',
        component: building,
        meta: { title: '数据填报与查询' },
        children: [
          {
            path: '办公用品采购申请',
            component: building,
            meta: { title: '办公用品采购申请' }
          }, {
            path: '办公用品领用申请',
            component: building,
            meta: { title: '办公用品领用申请' }
          }
        ]
      }
    ]
  }
]

export const panRouter = {
  path: '/pan',
  component: Layout,
  hidden: true,
  name: 'Pan',
  meta: {
    title: 'pan',
    icon: 'nested'
  },
  children: [
    {
      path: 'purchase-apply-list',
      component: () => import('@/views/purchase-apply/list'),
      name: 'PurchaseApplyList',
      meta: { title: '采购申请管理' }
    },
    {
      path: 'purchase-apply-create',
      component: () => import('@/views/purchase-apply/create'),
      name: 'PurchaseApplyCreate',
      meta: { title: '创建采购申请' }
    }, {
      path: 'purchase-apply-edit/:id',
      component: () => import('@/views/purchase-apply/edit'),
      name: 'PurchaseApplyEdit',
      meta: { title: '编辑采购申请', noCache: true, activeMenu: '/pan/purchase-apply-list' },
      hidden: true
    }
  ]
}

export default panRouter
