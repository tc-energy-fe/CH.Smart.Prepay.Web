<template>
  <div class="main-container has-search warn-time">
    <div class="main-search">
      <h4 class="main-search__title">选择区域</h4>
      <div class="tree-wrapper" v-loading="isLoadingMainGroupList">
        <el-tree
          v-if="!isLoadingMainGroupList"
          class="group-tree"
          ref="tree"
          :data="groupTree"
          node-key="value"
          :current-node-key="currentNodeId"
          default-expand-all
          :highlight-current="true"
          :expand-on-click-node="false"
          @current-change="handleCurrentNodeChange"
        />
      </div>
    </div>
    <div class="main-content">
      <eg-box>
        <template v-slot:headerLeft>
          <eg-input
            :value="searchName"
            @input="updateStateData({item: 'searchName', value: $event})"
            placeholder="报警名称搜索"
          />
          <el-select
            :value="searchWarnType"
            @input="updateStateData({item: 'searchWarnType', value: $event})"
            placeholder="报警类型"
          >
            <el-option
              v-for="(item, index) of searchWarnTypeOptions"
              :label="item.label"
              :value="item.value"
              :key="index"
            />
          </el-select>
          <eg-input
            :value="searchWarnObject"
            @input="updateStateData({item: 'searchWarnObject', value: $event})"
            placeholder="报警对象搜索"
          />
          <eg-button @click="searchClick">查询</eg-button>
        </template>
        <template v-slot:content>
          <div class="warn-info">
            <p>
              网关离线：
              <span>{{warnStaticData.GatewayOffline}}</span>
            </p>
            <p>
              冻结异常：
              <span>{{warnStaticData.FrozenErr}}</span>
            </p>
          </div>
          <el-table :data="warnListPagination" v-loading="isLoadingWarnList">
            <el-table-column prop="Name" label="报警名称" align="center" />
            <el-table-column prop="TypeText" label="报警类型" align="center" />
            <el-table-column prop="OwnName" label="报警对象" align="center" />
            <el-table-column prop="ProduceTimeText" label="报警时间" align="center" />
          </el-table>
          <el-pagination
            background
            :current-page="currentPage"
            :page-size="pageSize"
            :total="warnList.length"
            :page-sizes="[10, 15, 20, 25]"
            layout="total, ->, prev, pager, next, sizes"
            @current-change="handleCurrentPageChange"
            @size-change="handlePageSizeChange"
          />
        </template>
      </eg-box>
    </div>
  </div>
</template>

<script>
  import Vuex from 'vuex'
  const { mapState, mapGetters, mapActions } = Vuex.createNamespacedHelpers('warn/time')
  export default {
    name: 'WarnTime',
    data () {
      return {
      }
    },
    components: {},
    computed: {
      ...mapState([
        'searchName',
        'searchWarnType',
        'searchWarnTypeOptions',
        'searchWarnObject',
        'warnList',
        'currentPage',
        'pageSize',
        'isLoadingWarnList',
        'warnStaticData'
      ]),
      ...mapGetters([
        'currentNodeId',
        'warnListPagination'
      ]),
      ...Vuex.mapState({
        isLoadingMainGroupList: 'isLoadingMainGroupList',
        groupTree: 'mainGroupTreeHasRoot'
      }),
      ...Vuex.mapGetters({
      })
    },
    methods: {
      ...mapActions([
        'getWarnList',
        'getWarnTypeList',
        'getWarnStaticData',
        'updateStateData'
      ]),
      handleCurrentNodeChange (data) {
        this.updateStateData({ item: 'currentNode', value: data })
        this.searchMethod()
      },
      handleCurrentPageChange (current) {
        this.updateStateData({ item: 'currentPage', value: current })
      },
      handlePageSizeChange (size) {
        this.handleCurrentPageChange(1)
        this.updateStateData({ item: 'pageSize', value: size })
      },
      searchClick () {
        this.handleCurrentPageChange(1)
        this.getWarnTypeList()
        this.getWarnList()
      },
      searchMethod () {
        this.getWarnStaticData()
        this.searchClick()
      }
    },
    watch: {
      groupTree (newValue, oldValue) {
        if (newValue.length && newValue !== oldValue) {
          this.updateStateData({ item: 'currentNode', value: newValue[0] || {} })
          this.searchMethod()
        }
      }
    },
    created () {
      if (this.groupTree.length) {
        if (isEmpty(this.currentNodeId)) {
          this.updateStateData({ item: 'currentNode', value: this.groupTree[0] || {} })
        }
        this.searchMethod()
      }
    },
    beforeDestroy () {
    }
  }
</script>

<style scoped src="./time.scss" lang="scss" />
