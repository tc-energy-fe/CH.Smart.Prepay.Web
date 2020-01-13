<template>
  <div class="main-container statement-elecharge has-search">
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
      <div class="elecharge-content__search">
        <el-radio-group
          :value="searchData.dateType"
          @input="searchDataOnChange('dateType', $event)"
        >
          <el-radio-button :label="2">月</el-radio-button>
          <el-radio-button :label="1">年</el-radio-button>
        </el-radio-group>
        <el-date-picker
          :editable="false"
          :clearable="false"
          :value="searchData.date"
          :format="dateFormat"
          @input="searchDataOnChange('date', $event)"
        ></el-date-picker>
        <el-select
          filterable
          :value="searchData.room"
          @change="searchDataOnChange('room', $event)"
          :filter-method="searchRoomFilter"
        >
          <el-option
            v-for="room in searchRoomFilterList"
            :value="room.Id"
            :label="room.FullName"
            :key="room.Id"
          ></el-option>
        </el-select>
        <eg-button @click="search">查询</eg-button>
      </div>
      <eg-box class="eleCharge-statistic" title="汇总统计">
        <div slot="content" class="eleCharge-statistic__content">
          <div class="eleCharge-statistic__content--left">
            <overview-block
              :icon="Icons.totalEle" name="总用电量"
              :color="{ text: '#3d7dff' }" unit="kWh"
              :text="reportTotal.DeltaTotalSum | currency"
            ></overview-block>
            <overview-block
              :icon="Icons.totalMoney" name="总用电费"
              :color="{ left: '#bfefbb', text: '#67c23a' }" unit="元"
              :text="reportTotal.DeltaCostSum | currency"
            ></overview-block>
          </div>
          <div class="eleCharge-statistic__content--right">
            <total-pie-chart :data="pieData"></total-pie-chart>
          </div>
        </div>
      </eg-box>
      <eg-box class="eleCharge-report" title="明细报表">
        <eg-button slot="headerRight" @click="exportExcel">导出</eg-button>
        <div slot="content" v-loading="isLoadingRoomList || isLoadingRoomReport">
          <el-table :data="paginationData">
            <el-table-column prop="Date" label="日期" align="center" min-width="110"></el-table-column>
            <el-table-column prop="FullName" label="房间信息" align="center" min-width="120"></el-table-column>
            <el-table-column label="上次抄读数据(kWh)" align="center" min-width="160">
              <template slot-scope="{ row }">
                <el-popover trigger="hover" popper-class="eleCharge-report__popper">
                  <eg-button type="text" slot="reference">{{row.StartTotal | currency}}</eg-button>
                  <div class="eleCharge-report__pop">
                    <p><label>尖</label><span>{{row.StartPointed | currency}}</span></p>
                    <p><label>峰</label><span>{{row.StartPeak | currency}}</span></p>
                    <p><label>平</label><span>{{row.StartFlat | currency}}</span></p>
                    <p><label>谷</label><span>{{row.StartValley | currency}}</span></p>
                  </div>
                </el-popover>
              </template>
            </el-table-column>
            <el-table-column label="本次抄读数据(kWh)" align="center" min-width="160">
              <template slot-scope="{ row }">
                <el-popover trigger="hover" popper-class="eleCharge-report__popper">
                  <eg-button type="text" slot="reference">{{row.EndTotal | currency}}</eg-button>
                  <div class="eleCharge-report__pop">
                    <p><label>尖</label><span>{{row.EndPointed | currency}}</span></p>
                    <p><label>峰</label><span>{{row.EndPeak | currency}}</span></p>
                    <p><label>平</label><span>{{row.EndFlat | currency}}</span></p>
                    <p><label>谷</label><span>{{row.EndValley | currency}}</span></p>
                  </div>
                </el-popover>
              </template>
            </el-table-column>
            <el-table-column label="用电量(kWh)" align="center" min-width="120">
              <template slot-scope="{ row }">
                <el-popover trigger="hover" popper-class="eleCharge-report__popper">
                  <eg-button type="text" slot="reference">{{row.DeltaTotal | currency}}</eg-button>
                  <div class="eleCharge-report__pop">
                    <p><label>尖</label><span>{{row.DeltaPointed | currency}}</span></p>
                    <p><label>峰</label><span>{{row.DeltaPeak | currency}}</span></p>
                    <p><label>平</label><span>{{row.DeltaFlat | currency}}</span></p>
                    <p><label>谷</label><span>{{row.DeltaValley | currency}}</span></p>
                  </div>
                </el-popover>
              </template>
            </el-table-column>
            <el-table-column prop="DeltaCost" label="电费(元)" align="center" min-width="80"></el-table-column>
            <el-table-column prop="DateTime" label="冻结时间" align="center" min-width="180"></el-table-column>
          </el-table>
          <el-pagination
            background
            @current-change="currentPageOnChange"
            @size-change="pageSizeOnChange"
            :page-sizes="[5, 10, 15, 20]"
            :current-page="currentPage"
            :page-size="pageSize"
            layout="total, ->, prev, pager, next, sizes, jumper"
            :total="reportList.length"
          ></el-pagination>
        </div>
      </eg-box>
    </div>
  </div>
