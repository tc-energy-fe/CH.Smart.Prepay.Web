<template>
  <div class="resource-room main-container has-search">
    <div class="main-search" v-show="!isShowEdit">
      <p>选择区域</p>
      <el-tree
        :key="'tree'"
        ref="tree"
        :data="groupTree"
        node-key="value"
        default-expand-all
        auto-expand-parent
        :highlight-current="true"
        :current-node-key="currentNodeId"
        :expand-on-click-node="false"
        @current-change="nodeOnChange"
      ></el-tree>
    </div>
    <div class="main-content">
      <eg-box v-show="!isShowEdit">
        <template v-slot:headerLeft>
          <eg-input
            placeholder="户号搜索"
            v-model="searchNo"
          ></eg-input>
          <eg-input
            placeholder="门牌搜索"
            v-model="searchName"
          ></eg-input>
          <eg-button @click="getRoomList">查询</eg-button>
        </template>
        <template v-slot:headerRight>
          <eg-button style="margin-right: 1rem;">导入房间</eg-button>
          <eg-button @click="showEdit">新建房间</eg-button>
        </template>
        <template v-slot:content>
          <el-table :data="paginationData" v-loading="isLoadingRoomList">
            <el-table-column label="户号" prop="GroupNo" align="center"></el-table-column>
            <el-table-column label="门牌号" prop="Name" align="center"></el-table-column>
            <el-table-column label="所属区域" prop="ParentFullName" align="center"></el-table-column>
            <el-table-column label="绑定仪表" prop="EMeterSN" align="center"></el-table-column>
            <el-table-column label="操作" align="center">
              <template slot-scope="{ row }">
                <eg-button type="text" @click="showEdit({ data: row })" style="margin-right: 1.5rem;">编辑</eg-button>
                <eg-button type="text" color="danger" @click="deleteRoom(row)">删除</eg-button>
              </template>
            </el-table-column>
          </el-table>
          <el-pagination
            @current-change="currentPageOnChange"
            @size-change="pageSizeOnChange"
            :page-sizes="[10, 15, 20, 25]"
            :current-page="currentPage"
            :page-size="pageSize"
            layout="total, ->, prev, pager, next, sizes, jumper"
            :total="roomList.length"
          ></el-pagination>
        </template>
      </eg-box>
      <eg-box class="room-edit" v-if="isShowEdit">
        <template v-slot:headerLeft>
          <span class="room-edit__title">{{isModify ? '编辑' : '添加'}}房间</span>
          <span class="room-edit__back" @click="showEdit({ isShow: false })">返回列表</span>
        </template>
        <template v-slot:content>
          <p class="room-edit__row" v-if="isModify">
            <label>户号</label>
            <eg-input :value="editData.GroupNo" disabled></eg-input>
          </p>
          <p class="room-edit__row">
            <label>门牌编号</label>
            <eg-input v-model="editName"></eg-input>
            <i class="iconfont icon-content_icon_required"></i>
          </p>
          <div class="room-edit__row">
            <label>所属区域</label>
            <template  v-if="!isModify">
              <div class="room-edit__group">
                <el-tree
                  :key="'editTree'"
                  :data="groupTree"
                  node-key="value"
                  :default-expanded-keys="[projectId]"
                  auto-expand-parent
                  :highlight-current="true"
                  :expand-on-click-node="false"
                  @current-change="editGroupNodeOnChange"
                ></el-tree>
              </div>
              <i class="iconfont icon-content_icon_required"></i>
            </template>
            <eg-input v-else :value="editParentName" disabled></eg-input>
          </div>
          <div class="room-edit__row">
            <label>绑定仪表</label>
            <div
              v-if="!isModify"
              class="room-edit__device"
              v-loading="isLoadingGatewayList || isLoadingGatewayDeviceList">
              <div class="room-edit__device--top">
                <el-select
                  placeholder="选择网关"
                  :value="editGatewayId"
                >
                  <el-option
                    v-for="item in gatewayList"
                    :key="item.GatewayId"
                    :label="item.Name"
                    :value="item.GatewayId">
                  </el-option>
                </el-select>
                <eg-input
                  placeholder="名称搜索"
                  v-model="editDeviceName"
                >
                  <i class="iconfont icon-content_icon_search" slot="suffix"></i>
                </eg-input>
              </div>
              <el-tree
                v-if="!isLoadingGatewayList && !isLoadingGatewayDeviceList"
                :key="'deviceTree'"
                :data="gatewayDeviceList"
                node-key="value"
                auto-expand-parent
                :highlight-current="true"
                :current-node-key="editGatewayDeviceId"
                @current-change="updateFormData({ item: 'editGatewayDeviceId', value: $event.value })"
              ></el-tree>
            </div>
            <eg-input v-else :value="editGatewayDeviceName" disabled></eg-input>
          </div>
          <p class="room-edit__footer">
            <eg-button style="margin-right: 2rem" type="minor" @click="showEdit({ isShow: false })">取消</eg-button>
            <eg-button @click="editRoom">保存</eg-button>
          </p>
        </template>
      </eg-box>
    </div>
  </div>
