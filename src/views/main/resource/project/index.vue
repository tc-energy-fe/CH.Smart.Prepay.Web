<template>
  <div class="resource-project main-container">
    <eg-box v-if="!isShowEdit">
      <template v-slot:headerLeft>
        <eg-input
          placeholder="项目名称搜索"
        ></eg-input>
        <el-select
          :value="typeId"
          placeholder="项目类型"
          @change="typeOnChange"
        >
          <el-option
            v-for="item in projectTypeList"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
        <eg-button @click="getProjectList">查询</eg-button>
      </template>
      <template v-slot:headerRight>
        <eg-button @click="showEdit">新建项目</eg-button>
      </template>
      <template v-slot:content>
        <el-table :data="projectList">
          <el-table-column label="项目名称" prop="Name" align="center"></el-table-column>
          <el-table-column label="项目类型" prop="typeText" align="center"></el-table-column>
          <el-table-column label="项目描述" prop="Desc" align="center"></el-table-column>
          <el-table-column label="创建时间" prop="CreateTime" align="center" min-width="140"></el-table-column>
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
          :total="projectList.length"
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
          <label>项目类型</label>
          <el-select :value="editTypeId" @change="editTypeOnChange">
            <el-option
              v-for="item in projectTypeList"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
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
</template>

<script>
  import './project.scss'
  import { createNamespacedHelpers } from 'vuex'
  const { mapGetters, mapActions, mapState } = createNamespacedHelpers('resource/project')
  export default {
    name: 'resource-project',
    data () {
      return {
        currentPage: 1,
        pageSize: 10
      }
    },
    components: {},
    computed: {
      ...mapState([
        'projectList',
        'typeId',
        'editTypeId',
        'isModify',
        'projectTypeList',
        'editData',
        'isShowEdit'
      ]),
      ...mapGetters([]),
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
        'getProjectType',
        'getProjectList',
        'setEditData',
        'updateObjectData',
        'editProject',
        'updateFormData',
        'deleteProject',
        'showEdit'
      ]),
      typeOnChange (val) {
        this.updateFormData({ item: 'typeId', value: val })
      },
      editTypeOnChange (val) {
        this.updateFormData({ item: 'editTypeId', value: val })
      },
      currentOnChange (val) {
        this.currentPage = val
      },
      pageSizeOnChange (val) {
        this.pageSize = val
      }
    },
    watch: {},
    created () {
      this.getProjectType()
    },
    beforeDestroy () {
    }
  }
</script>
