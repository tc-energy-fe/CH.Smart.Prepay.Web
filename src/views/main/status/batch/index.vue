<template>
  <div class="main-container has-search status-batch">
    <div class="main-search">
      <h4 class="main-search__title">选择区域</h4>
      <div class="tree-wrapper" v-loading="isLoadingMainGroupList">
        <el-tree
          v-if="!isLoadingMainGroupList"
          class="group-tree"
          ref="tree"
          :data="mainGroupTree"
          node-key="value"
          :current-node-key="currentNodeId"
          default-expand-all
          :highlight-current="true"
          :expand-on-click-node="false"
        />
      </div>
    </div>
    <div class="main-content">
      <div class="status-batch__tab">
        <el-radio-group v-model="tabIndex">
          <el-radio-button :label="2" disabled>超功率设置</el-radio-button>
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
                :current-page="currentPageKeep"
                :page-size="pageSizeKeep"
                :total="totalCountKeep"
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
  import Vuex from 'vuex'
  const { mapState, mapGetters, mapActions } = Vuex.createNamespacedHelpers('status/batch')
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
        'currentPageKeep',
        'pageSizeKeep',
        'totalCountKeep'
      ]),
      ...mapGetters([
        'currentNodeId'
      ]),
      ...Vuex.mapState([
        'mainGroupTree',
        'isLoadingMainGroupList'
      ])
    },
    methods: {
      ...mapActions([
        'updateStateData'
      ])
    },
    watch: {
      mainGroupTree (newValue, oldValue) {
        if (newValue.length) {
          // this.$nextTick(function () {
          //   this.$refs.tree.setCurrentKey(newValue[0].value)
          // })
          this.updateStateData({ item: 'currentNode', value: newValue[0] || {} })
        }
      }
    },
    created () {
      if (this.mainGroupTree.length) {
        // this.$nextTick(function () {
        //   this.$refs.tree.setCurrentKey(this.currentNodeId)
        // })
        if (isEmpty(this.currentNodeId)) {
          this.updateStateData({ item: 'currentNode', value: this.mainGroupTree[0] || {} })
        }
      }
    },
    beforeDestroy () {
    }
  }
</script>

<style scoped src="./batch.scss" lang="scss"/>
