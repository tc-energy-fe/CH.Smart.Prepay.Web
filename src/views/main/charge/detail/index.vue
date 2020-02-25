<template>
  <div class="main-container charge-detail has-search">
    <div class="main-search">
      <p class="main-search__title">选择区域</p>
      <el-tree
        ref="tree"
        :data="groupTree"
        node-key="value"
        default-expand-all
        auto-expand-parent
        :highlight-current="true"
        :current-node-key="currentNodeId"
        :expand-on-click-node="false"
        @current-change="nodeOnChange"
      ></el-tree>
    </div>
    <div class="main-content charge-detail__content">
      <div v-if="isFromManage" class="charge-detail__header">
        <span class="charge-detail__title">缴退费明细</span>
        <eg-button type="text" @click="returnToManage">返回</eg-button>
      </div>
      <eg-box>
        <template v-slot:headerLeft>
          <el-date-picker
            :clearable="false"
            :editable="false"
            unlink-panels
            type="daterange"
            :value="searchPeriod"
            @input="updateStateData({item: 'searchPeriod', value: $event})"
          ></el-date-picker>
          <eg-input
            placeholder="房间信息搜索"
            :value="searchData.RoomFullName"
            @input="searchDataOnChange('RoomFullName', $event)"
          ></eg-input>
          <el-select :value="searchData.ChargeType" @input="searchDataOnChange('ChargeType', $event)">
            <el-option :value="-1" label="全部缴费类型"></el-option>
            <el-option
              v-for="w in chargeTypeList"
              :value="w.value"
              :label="w.label"
              :key="w.value"
            >
            </el-option>
          </el-select>
          <el-select :value="searchData.PayClient" @input="searchDataOnChange('PayClient', $event)">
            <el-option :value="-1" label="全部缴费方式"></el-option>
            <el-option
              v-for="w in payClientList"
              :value="w.value"
              :label="w.label"
              :key="w.value"
            >
            </el-option>
          </el-select>
          <eg-button @click="search">查询</eg-button>
        </template>
        <div style="height: 100%;overflow: auto" slot="content">
          <el-table :data="detailList" v-loading="isLoadingDetailList">
            <el-table-column label="房间信息" prop="RoomFullName" align="center" min-width="140"></el-table-column>
            <el-table-column label="缴费人姓名" prop="Name" align="center"  min-width="110"></el-table-column>
            <el-table-column label="缴费人电话" prop="Phone" align="center" min-width="120"></el-table-column>
            <el-table-column label="缴费方式" prop="PayClientText" align="center" min-width="90"></el-table-column>
            <el-table-column label="缴费类型" prop="ChargeTypeText" align="center" min-width="90"></el-table-column>
            <el-table-column label="支付方式" prop="PayTypeText" align="center" min-width="90"></el-table-column>
            <el-table-column label="缴费金额(元)" prop="Money" align="center" min-width="120"></el-table-column>
            <el-table-column label="缴费时间" prop="PayTimeText" align="center" min-width="180"></el-table-column>
          </el-table>
          <el-pagination
            background
            @current-change="currentPageOnChange"
            @size-change="pageSizeOnChange"
            :page-sizes="[10, 15, 20, 25]"
            :current-page="currentPage"
            :page-size="pageSize"
            layout="total, ->, prev, pager, next, sizes, jumper"
            :total="totalCount"
          ></el-pagination>
        </div>
      </eg-box>
    </div>
  </div>
</template>

<script>
  import './detail.scss'
  import { createNamespacedHelpers } from 'vuex'
  const { mapGetters, mapActions, mapState } = createNamespacedHelpers('charge/detail')
  export default {
    name: 'charge-detail',
    data () {
      return {
        isJumpToManage: false
      }
    },
    components: {},
    computed: {
      ...mapState([
        'searchData',
        'chargeTypeList',
        'payClientList',
        'detailList',
        'currentPage',
        'pageSize',
        'totalCount',
        'isLoadingDetailList',
        'searchPeriod'
      ]),
      ...mapGetters([
        'currentNodeId'
      ]),
      groupTree () {
        return this.$store.state.mainGroupTreeHasRoot
      },
      defaultRoom () {
        return this.$parent.payDetailGroup
      },
      isFromManage () {
        return this.$parent.isJumpToDetail
      }
    },
    methods: {
      ...mapActions([
        'updateStateData',
        'updateObjectData',
        'getDetailList'
      ]),
      nodeOnChange ($event) {
        this.updateStateData({ item: 'currentNode', value: $event })
        this.search()
      },
      searchDataOnChange (key, value) {
        this.updateObjectData({ obj: 'searchData', item: key, value })
      },
      search () {
        this.updateStateData({ item: 'currentPage', value: 1 })
        this.getDetailList()
      },
      currentPageOnChange (value) {
        this.updateStateData({ item: 'currentPage', value })
        this.getDetailList()
      },
      pageSizeOnChange (value) {
        this.updateStateData({ item: 'pageSize', value })
        this.currentPageOnChange(1)
      },
      returnToManage () {
        this.$parent.isReturnToManage = true
        this.$router.push('/charge/management')
      }
    },
    watch: {
      groupTree (newValue, oldValue) {
        if (newValue.length && newValue !== oldValue) {
          this.$nextTick(function () {
            this.$refs.tree.setCurrentKey(newValue[0].value)
          })
          this.updateStateData({ item: 'currentNode', value: newValue[0] || {} })
          this.search()
        }
      }
    },
    created () {
      this.searchDataOnChange('RoomFullName', this.isFromManage ? this.defaultRoom || '' : '')
      if (this.groupTree.length) {
        this.$nextTick(function () {
          this.$refs.tree.setCurrentKey(this.currentNodeId)
        })
        if (isEmpty(this.currentNodeId)) {
          this.updateStateData({ item: 'currentNode', value: this.groupTree[0] || {} })
        }
        this.search()
      }
    },
    beforeDestroy () {
      this.$parent.isJumpToDetail = false
      this.$parent.payDetailGroup = ''
    }
  }
</script>
