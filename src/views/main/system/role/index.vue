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
            v-for="(item, index) of searchRoleTypeList"
            :key="index"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <eg-button @click="getRoleListData">查询</eg-button>
      </template>
      <template v-slot:headerRight>
        <eg-button @click="showEdit()">新建角色</eg-button>
      </template>
      <template v-slot:content>
        <el-table :data="roleList" v-loading="isLoadingRoleList">
          <el-table-column label="角色名称" prop="RoleName" align="center"/>
          <el-table-column label="角色类型" prop="RoleTypeText" align="center"/>
          <el-table-column label="权限范围" align="center">
            <template v-slot="{row}">
              <el-popover title="角色权限详情" popper-class="row-popper" :popper-options="{boundariesElement: 'viewport', gpuAcceleration: true}">
                <div class="row-popper__content">
                  <el-tree :data="singleRoleMenusTreeData"/>
                </div>
                <eg-button slot="reference" type="text" @click="getSingleRoleData({id: row.RoleId, isEdit: false})">查看权限</eg-button>
              </el-popover>
            </template>
          </el-table-column>
          <el-table-column label="用户数" prop="UserCount" align="center"/>
          <el-table-column label="创建人" prop="CreatorName" align="center"/>
          <el-table-column label="操作" align="center">
            <template v-slot="{row}">
              <eg-button type="text" style="margin-right: 1rem;" @click="showEdit({row})">编辑</eg-button>
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
          <h4 class="role-edit__header-title">{{isModify ? '编辑角色' : '添加角色'}}</h4>
          <eg-button type="text" @click="showEdit({isShow: false})">返回列表</eg-button>
        </div>
      </template>
      <template v-slot:content>
        <div class="role-edit__row">
          <label class="role-edit__row-title">角色名称</label>
          <eg-input width-type="medium" v-model="editRoleName"/>
          <i class="iconfont icon-content_icon_required"/>
        </div>
        <div class="role-edit__row">
          <label class="role-edit__row-title">角色类型</label>
          <el-select
            placeholder="角色类型"
            v-model="editRoleType"
            :disabled="isModify"
          >
            <el-option
              v-for="item of editRoleTypeList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <i class="iconfont icon-content_icon_required"/>
        </div>
        <div class="role-edit__row">
          <label class="role-edit__row-title align-top">权限菜单</label>
          <div class="role-edit__row-box">
            <el-tree
              ref="editTree"
              :data="editTreeData"
              node-key="value"
              show-checkbox
              default-expand-all
              @check="handleCheck"
            />
          </div>
          <i class="iconfont icon-content_icon_required"/>
        </div>
        <div class="role-edit__row">
          <label class="role-edit__row-title"/>
          <eg-button type="minor" @click="showEdit({isShow: false})">取消</eg-button>
          <eg-button @click="saveClick">保存</eg-button>
        </div>
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
        'isShowEdit',
        'editRoleTypeList',
        'editData',
        'editTreeData',
        'singleRoleMenusTreeData',
        'isLoadingRoleList'
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
      },
      editRoleType: {
        get () { return this.editData.RoleType },
        set (value) { this.updateObjectData({ obj: 'editData', item: 'RoleType', value }) }
      },
      editRoleName: {
        get () { return this.editData.RoleName },
        set (value) { this.updateObjectData({ obj: 'editData', item: 'RoleName', value }) }
      },
      menusCheckedIds () {
        return this.editData.Menus.map(item => (item.Id))
      }
    },
    methods: {
      ...mapActions([
        'showEdit',
        'getRoleListData',
        'getRoleType',
        'getRoleMenus',
        'getSingleRoleData',
        'addRoleData',
        'saveRoleData',
        'currentPageOnChange',
        'pageSizeOnChange',
        'updateStateData',
        'updateObjectData'
      ]),
      saveClick () {
        if (this.isModify) {
          this.saveRoleData()
        } else {
          this.addRoleData()
        }
      },
      handleCheck (node, { checkedNodes, checkedKeys, halfCheckedNodes, halfCheckedKeys }) {
        let totalNodes = [...checkedNodes, ...halfCheckedNodes]
        this.updateObjectData({ obj: 'editData', item: 'Menus', value: totalNodes })
      }
    },
    watch: {
      editTreeData (newValue) {
        if (this.menusCheckedIds.length) {
          this.$nextTick(function () {
            this.menusCheckedIds.forEach(id => {
              this.$refs.editTree.setChecked(id, true, false)
            })
          })
        }
      },
      menusCheckedIds (newValue) {
        if (this.editTreeData.length) {
          this.$nextTick(function () {
            newValue.forEach(id => {
              this.$refs.editTree.setChecked(id, true, false)
            })
          })
        }
      }
    },
    created () {
      this.getRoleType(true)
      this.getRoleType(false)
      this.getRoleMenus()
    },
    beforeDestroy () {
      this.showEdit({ isShow: false })
    }
  }
</script>

<style src="./role.scss" lang="scss" scoped/>
