<template>
  <div ref="chart" style="width: 100%;height: 100%"></div>
</template>

<script>
  import Echarts from 'echarts/lib/echarts'
  export default {
    name: 'SimplePieChart',
    props: {
      data: {
        type: Array,
        required: true
      }
    },
    methods: {
      draw () {
        let data = this.data || []
        let options = {
          color: '#3d7dff',
          grid: {
            containLabel: true,
            left: 20,
            right: 40
          },
          xAxis: {
            name: '',
            type: 'value',
            axisLine: {
              show: false
            },
            axisTick: {
              show: false
            },
            splitLine: {
              show: false
            },
            axisLabel: {
              show: false
            }
          },
          yAxis: {
            name: '',
            type: 'category',
            axisLine: {
              show: false
            },
            axisTick: {
              show: false
            },
            splitLine: {
              show: false
            },
            axisLabel: {
              color: '#5e5e5e'
            },
            data: data.map(d => d.name)
          },
          series: {
            type: 'bar',
            barWidth: 15,
            data: data.map(d => d.value),
            label: {
              show: true,
              position: 'right',
              formatter: '{c}条',
              color: '#5e5e5e'
            },
            itemStyle: {
              barBorderRadius: 10
            }
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
