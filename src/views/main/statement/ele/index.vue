<template>
  <div class="main-container statement-ele has-search">
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
      <div class="ele-content__search">
        <el-radio-group
          :value="searchData.dateType"
          @input="searchDataOnChange('dateType', $event)"
        >
          <el-radio-button :label="2">月</el-radio-button>
          <el-radio-button :label="1">年</el-radio-button>
        </el-radio-group>
        <el-date-picker
          :key="searchData.dateType"
          :editable="false"
          :clearable="false"
          :value="searchData.date"
          :format="dateFormat"
          :type="searchData.dateType === 1 ? 'year' : 'month'"
          @input="searchDataOnChange('date', $event)"
        ></el-date-picker>
        <eg-button @click="search">查询</eg-button>
      </div>
      <eg-box class="ele-statistic" title="汇总统计">
        <div slot="content" class="ele-statistic__content">
          <div class="ele-statistic__content--left">
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
          <div class="ele-statistic__content--right">
            <total-pie-chart :data="pieData"></total-pie-chart>
          </div>
        </div>
      </eg-box>
      <eg-box class="ele-report" title="明细报表">
        <eg-button slot="headerRight" @click="exportExcel">导出</eg-button>
        <div slot="content">
          <div class="ele-detail__header--center">
            <el-radio-group v-model="detailTabIndex">
              <el-radio-button label="table">
                <i class="iconfont icon-tab_icon_table"></i>
              </el-radio-button>
              <el-radio-button label="chart">
                <i class="iconfont icon-tab_icon_histogram"></i>
              </el-radio-button>
            </el-radio-group>
          </div>
          <template v-if="detailTabIndex === 'table'">
            <el-table :data="paginationData" v-loading="isLoadingEleReport">
              <el-table-column prop="DateText" label="日期" align="center" min-width="110"></el-table-column>
              <el-table-column prop="DeltaTotal" label="总用电量(kWh)" align="center" min-width="130"></el-table-column>
              <el-table-column prop="DeltaCost" label="总用电费(元)" align="center" min-width="120"></el-table-column>
              <el-table-column prop="DeltaPointed" label="尖用电量(kWh)" align="center" min-width="130"></el-table-column>
              <el-table-column prop="DeltaPeak" label="峰用电量(kWh)" align="center" min-width="130"></el-table-column>
              <el-table-column prop="DeltaFlat" label="平用电量(kWh)" align="center" min-width="130"></el-table-column>
              <el-table-column prop="DeltaValley" label="谷用电量(kWh)" align="center" min-width="130"></el-table-column>
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
          </template>
          <div v-else class="ele-detail__chart" v-loading="isLoadingEleReport">
            <detail-bar-chart
              v-if="!isLoadingEleReport"
              :data="detailBarData"
              :custom-props="{
                xAxisName: searchData.dateType === 2 ? '日' : '月',
                yAxisName: 'kWh'
              }"
            ></detail-bar-chart>
          </div>
        </div>
      </eg-box>
    </div>
  </div>
</template>

<script>
  import './ele.scss'
  import Icons from '@/assets/icon/main'
  import { createNamespacedHelpers } from 'vuex'
  import OverviewBlock from 'overview-block'
  import TotalPieChart from '@/components/simple-pie-chart'
  import DetailBarChart from '@/components/multi-bar-chart'
  const { mapGetters, mapActions, mapState } = createNamespacedHelpers('statement/ele')
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
        currentPage: 1,
        detailTabIndex: 'table'
      }
    },
    components: { OverviewBlock, TotalPieChart, DetailBarChart },
    computed: {
      ...mapState([
        'searchData',
        'searchRoomList',
        'isLoadingEleReport',
        'reportList',
        'reportTotal',
        'pieData',
        'detailBarData'
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
      paginationData () {
        return this.reportList.slice(this.pageSize * (this.currentPage - 1), this.pageSize * this.currentPage)
      }
    },
    methods: {
      ...mapActions([
        'updateStateData',
        'updateObjectData',
        'getEleReport',
        'exportExcel'
      ]),
      nodeOnChange (value) {
        this.updateStateData({ item: 'currentNode', value })
        this.search()
      },
      search () {
        this.currentPageOnChange(1)
        this.getEleReport()
      },
      searchDataOnChange (key, value) {
        this.updateObjectData({ obj: 'searchData', item: key, value })
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
          this.search()
        }
      },
      'searchData.dateType' (newValue, oldValue) {
        if (!isEmpty(newValue) && newValue !== oldValue) {
          this.search()
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
        this.search()
      }
    },
    beforeDestroy () {}
  }
</script>