</template>

<script>
  import './room.scss'
  import { createNamespacedHelpers } from 'vuex'
  const { mapGetters, mapActions, mapState } = createNamespacedHelpers('resource/room')
  export default {
    name: 'resource-room',
    data () {
      return {
        pageSize: 10
      }
    },
    components: {},
    computed: {
      ...mapState([
        'roomList',
        'searchData',
        'isShowEdit',
        'currentPage',
        'isLoadingRoomList',
        'isModify',
        'editData',
        'editParentId',
        'gatewayList',
        'gatewayDeviceList',
        'editGatewayId',
        'editGatewayDeviceId',
        'isLoadingGatewayList',
        'isLoadingGatewayDeviceList',
        'editDeviceName',
        'editParentName',
        'editGatewayDeviceName'
      ]),
      ...mapGetters([
        'mainGroupList',
        'projectId',
        'groupTree',
        'currentNodeId'
      ]),
      paginationData () {
        return this.roomList.slice(this.pageSize * (this.currentPage - 1), this.pageSize * this.currentPage)
      },
      searchName: {
        get () { return this.searchData.Name },
        set (val) { this.updateObjectData({ obj: 'searchData', item: 'Name', value: val }) }
      },
      searchNo: {
        get () { return this.searchData.RoomNo },
        set (val) { this.updateObjectData({ obj: 'searchData', item: 'RoomNo', value: val }) }
      },
      editName: {
        get () { return this.editData.Name },
        set (val) { this.updateObjectData({ obj: 'editData', item: 'Name', value: val }) }
      }
    },
    methods: {
      ...mapActions([
        'nodeOnChange',
        'getRoomList',
        'currentPageOnChange',
        'showEdit',
        'editRoom',
        'deleteRoom',
        'getGatewayList',
        'updateFormData',
        'updateObjectData'
      ]),
      pageSizeOnChange (val) {
        this.pageSize = val
      },
      editGroupNodeOnChange (val) {
        this.updateFormData({ item: 'editParentId', value: val.value })
      }
    },
    watch: {
      groupTree (newValue, oldValue) {
        if (newValue.length && newValue !== oldValue) {
          this.$nextTick(function () {
            this.$refs.tree.setCurrentKey(newValue[0].value)
          })
          this.updateFormData({ item: 'currentNode', value: newValue[0] || {} })
          this.getRoomList()
        }
      }
    },
    created () {
      if (this.groupTree.length) {
        this.$nextTick(function () {
          this.$refs.tree.setCurrentKey(this.currentNodeId)
        })
        if (isEmpty(this.currentNodeId)) {
          this.updateFormData({ item: 'currentNode', value: this.groupTree[0] || {} })
        }
        this.getRoomList()
      }
    },
    beforeDestroy () {
      this.showEdit({ isShow: false })
    }
  }
</script>
