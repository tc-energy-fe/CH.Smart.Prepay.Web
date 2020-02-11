<template>
  <div class="resource-roomuser main-container has-search">
    <template v-if="!isShowEdit">
      <div class="main-search">
        <p class="main-search__title">选择区域</p>
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
            <eg-input placeholder="户号搜索"></eg-input>
            <eg-input placeholder="名称搜索"></eg-input>
            <el-select
              placeholder="开户状态"
              :value="searchStateId"
              @change="updateFormData({ item: 'searchStateId', value: $event })"
            >
              <el-option
                v-for="item in stateList"
                :value="item.value"
                :label="item.label"
                :key="item.value"
              ></el-option>
            </el-select>
            <eg-button @click="search">查询</eg-button>
          </template>
          <template v-slot:content>
            <el-table :data="roomList" v-loading="isLoadingRoomAccountList">
              <el-table-column prop="GroupNo" label="户号" align="center" min-width="130"></el-table-column>
              <el-table-column prop="FullName" label="房间信息" align="center" min-width="180"></el-table-column>
              <el-table-column prop="StateText" label="开户状态" align="center" min-width="80"></el-table-column>
              <el-table-column prop="HostName" label="开户人姓名" align="center" min-width="100"></el-table-column>
              <el-table-column prop="HostPhone" label="开户人手机号" align="center" min-width="120"></el-table-column>
              <el-table-column prop="ShareNum" label="共享人" align="center" min-width="70">
                <template slot-scope="{ row }">
                  <el-popover
                    v-if="row.ShareNum > 0"
                    @show="getShareList(row.Id)"
                    @hide="shareOnHide"
                  >
                    <eg-button slot="reference" type="text">{{row.ShareNum}}</eg-button>
                    <div class="roomuser-share-pop">
                      <p class="pop-title">共享人</p>
                      <div class="pop-content" v-loading="isLoadingShareList">
                        <p v-for="(s, index) in shareList" :key="index">
                          {{index + 1}} {{s.Name}} {{s.Phone || '-'}}
                        </p>
                      </div>
                    </div>
                  </el-popover>
                  <span v-else>0</span>
                </template>
              </el-table-column>
              <el-table-column label="操作" align="center">
                <template slot-scope="{ row }">
                  <eg-button
                    type="text"
                    :color="row.AccountState ? 'success' : 'danger'"
                    @click="showEdit({isShow: true, row})"
                  >
                    {{row.AccountState ? '销户' : '开户'}}
                  </eg-button>
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
              :total="totalCount"
            ></el-pagination>
          </template>
        </eg-box>
      </div>
    </template>
    <eg-box v-else>
      <template v-slot:headerLeft>
        <span class="room-edit__title">{{isAddAccount ? '开户' : '销户'}}</span>
        <eg-button type="text" @click="showEdit({ isShow: false })">返回列表</eg-button>
      </template>
      <template v-slot:content>
        <template v-if="isAddAccount">
          <p class="room-edit__name">
            <label>开户房间</label>
            <span>{{editData.FullName}}</span>
          </p>
          <p class="room-edit__row">
            <label>开户人姓名</label>
            <eg-input v-model="editHostName"></eg-input>
            <i class="iconfont icon-content_icon_required"></i>
          </p>
          <p class="room-edit__row">
            <label>开户人手机</label>
            <eg-input v-model="editHostPhone" :is-integer="true"></eg-input>
            <i class="iconfont icon-content_icon_required"></i>
          </p>
        </template>
        <template v-else>
          <p class="room-edit__name">
            <label>销户房间</label>
            <span>{{editData.FullName}}</span>
          </p>
          <p class="room-edit__name">
            <label>开户人姓名</label>
            <span>{{editData.HostName}}</span>
          </p>
          <p class="room-edit__name">
            <label>开户人手机</label>
            <span>{{editData.HostPhone}}</span>
          </p>
          <p class="room-edit__name">
            <label>共享人</label>
            <span>{{editData.ShareNum}}</span>
          </p>
        </template>
        <p class="room-edit__footer">
          <eg-button style="margin-right: 2rem" type="minor" @click="showEdit({ isShow: false })">取消</eg-button>
          <eg-button @click="editAccount">{{isAddAccount ? '开户' : '销户'}}</eg-button>
        </p>
      </template>
    </eg-box>
  </div>
</template>

<script>
  import './roomUser.scss'
  import { createNamespacedHelpers } from 'vuex'
  const { mapGetters, mapActions, mapState } = createNamespacedHelpers('resource/roomUser')
  export default {
    name: 'resource-roomuser',
    data () {
      return {
      }
    },
    components: {},
    computed: {
      ...mapState([
        'stateList',
        'searchStateId',
        'pageSize',
        'currentPage',
        'totalCount',
        'roomList',
        'isShowEdit',
        'isAddAccount',
        'editData',
        'isLoadingRoomAccountList',
        'reqCancels',
        'shareList',
        'isLoadingShareList'
      ]),
      ...mapGetters([
        'projectId',
        'groupTree',
        'currentNodeId'
      ]),
      editHostName: {
        get () { return this.editData.HostName },
        set (val) { this.updateObjectData({ obj: 'editData', item: 'HostName', value: val }) }
      },
      editHostPhone: {
        get () { return this.editData.HostPhone },
        set (val) { this.updateObjectData({ obj: 'editData', item: 'HostPhone', value: val }) }
      }
    },
    methods: {
      ...mapActions([
        'updateFormData',
        'pageSizeOnChange',
        'getRoomAccountList',
        'showEdit',
        'updateObjectData',
        'editAccount',
        'getShareList',
        'shareOnHide'
      ]),
      nodeOnChange (val) {
        this.updateFormData({ item: 'currentNode', value: val })
        this.currentPageOnChange(1)
      },
      search () {
        this.currentPageOnChange(1)
      },
      currentPageOnChange (value) {
        this.updateFormData({ item: 'currentPage', value })
        this.getRoomAccountList()
      }
    },
    watch: {
      projectId () {
        this.showEdit({ isShow: false })
      },
      groupTree (newValue, oldValue) {
        if (newValue.length && newValue !== oldValue) {
          this.$nextTick(function () {
            this.$refs.tree.setCurrentKey(newValue[0].value)
          })
          this.updateFormData({ item: 'currentNode', value: newValue[0] || {} })
          this.currentPageOnChange(1)
        }
      },
      pageSize (newValue) {
        if (!isEmpty(newValue)) {
          this.currentPageOnChange(1)
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
        this.currentPageOnChange(1)
      }
    },
    beforeDestroy () {
      this.showEdit({ isShow: false })
    }
  }
</script>
