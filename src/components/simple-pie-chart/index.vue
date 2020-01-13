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
      },
      customProps: {
        type: Object,
        default: () => {}
      },
      unit: {
        type: String,
        default: 'kWh'
      }
    },
    methods: {
      draw () {
        let data = this.data || []
        let props = this.customProps || {}
        let options = {
          color: window.colorArr,
          grid: {
            containLabel: true
          },
          legend: {
            orient: 'horizontal',
            bottom: 0,
            icon: 'rect',
            data: data.map(d => d.name)
          },
          series: [{
            name: '用电量',
            type: 'pie',
            data: data,
            radius: ['55%', '65%'],
            center: ['50%', '45%'],
            label: {
              formatter: `{b} {c} ${this.unit}`
            }
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
            bottom: 40,
            left: 20,
            right: 20
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
