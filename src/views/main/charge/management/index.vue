<template>
  <div class="main-container charge-management has-search">
    <template v-if="!isShowEdit">
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
            <eg-input
              placeholder="房间信息搜索"
              :value="searchData.Name"
              @input="searchDataOnChange('Name', $event)"
            ></eg-input>
            <eg-input
              placeholder="开户人姓名/手机号"
              :value="searchData.HostInfo"
              @input="searchDataOnChange('HostInfo', $event)"
            ></eg-input>
            <el-select :value="searchData.IsOn" @input="searchDataOnChange('IsOn', $event)">
              <el-option :value="-1" label="全部电表状态"></el-option>
              <el-option :value="true" label="合闸"></el-option>
              <el-option :value="false" label="开闸"></el-option>
            </el-select>
            <el-select :value="searchData.WarnType" @input="searchDataOnChange('WarnType', $event)">
              <el-option :value="-1" label="全部报警状态"></el-option>
              <el-option
                v-for="w in warnTypeList"
                :value="w.value"
                :label="w.label"
                :key="w.value"
              >
              </el-option>
            </el-select>
            <eg-button @click="search">查询</eg-button>
          </template>
          <template v-slot:content>
            <el-table :data="balanceList" v-loading="isLoadingBalanceList || isLoadingBalanceWarnType">
              <el-table-column label="房间信息" align="center" min-width="150">
                <template slot-scope="{ row }">
                  <eg-button type="text" @click="showEdit({ isShow: true, data: row })">{{row.FullName}}</eg-button>
                </template>
              </el-table-column>
              <el-table-column label="电表" prop="EMeterSN" align="center" min-width="130"></el-table-column>
              <el-table-column label="开户人姓名" prop="HostName" align="center"  min-width="110"></el-table-column>
              <el-table-column label="开户人手机号" prop="HostPhone" align="center" min-width="120"></el-table-column>
              <el-table-column label="剩余电费(元)" prop="Balance" align="center" min-width="120"></el-table-column>
              <el-table-column label="结算时间" prop="SettleTimeText" align="center" min-width="130"></el-table-column>
              <el-table-column label="电表状态" align="center" min-width="90">
                <template slot-scope="{ row }">
                  <span :style="{color: row.IsOn ? '#5e5e5e' : '#f56c6c'}">
                    {{row.IsOnText}}
                  </span>
                </template>
              </el-table-column>
              <el-table-column label="报警状态" align="center" min-width="90">
                <template slot-scope="{ row }">
                  <span :style="{color: row.WarnType === 0 ? '#5e5e5e' : '#f56c6c'}">
                    {{row.WarnTypeText}}
                  </span>
                </template>
              </el-table-column>
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
    </template>
    <template v-if="isShowEdit">
      <eg-box class="edit-wrapper">
        <div class="edit-header" slot="headerLeft">
          <span class="edit-header__title">缴退费</span>
          <eg-button type="text" @click="showEdit({ isShow: false })">返回列表</eg-button>
        </div>
        <div class="edit-content" slot="content">
          <div class="edit-content--left">
            <p class="edit-content__name">{{detailData.room}}</p>
            <p><label>开户人</label><span>{{detailData.host}}</span></p>
            <p><label>手机号</label><span>{{detailData.phone}}</span></p>
            <p>
              <label>房间余额</label>
              <span :style="{color: detailData.balance >= 0 ? '#67c23a' : '#f56c6c'}">
                {{detailData.balance}}
              </span>&nbsp;元
            </p>
            <eg-button @click="toDetailPage">查询缴费记录</eg-button>
          </div>
          <div class="edit-content--right">
            <p>
              <label>缴费类型</label>
              <el-radio-group :value="editChargeType" @input="updateStateData({item: 'editChargeType', value: $event})">
                <el-radio :label="0">预存</el-radio>
                <el-radio :label="1">退费</el-radio>
                <el-radio :label="2">补助</el-radio>
              </el-radio-group>
            </p>
            <p>
              <label>缴费金额</label>
              <eg-input
                is-number
                placeholder="请输入金额"
                :value="editMoney"
                suffix-text="元"
                @input="updateStateData({item: 'editMoney', value: $event})"></eg-input>
            </p>
            <eg-button @click="balancePay">立即缴费</eg-button>
          </div>
        </div>
      </eg-box>
      <eg-box class="management-recent">
        <p class="management-edit__title" slot="headerLeft">最近抄读数据</p>
        <el-table :data="[recentData]" slot="content" v-loading="isLoadingRecent">
          <el-table-column prop="FullName" label="房间名称" align="center" min-width="100"></el-table-column>
          <el-table-column prop="EMeterSN" label="电表" align="center" min-width="140"></el-table-column>
          <el-table-column prop="StartTotal" label="上次抄读数据(kWh)" align="center" min-width="160">
            <template slot-scope="{ row }">
              <el-popover trigger="hover" popper-class="recent-table__total">
                <eg-button type="text" slot="reference">{{row.StartTotal | currency}}</eg-button>
                <div class="recent-table__pop">
                  <p><label>尖</label><span>{{row.StartPointed | currency}}</span></p>
                  <p><label>峰</label><span>{{row.StartPeak | currency}}</span></p>
                  <p><label>平</label><span>{{row.StartFlat | currency}}</span></p>
                  <p><label>谷</label><span>{{row.StartValley | currency}}</span></p>
                </div>
              </el-popover>
            </template>
          </el-table-column>
          <el-table-column prop="EndTotal" label="本次抄读数据(kWh)" align="center" min-width="160"></el-table-column>
          <el-table-column prop="DeltaTotal" label="用电量(kWh)" align="center" min-width="120"></el-table-column>
          <el-table-column prop="DeltaCost" label="电费(元)" align="center"></el-table-column>
          <el-table-column prop="Date" label="抄读时间" align="center" min-width="180"></el-table-column>
        </el-table>
      </eg-box>
      <eg-box class="management-trend">
        <p class="management-edit__title" slot="headerLeft">近7天用电趋势</p>
        <div style="height: 13rem" slot="content" v-loading="isLoadingSevenDayData">
          <my-line-chart
            :data="sevenDayData"
            :customProps="customProps"
          ></my-line-chart>
        </div>
      </eg-box>
    </template>
  </div>
