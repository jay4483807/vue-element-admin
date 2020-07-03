<template>
  <edit-page
    :id="id"
    ref="page"
    :editable="editable"
    :config-form-items="configFormItems"
    :compute-form-data="computeFormData"
    :compute-form-items="computeFormItems"
    :config-toolbar-items="configToolbarItems"
    :config-sub-bo-form-items="configSubBoFormItems"
    :compute-sub-bo-form-items="computeSubBoFormItems"
    :compute-sub-bo-form-data="computeSubBoFormData"
  />
</template>

<script>
import EditPage from '@/views/pan/components/editPage'
import { mergeConfig } from '@/utils/pan'
import { UI_TYPE } from '@/constants'
import moment from 'moment'

const YES_NO_ITEM = {
  uiType: UI_TYPE.SELECT,
  selectOptions: [{
    value: 'Y',
    text: '是'
  }, {
    value: 'N',
    text: '否'
  }]
}

export default {
  components: { EditPage },
  data() {
    return {
      id: this.$route.params.id || '',
      editable: this.$route.meta.editable || false
    }
  },
  mounted() {
    if (!this.id) {
      // 创建时设置表单数据的初始值
      this.$refs.page.setForm({
        applydate: new Date(),
        bedat: new Date(),
        businessstate: '0'
      })
    }
  },
  methods: {
    configFormItems(items) {
      items = items.filter(item => !['waers', 'status', 'isdelete'].includes(item.prop))
      mergeConfig(items, [{
        prop: 'purchaseapplyno',
        editable: false,
        rowNo: 1,
        colNo: 1
      }, {
        prop: 'applydate',
        editable: false,
        required: true,
        rowNo: 1,
        colNo: 2
      }, {
        prop: 'bedat',
        editable: false,
        rowNo: 1,
        colNo: 3
      }, {
        prop: 'businessstate',
        label: '单据状态',
        editable: false,
        visibility: true,
        uiType: UI_TYPE.SELECT,
        selectOptions: [{
          value: '-1',
          text: '作废'
        }, {
          value: '0',
          text: '新增'
        }, {
          value: '1',
          text: '在途'
        }, {
          value: '8',
          text: '审批通过'
        }, {
          value: '9',
          text: '审批不通过'
        }, {
          value: '2',
          text: '单据处理'
        }]
      }, {
        prop: 'isprint',
        editable: false,
        ...YES_NO_ITEM
      }, {
        prop: 'emergent',
        ...YES_NO_ITEM
      }, {
        prop: 'issappr',
        ...YES_NO_ITEM
      }, {
        prop: 'printnum',
        editable: false
      }, {
        prop: 'memo',
        label: '原因/用途'
      }])
      if (!this.id) { // 创建页特殊处理
        items = items.filter(item => !['isprint', 'printnum'].includes(item.prop))
        // 申请日期、采购订单日期只在创建页面可编辑
        mergeConfig(items, [
          {
            prop: 'applydate',
            editable: true
          }, {
            prop: 'bedat',
            editable: true
          }
        ])
      }
      return items
    },
    computeFormData(form) {
      if (form.bsart && !form.memo) {
        form.memo = '自动生成备注，凭证类型：' + form.bsart
      }
      return form
    },
    // 根据表单数据动态计算表单配置
    computeFormItems({ items, form }) {
      if (form.issappr === 'Y') {
        // 移除表单项会触发表单项重新排列
        items = items.filter(item => item.prop !== 'recommenvent')
      }
      mergeConfig(items, [{
        prop: 'formtype', // 修改单据类型
        editable: form.issappr !== 'Y',
        required: form.issappr !== 'Y'
      }, {
        prop: 'actorid',
        hide: form.issappr === 'Y' // 隐藏表单项，不同于移除，它会占住原来的位置
      }])
      return items
    },
    configToolbarItems(items) {
      if (!this.id) {
        mergeConfig(items, [{
          action: '_submitProcess',
          disabled: true
        }], 'action')
      }
    },
    configSubBoFormItems({ boName, items }) {
      if (boName === 'PurchaseAppItemFro') { // 配置子对象：项目预览
        items = items.filter(item => !['mwskz'].includes(item.prop)) // 税码、工厂的下拉字典表项值不唯一，会报错，先去掉
        mergeConfig(items, [{
          prop: 'bnfpo',
          rowNo: 1,
          colNo: 1
        }, {
          prop: 'knttp', // 科目分配类别
          rowNo: 1,
          colNo: 2,
          queryParams: {
            defaultCondition: 'KNTTP in (\'A\',\'K\',\'Y\',\'Z\',\'U\')'
          }
        }, {
          prop: 'matkl', // 物料组
          required: true,
          rowNo: 2,
          colNo: 1
        }, {
          prop: 'gsber',
          label: '成本控制域',
          rowNo: 3,
          colNo: 1
        }, {
          prop: 'anln1',
          label: 'SAP资产编码',
          rowNo: 3,
          colNo: 2
        }, {
          prop: 'sakto',
          rowNo: 3,
          colNo: 3
        }, {
          prop: 'memo',
          rowNo: 0 // 设置为0表示不指定位置，自动按colNo排列
        }, {
          prop: 'kostl',
          rowNo: 0
        }])
      }
      return items
    },
    computeSubBoFormItems({ boName, items, form }) {
      if (boName === 'PurchaseAppItemFro') {
        mergeConfig(items, [{
          prop: 'gsber', // 成本控制域
          required: form.knttp === 'K'
        }, {
          prop: 'anln1', // SAP资产编码
          required: form.knttp === 'A' || form.knttp === 'Y'
        }, {
          prop: 'sakto', // 总账科目
          required: form.knttp === 'U' || form.knttp === 'Z'
        }])
      }
      return [...items]
    },
    computeSubBoFormData({ boName, form }) {
      if (boName === 'PurchaseAppItemFro') {
        // 锁选的“knttp:科目分配类别”自动填单
        if (form.knttp === 'A') {
          form.matkl = '116'
          form.anln1 = '000001000000'
          form.txz01 = '1'
          form.ekgrp = '200'
          form.lfdatfront = moment().add(7, 'd')
          form.menge = 1
        } else if (form.knttp === 'K') {
          form.matkl = '114'
        } else if (form.knttp === 'Y') {
          form.matkl = '116'
        }
        if (form.matkl) {
          // 异步修改表单值
          // 获取“matkl:物料组”搜索帮助组件，异步查询其对应的文本值并设置到“mpotext:物料采购文本”上
          this.$refs.page.getSubBoFormItem('PurchaseAppItemFro', 'matkl').getDisplay(form.matkl).then(res => {
            form.mpotext = '自动填单：' + res
          })
        }
      }
      return form
    }
  }
}
</script>

<style scoped>

</style>
