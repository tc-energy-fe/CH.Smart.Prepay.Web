<template>
  <div class="main-container system-user">
    <eg-box v-if="!isShowEdit" class="user-box">
      <template v-slot:headerLeft>
        <eg-input
          placeholder="用户名称搜索"
          :value="searchName"
          @input="updateStateData({item: 'searchName', value: $event})"
        />
        <el-select
          placeholder="角色类型"
          :value="searchTypeId"
          @input="updateStateData({item: 'searchTypeId', value: $event})"
        >
          <el-option
            label="全部角色类型"
            :value="'total'"
          />
          <el-option
            v-for="(item, index) of searchRoleTypeList"
            :key="index"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <el-select
          placeholder="启用状态"
          :value="searchStatusId"
          @input="updateStateData({item: 'searchStatusId', value: $event})"
        >
          <el-option
            v-for="(item, index) of searchStatusList"
            :key="index"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <eg-button @click="searchClick">查询</eg-button>
      </template>
      <template v-slot:headerRight>
        <eg-button @click="showEdit">新建用户</eg-button>
      </template>
      <template v-slot:content>
        <el-table :data="userList" v-loading="isLoadingUserList">
          <el-table-column label="用户名称" prop="UserName" align="center"/>
          <el-table-column label="手机号" prop="PhoneNo" align="center"/>
          <el-table-column label="角色类型" prop="RoleTypeText" align="center"/>
          <el-table-column label="角色名称" prop="RoleName" align="center"/>
          <el-table-column label="启用状态" prop="StatusText" align="center"/>
          <el-table-column label="创建人" prop="CreatorName" align="center"/>
          <el-table-column label="操作" align="center">
            <template v-slot="{row}">
              <eg-button type="text" style="margin-right: 1rem;" @click="showEdit({row})">编辑</eg-button>
              <eg-button v-if="row.Status === STATUS_DISABLED_VALUE" type="text" color="success" @click="changeUserStatus({row, status: STATUS_ENABLED_VALUE})">启用</eg-button>
              <eg-button v-if="row.Status === STATUS_ENABLED_VALUE" type="text" color="danger" @click="changeUserStatus({row, status: STATUS_DISABLED_VALUE})">停用</eg-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          background
          layout="total, ->, prev, pager, next, sizes, jumper"
          :current-page="currentPage"
          :page-size="pageSize"
          :total="totalCount"
          :page-sizes="[10,20,50]"
          @current-change="currentPageOnChange"
          @size-change="pageSizeOnChange"
        />
      </template>
    </eg-box>
    <eg-box v-if="isShowEdit" class="user-edit">
      <template v-slot:headerLeft>
        <div class="user-edit__header">
          <h4 class="user-edit__header-title">{{isModify ? '编辑用户' : '添加用户'}}</h4>
          <eg-button type="text" @click="showEdit({isShow: false})">返回列表</eg-button>
        </div>
      </template>
      <template v-slot:content>
        <div class="user-edit__row">
          <label class="user-edit__row-title">用户姓名</label>
          <eg-input
            width-type="medium"
            :value="editData.UserName"
            @input="updateObjectData({obj: 'editData', item: 'UserName', value: $event})"
          />
          <i class="iconfont icon-content_icon_required"/>
        </div>
        <div class="user-edit__row">
          <label class="user-edit__row-title">手机号</label>
          <eg-input
            width-type="medium"
            is-integer
            :value="editData.PhoneNo"
            @input="updateObjectData({obj: 'editData', item: 'PhoneNo', value: $event})"
          />
          <i class="iconfont icon-content_icon_required"/>
        </div>
        <div class="user-edit__row">
          <label class="user-edit__row-title">登录名</label>
          <eg-input
            :disabled="isModify"
            width-type="medium"
            :value="editData.AccountName"
            @input="updateObjectData({obj: 'editData', item: 'AccountName', value: $event})"
          />
          <i class="iconfont icon-content_icon_required"/>
        </div>
        <div class="user-edit__row">
          <label class="user-edit__row-title">密码</label>
          <eg-input
            width-type="medium"
            :value="editData.Password"
            @input="updateObjectData({obj: 'editData', item: 'Password', value: $event})"
          />
          <i class="iconfont icon-content_icon_required"/>
        </div>
        <div class="user-edit__row">
          <label class="user-edit__row-title">角色名称</label>
          <el-select
            class="width-medium"
            placeholder="角色名称"
            :value="editData.RoleId"
            @input="updateObjectData({obj: 'editData', item: 'RoleId', value: $event})"
          >
            <el-option
              v-for="(item, index) of editRoleList"
              :key="index"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <i class="iconfont icon-content_icon_required"/>
        </div>
        <div class="user-edit__row">
          <label class="user-edit__row-title">启用状态</label>
          <el-radio-group
            :value="editData.Status"
            @input="updateObjectData({obj: 'editData', item: 'Status', value: $event})"
          >
            <el-radio :label="STATUS_ENABLED_VALUE">启用</el-radio>
            <el-radio :label="STATUS_DISABLED_VALUE">停用</el-radio>
          </el-radio-group>
          <i class="iconfont icon-content_icon_required"/>
        </div>
        <div class="user-edit__row">
          <label class="user-edit__row-title align-top">区域权限</label>
          <div class="user-edit__row-box" v-loading="isLoadingProjectGroupList || isLoadingSingleUser">
            <el-tree
              ref="editTree"
              :data="editGroupTreeData"
              node-key="value"
              show-checkbox
              default-expand-all
            />
          </div>
          <i class="iconfont icon-content_icon_required"/>
        </div>
        <div class="user-edit__row">
          <label class="user-edit__row-title"/>
          <eg-button type="minor" @click="showEdit({isShow: false})">取消</eg-button>
          <eg-button @click="saveClick">保存</eg-button>
        </div>
      </template>
    </eg-box>
  </div>
