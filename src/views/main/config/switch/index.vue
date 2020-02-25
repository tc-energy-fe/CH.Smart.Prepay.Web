<template>
  <div class="main-container config-switch">
    <template v-if="!isShowEdit">
      <div class="config-tab">
        <eg-tab-group v-model="tabIndex">
          <eg-tab-button :label="1">定时开合闸任务管理</eg-tab-button>
          <eg-tab-button :label="2">房间方案查询</eg-tab-button>
        </eg-tab-group>
      </div>
      <eg-box class="config-scheme" v-show="tabIndex===1">
        <template v-slot:headerLeft>
          <eg-input
            placeholder="任务名称搜索"
            :value="searchNameSwitch"
            @input="updateStateData({item: 'searchNameSwitch', value: $event})"
          />
          <eg-button @click="getSwitchTaskList">查询</eg-button>
        </template>
        <template v-slot:headerRight>
          <eg-button @click="showEdit">新建定时任务</eg-button>
        </template>
        <template v-slot:content>
          <el-table :data="switchList" v-loading="isLoadingSwitchList">
            <el-table-column prop="Name" label="任务名称" width="200px" align="center" />
            <el-table-column prop="ContentText" label="任务内容" align="center">
              <template v-slot="{row}">
                <p v-for="(item, index) of row.Periods" :key="index" style="padding: 0 20%; text-align: left;">
                  {{`${index + 1}.`}}<span style="display: inline-block;width: 22rem;">{{`【${item.Days.map(day => (taskDaysDic[day])).join('、')}】`}}</span>{{`${item.Time} ${item.SwitchParam ? '合闸' : '断闸'}`}}
                </p>
              </template>
            </el-table-column>
            <el-table-column prop="StatusText" label="启用状态" width="200px" align="center" />
            <el-table-column label="操作" width="200px" align="center">
              <template v-slot="{row}">
                <eg-button type="text" style="margin-right: 1rem;" @click="showEdit({row})">编辑</eg-button>
                <eg-button v-if="row.Status === 3" @click="editTaskStatus({ row, status: 0 })" type="text" color="success">启用</eg-button>
                <eg-button v-else-if="row.Status === 0" @click="editTaskStatus({ row, status: 3 })" type="text" color="danger">停用</eg-button>
              </template>
            </el-table-column>
          </el-table>
          <el-pagination
            background
            :current-page="currentPageSwitch"
            :page-size="switchPageSize"
            :page-sizes="[10, 15, 20, 25]"
            :total="totalCountSwitch"
            layout="total, ->, prev, pager, next, sizes, jumper"
            @current-change="currentPageSwitchChange"
            @size-change="switchPagesSizeOnChange"
          />
        </template>
      </eg-box>
      <eg-box class="config-room" v-show="tabIndex===2">
        <template v-slot:headerLeft>
          <eg-input
            placeholder="户号/房间信息搜索"
            :value="searchNameRoom"
            @input="updateStateData({item: 'searchNameRoom', value: $event})"
          />
          <eg-input
            placeholder="任务名称搜索"
            :value="searchNameTask"
            @input="updateStateData({item: 'searchNameTask', value: $event})"
          />
          <eg-button @click="getRoomList">查询</eg-button>
        </template>
        <template v-slot:content>
          <el-table :data="roomList" v-loading="isLoadingRoomList">
            <el-table-column prop="RoomNo" label="户号" align="center" />
            <el-table-column prop="FullName" label="房间信息" align="center" />
            <el-table-column prop="TaskName" label="任务名称" align="center" />
          </el-table>
          <el-pagination
            background
            :current-page="currentPageRoom"
            :page-size="roomPageSize"
            :page-sizes="[10, 15, 20, 25]"
            :total="totalCountRoom"
            layout="total, ->, prev, pager, next, sizes, jumper"
            @current-change="currentPageRoomChange"
            @size-change="roomPageSizeOnChange"
          />
        </template>
      </eg-box>
    </template>
    <template v-if="isShowEdit">
      <eg-box class="edit-wrapper switch-edit">
        <template v-slot:headerLeft>
          <div class="edit-header">
            <p class="edit-header__title">{{isModify ? '编辑' : '新建'}}定时开合闸任务</p>
            <eg-button type="text" @click="showEdit({isShow: false})">返回列表</eg-button>
          </div>
        </template>
        <template v-slot:content>
          <div class="switch-edit__row">
            <label class="switch-edit__row-title">任务名称</label>
            <eg-input
              width-type="medium"
              :value="editData.Name"
              @input="updateObjectData({obj: 'editData', item: 'Name', value: $event})"
            />
            <i class="iconfont icon-content_icon_required"/>
          </div>
          <div class="switch-edit__row">
            <label class="switch-edit__row-title">启用状态</label>
            <el-radio-group
              :value="editData.Status"
              @input="updateObjectData({obj: 'editData', item: 'Status', value: $event})"
            >
              <el-radio :label="0">启用</el-radio>
              <el-radio :label="3">停用</el-radio>
            </el-radio-group>
            <i class="iconfont icon-content_icon_required"/>
          </div>
          <div class="switch-edit__row">
            <label class="switch-edit__row-title align-top">任务内容</label>
            <div class="switch-edit__row-box long-width" v-loading="isLoadingTaskPeriod">
              <div
                class="switch-edit__row-period"
                v-for="(item, index) of editPeriodList"
                :key="index"
              >
                <div>
                  <label class="switch-edit__row-period__title">时段{{index + 1}}</label>
                  <eg-button type="text" color="danger" @click="handleDeletePeriod(index)">删除时段</eg-button>
                </div>
                <div>
                  <eg-checkbox-group size="short" :value="item.Days" @change="handleInputPeriod($event, index, 'Days')">
                    <eg-checkbox-button
                      v-for="(day, dayIndex) of editTaskDays"
                      :key="dayIndex"
                      :label="day.label"
                    >
                      {{day.text}}
                    </eg-checkbox-button>
                  </eg-checkbox-group>
                </div>
                <div>
