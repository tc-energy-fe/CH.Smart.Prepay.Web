<template>
  <div class="main-container system-log">
    <eg-box class="log-box">
      <template v-slot:headerLeft>
        <eg-input placeholder="操作人搜索" v-model="searchNameValue"/>
        <el-select placeholder="操作类型" v-model="searchOperateIdValue">
          <el-option
            v-for="(item, index) of searchOperateTypeList"
            :key="index"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <el-date-picker
          type="daterange"
          v-model="searchDateRangeValue"
          :editable="false"
          :clearable="false"
          range-separator="至"
        />
        <eg-button @click="getLogListData">查询</eg-button>
      </template>
      <template v-slot:content>
        <el-table :data="logList" v-loading="isLoadingLogList">
          <el-table-column label="操作人" prop="OperatorName" align="center"/>
          <el-table-column label="操作类型" prop="OTypeText" align="center"/>
          <el-table-column label="操作时间" prop="Time" align="center"/>
          <el-table-column label="操作内容" prop="Content" align="center"/>
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
        'searchName',
        'searchOperateId',
        'searchOperateTypeList',
        'searchDateRange',
        'logList',
        'currentPage',
        'pageSize',
        'totalCount',
        'isLoadingLogList'
      ]),
      ...mapGetters([
      ]),
      projectId () {
        return this.$store.state.areaId
      },
      searchNameValue: {
        get () { return this.searchName },
        set (value) { this.updateStateData({ item: 'searchName', value }) }
      },
      searchOperateIdValue: {
        get () { return this.searchOperateId },
        set (value) { this.updateStateData({ item: 'searchOperateId', value }) }
      },
      searchDateRangeValue: {
        get () { return this.searchDateRange },
        set (value) { this.updateStateData({ item: 'searchDateRange', value }) }
      }
    },
    methods: {
      ...mapActions([
        'getLogOperateType',
        'getLogListData',
        'currentPageOnChange',
        'pageSizeOnChange',
        'updateStateData',
        'updateObjectData'
      ])
    },
    watch: {
    },
    created () {
      this.getLogOperateType()
    },
    beforeDestroy () {
    }
  }
</script>

<style scoped lang="scss" src="./log.scss" />
