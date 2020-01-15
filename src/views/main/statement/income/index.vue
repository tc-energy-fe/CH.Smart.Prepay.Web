<template>
  <div class="main-container statement-income has-search">
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
      <div class="income-content__search">
        <el-radio-group
          :value="searchData.dateType"
          @input="searchDataOnChange('dateType', $event)"
        >
          <el-radio-button :label="3">日</el-radio-button>
          <el-radio-button :label="2">月</el-radio-button>
          <el-radio-button :label="1">年</el-radio-button>
        </el-radio-group>
        <el-date-picker
          :key="searchData.dateType"
          :editable="false"
          :clearable="false"
          :value="searchData.date"
          :format="dateFormat"
          :type="searchData.dateType === 1 ? 'year' : searchData.dateType === 2 ? 'month' : 'date'"
          @input="searchDataOnChange('date', $event)"
        ></el-date-picker>
        <eg-button @click="search">查询</eg-button>
      </div>
      <eg-box title="汇总统计" class="income-statistic">
        <div class="income-statistic__content" slot="content">
          <div class="income-statistic__content--left">
            <total-pie-chart v-if="!isLoadingPayData" :data="pieData" unit="元"></total-pie-chart>
          </div>
          <div class="income-statistic__content--right">
            <el-table :data="totalTableData">
              <el-table-column prop="name" label="类型" align="center"></el-table-column>
              <el-table-column prop="value" label="金额(元)" align="center">
                <template slot-scope="{ row, $index }">
                  <span :style="$index === totalTableData.length - 1 ? 'color: #f56c6c;' : ''">{{row.value | currency}}</span>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </eg-box>
      <eg-box title="明细报表" class="income-detail">
        <eg-button slot="headerRight" @click="exportExcel">导出</eg-button>
        <div class="income-detail__content" slot="content">
          <div class="income-detail__header--center">
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
            <el-table :data="paginationData">
              <el-table-column prop="DateText" label="时间" align="center"></el-table-column>
              <el-table-column prop="Total" label="总收入(元)" align="center"></el-table-column>
              <el-table-column prop="Weixin" label="微信收入(元)" align="center"></el-table-column>
              <el-table-column prop="Alipay" label="支付宝收入(元)" align="center"></el-table-column>
              <el-table-column prop="Cash" label="现金收入(元)" align="center"></el-table-column>
              <el-table-column prop="Refund" label="退费金额(元)" align="center"></el-table-column>
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
          <div v-else class="income-detail__chart">
            <detail-bar-chart
              :data="detailBarData"
              :custom-props="{
                xAxisName: barUnit,
                yAxisName: '元'
              }"
            ></detail-bar-chart>
          </div>
        </div>
      </eg-box>
    </div>
  </div>
</template>

<script>
  import './income.scss'
  import TotalPieChart from '@/components/simple-pie-chart'
  import DetailBarChart from '@/components/multi-bar-chart'
  import { createNamespacedHelpers } from 'vuex'
  const { mapGetters, mapActions, mapState } = createNamespacedHelpers('statement/income')
  export default {
    name: 'statement-income',
    data () {
      return {
        detailTabIndex: 'table',
        currentPage: 1,
        pageSize: 5
      }
    },
    components: { TotalPieChart, DetailBarChart },
    computed: {
      ...mapState([
        'searchData',
        'totalTableData',
        'pieData',
        'isLoadingPayData',
        'reportList',
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
      },
      barUnit () {
        let type = this.searchData.dateType
        return type === 3 ? '时' : type === 2 ? '日' : '月'
      }
    },
    methods: {
      ...mapActions([
        'updateStateData',
        'updateObjectData',
        'getPayData',
        'exportExcel'
      ]),
      search () {
        this.getPayData()
      },
      nodeOnChange (value) {
        this.updateStateData({ item: 'currentNode', value })
        this.search()
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
    beforeDestroy () {
      this.updateStateData({ item: 'currentNode', value: {} })
    }
  }
</script>
