<template>
  <div class="main-container has-search status-batch">
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
      <div class="status-batch__tab">
        <el-radio-group :value="settingType" @input="updateStateData({item: 'settingType', value: $event})">
          <el-radio-button
            v-for="(item, index) of settingTypeRadioList"
            :label="item.label"
            :key="index"
            :disabled="item.disabled"
          >
            {{item.text}}
          </el-radio-button>
        </el-radio-group>
      </div>
      <div class="status-batch__content">
        <template v-if="settingTypeIsPower">
        </template>
        <template v-if="settingTypeIsKeep">
          <eg-box key="keep">
            <template v-slot:headerLeft>
              <eg-input
                :value="searchNameKeep"
                @input="updateStateData({item: 'searchNameKeep', value: $event})"
                placeholder="房间编号/名称搜索"
              />
              <el-select
                :value="searchKeepType"
                @input="updateStateData({item: 'searchKeepType', value: $event})"
                placeholder="保电方式"
              >
                <el-option
                  v-for="(item, index) of searchKeepTypeOptions"
                  :label="item.label"
                  :value="item.value"
                  :key="index"
                />
              </el-select>
              <el-select
                :value="searchKeepState"
                @input="updateStateData({item: 'searchKeepState', value: $event})"
                placeholder="保电状态"
              >
                <el-option
                  v-for="(item, index) of searchKeepStateOptions"
                  :label="item.label"
                  :value="item.value"
                  :key="index"
                />
              </el-select>
              <eg-button @click="getDeviceCtrlKeepList">查询</eg-button>
            </template>
            <template v-slot:headerRight>
              <eg-button>批量设置</eg-button>
            </template>
            <template v-slot:content>
              <el-table :data="keepList" v-loading="isLoadingKeepList">
                <el-table-column type="selection" align="center" />
                <el-table-column prop="RoomFullName" label="房间信息" align="center" />
                <el-table-column prop="DeviceSN" label="电表" align="center" />
                <el-table-column prop="KeepEleTypeText" label="保电方式" align="center" />
                <el-table-column prop="KeepStateText" label="保电状态" align="center" />
                <el-table-column width="150px" label="操作" align="center">
                  <template v-slot="{row}">
                    <eg-button type="text" @click="keepDialogVisible = true">保电设置</eg-button>
                  </template>
                </el-table-column>
              </el-table>
              <el-pagination
                background
                :current-page="currentPageKeep"
                :page-size="pageSizeKeep"
                :total="totalCountKeep"
                :page-sizes="[10, 15, 20, 25]"
                layout="total, ->, prev, pager, next, sizes"
                @current-change="handleCurrentPageChange"
                @size-change="handlePageSizeChange"
              />
            </template>
          </eg-box>
          <el-dialog
            title="保电设置"
            :visible.sync="keepDialogVisible"
            width="30rem"
            top="30vh"
          >
            <div slot="footer">
              <eg-button type="minor">取消</eg-button>
              <eg-button>下发命令</eg-button>
            </div>
          </el-dialog>
        </template>
        <template v-if="settingTypeIsSwitch">
          <eg-box key="switch">
            <template v-slot:headerLeft>
              <eg-input
                :value="searchNameSwitch"
                @input="updateStateData({item: 'searchNameSwitch', value: $event})"
                placeholder="房间编号/名称搜索"
              />
              <el-select
                :value="searchSwitchState"
                @input="updateStateData({item: 'searchSwitchState', value: $event})"
                placeholder="电表状态"
              >
                <el-option
                    v-for="(item, index) of searchSwitchStateOptions"
                  :label="item.label"
                  :value="item.value"
                  :key="index"
                />
              </el-select>
              <eg-button @click="getDeviceCtrlSwitchList">查询</eg-button>
            </template>
            <template v-slot:headerRight>
              <eg-button>批量设置</eg-button>
            </template>
            <template v-slot:content>
              <el-table :data="switchList" v-loading="isLoadingSwitchList">
                <el-table-column type="selection" align="center" />
                <el-table-column prop="RoomFullName" label="房间信息" align="center" />
                <el-table-column prop="DeviceSN" label="电表" align="center" />
                <el-table-column prop="SwitchStateText" label="电表状态" align="center" />
                <el-table-column width="150px" label="操作" align="center">
                  <template v-slot="{row}">
                    <eg-button v-if="row.SwitchState === undefined" type="text">设置</eg-button>
                    <eg-button v-else-if="row.SwitchState" type="text" color="danger">断闸</eg-button>
                    <eg-button v-else type="text" color="success">合闸</eg-button>
                  </template>
                </el-table-column>
              </el-table>
              <el-pagination
                background
                :current-page="currentPageSwitch"
                :page-size="pageSizeSwitch"
                :total="totalCountSwitch"
                :page-sizes="[10, 15, 20, 25]"
                layout="total, ->, prev, pager, next, sizes"
                @current-change="handleCurrentPageChange"
                @size-change="handlePageSizeChange"
              />
            </template>
          </eg-box>
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
        keepDialogVisible: false
      }
    },
    components: {},
    computed: {
      ...mapState([
        'settingType',
        'settingTypeRadioList',
        'searchNameKeep',
        'searchKeepType',
        'searchKeepState',
        'searchKeepTypeOptions',
        'searchKeepStateOptions',
        'searchNameSwitch',
        'searchSwitchState',
        'searchSwitchStateOptions',
        'currentPageKeep',
        'pageSizeKeep',
        'totalCountKeep',
        'currentPageSwitch',
        'pageSizeSwitch',
        'totalCountSwitch',
        'keepList',
        'switchList',
        'isLoadingSwitchList',
        'isLoadingKeepList'
      ]),
      ...mapGetters([
        'currentNodeId',
        'settingTypeIsPower',
        'settingTypeIsKeep',
        'settingTypeIsSwitch'
      ]),
      ...Vuex.mapState({
        groupTree: 'mainGroupTreeHasRoot',
        isLoadingMainGroupList: 'isLoadingMainGroupList'
      })
    },
    methods: {
      ...mapActions([
        'getDeviceCtrlKeepList',
        'getDeviceCtrlSwitchList',
        'updateStateData'
      ]),
      handleCurrentNodeChange (data) {
        this.updateStateData({ item: 'currentNode', value: data })
        this.searchMethod()
      },
      handleCurrentPageChange (current) {
        if (this.settingTypeIsKeep) {
          this.updateStateData({ item: 'currentPageKeep', value: current })
        }
        if (this.settingTypeIsSwitch) {
          this.updateStateData({ item: 'currentPageSwitch', value: current })
        }
        this.searchMethod()
      },
      handlePageSizeChange (size) {
        if (this.settingTypeIsKeep) {
          this.updateStateData({ item: 'pageSizeKeep', value: size })
        }
        if (this.settingTypeIsSwitch) {
          this.updateStateData({ item: 'pageSizeSwitch', value: size })
        }
        this.handleCurrentPageChange(1)
      },
      searchMethod () {
        if (this.settingTypeIsKeep) {
          this.getDeviceCtrlKeepList()
        }
        if (this.settingTypeIsSwitch) {
          this.getDeviceCtrlSwitchList()
        }
      }
    },
    watch: {
      groupTree (newValue, oldValue) {
        if (newValue.length && newValue !== oldValue) {
          this.updateStateData({ item: 'currentNode', value: newValue[0] || {} })
          this.handleCurrentPageChange(1)
        }
      },
      settingType () {
        this.handleCurrentPageChange(1)
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

<style scoped src="./batch.scss" lang="scss"/>
