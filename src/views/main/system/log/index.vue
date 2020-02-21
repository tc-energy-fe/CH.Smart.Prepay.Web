<template>
  <div class="main-container system-log">
    <eg-box class="log-box">
      <template v-slot:headerLeft>
        <el-radio-group :value="logType" @input="updateStateData({item: 'logType', value: $event})">
          <el-radio-button :label="0">操作日志</el-radio-button>
          <el-radio-button :label="1">运行日志</el-radio-button>
        </el-radio-group>
        <template v-if="logTypeIsOperation">
          <eg-input
            placeholder="操作人搜索"
            :value="searchOperator"
            @input="updateStateData({item: 'searchOperator', value: $event})"
          />
          <el-select
            placeholder="操作类型"
            :value="searchOperateId"
            @input="updateStateData({item: 'searchOperateId', value: $event})"
          >
            <el-option
              label="--"
              value="total"
            />
            <el-option
              v-for="(item, index) of searchOperateTypeList"
              :key="index"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <el-date-picker
            type="daterange"
            :value="searchDateRangeOperate"
            @input="updateStateData({item: 'searchDateRangeOperate', value: $event})"
            :editable="false"
            :clearable="false"
            range-separator="至"
          />
        </template>
        <template v-if="logTypeIsRun">
          <eg-input
            placeholder="任务对象"
            :value="searchTaskName"
            @input="updateStateData({item: 'searchTaskName', value: $event})"
          />
          <el-select
            placeholder="任务类别"
            :value="searchTaskType"
            @input="updateStateData({item: 'searchTaskType', value: $event})"
          >
            <el-option
              label="--"
              value="total"
            />
            <el-option
              v-for="(item, index) of searchTaskTypeList"
              :key="index"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <el-date-picker
            type="daterange"
            :value="searchDateRangeTask"
            @input="updateStateData({item: 'searchDateRangeTask', value: $event})"
            :editable="false"
            :clearable="false"
            range-separator="至"
          />
          <el-select
            placeholder="执行结果"
            :value="searchTaskResult"
            @input="updateStateData({item: 'searchTaskResult', value: $event})"
          >
            <el-option
              label="--"
              value="total"
            />
            <el-option
              v-for="(item, index) of searchTaskResultList"
              :key="index"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </template>
        <eg-button @click="searchMethod">查询</eg-button>
      </template>
      <template v-slot:content>
        <template v-if="logTypeIsOperation">
          <el-table :data="operateLogList" v-loading="isLoadingOperateLogList" key="operation">
            <el-table-column label="操作人" prop="OperatorName" align="center"/>
            <el-table-column label="操作类型" prop="OTypeText" align="center"/>
            <el-table-column label="操作时间" prop="TimeText" align="center"/>
            <el-table-column label="操作内容" prop="Content" align="center"/>
          </el-table>
          <el-pagination
            key="operation"
            background
            layout="total, ->, prev, pager, next, sizes, jumper"
            :current-page="currentPageOperate"
            :page-size="pageSizeOperate"
            :total="totalCountOperate"
            :page-sizes="[10,20,50]"
            @current-change="currentPageOnChangeOperate"
            @size-change="pageSizeOnChangeOperate"
          />
        </template>
        <template v-if="logTypeIsRun">
          <el-table :data="taskLogList" v-loading="isLoadingTaskLogList" key="task">
            <el-table-column label="任务类别" prop="OTypeText" align="center"/>
            <el-table-column label="任务名称" prop="TaskName" align="center"/>
            <el-table-column label="任务对象" prop="OperatorObj" align="center"/>
            <el-table-column label="执行时间" prop="TimeText" align="center"/>
            <el-table-column label="执行结果" prop="ControlResultText" align="center"/>
          </el-table>
          <el-pagination
            key="task"
            background
            layout="total, ->, prev, pager, next, sizes, jumper"
            :current-page="currentPageTask"
            :page-size="pageSizeTask"
            :total="totalCountTask"
            :page-sizes="[10,20,50]"
            @current-change="currentPageOnChangeTask"
            @size-change="pageSizeOnChangeTask"
          />
        </template>
      </template>
    </eg-box>
  </div>
</template>

<script>
  import { createNamespacedHelpers } from 'vuex'
  const { mapState, mapGetters, mapActions } = createNamespacedHelpers('system/log')
  export default {
    name: 'Log',
    data () {
      return {
      }
    },
    components: {},
    computed: {
      ...mapState([
        'logType',
        'searchOperator',
        'searchOperateId',
        'searchOperateTypeList',
        'searchDateRangeOperate',
        'searchTaskName',
        'searchTaskType',
        'searchTaskTypeList',
        'searchDateRangeTask',
        'searchTaskResult',
        'searchTaskResultList',
        'operateLogList',
        'currentPageOperate',
        'pageSizeOperate',
        'totalCountOperate',
        'isLoadingOperateLogList',
        'taskLogList',
        'currentPageTask',
        'pageSizeTask',
        'totalCountTask',
        'isLoadingTaskLogList'
      ]),
      ...mapGetters([
        'logTypeIsOperation',
        'logTypeIsRun'
      ]),
      projectId () {
        return this.$store.state.areaId
      }
    },
    methods: {
      ...mapActions([
        'getLogOperateType',
        'getLogTaskType',
        'getOperateLogList',
        'getTaskLogList',
        'updateStateData',
        'updateObjectData'
      ]),
      searchMethod () {
        if (this.logTypeIsOperation) {
          this.currentPageOnChangeOperate(1)
        }
        if (this.logTypeIsRun) {
          this.currentPageOnChangeTask(1)
        }
      },
      currentPageOnChangeOperate (current) {
        this.updateStateData({ item: 'currentPageOperate', value: current })
        this.getOperateLogList()
      },
      pageSizeOnChangeOperate (size) {
        this.updateStateData({ item: 'pageSizeOperate', value: size })
        this.currentPageOnChangeOperate(1)
      },
      currentPageOnChangeTask (current) {
        this.updateStateData({ item: 'currentPageTask', value: current })
        this.getTaskLogList()
      },
      pageSizeOnChangeTask (size) {
        this.updateStateData({ item: 'pageSizeTask', value: size })
        this.currentPageOnChangeTask(1)
      }
    },
    watch: {
      projectId (newId) {
        if (newId) {
          this.searchMethod()
        }
      },
      logType () {
        if (this.projectId) {
          this.searchMethod()
        }
      },
      searchOperateId (newId) {
        if (this.projectId) {
          this.currentPageOnChangeOperate(1)
        }
      },
      searchTaskType (newId) {
        if (this.projectId) {
          this.currentPageOnChangeTask(1)
        }
      }
    },
    created () {
      this.getLogOperateType()
      this.getLogTaskType()
      if (this.projectId) {
        this.searchMethod()
      }
    },
    beforeDestroy () {
    }
  }
</script>

<style lang="scss" src="./log.scss" />
