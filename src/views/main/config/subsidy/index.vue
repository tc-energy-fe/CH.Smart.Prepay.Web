<template>
  <div class="main-container config-subsidy">
    <template v-if="!isShowEdit">
      <div class="config-scheme">
        <p class="scheme-title">补助方案查询</p>
        <eg-box>
          <template v-slot:headerLeft>
            <eg-input
              placeholder="方案名称搜索"
              :value="searchTaskName"
              @input="updateStateData({item: 'searchTaskName', value: $event})"
            ></eg-input>
            <eg-button @click="searchTask">查询</eg-button>
          </template>
          <template v-slot:headerRight>
            <eg-button @click="showEdit({ isShow: true })">新建补助方案</eg-button>
          </template>
          <div class="table-wrapper" slot="content">
            <el-table v-loading="isLoadingTaskList" :data="taskList">
              <el-table-column prop="Name" label="方案名称" align="center"></el-table-column>
              <el-table-column prop="SubTypeText" label="补助方式" align="center"></el-table-column>
              <el-table-column prop="IsClearText" label="补助清零" align="center"></el-table-column>
              <el-table-column prop="StatusText" label="启用状态" align="center"></el-table-column>
              <el-table-column label="操作" align="center">
                <template slot-scope="{ row }">
                  <eg-button type="text" @click="showEdit({ isShow: true, row })" style="margin-right: 1.5rem;">编辑</eg-button>
                  <eg-button
                    v-if="row.Status === 0"
                    type="text" color="success"
                    @click="modifyTaskStatus({ row, status: 3 })">停用</eg-button>
                  <eg-button
                    v-else
                    type="text" color="danger"
                    @click="modifyTaskStatus({ row, status: 0 })">启用</eg-button>
                </template>
              </el-table-column>
            </el-table>
            <el-pagination
              @current-change="currentTaskPageOnChange"
              :current-page="currentPageTask"
              :page-size="pageSize"
              layout="total, ->, prev, pager, next, jumper"
              :total="totalCountTask"
            ></el-pagination>
          </div>
        </eg-box>
      </div>
      <div class="config-room">
        <p class="scheme-title">房间方案查询</p>
        <eg-box>
          <template v-slot:headerLeft>
            <eg-input
              placeholder="房间编号/名称搜索"
              :value="searchNameRoom"
              @input="updateStateData({item: 'searchNameRoom', value: $event})"
            ></eg-input>
            <eg-input
              placeholder="补助方案搜索"
              :value="searchTaskType"
              @input="updateStateData({item: 'searchTaskType', value: $event})"
            ></eg-input>
            <eg-button @click="searchRoom">查询</eg-button>
          </template>
          <div class="table-wrapper" slot="content">
            <el-table v-loading="isLoadingRoomList" :data="roomList">
              <el-table-column prop="RoomNo" label="房间编号" align="center"></el-table-column>
              <el-table-column prop="FullName" label="房间信息" align="center"></el-table-column>
              <el-table-column prop="TaskName" label="补助方案" align="center"></el-table-column>
            </el-table>
            <el-pagination
              @current-change="currentRoomPageOnChange"
              :current-page="currentPageRoom"
              :page-size="pageSize"
              layout="total, ->, prev, pager, next, jumper"
              :total="totalCountRoom"
            ></el-pagination>
          </div>
        </eg-box>
      </div>
    </template>
    <template v-if="isShowEdit">
      <eg-box class="edit-wrapper">
        <template v-slot:headerLeft>
          <div class="edit-header">
            <p class="edit-header__title">{{isModify ? '编辑' : '新建'}}余额报警方案</p>
            <eg-button type="text" @click="showEdit({isShow: false})">返回列表</eg-button>
          </div>
        </template>
        <template v-slot:content>
          <div class="subsidy-edit__row">
            <div class="subsidy-edit__row-item">
              <label>方案名称</label>
              <eg-input></eg-input>
              <i class="iconfont icon-content_icon_required"></i>
            </div>
            <div class="subsidy-edit__row-item">
              <label>补助方式</label>
              <el-select></el-select>
              <i class="iconfont icon-content_icon_required"></i>
              <template>
                <label class="term-label">春季学期</label>
                <month-range-picker
                  position="bottom"
                  :value="[springTerm.StartMonth, springTerm.EndMonth]"
                  @input="editTermMonthsOnChange(1, $event)"
                ></month-range-picker>
                <label class="term-label">秋季学期</label>
                <month-range-picker
                  position="bottom-end"
                  :value="[autumnTerm.StartMonth, autumnTerm.EndMonth]"
                  @input="editTermMonthsOnChange(2, $event)"
                ></month-range-picker>
              </template>
            </div>
          </div>
        </template>
      </eg-box>
    </template>
  </div>
</template>

<script>
  import { createNamespacedHelpers } from 'vuex'
  import MonthRangePicker from '@/components/month-picker'
  const { mapGetters, mapActions, mapState } = createNamespacedHelpers('config/subsidy')
  export default {
    name: 'config-subsidy',
    data () {
      return {
        month: [1, 11]
      }
    },
    components: { MonthRangePicker },
    computed: {
      ...mapState([
        'searchTaskName',
        'isShowEdit',
        'isModify',
        'taskList',
        'totalCountTask',
        'pageSize',
        'currentPageTask',
        'isLoadingTaskList',
        'roomList',
        'searchNameRoom',
        'searchTaskType',
        'currentPageRoom',
        'isLoadingRoomList',
        'totalCountRoom',
        'springTerm',
        'autumnTerm'
      ]),
      ...mapGetters([
      ]),
      projectId () {
        return this.$store.state.areaId
      }
    },
    methods: {
      ...mapActions([
        'updateStateData',
        'updateObjectData',
        'modifyTaskStatus',
        'getTaskList',
        'showEdit',
        'getRoomList'
      ]),
      searchTask () {
        this.updateStateData({ item: 'currentPageTask', value: 1 })
        this.getTaskList()
      },
      searchRoom () {
        this.updateStateData({ item: 'currentPageRoom', value: 1 })
        this.getRoomList()
      },
      currentTaskPageOnChange (value) {
        this.updateStateData({ item: 'currentPageTask', value })
        this.getTaskList()
      },
      currentRoomPageOnChange (value) {
        this.updateStateData({ item: 'currentPageRoom', value })
        this.getRoomList()
      },
      editTermMonthsOnChange (type, value) {
        switch (type) {
          case 1:
            this.updateObjectData({ obj: 'springTerm', item: 'StartMonth', value: value[0] })
            this.updateObjectData({ obj: 'springTerm', item: 'EndMonth', value: value[1] })
            break
          case 2:
            this.updateObjectData({ obj: 'autumnTerm', item: 'StartMonth', value: value[0] })
            this.updateObjectData({ obj: 'autumnTerm', item: 'EndMonth', value: value[1] })
            break
        }
      }
    },
    watch: {
      projectId (newId) {
        if (newId) {
          this.searchTask()
          this.searchRoom()
        }
      }
    },
    created () {
      if (this.projectId) {
        this.searchTask()
        this.searchRoom()
      }
    },
    beforeDestroy () {
      this.showEdit({ isShow: false })
    }
  }
</script>

<style scoped lang="scss" src="./subsidy.scss"/>
