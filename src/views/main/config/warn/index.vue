<template>
  <div class="main-container config-warn">
    <template v-if="!isShowEdit">
      <div class="config-scheme">
        <p class="scheme-title">余额告警方案管理</p>
        <eg-box>
          <template v-slot:headerLeft>
            <eg-input
              placeholder="方案名称搜索"
              :value="searchNameWarn"
              @input="updateStateData({item: 'searchNameWarn', value: $event})"
            />
            <eg-button @click="getWarnSchemeList">查询</eg-button>
          </template>
          <template v-slot:headerRight>
            <eg-button @click="showEdit">新建报警方案</eg-button>
          </template>
          <template v-slot:content>
            <div class="table-wrapper">
              <el-table height="100%" :data="warnList" v-loading="isLoadingWarnList">
                <el-table-column prop="Name" label="方案名称" align="center" />
                <el-table-column prop="WarnValueText" label="报警阈值（元）" align="center" />
                <el-table-column prop="OffTypeText" label="拉闸方式" align="center" />
                <el-table-column prop="StatusText" label="启用状态" align="center" />
                <el-table-column label="操作" align="center">
                  <template v-slot="{row}">
                    <eg-button type="text" style="margin-right: 1rem;" @click="showEdit({row})">编辑</eg-button>
                    <eg-button v-if="row.Status === 3" @click="editSchemeStatus({ row, status: 0 })" type="text" color="success">启用</eg-button>
                    <eg-button v-else-if="row.Status === 0" @click="editSchemeStatus({ row, status: 3 })" type="text" color="danger">停用</eg-button>
                  </template>
                </el-table-column>
              </el-table>
              <el-pagination
                background
                :current-page="currentPageWarn"
                :page-size="pageSize"
                :total="totalCountWarn"
                layout="total, ->, prev, pager, next"
                @current-change="currentPageWarnChange($event)"
              />
            </div>
          </template>
        </eg-box>
      </div>
      <div class="config-room">
        <p class="scheme-title">房间方案查询</p>
        <eg-box>
          <template v-slot:headerLeft>
            <eg-input
              placeholder="房间编号/名称搜索"
              :value="searchNameRoom"
              @input="updateStateData({item: 'searchNameRoom', value: $event})"
            />
            <eg-input
              placeholder="余额报警方案搜索"
              :value="searchNameScheme"
              @input="updateStateData({item: 'searchNameScheme', value: $event})"
            />
            <eg-button @click="getRoomList">查询</eg-button>
          </template>
          <template v-slot:content>
            <div class="table-wrapper">
              <el-table height="100%" :data="roomList" v-loading="isLoadingRoomList">
                <el-table-column prop="RoomNo" label="房间编号" align="center" />
                <el-table-column prop="FullName" label="房间信息" align="center" />
                <el-table-column prop="SchemeName" label="余额报警方案" align="center" />
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
      <eg-box class="edit-wrapper warn-edit">
        <template v-slot:headerLeft>
          <div class="edit-header">
            <p class="edit-header__title">{{isModify ? '编辑' : '新建'}}余额报警方案</p>
            <eg-button type="text" @click="showEdit({isShow: false})">返回列表</eg-button>
          </div>
        </template>
        <template v-slot:content>
          <div class="warn-edit__row">
            <label class="warn-edit__row-title">方案名称</label>
            <eg-input
              width-type="medium"
              :value="editData.Name"
              @input="updateObjectData({obj: 'editData', item: 'Name', value: $event})"
            />
            <i class="iconfont icon-content_icon_required"/>
          </div>
          <div class="warn-edit__row">
            <label class="warn-edit__row-title">报警阈值</label>
            <eg-input
              width-type="medium"
              is-number
              :value="editData.WarnValue"
              @input="updateObjectData({obj: 'editData', item: 'WarnValue', value: $event})"
              suffix-text="元"
            />
            <i class="iconfont icon-content_icon_required"/>
          </div>
          <div class="warn-edit__row">
            <label class="warn-edit__row-title">是否发送短信</label>
            <el-radio-group
              :value="editData.SNS"
              @input="updateObjectData({obj: 'editData', item: 'SNS', value: $event})"
            >
              <el-radio :label="true">是</el-radio>
              <el-radio :label="false">否</el-radio>
            </el-radio-group>
            <i class="iconfont icon-content_icon_required"/>
          </div>
          <div class="warn-edit__row">
            <label class="warn-edit__row-title">拉闸方式</label>
            <el-select
              class="width-medium"
              :value="editData.OffType"
              @input="updateObjectData({obj: 'editData', item: 'OffType', value: $event})"
            >
              <el-option
                v-for="(item, index) of offTypeList"
                :key="index"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
            <el-time-picker
              v-if="offTypeIsDelay"
              is-range
              start-placeholder="拉闸开始时间"
              end-placeholder="拉闸结束时间"
              format="HH:mm"
              range-separator="至"
              :value="editData.OffRange"
              @input="updateObjectData({obj: 'editData', item: 'OffRange', value: $event})"
            />
            <i class="iconfont icon-content_icon_required"/>
          </div>
          <div class="warn-edit__row">
            <label class="warn-edit__row-title">启用状态</label>
            <el-radio-group
              :value="editData.Status"
              @input="updateObjectData({obj: 'editData', item: 'Status', value: $event})"
            >
              <el-radio :label="0">启用</el-radio>
              <el-radio :label="3">停用</el-radio>
            </el-radio-group>
            <i class="iconfont icon-content_icon_required"/>
          </div>
          <div class="warn-edit__row">
            <label class="warn-edit__row-title align-top">执行房间</label>
            <div class="warn-edit__row-box">
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
          <div class="warn-edit__row">
            <label class="warn-edit__row-title"/>
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
  const { mapGetters, mapActions, mapState } = createNamespacedHelpers('config/warn')
  export default {
    name: 'ConfigWarn',
    data () {
      return {
      }
    },
    components: {},
    computed: {
      ...mapState([
        'searchNameWarn',
        'searchNameRoom',
        'searchNameScheme',
        'currentPageWarn',
        'currentPageRoom',
        'pageSize',
        'warnList',
        'roomList',
        'totalCountWarn',
        'totalCountRoom',
        'isLoadingWarnList',
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
        'getWarnSchemeList',
        'getRoomList',
        'getGroupListAdd',
        'editSchemeData',
        'editSchemeStatus',
        'updateStateData',
        'updateObjectData',
        'updateItemData'
      ]),
      currentPageWarnChange (page) {
        this.updateStateData({ item: 'currentPageWarn', value: page })
        this.getWarnSchemeList()
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
          this.currentPageWarnChange(1)
          this.currentPageRoomChange(1)
        }
      },
      editSearchRoomName (newValue) {
        this.$refs.editTree.filter(newValue.trim())
      }
    },
    created () {
      if (this.projectId) {
        this.currentPageWarnChange(1)
        this.currentPageRoomChange(1)
      }
    },
    beforeDestroy () {
      this.showEdit({ isShow: false })
    }
  }
</script>

<style scoped lang="scss" src="./warn.scss"/>
