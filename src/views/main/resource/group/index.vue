<template>
  <div class="resource-group main-container has-search">
    <div class="main-search">
      <p>选择区域</p>
      <el-tree
        ref="tree"
        :data="groupTree"
        node-key="value"
        :highlight-current="true"
        :expand-on-click-node="false"
        @current-change="nodeOnChange"
      ></el-tree>
    </div>
    <div class="main-content">
      <eg-box v-if="!isShowEdit">
        <template v-slot:headerLeft>
          <eg-input
            placeholder="区域名称搜索"
          ></eg-input>
          <eg-button @click="getGroupList">查询</eg-button>
        </template>
        <template v-slot:headerRight>
          <eg-button @click="showEdit">新建项目</eg-button>
        </template>
        <template v-slot:content>
          <el-table :data="groupList" v-loading="isLoadingGroupList">
            <el-table-column label="区域名称" prop="Name" align="center"></el-table-column>
            <el-table-column label="上级区域" prop="ParentName" align="center"></el-table-column>
            <el-table-column label="操作" align="center" min-width="130">
              <template slot-scope="{ row }">
                <eg-button type="text" @click="showEdit({ data: row })" style="margin-right: 1.5rem;">编辑</eg-button>
                <eg-button type="text" color="danger" @click="deleteProject(row.Id)">删除</eg-button>
              </template>
            </el-table-column>
          </el-table>
          <el-pagination
            @current-change="currentOnChange"
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
          <span class="project-edit__title">{{isModify ? '编辑' : '添加'}}项目</span>
          <span class="project-edit__back" @click="showEdit({ isShow: false })">返回列表</span>
        </template>
        <template v-slot:content>
          <p class="project-edit__row">
            <label>项目名称</label>
            <eg-input v-model="editName"></eg-input>
          </p>
          <p class="project-edit__row">
            <label>项目描述</label>
            <el-input type="textarea" v-model="editDesc"></el-input>
          </p>
          <p class="project-edit__footer">
            <eg-button style="margin-right: 2rem" type="minor" @click="showEdit({ isShow: false })">取消</eg-button>
            <eg-button @click="editProject">保存</eg-button>
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
        currentPage: 1,
        pageSize: 10
      }
    },
    components: {},
    computed: {
      ...mapState([
        'currentNode',
        'groupList',
        'isModify',
        'projectTypeList',
        'editData',
        'isShowEdit',
        'isLoadingGroupList'
      ]),
      ...mapGetters([
        'groupTree',
        'projectId',
        'currentNodeId',
        'isLoadingMainGroupList'
      ]),
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
        'editProject',
        'updateFormData',
        'deleteProject',
        'showEdit'
      ]),
      currentOnChange (val) {
        this.currentPage = val
      },
      pageSizeOnChange (val) {
        this.pageSize = val
      }
    },
    watch: {
      projectId (newValue) {
        if (!window.isEmpty(newValue)) {
        }
      },
      groupTree (newValue) {
        if (!window.isEmpty(newValue)) {
          this.$nextTick(function () {
            this.$refs.tree.setCurrentKey(newValue[0].value)
          })
          this.updateFormData({ item: 'currentNode', value: newValue[0] || {} })
        }
      }
    },
    created () {
      if (!window.isEmpty(this.projectId)) {
      }
    },
    beforeDestroy () {
      this.showEdit({ isShow: false })
    }
  }
</script>
