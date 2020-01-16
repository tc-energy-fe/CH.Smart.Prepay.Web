<template>
  <div class="main-container has-search status-emeter">
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
      <div class="emeter-overview">
        <overview-block
          class="emeter-overview__item"
          :icon="Icons.total"
          unit="个"
          name="电表总数"
          :color="{left: '#cfe0ff', right: 'white', text: '#3d7dff'}"
          :text="emeterStaticData.Total"
        />
        <overview-block
          class="emeter-overview__item"
          :icon="Icons.switchOff"
          unit="个"
          name="开闸数"
          :color="{left: '#bfefbb', right: 'white', text: '#67c23a'}"
          :text="emeterStaticData.OFF"
        />
        <overview-block
          class="emeter-overview__item"
          :icon="Icons.switchOn"
          unit="个"
          name="合闸数"
          :color="{left: '#cfe0ff', right: 'white', text: '#3d7dff'}"
          :text="emeterStaticData.ON"
        />
        <overview-block
          class="emeter-overview__item"
          :icon="Icons.frozen"
          unit="个"
          name="冻结异常数"
          :color="{left: '#f9cfcf', right: 'white', text: '#f56c6c'}"
          :text="emeterStaticData.FrozenException"
        />
      </div>
      <div class="emeter-list">
        <eg-box>
          <template v-slot:headerLeft>
            <eg-input
              :value="searchName"
              @input="updateStateData({item: 'searchName', value: $event})"
              placeholder="房间编号/名称搜索"
            />
            <el-select
              :value="searchEMeterState"
              @input="updateStateData({item: 'searchEMeterState', value: $event})"
              placeholder="电表状态"
            >
              <el-option
                v-for="(item, index) of searchEMeterStateOptions"
                :label="item.label"
                :value="item.value"
                :key="index"
              />
            </el-select>
            <el-select
              :value="searchFrozenState"
              @input="updateStateData({item: 'searchFrozenState', value: $event})"
              placeholder="冻结状态"
            >
              <el-option
                v-for="(item, index) of searchFrozenStateOptions"
                :label="item.label"
                :value="item.value"
                :key="index"
              />
            </el-select>
            <eg-button @click="searchClick">查询</eg-button>
          </template>
          <template v-slot:content>
            <el-table
              :data="emeterList"
              row-key="DeviceId"
              v-loading="isLoadingEMeterList"
            >
              <el-table-column prop="RoomFullName" label="房间信息" align="center" />
              <el-table-column prop="DeviceSN" label="电表" align="center" />
              <el-table-column prop="" label="最大功率(W)" align="center" />
              <el-table-column prop="CurrentP" label="当前功率(W)" align="center" />
              <el-table-column prop="CurrentVA" label="当前电压(V)" align="center" />
              <el-table-column prop="CurrentAA" label="当前电流(A)" align="center" />
              <el-table-column prop="KeepStateText" label="保电状态" align="center" />
              <el-table-column prop="EMeterStateText" label="电表状态" align="center" />
              <el-table-column prop="FrozenStateText" label="冻结状态" align="center" />
              <el-table-column prop="DataTimeText" label="更新时间" align="center" />
            </el-table>
            <el-pagination
              background
              :current-page="currentPage"
              :page-size="pageSize"
              :total="totalCount"
              :page-sizes="[10, 15, 20, 25]"
              layout="total, ->, prev, pager, next, sizes"
              @current-change="handleCurrentPageChange"
              @size-change="handlePageSizeChange"
            />
          </template>
        </eg-box>
      </div>
    </div>
  </div>
</template>

<script>
  import Icons from '@/assets/icon/main'
  import Vuex from 'vuex'
  import OverviewBlock from '@/components/overview-block/index'
  const { mapGetters, mapActions, mapState } = Vuex.createNamespacedHelpers('status/emeter')
  export default {
    name: 'status-emeter',
    data () {
      return {
        Icons: {
          total: Icons.icon_meter_total,
          switchOff: Icons.tab_icon_open,
          switchOn: Icons.tab_icon_close,
          frozen: Icons.tab_icon_alarm
        }
      }
    },
    components: { OverviewBlock },
    computed: {
      ...mapState([
        'searchName',
        'searchEMeterState',
        'searchFrozenState',
        'searchEMeterStateOptions',
        'searchFrozenStateOptions',
        'emeterList',
        'currentPage',
        'pageSize',
        'totalCount',
        'isLoadingEMeterList',
        'emeterStaticData'
      ]),
      ...mapGetters([
        'currentNodeId'
      ]),
      ...Vuex.mapState({
        groupTree: 'mainGroupTreeHasRoot',
        isLoadingMainGroupList: 'isLoadingMainGroupList'
      })
    },
    methods: {
      ...mapActions([
        'getEMeterStatusList',
        'getEMeterStatic',
        'updateStateData'
      ]),
      handleCurrentNodeChange (data) {
        this.updateStateData({ item: 'currentNode', value: data })
        this.searchClick()
      },
      handleCurrentPageChange (current) {
        this.updateStateData({ item: 'currentPage', value: current })
        this.getEMeterStatusList()
      },
      handlePageSizeChange (size) {
        this.updateStateData({ item: 'pageSize', value: size })
        this.searchClick()
      },
      searchClick () {
        this.handleCurrentPageChange(1)
      },
      searchMethod () {
        this.getEMeterStatic()
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

<style src="./emeter.scss" lang="scss" scoped />
