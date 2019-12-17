<template>
  <div class="main-container system-user">
    <eg-box v-if="!isShowEdit" class="user-box">
      <template v-slot:headerLeft>
        <eg-input placeholder="用户名称搜索" v-model="searchNameValue"/>
        <el-select
          placeholder="角色类型"
          v-model="searchTypeIdValue"
        >
          <el-option
            v-for="(item, index) of searchRoleTypeList"
            :key="index"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <el-select
          placeholder="启用状态"
          v-model="searchStatusIdValue"
        >
          <el-option
            v-for="(item, index) of searchStatusList"
            :key="index"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <eg-button @click="getUserListData">查询</eg-button>
      </template>
      <template v-slot:headerRight>
        <eg-button @click="showEdit">新建用户</eg-button>
      </template>
      <template v-slot:content>
        <el-table :data="roleList" v-loading="isLoadingUserList">
          <el-table-column label="用户名称" prop="AccountName" align="center"/>
          <el-table-column label="手机号" prop="PhoneNo" align="center"/>
          <el-table-column label="角色类型" prop="RoleTypeText" align="center"/>
          <el-table-column label="角色名称" prop="RoleName" align="center"/>
          <el-table-column label="启用状态" prop="StatusText" align="center"/>
          <el-table-column label="创建人" prop="CreatorName" align="center"/>
          <el-table-column label="操作" align="center">
            <template v-slot="{row}">
              <eg-button type="text" style="margin-right: 1rem;" @click="showEdit({row})">编辑</eg-button>
              <eg-button v-if="row.Status === 3" type="text" color="success">启用</eg-button>
              <eg-button v-if="row.Status === 0" type="text" color="danger">停用</eg-button>
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
          <eg-input width-type="medium" v-model="editUserName"/>
          <i class="iconfont icon-content_icon_required"/>
        </div>
        <div class="user-edit__row">
          <label class="user-edit__row-title">手机号</label>
          <eg-input width-type="medium" v-model="editPhoneNo"/>
          <i class="iconfont icon-content_icon_required"/>
        </div>
        <div class="user-edit__row">
          <label class="user-edit__row-title">登录名</label>
          <eg-input width-type="medium" v-model="editAccountName"/>
          <i class="iconfont icon-content_icon_required"/>
        </div>
        <div class="user-edit__row">
          <label class="user-edit__row-title">密码</label>
          <eg-input width-type="medium" v-model="editPassword"/>
          <i class="iconfont icon-content_icon_required"/>
        </div>
        <div class="user-edit__row">
          <label class="user-edit__row-title">角色名称</label>
          <el-select
            class="width-medium"
            placeholder="角色名称"
            v-model="editRoleId"
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
          <el-radio-group v-model="editStatus">
            <el-radio :label="0">启用</el-radio>
            <el-radio :label="3">停用</el-radio>
          </el-radio-group>
          <i class="iconfont icon-content_icon_required"/>
        </div>
        <div class="user-edit__row">
          <label class="user-edit__row-title align-top">区域权限</label>
          <div class="user-edit__row-box">
          </div>
          <i class="iconfont icon-content_icon_required"/>
        </div>
        <div class="user-edit__row">
          <label class="user-edit__row-title"/>
          <eg-button type="minor">取消</eg-button>
          <eg-button>保存</eg-button>
        </div>
      </template>
    </eg-box>
  </div>
</template>

<script>
  import { createNamespacedHelpers } from 'vuex'
  const { mapState, mapGetters, mapActions } = createNamespacedHelpers('system/user')
  export default {
    name: 'User',
    data () {
      return {
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
        'roleList',
        'currentPage',
        'pageSize',
        'totalCount',
        'isLoadingUserList',
        'isModify',
        'isShowEdit',
        'editData',
        'editRoleList'
      ]),
      ...mapGetters([
      ]),
      searchNameValue: {
        get () { return this.searchName },
        set (value) { this.updateStateData({ item: 'searchName', value }) }
      },
      searchTypeIdValue: {
        get () { return this.searchTypeId },
        set (value) { this.updateStateData({ item: 'searchTypeId', value }) }
      },
      searchStatusIdValue: {
        get () { return this.searchStatusId },
        set (value) { this.updateStateData({ item: 'searchStatusId', value }) }
      },
      editUserName: {
        get () { return this.editData.UserName },
        set (value) { this.updateObjectData({ obj: 'editData', item: 'UserName', value }) }
      },
      editPhoneNo: {
        get () { return this.editData.PhoneNo },
        set (value) { this.updateObjectData({ obj: 'editData', item: 'PhoneNo', value }) }
      },
      editAccountName: {
        get () { return this.editData.AccountName },
        set (value) { this.updateObjectData({ obj: 'editData', item: 'AccountName', value }) }
      },
      editPassword: {
        get () { return this.editData.Password },
        set (value) { this.updateObjectData({ obj: 'editData', item: 'Password', value }) }
      },
      editRoleId: {
        get () { return this.editData.RoleId },
        set (value) { this.updateObjectData({ obj: 'editData', item: 'RoleId', value }) }
      },
      editStatus: {
        get () { return this.editData.Status },
        set (value) { this.updateObjectData({ obj: 'editData', item: 'Status', value }) }
      }
    },
    methods: {
      ...mapActions([
        'getUserListData',
        'getRoleType',
        'getRoleListData',
        'getProjectGroupList',
        'showEdit',
        'currentPageOnChange',
        'pageSizeOnChange',
        'updateStateData',
        'updateObjectData'
      ])
    },
    watch: {
    },
    created () {
      this.getRoleType(true)
      this.getRoleListData()
      this.getProjectGroupList()
    },
    beforeDestroy () {
    }
  }
</script>

<style scoped src="./user.scss" lang="scss" />
