<template>
  <div class="main-container config-subsidy">
    <template v-if="!isShowEdit">
      <div class="config-tab">
        <eg-tab-group v-model="tabIndex">
          <eg-tab-button :label="1">补助方案管理</eg-tab-button>
          <eg-tab-button :label="2">房间方案查询</eg-tab-button>
        </eg-tab-group>
      </div>
      <eg-box v-show="tabIndex===1" class="config-scheme">
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
        <template v-slot:content>
          <el-table v-loading="isLoadingTaskList" :data="taskList" key="subsidy">
            <el-table-column prop="Name" label="方案名称" align="center"></el-table-column>
            <el-table-column prop="SubTypeText" label="补助方式" align="center"></el-table-column>
            <el-table-column prop="IsClearText" label="补助清零" align="center"></el-table-column>
            <el-table-column prop="StatusText" label="启用状态" align="center"></el-table-column>
            <el-table-column label="操作" align="center">
              <template slot-scope="{ row }">
                <eg-button type="text" @click="showEdit({ isShow: true, row })" style="margin-right: 1.5rem;">编辑</eg-button>
                <eg-button
                  v-if="row.Status === 0"
                  type="text" color="danger"
                  @click="modifySubsidyStatus({ row, status: 3 })">停用</eg-button>
                <eg-button
                  v-else
                  type="text" color="success"
                  @click="modifySubsidyStatus({ row, status: 0 })">启用</eg-button>
              </template>
            </el-table-column>
          </el-table>
          <el-pagination
            background
            @current-change="currentTaskPageOnChange"
            @size-change="taskPageSizeOnChange"
            :current-page="currentPageTask"
            :page-size="taskPageSize"
            :page-sizes="[10, 15, 20, 25]"
            layout="total, ->, prev, pager, next, sizes, jumper"
            :total="totalCountTask"
          ></el-pagination>
        </template>
      </eg-box>
      <eg-box v-show="tabIndex===2" class="config-room">
        <template v-slot:headerLeft>
          <eg-input
            placeholder="户号/房间信息搜索"
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
        <template v-slot:content>
          <el-table v-loading="isLoadingRoomList" :data="roomList" key="room">
            <el-table-column prop="RoomNo" label="户号" align="center"></el-table-column>
            <el-table-column prop="FullName" label="房间信息" align="center"></el-table-column>
            <el-table-column prop="TaskName" label="补助方案" align="center"></el-table-column>
          </el-table>
          <el-pagination
            background
            @current-change="currentRoomPageOnChange"
            @size-change="roomPageSizeOnChange"
            :current-page="currentPageRoom"
            :page-size="roomPageSize"
            :page-sizes="[10, 15, 20, 25]"
            layout="total, ->, prev, pager, next, sizes, jumper"
            :total="totalCountRoom"
          ></el-pagination>
        </template>
      </eg-box>
    </template>
    <template v-if="isShowEdit">
      <eg-box class="edit-wrapper">
        <template v-slot:headerLeft>
          <div class="edit-header">
            <p class="edit-header__title">{{isModify ? '编辑' : '新建'}}补助方案</p>
            <eg-button type="text" @click="showEdit({isShow: false})">返回列表</eg-button>
          </div>
        </template>
        <div class="edit-content" slot="content">
          <div class="subsidy-edit__row">
            <div class="subsidy-edit__row-item">
              <label class="subsidy-edit__row-label">方案名称</label>
              <eg-input :value="editData.Name" @input="editDataOnChange('Name', $event)"></eg-input>
              <i class="iconfont icon-content_icon_required"></i>
            </div>
            <div class="subsidy-edit__row-item">
              <label class="subsidy-edit__row-label">补助方式</label>
              <el-select
                :value="editData.SubType"
                @change="editSubTypeOnChange"
              >
                <el-option
                  v-for="t in subType"
                  :value="t.value"
                  :label="t.label"
                  :key="t.value"
                ></el-option>
              </el-select>
              <i class="iconfont icon-content_icon_required"></i>
              <template v-if="editData.SubType === 3">
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
          <div class="subsidy-edit__row">
            <div class="subsidy-edit__row-item">
              <label class="subsidy-edit__row-label">补助清零</label>
              <el-radio-group :value="editData.IsClear" @input="editDataOnChange('IsClear', $event)">
                <el-radio :label="true">是</el-radio>
                <el-radio :label="false">否</el-radio>
              </el-radio-group>
            </div>
            <div class="subsidy-edit__row-item">
              <label class="subsidy-edit__row-label">启用状态</label>
              <el-radio-group :value="editData.Status" @input="editDataOnChange('Status', $event)">
                <el-radio :label="0">启用</el-radio>
                <el-radio :label="3">停用</el-radio>
              </el-radio-group>
            </div>
          </div>
          <div class="subsidy-edit__row">
            <label class="subsidy-edit__row-label">补助金额</label>
            <div class="edit-money__block" v-loading="isLoadingTaskDic">
              <div v-for="(p, index) in pricePeriods" class="edit-money__btn-bar" :key="index">
                <p>
                  <span style="margin-right: 1rem;">时段{{index + 1}}</span>
                  <eg-button
                    v-if="index !== 0"
                    type="text" color="danger"
                    @click="deletePricePeriod(index)">删除时段</eg-button>
                </p>
                <eg-checkbox-group
                  v-if="!isLoadingTaskDic && !isLoadingTaskDetail"
                  :size="editData.SubType === 1 ? 'short' : ''"
                  :value="p[`Days_${editData.SubType}`]"
                  @change="editPricePeriodDataOnChange({ index, key: `Days_${editData.SubType}`, value: $event })">
                  <eg-checkbox-button
                    v-for="(d, index) in editDic"
                    :label="d.value"
                    :key="index">{{d.name}}</eg-checkbox-button>
                </eg-checkbox-group>
                <p>
                  <eg-input
                    :value="p.Monney"
                    placeholder="请输入金额"
                    suffix-text="元"
                    is-number
                    @input="editPricePeriodDataOnChange({ index, key: 'Monney', value: $event })"></eg-input>
                </p>
              </div>
              <eg-button type="text" @click="addPricePeriod">添加时段</eg-button>
            </div>
            <i class="iconfont icon-content_icon_required"></i>
          </div>
          <div class="subsidy-edit__row">
            <label class="subsidy-edit__row-label">执行房间</label>
            <div class="edit-room__block">
              <eg-input
                placeholder="门牌编号搜索"
                v-model="editRoomSearchName"
              >
                <i slot="suffix" class="iconfont icon-content_icon_search"></i>
              </eg-input>
              <el-tree
                v-if="!isLoadingEditRoomList && !isLoadingTaskDetail"
                ref="editRoomTree"
                :data="editRoomTree"
                default-expand-all
                show-checkbox
                node-key="value"
                :default-checked-keys="editData.GroupIds"
                :filter-node-method="roomTreeFilter"
              ></el-tree>
            </div>
            <i class="iconfont icon-content_icon_required"></i>
          </div>
          <div class="subsidy-edit__footer">
            <eg-button style="margin-right: 2rem" type="minor" @click="showEdit(false)">取消</eg-button>
            <eg-button @click="saveEdit">保存</eg-button>
          </div>
        </div>
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
        editRoomSearchName: '',
        tabIndex: 1
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
        'taskPageSize',
        'isLoadingTaskList',
        'roomList',
        'searchNameRoom',
        'searchTaskType',
        'currentPageRoom',
        'roomPageSize',
        'isLoadingRoomList',
        'totalCountRoom',
        'springTerm',
        'autumnTerm',
        'subType',
        'editData',
        'pricePeriods',
        'editRoomTree',
        'isLoadingEditRoomList',
        'isLoadingTaskDetail',
        'isLoadingTaskDic',
        'editDic'
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
        'getRoomList',
        'editPricePeriodDataOnChange',
        'getTaskDic',
        'addPricePeriod',
        'deletePricePeriod',
        'editSubsidy',
        'modifySubsidyStatus'
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
      taskPageSizeOnChange (value) {
        this.updateStateData({ item: 'taskPageSize', value })
        this.currentTaskPageOnChange(1)
      },
      currentRoomPageOnChange (value) {
        this.updateStateData({ item: 'currentPageRoom', value })
        this.getRoomList()
      },
      roomPageSizeOnChange (value) {
        this.updateStateData({ item: 'roomPageSize', value })
        this.currentRoomPageOnChange(1)
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
      },
      editDataOnChange (key, value) {
        this.updateObjectData({ obj: 'editData', item: key, value })
      },
      editSubTypeOnChange ($event) {
        this.editDataOnChange('SubType', $event)
        this.getTaskDic()
      },
      roomTreeFilter (value, data) {
        return data.label.indexOf(value) > -1
      },
      saveEdit () {
        let ids = this.$refs.editRoomTree.getCheckedKeys(true)
        this.editDataOnChange('GroupIds', ids)
        this.editSubsidy()
      }
    },
    watch: {
      projectId (newId) {
        if (newId) {
          this.searchTask()
          this.searchRoom()
        }
        this.showEdit({ isShow: false })
      },
      editRoomSearchName (newValue) {
        this.$refs.editRoomTree.filter(newValue)
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
