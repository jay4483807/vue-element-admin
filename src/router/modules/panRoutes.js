export const boImports = {
  'PurchaseApplyFront': {
    manage: () => import('@/views/pan-demo/list-demo'),
    edit: () => import('@/views/pan-demo/edit-demo')
  },
  'LibraryPick': {
    manage: () => import('@/views/ba/library-pick/list'),
    edit: () => import('@/views/ba/library-pick/edit')
  }
}
