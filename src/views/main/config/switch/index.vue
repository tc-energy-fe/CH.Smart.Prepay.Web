<template>
  <div class="main-container config-switch">
    <template v-if="!isShowEdit">
      <div class="config-scheme">
        <p class="scheme-title">定时开合闸任务管理</p>
        <eg-box>
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
            <div class="table-wrapper">
              <el-table height="100%" :data="switchList" v-loading="isLoadingSwitchList">
                <el-table-column prop="Name" label="任务名称" align="center" />
                <el-table-column prop="ContentText" label="任务内容" align="center" />
                <el-table-column prop="StatusText" label="启用状态" align="center" />
                <el-table-column label="操作" align="center">
                  <template v-slot="{row}">
                    <eg-button type="text" style="margin-right: 1rem;" @click="showEdit({row})">编辑</eg-button>
                    <eg-button v-if="row.Status === 3" type="text" color="success">启用</eg-button>
                    <eg-button v-else-if="row.Status === 0" type="text" color="danger">停用</eg-button>
                  </template>
                </el-table-column>
              </el-table>
              <el-pagination
                background
                :current-page="currentPageSwitch"
                :page-size="pageSize"
                :total="totalCountSwitch"
                layout="total, ->, prev, pager, next"
                @current-change="currentPageSwitchChange($event)"
              />
            </div>
          </template>
        </eg-box>
      </div>
      <div class="config-room">
        <p class="scheme-title">房间定时任务查询</p>
        <eg-box>
          <template v-slot:headerLeft>
            <eg-input
              placeholder="房间编号/名称搜索"
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
            <div class="table-wrapper">
              <el-table height="100%" :data="roomList" v-loading="isLoadingRoomList">
                <el-table-column prop="RoomNo" label="房间编号" align="center" />
                <el-table-column prop="FullName" label="房间信息" align="center" />
                <el-table-column prop="TaskName" label="任务名称" align="center" />
              </el-table>
              <el-pagination
                background
                :current-page="currentPageRoom"
                :page-size="pageSize"
                :total="totalCountRoom"
                layout="total, ->, prev, pager, next"
                @current-change="currentPageRoomChange($event)"
              />
            </div>
          </template>
        </eg-box>
      </div>
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
            <div class="switch-edit__row-box long-width">
              <div class="switch-edit__row-period">
                <div>
                  <label style="font-weight: bold; margin-right: 1rem;">时段</label>
                  <eg-button type="text" color="danger">删除时段</eg-button>
                </div>
                <div>
                  <el-checkbox-group :value="[]">
                    <el-checkbox-button>周一</el-checkbox-button>
                    <el-checkbox-button>周二</el-checkbox-button>
                    <el-checkbox-button>周三</el-checkbox-button>
                    <el-checkbox-button>周四</el-checkbox-button>
                    <el-checkbox-button>周五</el-checkbox-button>
                    <el-checkbox-button>周六</el-checkbox-button>
                    <el-checkbox-button>周日</el-checkbox-button>
                  </el-checkbox-group>
                </div>
                <div>
                  <el-time-picker style="margin-right: 1rem;"/>
                  <label style="margin-right: 1rem;">开合闸</label>
                  <el-radio-group>
                    <el-radio>开闸</el-radio>
                    <el-radio>合闸</el-radio>
                  </el-radio-group>
                </div>
              </div>
              <eg-button type="text" style="margin-top: 1rem;">添加时段</eg-button>
            </div>
            <i class="iconfont icon-content_icon_required"/>
          </div>
          <div class="switch-edit__row">
            <label class="switch-edit__row-title align-top">执行房间</label>
            <div class="switch-edit__row-box">
              <eg-input
                placeholder="房间名称搜索"
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
      }
    },
    components: {},
    computed: {
      ...mapState([
        'searchNameSwitch',
        'searchNameRoom',
        'searchNameTask',
        'currentPageSwitch',
        'currentPageRoom',
        'pageSize',
        'switchList',
        'roomList',
        'totalCountSwitch',
        'totalCountRoom',
        'isLoadingSwitchList',
        'isLoadingRoomList',
        'isShowEdit',
        'isModify',
        'editData',
        'editTreeData',
        'editSearchRoomName'
      ]),
      ...mapGetters([
        'offTypeList',
        'offTypeIsDelay'
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
        'getGroupListAdd',
        'editSchemeData',
        'updateStateData',
        'updateObjectData',
        'updateItemData'
      ]),
      currentPageSwitchChange (page) {
        this.updateStateData({ item: 'currentPageSwitch', value: page })
        this.getSwitchTaskList()
      },
      currentPageRoomChange (page) {
        this.updateStateData({ item: 'currentPageRoom', value: page })
        this.getRoomList()
      },
      saveClick () {
        let checkedKeys = this.$refs.editTree.getCheckedKeys(true)
        this.updateObjectData({ obj: 'editData', item: 'GroupIds', value: checkedKeys })
        this.editSchemeData()
      },
      editTreeFilter (value, data) {
        return data.label.includes(value)
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
    },
    beforeDestroy () {
      this.showEdit({ isShow: false })
    }
  }
</script>

<style scoped lang="scss" src="./switch.scss"/>
