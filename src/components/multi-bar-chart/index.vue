<template>
  <div ref="chart" style="width: 100%;height: 100%"></div>
</template>

<script>
  import Echarts from 'echarts/lib/echarts'
  export default {
    name: 'MultiBarChart',
    props: {
      data: {
        type: Array,
        required: true
      },
      customProps: {
        type: Object,
        default: () => ({
          xAxisName: '',
          yAxisName: ''
        })
      }
    },
    methods: {
      draw () {
        let data = this.data || []
        let props = this.customProps
        let options = {
          color: window.colorArr,
          tooltip: {
            trigger: 'axis'
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
            data: data[0] ? data[0].data.map(d => d.label) : []
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
          series: data.map(d => ({
            name: d.name,
            type: 'bar',
            data: d.data,
            stack: 'money',
            barWidth: 20
          }))
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
      data (newValue, oldValue) {
        if (!isEmpty(newValue) && newValue !== oldValue) {
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