</template>

<script>
  import './eleCharge.scss'
  import Icons from '@/assets/icon/main'
  import { createNamespacedHelpers } from 'vuex'
  import OverviewBlock from 'overview-block'
  import TotalPieChart from '@/components/simple-pie-chart'
  const { mapGetters, mapActions, mapState } = createNamespacedHelpers('statement/eleCharge')
  export default {
    name: 'statement-elecharge',
    data () {
      return {
        searchRoomFilterText: '',
        Icons: {
          totalEle: Icons.icon_meter_total,
          totalMoney: Icons.tab_icon_money
        },
        pageSize: 5,
        currentPage: 1
      }
    },
    components: { OverviewBlock, TotalPieChart },
    computed: {
      ...mapState([
        'searchData',
        'isLoadingRoomList',
        'searchRoomList',
        'isLoadingRoomReport',
        'reportList',
        'reportTotal',
        'pieData'
      ]),
      ...mapGetters([
        'currentNodeId'
      ]),
      groupTree () {
        return this.$store.state.mainGroupTreeHasRoot
      },
      dateFormat () {
        let type = this.searchData.dateType
        return type === 1 ? 'yyyy' : type === 2 ? 'yyyy-MM' : 'yyyy-MM-dd'
      },
      searchRoomFilterList () {
        return this.searchRoomList.filter(r => r.FullName.indexOf(this.searchRoomFilterText) > -1)
      },
      paginationData () {
        return this.reportList.slice(this.pageSize * (this.currentPage - 1), this.pageSize * this.currentPage)
      }
    },
    methods: {
      ...mapActions([
        'updateStateData',
        'updateObjectData',
        'getSearchRoomList',
        'getRoomReport',
        'exportExcel'
      ]),
      nodeOnChange (value) {
        this.updateStateData({ item: 'currentNode', value })
        this.updateStateData({ item: 'currentPage', value: 1 })
        this.getSearchRoomList()
      },
      search () {
        this.updateStateData({ item: 'currentPage', value: 1 })
        this.getRoomReport()
      },
      searchDataOnChange (key, value) {
        this.updateObjectData({ obj: 'searchData', item: key, value })
      },
      searchRoomFilter (data) {
        this.searchRoomFilterText = data
      },
      currentPageOnChange (value) {
        this.currentPage = value
      },
      pageSizeOnChange (value) {
        this.pageSize = value
      }
    },
    watch: {
      groupTree (newValue, oldValue) {
        if (newValue.length && newValue !== oldValue) {
          this.$nextTick(function () {
            this.$refs.tree.setCurrentKey(newValue[0].value)
          })
          this.updateStateData({ item: 'currentNode', value: newValue[0] || {} })
          this.updateStateData({ item: 'currentPage', value: 1 })
          this.getSearchRoomList()
        }
      },
      'searchData.dateType' (newValue, oldValue) {
        if (!isEmpty(newValue) && newValue !== oldValue) {
          this.updateStateData({ item: 'currentPage', value: 1 })
          this.getSearchRoomList()
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
        this.getSearchRoomList()
      }
    },
    beforeDestroy () {
      this.updateStateData({ item: 'currentNode', value: {} })
    }
  }
</script>