<!--                  <el-time-picker-->
<!--                    format="HH:mm"-->
<!--                    :value="item.Time"-->
<!--                    @input="handleInputPeriod($event, index, 'Time')"-->
<!--                    :clearable="false"-->
<!--                    style="margin-right: 1rem;"-->
<!--                  />-->
                  <el-time-select
                    :value="item.Time"
                    @input="handleInputPeriod($event, index, 'Time')"
                    :picker-options="{
                      start: '00:00',
                      step: '00:10',
                      end: '24:00'
                    }"
                    :clearable="false"
                    style="margin-right: 1rem;"
                  />
                  <label style="margin-right: 1rem;">断合闸</label>
                  <el-radio-group :value="item.SwitchParam" @input="handleInputPeriod($event, index, 'SwitchParam')">
                    <el-radio :label="false">断闸</el-radio>
                    <el-radio :label="true">合闸</el-radio>
                  </el-radio-group>
                </div>
              </div>
              <eg-button type="text" style="margin: 1rem 0;" @click="handleAddPeriod">添加时段</eg-button>
            </div>
            <i class="iconfont icon-content_icon_required"/>
          </div>
          <div class="switch-edit__row">
            <label class="switch-edit__row-title align-top">执行房间</label>
            <div class="switch-edit__row-box" v-loading="isLoadingEditTree">
              <eg-input
                placeholder="门牌编号搜索"
                :value="editSearchRoomName"
                @input="updateStateData({item: 'editSearchRoomName', value: $event})">
                <i slot="suffix" class="iconfont icon-content_icon_search"/>
              </eg-input>
              <el-tree
                ref="editTree"
                :data="editTreeData"
                node-key="value"
                show-checkbox
                default-expand-all
                :default-checked-keys="editData.GroupIds"
                :filter-node-method="editTreeFilter"
              />
            </div>
            <i class="iconfont icon-content_icon_required"/>
          </div>
          <div class="switch-edit__row">
            <label class="switch-edit__row-title"/>
            <eg-button type="minor" @click="showEdit({isShow: false})">取消</eg-button>
            <eg-button @click="saveClick">保存</eg-button>
          </div>
        </template>
      </eg-box>
    </template>
  </div>
