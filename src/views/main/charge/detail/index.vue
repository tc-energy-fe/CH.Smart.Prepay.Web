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
    <div class="main-content">
        <eg-box>
          <template v-slot:headerLeft>
            <el-date-picker
              type="daterange"
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
            <el-select :value="searchData.PayType" @input="searchDataOnChange('PayType', $event)">
              <el-option :value="-1" label="全部缴费方式"></el-option>
              <el-option
                v-for="w in payTypeList"
                :value="w.value"
                :label="w.label"
                :key="w.value"
              >
              </el-option>
            </el-select>
            <eg-button @click="search">查询缴费记录</eg-button>
          </template>
          <template v-slot:content>
            <el-table :data="balanceList" v-loading="isLoadingBalanceList || isLoadingBalanceWarnType">
              <el-table-column label="房间信息" align="center" min-width="150">
                <template slot-scope="{ row }">
                  <eg-button type="text">{{row.FullName}}</eg-button>
                </template>
              </el-table-column>
              <el-table-column label="电表" prop="EMeterSN" align="center" min-width="130"></el-table-column>
              <el-table-column label="开户人姓名" prop="HostName" align="center"  min-width="110"></el-table-column>
              <el-table-column label="开户人手机号" prop="HostPhone" align="center" min-width="120"></el-table-column>
              <el-table-column label="剩余电费(元)" prop="Balance" align="center" min-width="120"></el-table-column>
              <el-table-column label="结算时间" prop="SettleTimeText" align="center" min-width="130"></el-table-column>
              <el-table-column label="电表状态" prop="IsOnText" align="center" min-width="90"></el-table-column>
              <el-table-column label="报警状态" prop="WarnTypeText" align="center" min-width="90"></el-table-column>
              <el-table-column label="操作" align="center">
                <template slot-scope="{ row }">
                  <eg-button type="text" @click="showEdit({ isShow: true, data: row })">缴退费</eg-button>
                </template>
              </el-table-column>
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
          </template>
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
      return {}
    },
    components: {},
    computed: {
      ...mapState([
        'searchData',
        'chargeTypeList',
        'payTypeList',
        'balanceList',
        'currentPage',
        'pageSize',
        'totalCount',
        'isLoadingBalanceList',
        'isLoadingBalanceWarnType',
        'isShowEdit',
        'detailData',
        'isLoadingRecent',
        'recentData',
        'sevenDayData',
        'isLoadingSevenDayData'
      ]),
      ...mapGetters([
        'currentNodeId'
      ]),
      groupTree () {
        return this.$store.state.mainGroupTreeHasRoot
      }
    },
    methods: {
      ...mapActions([
        'updateStateData',
        'updateObjectData',
        'getBalanceList',
        'getWarnType',
        'showEdit'
      ]),
      nodeOnChange ($event) {
        this.updateStateData({ item: 'currentNode', value: $event })
      },
      searchDataOnChange (key, value) {
        this.updateObjectData({ obj: 'searchData', key, value })
      },
      search () {
        this.updateStateData({ item: 'currentPage', value: 1 })
        this.getBalanceList()
      },
      currentPageOnChange (value) {
        this.updateStateData({ item: 'currentPage', value })
        this.getBalanceList()
      },
      pageSizeOnChange (value) {
        this.updateStateData({ item: 'pageSize', value })
        this.currentPageOnChange(1)
      }
    },
    watch: {
      groupTree (newValue, oldValue) {
        if (newValue.length && newValue !== oldValue) {
          this.$nextTick(function () {
            this.$refs.tree.setCurrentKey(newValue[0].value)
          })
          this.updateStateData({ item: 'currentNode', value: newValue[0] || {} })
          this.getWarnType()
        }
      }
    },
    created () {
      if (this.groupTree.length) {
        this.$nextTick(function () {
          this.$refs.tree.setCurrentKey(this.currentNodeId)
        })
        if (isEmpty(this.currentNodeId)) {
          this.updateStateData({ item: 'currentNode', value: this.groupTree[0] || {} })
        }
        this.getWarnType()
      }
    },
    beforeDestroy () {
      this.showEdit({ isShow: false })
    }
  }
</script>
