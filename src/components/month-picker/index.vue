<template>
  <el-popover
    :placement="position"
    trigger="click"
    v-model="visible"
  >
    <table class="month-range-panel">
      <tbody>
        <tr v-for="(row, rindex) in rows" :key="rindex">
          <td v-for="(cell, cindex) in row" :class="getCellClass(cell)"  :key="cindex">
            <div @click.stop="cellOnClick(cell)" @mouseenter="cellOnMouseOver(cell)">
              <p class="cell">{{months[cell.text]}}</p>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    <div
      class="month-range-editor"
      :style="{width: width + 'rem'}"
      slot="reference"
    >
      <span
        class="month-range-month"
        v-if="displayValue[0]"
      >
        {{displayValue[0]}}月
      </span>
      <span v-else class="month-range-placeholder">{{startPlaceholder}}</span>
      <span class="month-range-separator">至</span>
      <span
        v-if="displayValue[1]"
        class="month-range-month"
      >
        {{displayValue[1]}}月
      </span>
      <span v-else class="month-range-placeholder">{{endPlaceholder}}</span>
    </div>
  </el-popover>
</template>

<script>
  export default {
    name: 'month-range-picker',
    props: {
      width: {
        type: [Number, String],
        default: 11.25
      },
      startPlaceholder: {
        type: String,
        default: '开始月份'
      },
      endPlaceholder: {
        type: String,
        default: '结束月份'
      },
      value: {
        type: Array,
        default: () => []
      },
      position: {
        type: String,
        default: 'bottom'
      }
    },
    data () {
      return {
        months: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
        tableRows: [[], [], []],
        startMonth: null,
        endMonth: null,
        mouseOverStartMonth: null,
        selecting: false,
        visible: false
      }
    },
    computed: {
      displayValue () {
        return [
          this.value[0] || '',
          this.value[1] || ''
        ]
      },
      rows () {
        let rows = this.tableRows
        for (let outer = 0; outer < 3; ++outer) {
          let row = rows[outer]
          for (let inner = 0; inner < 4; ++inner) {
            let cell = row[inner]
            if (!cell) {
              cell = { row: outer, column: inner, inRange: false, start: false, end: false }
            }
            let startMonth = this.startMonth
            let endMonth = this.endMonth
            const index = outer * 4 + inner
            const month = index + 1
            cell.start = startMonth && month === startMonth
            cell.end = endMonth && month === endMonth
            cell.inRange = (startMonth && endMonth) && (month <= endMonth && month >= startMonth)
            cell.text = index
            this.$set(row, inner, cell)
          }
        }
        return rows
      }
    },
    methods: {
      getCellClass (cell) {
        let classes = []
        if (cell.inRange) {
          classes.push('in-range')
        }
        if (cell.start) {
          classes.push('start-date')
        }
        if (cell.end) {
          classes.push('end-date')
        }
        return classes
      },
      cellOnClick (cell) {
        let month = cell.text + 1
        if (!this.selecting) {
          this.selecting = true
          this.startMonth = month
          this.endMonth = month
          this.mouseOverStartMonth = month
        } else {
          this.selecting = false
          this.$emit('input', [this.startMonth, this.endMonth])
          this.visible = false
        }
      },
      cellOnMouseOver (cell) {
        if (!this.selecting) return

        let month = cell.text + 1
        let endMonth = this.mouseOverStartMonth
        if (month >= endMonth) {
          this.startMonth = endMonth
          this.endMonth = month
        } else {
          this.startMonth = month
          this.endMonth = endMonth
        }
      }
    },
    mounted () {
      this.startMonth = this.displayValue[0]
      this.endMonth = this.displayValue[1]
    }
  }
</script>

<style lang="scss" src="./month-picker.scss" scoped></style>
