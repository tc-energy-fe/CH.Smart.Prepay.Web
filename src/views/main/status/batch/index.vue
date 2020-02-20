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
        <eg-tab-group :value="settingType" @change="updateStateData({item: 'settingType', value: $event})">
          <eg-tab-button
            v-for="(item, index) of settingTypeRadioList"
            :label="item.label"
            :key="index"
            :disabled="item.disabled"
          >
            {{item.text}}
          </eg-tab-button>
        </eg-tab-group>
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
              <eg-button @click="searchClick">查询</eg-button>
            </template>
            <template v-slot:headerRight>
              <eg-button @click="batchKeepClick">批量设置</eg-button>
            </template>
            <template v-slot:content>
              <el-table
                :data="keepList"
                ref="keepTable"
                row-key="DeviceId"
                v-loading="isLoadingKeepList"
                @selection-change="handleSelectionChangeKeep"
              >
                <el-table-column type="selection" align="center" :reserve-selection="true" />
                <el-table-column prop="RoomFullName" label="房间信息" align="center" />
                <el-table-column prop="DeviceSN" label="电表" align="center" />
                <el-table-column prop="KeepEleTypeText" label="保电方式" align="center" />
                <el-table-column prop="KeepStateText" label="保电状态" align="center" />
                <el-table-column width="150px" label="操作" align="center">
                  <template v-slot="{row}">
                    <eg-button type="text" @click="showDialogKeep({isShow: true, row})">保电设置</eg-button>
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
            :visible="dialogVisibleKeep"
            width="30rem"
            top="30vh"
            @close="showDialogKeep({isShow: false})"
          >
            <div>
              <label style="margin-right: 1rem;">保电状态</label>
              <el-radio-group :value="keepControlState" @input="updateStateData({item: 'keepControlState', value: $event})">
                <el-radio :label="true">保电</el-radio>
                <el-radio :label="false">不保电</el-radio>
              </el-radio-group>
            </div>
            <template v-slot:footer>
              <eg-button type="minor" @click="showDialogKeep({isShow: false})">取消</eg-button>
              <eg-button @click="controlDeviceKeep">下发命令</eg-button>
            </template>
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
              <eg-button @click="searchClick">查询</eg-button>
            </template>
            <template v-slot:headerRight>
              <eg-button @click="batchSwitchClick">批量设置</eg-button>
            </template>
            <template v-slot:content>
              <el-table
                :data="switchList"
                ref="switchTable"
                row-key="DeviceId"
                v-loading="isLoadingSwitchList"
                @selection-change="handleSelectionChangeSwitch"
              >
                <el-table-column type="selection" align="center" :reserve-selection="true" />
                <el-table-column prop="RoomFullName" label="房间信息" align="center" />
                <el-table-column prop="DeviceSN" label="电表" align="center" />
                <el-table-column prop="SwitchStateText" label="电表状态" align="center" />
                <el-table-column width="150px" label="操作" align="center">
                  <template v-slot="{row}">
                    <eg-button v-if="row.SwitchState === undefined" type="text" @click="showDialogSwitch({isShow: true, row})">设置</eg-button>
                    <eg-button v-else type="text" :color="row.SwitchState ? 'danger' : 'success'" @click="switchClick(row)">
                      {{row.SwitchState ? '断闸' : '合闸'}}
                    </eg-button>
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
          <el-dialog
            title="开合闸设置"
            :visible="dialogVisibleSwitch"
            width="30rem"
            top="30vh"
            @close="showDialogSwitch({isShow: false})"
          >
            <div>
              <label style="margin-right: 1rem;">开合闸</label>
              <el-radio-group :value="switchControlState" @input="updateStateData({item: 'switchControlState', value: $event})">
                <el-radio :label="false">断闸</el-radio>
                <el-radio :label="true">合闸</el-radio>
              </el-radio-group>
            </div>
            <template v-slot:footer>
              <eg-button type="minor" @click="showDialogSwitch({isShow: false})">取消</eg-button>
              <eg-button @click="controlDeviceSwitch" v-loading.fullscreen="isControlling">下发命令</eg-button>
            </template>
          </el-dialog>
          <el-dialog
            class="dialog-control"
            title="命令下发中"
            :visible="dialogVisibleSwitchBatch"
            width="30rem"
            top="30vh"
            :show-close="false"
            :close-on-click-modal="false"
            :close-on-press-escape="false"
          >
            <div class="dialog-control__content">
              <div class="dialog-control__process">
                <div class="dialog-control__process-percent" :style="{width: `${finishedPercentSwitch}%`}" />
              </div>
              <p class="dialog-control__text">{{finishedPercentSwitch}}%</p>
            </div>
            <template v-slot:footer>
              <eg-button type="minor" @click="cancelClick">取消任务</eg-button>
            </template>
          </el-dialog>
          <el-dialog
            class="dialog-result"
            title="下发结果"
            :visible="dialogVisibleSwitchResult"
            width="40rem"
            top="30vh"
            :close-on-click-modal="false"
            :close-on-press-escape="false"
            @close="showDialogSwitchResult({isShow: false})"
          >
            <div class="dialog-result__info">
              <p>下发成功：<span class="success-text">36</span></p>
              <p>下发失败：<span class="warning-text">9</span></p>
            </div>
            <el-table :data="[]">
              <el-table-column prop="RoomFullName" label="房间信息" align="center" />
              <el-table-column prop="DeviceSN" label="电表" align="center" />
              <el-table-column prop="Result" label="下发结果" align="center" />
            </el-table>
            <template v-slot:footer>
              <eg-button type="minor" @click="showDialogSwitchResult({isShow: false})">关闭</eg-button>
            </template>
          </el-dialog>
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
        'isLoadingKeepList',
        'dialogVisibleKeep',
        'dialogVisibleSwitch',
        'dialogVisibleSwitchBatch',
        'dialogVisibleSwitchResult',
        'keepControlDeviceIds',
        'switchControlDeviceIds',
        'switchControlState',
        'keepControlState',
        'isControlling'
      ]),
      ...mapGetters([
        'currentNodeId',
        'settingTypeIsPower',
        'settingTypeIsKeep',
        'settingTypeIsSwitch',
        'finishedPercentSwitch'
      ]),
      ...Vuex.mapState({
        groupTree: 'mainGroupTreeHasRoot',
        isLoadingMainGroupList: 'isLoadingMainGroupList'
      })
    },
    methods: {
      ...mapActions([
        'showDialogKeep',
        'showDialogSwitch',
        'showDialogSwitchResult',
        'getDeviceCtrlKeepList',
        'getDeviceCtrlSwitchList',
        'controlDeviceKeep',
        'controlDeviceSwitch',
        'cancelDeviceControlTask',
        'updateStateData'
      ]),
      handleCurrentNodeChange (data) {
        this.updateStateData({ item: 'currentNode', value: data })
        this.handleCurrentPageChange(1)
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
      },
      searchClick () {
        this.handleCurrentPageChange(1)
      },
      handleSelectionChangeKeep (selection) {
        let keepControlDeviceIds = selection.map(item => item.DeviceId)
        this.updateStateData({ item: 'keepControlDeviceIds', value: keepControlDeviceIds })
      },
      handleSelectionChangeSwitch (selection) {
        let switchControlDeviceIds = selection.map(item => item.DeviceId)
        this.updateStateData({ item: 'switchControlDeviceIds', value: switchControlDeviceIds })
      },
      batchKeepClick () {
        if (this.keepControlDeviceIds.length) {
          this.showDialogKeep({ isShow: true })
        } else {
          ElAlert('请勾选设备！', '提示').then(() => {})
        }
      },
      batchSwitchClick () {
        if (this.switchControlDeviceIds.length) {
          this.showDialogSwitch({ isShow: true })
        } else {
          ElAlert('请勾选设备！', '提示').then(() => {})
        }
      },
      switchClick (row) {
        ElConfirm(`确定要对此电表进行${row.SwitchState ? '断闸' : '合闸'}操作`, '提示').then(() => {
          this.controlDeviceSwitch({ row })
        }).catch(cancel => {
        })
      },
      cancelClick () {
        ElConfirm('已经下发的命令无法撤销，确定终止下发命令吗？', '提示').then(() => {
          this.cancelDeviceControlTask()
        }).catch(cancel => {
        })
      }
    },
    watch: {
      groupTree (newValue, oldValue) {
        if (newValue.length && newValue !== oldValue) {
          this.updateStateData({ item: 'currentNode', value: newValue[0] || {} })
          this.handleCurrentPageChange(1)
          // 清除表格勾选项
          if (this.settingTypeIsKeep) {
            this.$refs.keepTable.clearSelection()
          }
          if (this.settingTypeIsSwitch) {
            this.$refs.switchTable.clearSelection()
          }
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
