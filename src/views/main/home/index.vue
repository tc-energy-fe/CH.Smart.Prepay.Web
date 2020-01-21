<template>
  <div class="home main-container">
    <div class="home__block home-status">
      <eg-box title="运行状态">
        <template v-slot:content>
          <div class="home-status--up">
            <div class="home-status__block">
              <p>
<!--                <i class="iconfont icon-content_icon_gateway"></i>-->
                <img :src="Icons.gateway">
                <span>网关状态</span>
              </p>
              <div class="home-status__content">
                <div class="home-status__item">
                  <p>
                    <span class="num" style="color: #3d7dff;">{{gatewayStatus.Total | miss}}</span>
                    <span class="unit">个</span>
                  </p>
                  <p>总数</p>
                </div>
                <div class="home-status__item">
                  <p>
                    <span class="num" style="color: #67c23a;">{{gatewayStatus.Online | miss}}</span>
                    <span class="unit">个</span>
                  </p>
                  <p>在线数</p>
                </div>
                <div class="home-status__item">
                  <p>
                    <span class="num" style="color: #f56c6c;">{{gatewayStatus.Offline | miss}}</span>
                    <span class="unit">个</span>
                  </p>
                  <p>离线数</p>
                </div>
              </div>
            </div>
          </div>
          <div class="home-status--down">
            <div class="home-status__block">
              <p>
                <i class="iconfont icon-content_icon_meter"></i>
                <span>电表状态</span>
              </p>
              <div class="home-status__content">
                <div class="home-status__content">
                  <div class="home-status__item">
                    <p>
                      <span class="num" style="color: #3d7dff;">{{emeterStatus.Total | miss}}</span>
                      <span class="unit">个</span>
                    </p>
                    <p>总数</p>
                  </div>
                  <div class="home-status__item">
                    <p>
                      <span class="num" style="color: #67c23a;">{{emeterStatus.ON | miss}}</span>
                      <span class="unit">个</span>
                    </p>
                    <p>合闸数</p>
                  </div>
                  <div class="home-status__item">
                    <p>
                      <span class="num" style="color: #f56c6c;">{{emeterStatus.OFF | miss}}</span>
                      <span class="unit">个</span>
                    </p>
                    <p>开闸数</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </eg-box>
    </div>
    <div class="home__block home-income">
      <eg-box title="营收统计">
        <template v-slot:content>
          <div class="home-income__total">
            <div class="home-income__total-item">
              <p class="label">累计消费电量</p>
              <p><span class="num">{{incomeEleData.TotalDelta}}</span><span class="unit">kWh</span></p>
            </div>
            <div class="home-income__total-item">
              <p class="label">累计电费支出</p>
              <p><span class="num">{{incomeEleData.TotalCost}}</span><span class="unit">元</span></p>
            </div>
            <div class="home-income__total-item">
              <p class="label">累计电费收入</p>
              <p><span class="num">{{incomeEleData.TotalIncome}}</span><span class="unit">元</span></p>
            </div>
          </div>
          <div class="home-income__total-period">
            <div class="period--left">
              <el-radio-group :value="incomeDateType" @input="incomeDateTypeOnChange">
                <el-radio-button :label="3">今日收入</el-radio-button>
                <el-radio-button :label="2">本月收入</el-radio-button>
                <el-radio-button :label="1">本年收入</el-radio-button>
              </el-radio-group>
              <div class="period-total">
                <p class="period-total__time">{{incomeData.Start}} - {{incomeData.End}}</p>
                <p class="period-total__num">
                  <span class="num">{{incomeData.TotalIncome | currency}}</span><span class="unit">元</span>
                </p>
                <p class="period-total--bottom">
                  <span style="float: left;">收入合计 <span style="color: #3d7dff">{{incomeData.Total | currency}}</span> 元</span>
                  <span style="float: right;">退费金额 <span style="color: #f56c6c">{{incomeData.RefundTotal | currency}}</span> 元</span>
                </p>
              </div>
            </div>
            <div class="period--right">
              <income-pie-chart :data="incomeChartData" unit="元" :custom-props="{ startAngle: 0, radius: ['45%', '55%'] }"></income-pie-chart>
            </div>
          </div>
        </template>
      </eg-box>
    </div>
    <div class="home__block home-warn">
      <eg-box title="预警统计">
        <warn-bar-chart slot="content" :data="warnData"></warn-bar-chart>
      </eg-box>
    </div>
    <div class="home__block home-trend">
      <eg-box title="电量趋势">
        <div class="home-trend__content" slot="content">
          <el-radio-group :value="trendDateType" @input="trendDateTypeOnChange">
            <el-radio-button :label="2">本月趋势</el-radio-button>
            <el-radio-button :label="1">本年趋势</el-radio-button>
          </el-radio-group>
          <ele-line-chart
            class="home-trend__chart"
            :data="eleTrendData"
            :custom-props="{
              xAxisName: trendDateType === 2 ? '日' : '月',
              yAxisName: 'kWh'
            }"
          ></ele-line-chart>
        </div>
      </eg-box>
    </div>
  </div>
</template>

<script>
  import './home.scss'
  import Icons from '@/assets/icon/main'
  import IncomePieChart from '@/components/simple-pie-chart'
  import WarnBarChart from './components/warn-bar-chart'
  import EleLineChart from '@/components/single-line-chart'
  import { createNamespacedHelpers } from 'vuex'
  const { mapGetters, mapActions, mapState } = createNamespacedHelpers('home')
  export default {
    name: 'home',
    data () {
      return {
        Icons: {
          gateway: Icons.content_icon_gateway
        }
      }
    },
    components: { IncomePieChart, WarnBarChart, EleLineChart },
    computed: {
      ...mapState([
        'gatewayStatus',
        'emeterStatus',
        'incomeDateType',
        'incomeData',
        'incomeEleData',
        'incomeChartData',
        'warnData',
        'trendDateType',
        'eleTrendData'
      ]),
      ...mapGetters([]),
      projectId () {
        return this.$store.state.areaId
      }
    },
    methods: {
      ...mapActions([
        'getGatewayStatus',
        'getEmeterStatus',
        'updateFormData',
        'getIncomeData',
        'abortAllRequests',
        'getWarnData',
        'getIncomeEle',
        'getEleTrendData'
      ]),
      incomeDateTypeOnChange (value) {
        this.updateFormData({ item: 'incomeDateType', value })
        this.getIncomeData()
      },
      trendDateTypeOnChange (value) {
        this.updateFormData({ item: 'trendDateType', value })
        this.getEleTrendData()
      }
    },
    watch: {
      projectId (newValue) {
        if (!isEmpty(newValue)) {
          this.getGatewayStatus()
          this.getEmeterStatus()
          this.getIncomeEle()
          this.getIncomeData()
          this.getWarnData()
          this.getEleTrendData()
        }
      }
    },
    created () {
      if (!isEmpty(this.projectId)) {
        this.getGatewayStatus()
        this.getEmeterStatus()
        this.getIncomeEle()
        this.getIncomeData()
        this.getWarnData()
        this.getEleTrendData()
      }
    },
    beforeDestroy () {
      this.abortAllRequests()
    }
  }
</script>
