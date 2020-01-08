<template>
  <div class="main-container has-search status-batch">
    <div class="main-search">
      <h4>选择区域</h4>
      <el-tree
        :data="[]"
        default-expand-all
      />
    </div>
    <div class="main-content">
      <div class="status-batch__tab">
        <el-radio-group v-model="tabIndex">
          <el-radio-button :label="2">超功率设置</el-radio-button>
          <el-radio-button :label="0">保电设置</el-radio-button>
          <el-radio-button :label="1">开合闸设置</el-radio-button>
        </el-radio-group>
      </div>
      <div class="status-batch__content">
        <template v-if="tabIndex === 2">
        </template>
        <template v-if="tabIndex === 0">
          <eg-box>
            <template v-slot:headerLeft>
              <eg-input placeholder="房间编号/名称搜索"/>
              <el-select :value="1" placeholder="保电方式">
                <el-option
                  v-for="(item, index) of []"
                  :label="item.label"
                  :value="item.value"
                  :key="index"
                />
              </el-select>
              <el-select :value="1" placeholder="保电状态">
                <el-option
                  v-for="(item, index) of []"
                  :label="item.label"
                  :value="item.value"
                  :key="index"
                />
              </el-select>
              <eg-button>查询</eg-button>
            </template>
            <template v-slot:headerRight>
              <eg-button>批量设置</eg-button>
            </template>
            <template v-slot:content>
              <el-table :data="[]">
                <el-table-column prop="Name" label="房间信息" align="center" />
                <el-table-column prop="WarnValueText" label="电表" align="center" />
                <el-table-column prop="OffTypeText" label="保电方式" align="center" />
                <el-table-column prop="StatusText" label="保电状态" align="center" />
                <el-table-column label="操作" align="center">
                  <template v-slot="{row}">
                    <eg-button type="text" >保电设置</eg-button>
                  </template>
                </el-table-column>
              </el-table>
              <el-pagination
                background
                :current-page="currentPageEle"
                :page-size="pageSizeEle"
                :total="totalCountEle"
                layout="total, ->, prev, pager, next"
              />
            </template>
          </eg-box>
        </template>
        <template v-if="tabIndex === 1">
        </template>
      </div>
    </div>
  </div>
</template>

<script>
  import { createNamespacedHelpers } from 'vuex'
  const { mapState, mapGetters, mapActions } = createNamespacedHelpers('status/batch')
  export default {
    name: 'Batch',
    data () {
      return {
        tabIndex: 0
      }
    },
    components: {},
    computed: {
      ...mapState([
        'currentPageEle',
        'pageSizeEle',
        'totalCountEle'
      ]),
      ...mapGetters([
      ])
    },
    methods: {
      ...mapActions([
      ])
    },
    watch: {
    },
    created () {
    },
    beforeDestroy () {
    }
  }
</script>

<style scoped src="./batch.scss" lang="scss"/>
