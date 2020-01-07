<template>
  <div ref="chart" style="width: 100%;height: 100%"></div>
</template>

<script>
  import Echarts from 'echarts/lib/echarts'
  export default {
    name: 'SingleLineChart',
    props: {
      data: {
        type: [Array, Object],
        required: true
      },
      customProps: {
        type: Object,
        default: () => ({
          xAxisName: '',
          yAxisName: '',
          grid: [10, 10, 20, 20]
        })
      }
    },
    methods: {
      draw () {
        let props = this.customProps
        let options = {
          color: window.colorArr,
          tooltip: {
            trigger: 'axis'
          },
          grid: {
            containLabel: true
          },
          xAxis: {
            name: props.xAxisName || '',
            type: 'category',
            axisTick: {
              show: false
            },
            splitLine: {
              show: false
            },
            axisLabel: {
              interval: 0,
              rotate: 0,
              color: '#5e5e5e'
            },
            data: this.data.map(d => d.name)
          },
          yAxis: {
            name: props.yAxisName || '',
            type: 'value',
            axisTick: {
              show: false
            },
            splitLine: {
              show: false
            },
            axisLabel: {
              color: '#5e5e5e'
            }
          },
          series: [{
            name: '用电量',
            type: 'line',
            data: this.data,
            smooth: true
          }]
        }
        if (props.grid) {
          options.grid = {
            containLabel: true,
            top: props.grid[0],
            bottom: props.grid[1],
            left: props.grid[2],
            right: props.grid[3]
          }
        } else {
          options.grid = {
            containLabel: true,
            top: 10,
            bottom: 10,
            left: 20,
            right: 40
          }
        }
        let chart = Echarts.init(this.$refs.chart)
        chart.setOption(options)
        this.chart = chart
      },
      resize () {
        this.chart && this.chart.resize()
      }
    },
    watch: {
      data (newValue) {
        if (!isEmpty(newValue)) {
          this.draw()
        }
      }
    },
    mounted () {
      this.draw()
      window.addEventListener('resize', this.resize)
    },
    beforeDestroy () {
      window.removeEventListener('resize', this.resize)
      this.chart.dispose()
    }
  }
</script>