</template>

<script>
  import { createNamespacedHelpers } from 'vuex'
  const { mapGetters, mapActions, mapState } = createNamespacedHelpers('config/switch')
  export default {
    name: 'ConfigSwitch',
    data () {
      return {
        tabIndex: 1
      }
    },
    components: {},
    computed: {
      ...mapState([
        'searchNameSwitch',
        'searchNameRoom',
        'searchNameTask',
        'currentPageSwitch',
        'switchPageSize',
        'currentPageRoom',
        'roomPageSize',
        'pageSize',
        'switchList',
        'roomList',
        'totalCountSwitch',
        'totalCountRoom',
        'taskDaysDic',
        'isLoadingSwitchList',
        'isLoadingRoomList',
        'isShowEdit',
        'isModify',
        'editData',
        'editTreeData',
        'editPeriodList',
        'editTaskDays',
        'editSearchRoomName',
        'isLoadingEditTree',
        'isLoadingTaskPeriod'
      ]),
      ...mapGetters([
      ]),
      projectId () {
        return this.$store.state.areaId
      }
    },
    methods: {
      ...mapActions([
        'showEdit',
        'getSwitchTaskList',
        'getRoomList',
        'getTaskPeriodList',
        'editTaskData',
        'editTaskStatus',
        'updateStateData',
        'updateObjectData',
        'updateItemData'
      ]),
      currentPageSwitchChange (page) {
        this.updateStateData({ item: 'currentPageSwitch', value: page })
        this.getSwitchTaskList()
      },
      switchPagesSizeOnChange (value) {
        this.updateStateData({ item: 'switchPagesSize', value: value })
        this.currentPageSwitchChange(1)
      },
      currentPageRoomChange (page) {
        this.updateStateData({ item: 'currentPageRoom', value: page })
        this.getRoomList()
      },
      roomPageSizeOnChange (page) {
        this.updateStateData({ item: 'roomPageSize', value: page })
        this.currentPageRoomChange(1)
      },
      saveClick () {
        let checkedKeys = this.$refs.editTree.getCheckedKeys(true)
        this.updateObjectData({ obj: 'editData', item: 'GroupIds', value: checkedKeys })
        this.editTaskData()
      },
      editTreeFilter (value, data) {
        return data.label.includes(value)
      },
      handleInputPeriod (data, dayIndex, prop) {
        let editPeriodList = JSON.parse(JSON.stringify(this.editPeriodList))
        editPeriodList.forEach((item, index) => {
          if (dayIndex === index) {
            item[prop] = data
          }
        })
        this.updateStateData({ item: 'editPeriodList', value: editPeriodList })
      },
      handleAddPeriod () {
        let editPeriodList = JSON.parse(JSON.stringify(this.editPeriodList))
        editPeriodList.push({
          SwitchParam: true,
          Time: '06:00',
          Days: [1, 2, 3, 4, 5, 6, 7]
        })
        this.updateStateData({ item: 'editPeriodList', value: editPeriodList })
      },
      handleDeletePeriod (index) {
        let editPeriodList = JSON.parse(JSON.stringify(this.editPeriodList))
        editPeriodList.splice(index, 1)
        this.updateStateData({ item: 'editPeriodList', value: editPeriodList })
      }
    },
    watch: {
      projectId (newId) {
        if (newId) {
          this.currentPageSwitchChange(1)
          this.currentPageRoomChange(1)
        }
      },
      editSearchRoomName (newValue) {
        this.$refs.editTree.filter(newValue.trim())
      }
    },
    created () {
      if (this.projectId) {
        this.currentPageSwitchChange(1)
        this.currentPageRoomChange(1)
      }
      this.getTaskPeriodList()
    },
    beforeDestroy () {
      this.showEdit({ isShow: false })
    }
  }
</script>

<style lang="scss" src="./switch.scss"/>
