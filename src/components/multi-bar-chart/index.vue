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
        default: () => ({})
      },
      unit: String
    },
    methods: {
      draw () {
        let _this = this
        let data = this.data || []
        let props = this.customProps
        let options = {
          color: window.colorArr,
          tooltip: {
            trigger: 'axis',
            padding: 10,
            formatter (params) {
              let html = `<span style="padding-left: 1rem">${params[0].data.label}</span>`
              let circle = (color) => `<span style="display:inline-block;width: .8rem;height: .8rem;background-color: ${color};border-radius: .4rem"></span>`
              params.forEach(p => {
                html += '<br/>'
                html += `${circle(p.color)}<span style="padding: 0 .5rem;">${p.seriesName}</span>
                  <span>${p.value}${_this.unit || props.yAxisName || ''}</span>`
              })
              return html
            }
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
            data: data[0] ? data[0].data.map(d => d.xAxis) : []
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
            top: 30,
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
