<template>
  <div class="resource-group main-container has-search">
    <div class="main-search" v-show="!isShowEdit">
      <p>选择区域</p>
      <el-tree
        ref="tree"
        :data="groupTree"
        node-key="value"
        :default-expanded-keys="[-1, currentNodeId]"
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
            placeholder="区域名称搜索"
            v-model="searchName"
          ></eg-input>
          <eg-button @click="getGroupList">查询</eg-button>
        </template>
        <template v-slot:headerRight>
          <eg-button @click="showEdit">新建区域</eg-button>
        </template>
        <template v-slot:content>
          <el-table :data="groupList" v-loading="isLoadingGroupList">
            <el-table-column label="区域名称" prop="Name" align="center"></el-table-column>
            <el-table-column label="上级区域" prop="ParentName" align="center"></el-table-column>
            <el-table-column label="操作" align="center">
              <template slot-scope="{ row }">
                <eg-button type="text" @click="showEdit({ data: row })" style="margin-right: 1.5rem;">编辑</eg-button>
                <eg-button type="text" color="danger" @click="deleteGroup(row)">删除</eg-button>
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
            :total="groupList.length"
          ></el-pagination>
        </template>
      </eg-box>
      <eg-box class="project-edit" v-if="isShowEdit">
        <template v-slot:headerLeft>
          <span class="project-edit__title">{{isModify ? '编辑' : '添加'}}区域</span>
          <span class="project-edit__back" @click="showEdit({ isShow: false })">返回列表</span>
        </template>
        <template v-slot:content>
          <p class="project-edit__row">
            <label>区域名称</label>
            <eg-input v-model="editName"></eg-input>
          </p>
          <p class="project-edit__row">
            <label>上级区域</label>
            <el-select
              :disabled="isModify"
              :value="editParentId"
              @change="updateFormData({ item: 'editParentId', value: $event })"
            >
              <el-option
                :label="'不选择'"
                :value="-1"
              ></el-option>
              <el-option
                v-for="item in mainGroupList"
                :key="item.value"
                :label="item.FullName"
                :value="item.value">
              </el-option>
            </el-select>
          </p>
          <p class="project-edit__footer">
            <eg-button style="margin-right: 2rem" type="minor" @click="showEdit({ isShow: false })">取消</eg-button>
            <eg-button @click="editGroup">保存</eg-button>
          </p>
        </template>
      </eg-box>
    </div>
  </div>
</template>

<script>
  import './group.scss'
  import { createNamespacedHelpers } from 'vuex'
  const { mapGetters, mapActions, mapState } = createNamespacedHelpers('resource/group')
  export default {
    name: 'resource-group',
    data () {
      return {
        pageSize: 10
      }
    },
    components: {},
    computed: {
      ...mapState([
        'groupList',
        'isModify',
        'editParentId',
        'editData',
        'isShowEdit',
        'currentPage',
        'isLoadingGroupList'
      ]),
      ...mapGetters([
        'mainGroupList',
        'groupTree',
        'projectId',
        'currentNodeId'
      ]),
      searchName: {
        get () { return this.$store.state.resource.group.searchName },
        set (val) {
          this.updateFormData({ item: 'searchName', value: val })
        }
      },
      editName: {
        get () { return this.editData.Name },
        set (val) {
          this.updateObjectData({ obj: 'editData', item: 'Name', value: val })
        }
      },
      editDesc: {
        get () { return this.editData.Desc },
        set (val) {
          this.updateObjectData({ obj: 'editData', item: 'Desc', value: val })
        }
      }
    },
    methods: {
      ...mapActions([
        'nodeOnChange',
        'getGroupList',
        'setEditData',
        'updateObjectData',
        'editGroup',
        'updateFormData',
        'deleteGroup',
        'showEdit',
        'currentPageOnChange'
      ]),
      pageSizeOnChange (val) {
        this.pageSize = val
      }
    },
    watch: {
      projectId (newValue) {
      },
      groupTree (newValue, oldValue) {
        if (newValue.length && newValue[0].children !== oldValue[0].children) {
          this.$nextTick(function () {
            this.$refs.tree.setCurrentKey(newValue[0].value)
          })
          this.updateFormData({ item: 'currentNode', value: newValue[0] || {} })
          this.getGroupList()
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
        this.getGroupList()
      }
    },
    beforeDestroy () {
      this.showEdit({ isShow: false })
    }
  }
</script>
