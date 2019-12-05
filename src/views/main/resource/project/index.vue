<template>
  <div class="resource-project main-container">
    <eg-box>
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
        <el-button>查询</el-button>
      </template>
      <template v-slot:headerRight>
        <el-button>新建项目</el-button>
      </template>
      <template v-slot:content>
        <el-table :data="projectList">
          <el-table-column label="项目名称" prop="Name" align="center"></el-table-column>
          <el-table-column label="项目类型" prop="TypeText" align="center"></el-table-column>
          <el-table-column label="项目描述" prop="Desc" align="center"></el-table-column>
          <el-table-column label="创建时间" prop="CreateTime" align="center"></el-table-column>
          <el-table-column label="操作" align="center"></el-table-column>
        </el-table>
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
      }
    },
    components: {},
    computed: {
      ...mapState([
        'projectList',
        'projectTypes',
        'typeId'
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
        'getProjectType'
      ])
    },
    watch: {},
    created () {
      this.getProjectType()
    },
    beforeDestroy () {}
  }
</script>
