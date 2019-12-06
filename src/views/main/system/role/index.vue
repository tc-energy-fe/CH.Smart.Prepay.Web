<template>
  <div class="system-role main-container">
    <eg-box class="role-box">
      <template v-slot:headerLeft>
        <eg-input placeholder="角色名称搜索" v-model="searchNameValue"/>
        <el-select
          placeholder="角色类型"
          :value="searchTypeId"
        >
          <el-option
            v-for="item of searchRoleTypeList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <eg-button>查询</eg-button>
      </template>
      <template v-slot:headerRight>
        <eg-button>新建角色</eg-button>
      </template>
      <template v-slot:content>
        <el-table :data="[]">
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
          layout="total, ->, prev, pager, next, sizes, jumper"
        />
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
        'roleList'
      ]),
      ...mapGetters([
      ]),
      searchNameValue: {
        get () { return this.searchName },
        set (value) { this.updateStateData({ item: 'searchName', value }) }
      }
    },
    methods: {
      ...mapActions([
        'getRoleList',
        'updateStateData'
      ])
    },
    watch: {
    },
    created () {
      this.getRoleList()
    }
  }
</script>

<style src="./role.scss" lang="scss" scoped/>