</template>

<script>
  import './management.scss'
  import { createNamespacedHelpers } from 'vuex'
  import MyLineChart from '@/components/single-line-chart'
  const { mapGetters, mapActions, mapState } = createNamespacedHelpers('charge/management')
  export default {
    name: 'charge-management',
    data () {
      return {
        customProps: {
          xAxisName: '日',
          yAxisName: 'kWh'
        }
      }
    },
    components: { MyLineChart },
    computed: {
      ...mapState([
        'searchData',
        'warnTypeList',
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
        'isLoadingSevenDayData',
        'editChargeType',
        'editMoney'
      ]),
      ...mapGetters([
        'currentNodeId'
      ]),
      groupTree () {
        return this.$store.state.mainGroupTreeHasRoot
      },
      projectId () {
        return this.$store.state.areaId
      }
    },
    methods: {
      ...mapActions([
        'updateStateData',
        'updateObjectData',
        'getBalanceList',
        'getWarnType',
        'showEdit',
        'balancePay'
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
        this.getBalanceList()
      },
      currentPageOnChange (value) {
        this.updateStateData({ item: 'currentPage', value })
        this.getBalanceList()
      },
      pageSizeOnChange (value) {
        this.updateStateData({ item: 'pageSize', value })
        this.currentPageOnChange(1)
      },
      toDetailPage () {
        this.$parent.$emit('toDetailPage', this.detailData.room)
        this.$router.push('/charge/detail')
      }
    },
    watch: {
      projectId () {
        this.showEdit({ isShow: false })
      },
      groupTree (newValue, oldValue) {
        if (newValue.length && newValue !== oldValue) {
          this.$nextTick(function () {
            this.$refs.tree.setCurrentKey(newValue[0].value)
          })
          this.updateStateData({ item: 'currentNode', value: newValue[0] || {} })
          this.updateStateData({ item: 'currentPage', value: 1 })
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
        this.updateStateData({ item: 'currentPage', value: 1 })
        this.getWarnType()
      }
    },
    beforeDestroy () {
      this.showEdit({ isShow: false })
    }
  }
</script>