</template>

<script>
  import { createNamespacedHelpers } from 'vuex'
  const { mapState, mapGetters, mapActions } = createNamespacedHelpers('system/user')
  export default {
    name: 'SystemUser',
    data () {
      return {
        STATUS_ENABLED_VALUE: 0,
        STATUS_DISABLED_VALUE: 3
      }
    },
    components: {},
    computed: {
      ...mapState([
        'searchName',
        'searchTypeId',
        'searchStatusId',
        'searchRoleTypeList',
        'searchStatusList',
        'userList',
        'currentPage',
        'pageSize',
        'totalCount',
        'isLoadingUserList',
        'isLoadingProjectGroupList',
        'isLoadingSingleUser',
        'isModify',
        'isShowEdit',
        'editData',
        'editRoleList',
        'editGroupTreeData'
      ]),
      ...mapGetters([
      ]),
      userId () {
        return this.$store.state.userId
      }
    },
    methods: {
      ...mapActions([
        'getUserListData',
        'getRoleType',
        'getRoleListData',
        'getProjectGroupList',
        'showEdit',
        'addUserData',
        'saveUserData',
        'changeUserStatus',
        'currentPageOnChange',
        'pageSizeOnChange',
        'updateStateData',
        'updateObjectData'
      ]),
      searchClick () {
        this.currentPageOnChange(1)
        this.getUserListData()
      },
      saveClick () {
        let checkedLeafNodes = this.$refs.editTree.getCheckedNodes(true)
        let isIncludeGroups = checkedLeafNodes.some(node => node.Level !== 0)
        let ProjectGroups = []
        if (isIncludeGroups) {
          // 包含项目和区域
          ProjectGroups = [{
            Groups: checkedLeafNodes.map(node => { return { Id: node.Id } })
          }]
        } else {
          // 仅包含项目
          ProjectGroups = checkedLeafNodes.map(node => { return { Id: node.Id } })
        }
        this.updateStateData({ item: 'editCheckedProjectGroups', value: ProjectGroups })
        if (this.isModify) {
          this.saveUserData()
        } else {
          this.addUserData()
        }
      }
    },
    watch: {
      userId (newValue) {
        if (newValue) {
          this.getRoleListData(newValue)
          this.getProjectGroupList(newValue)
        }
      },
      currentPage () {
        this.getUserListData()
      },
      pageSize () {
        this.searchClick()
      },
      searchTypeId () {
        this.searchClick()
      },
      searchStatusId () {
        this.searchClick()
      },
      'editData.ProjectGroups' (newValue) {
        let checkedKeys = []
        newValue.forEach(project => {
          if (project.Groups) {
            checkedKeys = checkedKeys.concat(project.Groups.map(group => group.Id))
          } else {
            checkedKeys.push(project.Id)
          }
        })
        this.$nextTick(function () {
          this.$refs.editTree && this.$refs.editTree.setCheckedKeys(checkedKeys, true)
        })
      }
    },
    created () {
      this.getRoleType(true)
      if (this.userId) {
        this.getRoleListData(this.userId)
        this.getProjectGroupList(this.userId)
      }
    },
    beforeDestroy () {
      this.showEdit({ isShow: false })
    }
  }
</script>

<style scoped src="./user.scss" lang="scss" />
