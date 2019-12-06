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
          <el-table-column label="创建时间" prop="CreateTime" align="center"></el-table-column>
          <el-table-column label="操作" align="center">
            <template></template>
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
          <eg-input></eg-input>
        </p>
        <p class="project-edit__row">
          <label>项目类型</label>
          <el-select :value="editTypeId">
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
          <el-input type="textarea"></el-input>
        </p>
        <p class="project-edit__footer">
          <eg-button style="margin-right: 2rem" type="minor" @click="showEdit({ isShow: false })">取消</eg-button>
          <eg-button>保存</eg-button>
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
        pageSize: 10,
        isShowEdit: false
      }
    },
    components: {},
    computed: {
      ...mapState([
        'projectList',
        'projectTypes',
        'typeId',
        'editTypeId',
        'isModify'
      ]),
      ...mapGetters([]),
      projectTypeList () {
        let typeList = []
        let types = Object.entries(this.projectTypes) || []
        types.forEach(type => {
          typeList.push({
            value: type[0],
            label: type[1]
          })
        })
        return typeList
      }
    },
    methods: {
      ...mapActions([
        'getProjectType',
        'getProjectList',
        'setEditData'
      ]),
      currentOnChange (val) {
        this.currentPage = val
      },
      pageSizeOnChange (val) {
        this.pageSize = val
      },
      showEdit ({ data, isShow = true }) {
        if (isShow) {
          this.setEditData(data)
        }
        this.isShowEdit = isShow
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
