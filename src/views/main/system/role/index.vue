<template>
  <div class="system-role main-container">
    <eg-box v-if="!isShowEdit" class="role-box">
      <template v-slot:headerLeft>
        <eg-input placeholder="角色名称搜索" v-model="searchNameValue"/>
        <el-select
          placeholder="角色类型"
          v-model="searchTypeIdValue"
        >
          <el-option
            v-for="item of searchRoleTypeList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <eg-button @click="searchClick">查询</eg-button>
      </template>
      <template v-slot:headerRight>
        <eg-button @click="showEdit({isShow: true})">新建角色</eg-button>
      </template>
      <template v-slot:content>
        <el-table :data="roleList">
          <el-table-column label="角色名称" prop="RoleName" align="center"/>
          <el-table-column label="角色类型" prop="RoleType" align="center"/>
          <el-table-column label="权限范围" align="center"/>
          <el-table-column label="用户数" prop="UserCount" align="center"/>
          <el-table-column label="创建人" prop="CreatorName" align="center"/>
          <el-table-column label="操作" align="center">
            <template v-slot="{row}">
              <eg-button type="text" style="margin-right: 1rem;">编辑</eg-button>
              <eg-button type="text" color="danger">删除</eg-button>
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
    <eg-box v-if="isShowEdit" class="role-edit">
      <template v-slot:headerLeft>
        <div class="role-edit__header">
          <h4 class="role-edit__header-title">编辑角色</h4>
          <eg-button type="text" @click="showEdit({isShow: false})">返回列表</eg-button>
        </div>
      </template>
      <template v-slot:content>
      </template>
    </eg-box>
  </div>
</template>

<script>
  import { createNamespacedHelpers } from 'vuex'
  const { mapState, mapGetters, mapActions } = createNamespacedHelpers('system/role')
  export default {
    name: 'Role',
    data () {
      return {
      }
    },
    components: {},
    computed: {
      ...mapState([
        'searchName',
        'searchTypeId',
        'searchRoleTypeList',
        'roleList',
        'currentPage',
        'pageSize',
        'totalCount',
        'isModify',
        'isShowEdit'
      ]),
      ...mapGetters([
      ]),
      searchTypeIdValue: {
        get () { return this.searchTypeId },
        set (value) { this.updateStateData({ item: 'searchTypeId', value }) }
      },
      searchNameValue: {
        get () { return this.searchName },
        set (value) { this.updateStateData({ item: 'searchName', value }) }
      }
    },
    methods: {
      ...mapActions([
        'showEdit',
        'getRoleListData',
        'getRoleType',
        'currentPageOnChange',
        'pageSizeOnChange',
        'updateStateData'
      ]),
      searchClick () {
        this.getRoleType(true)
        this.getRoleListData()
      }
    },
    watch: {
    },
    created () {
      this.searchClick()
    }
  }
</script>

<style src="./role.scss" lang="scss" scoped/>
