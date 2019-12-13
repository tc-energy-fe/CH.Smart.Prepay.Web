<template>
  <div class="main-container system-user">
    <eg-box class="user-box">
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
        <eg-button >新建用户</eg-button>
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
        'isLoadingUserList'
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
      }
    },
    methods: {
      ...mapActions([
        'getUserListData',
        'getRoleType',
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
    },
    beforeDestroy () {
    }
  }
</script>

<style scoped src="./user.scss" lang="scss" />
