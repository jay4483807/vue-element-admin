<template>
  <div :class="{'hidden':hidden}" class="pagination-container">
    <span v-show="showSelectedOnly" class="select">共{{ total }}条 已选{{ selectedSize }}条 <a @click="changeShowSelectedOnly">显示全部</a></span>
    <div v-show="!showSelectedOnly">
      <el-pagination
        :background="background"
        :current-page.sync="currentPage"
        :page-size.sync="pageSize"
        :layout="layout"
        :page-sizes="pageSizes"
        :total="total"
        v-bind="$attrs"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      >
        <span v-if="selectedSize!==undefined" class="select">
          共{{ total }}条<template v-if="showSelectedSize"> 已选<a @click="changeShowSelectedOnly"> {{ selectedSize }} </a>条</template>
        </span>
      </el-pagination>
    </div>
  </div>
</template>

<script>
import { scrollTo } from '@/utils/scroll-to'

export default {
  name: 'Pagination',
  props: {
    total: {
      required: true,
      type: Number
    },
    page: {
      type: Number,
      default: 1
    },
    limit: {
      type: Number,
      default: 20
    },
    pageSizes: {
      type: Array,
      default() {
        return [10, 20, 30, 50]
      }
    },
    layout: {
      type: String,
      default: 'slot, sizes, prev, pager, next, jumper'
    },
    background: {
      type: Boolean,
      default: true
    },
    autoScroll: {
      type: Boolean,
      default: true
    },
    hidden: {
      type: Boolean,
      default: false
    },
    selectedSize: {
      type: Number,
      default: undefined
    },
    showSelectedSize: {
      type: Boolean,
      default: false
    },
    // 是否只显示选中的记录
    showSelectedOnly: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    currentPage: {
      get() {
        return this.page
      },
      set(val) {
        this.$emit('update:page', val)
      }
    },
    pageSize: {
      get() {
        return this.limit
      },
      set(val) {
        this.$emit('update:limit', val)
      }
    }
  },
  methods: {
    handleSizeChange(val) {
      this.$emit('pagination', { page: this.currentPage, limit: val })
      if (this.autoScroll) {
        scrollTo(0, 800)
      }
    },
    handleCurrentChange(val) {
      this.$emit('pagination', { page: val, limit: this.pageSize })
      if (this.autoScroll) {
        scrollTo(0, 800)
      }
    },
    changeShowSelectedOnly() {
      this.$emit('changeShowSelectedOnly')
    }
  }
}
</script>

<style scoped>
.pagination-container {
  background: #fff;
  padding: 16px 16px;
}
.pagination-container.hidden {
  display: none;
}
  .pagination-container .select {
    margin-right: 10px;
    font-weight: normal;
    color: #606266;
  }

.pagination-container .select a {
  text-decoration: underline;
}
</style>
