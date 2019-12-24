<template>
  <div class="main-container config-price">
    <template v-if="!isShowEdit">
      <div class="config-scheme">
        <p class="scheme-title">电价方案查询</p>
        <eg-box slot="content">
          <template v-slot:headerLeft>
            <eg-input
              placeholder="方案名称搜索"
              :value="searchPriceName"
              @input="updateFormData({ item: 'searchPriceName', value: $event })"
            ></eg-input>
            <eg-button @click="search('price')">查询</eg-button>
          </template>
          <template v-slot:headerRight>
            <eg-button @click="showEdit({ isShow: true })">新建电价方案</eg-button>
          </template>
          <template v-slot:content>
            <div class="table-wrapper">
              <el-table height="100%" v-loading="isLoadingPriceList" :data="priceList">
                <el-table-column prop="Name" label="方案名称" align="center"></el-table-column>
                <el-table-column prop="StatusText" label="启用状态" align="center"></el-table-column>
                <el-table-column label="操作" align="center">
                  <template slot-scope="{ row }">
                    <eg-button type="text" @click="showEdit({ isShow: true, row })" style="margin-right: 1.5rem;">编辑</eg-button>
                    <eg-button
                      v-if="row.Status === 0"
                      type="text" color="success"
                      @click="modifySchemeStatus({ row, status: 3 })">停用</eg-button>
                    <eg-button
                      v-else
                      type="text" color="danger"
                      @click="modifySchemeStatus({ row, status: 0 })">启用</eg-button>
                  </template>
                </el-table-column>
              </el-table>
              <el-pagination
                @current-change="currentPageOnChange('currentPricePage', $event)"
                :current-page="currentPricePage"
                :page-size="5"
                layout="total, ->, prev, pager, next, jumper"
                :total="totalPriceCount"
              ></el-pagination>
            </div>
          </template>
        </eg-box>
      </div>
      <div class="config-room">
        <p class="scheme-title">房间方案查询</p>
        <eg-box slot="content">
          <template v-slot:headerLeft>
            <eg-input
              placeholder="房间编号/名称搜索"
              :value="searchRoomName"
              @input="updateFormData({ item: 'searchRoomName', value: $event })"
            ></eg-input>
            <eg-input
              placeholder="电价方案搜索"
              :value="searchSchemeType"
              @input="updateFormData({ item: 'searchSchemeType', value: $event })"
            ></eg-input>
            <eg-button @click="search('room')">查询</eg-button>
          </template>
          <template v-slot:content>
            <div class="table-wrapper">
              <el-table height="100%" v-loading="isLoadingRoomList" :data="roomList">
                <el-table-column prop="RoomNo" label="房间编号" align="center"></el-table-column>
                <el-table-column prop="FullName" label="房间信息" align="center"></el-table-column>
                <el-table-column prop="SchemeName" label="电价方案" align="center"></el-table-column>
              </el-table>
              <el-pagination
                @current-change="currentPageOnChange('currentPricePage', $event)"
                :current-page="currentPricePage"
                :page-size="5"
                layout="total, ->, prev, pager, next, jumper"
                :total="totalPriceCount"
              ></el-pagination>
            </div>
          </template>
        </eg-box>
      </div>
    </template>
    <template v-if="isShowEdit">
      <eg-box class="edit-wrapper">
        <div class="edit-header" slot="headerLeft">
          <span class="edit-header__title">{{isModify ? '编辑' : '添加'}}电价方案</span>
          <eg-button type="text" @click="showEdit({ isShow: false })">返回列表</eg-button>
        </div>
        <template v-slot:content>
          <div class="price-edit">
            <div class="price-edit__row">
              <label class="price-edit__lable">方案名称</label>
              <eg-input
                :value="editData.Name"
                @input="editDataOnChange('Name', $event)"
              ></eg-input>
              <i class="iconfont icon-content_icon_required"></i>
              <label class="price-edit__lable" style="margin-left: 5rem;">启用状态</label>
              <el-radio-group :value="editData.Status" @input="editDataOnChange('Status', $event)">
                <el-radio :label="0">启用</el-radio>
                <el-radio :label="3">停用</el-radio>
              </el-radio-group>
            </div>
            <div class="price-edit__row">
              <label class="price-edit__lable">电价设置</label>
              <div class="price-edit__price">
                <div
                  class="price-edit__price-block"
                  v-for="(pC, pCIndex) in editPriceContent"
                  :key="`content-${pCIndex}`"
                >
                  <p class="price-block__title">
                    <span style="margin-right: 1rem">时段{{pCIndex + 1}}</span>
                    <eg-button v-if="pCIndex !== 0" type="text" @click="removeEditPriceContentItem(pCIndex)">删除时段</eg-button>
                  </p>
                  <div class="price-block__condition">
                    <el-date-picker
                      :value="[pC.DateStart, pC.DateEnd]"
                      type="daterange"
                      :editable="false"
                      :clearable="false"
                      range-separator="至"
                      format="M月d日"
                      unlink-panels
                      :picker-options="{
                        disabledDate: priceDateRangeDisabled(pCIndex)
                      }"
                      @input="editPriceDateOnChange(pCIndex, $event)"
                    ></el-date-picker>
                    <el-select
                      :value="pC.PriceType"
                      @change="editPriceContentDataOnChange({ index: pCIndex, key: 'PriceType', value: $event })"
                    >
                      <el-option :value="0" label="分时电价"></el-option>
                      <el-option :value="1" label="统一电价"></el-option>
                    </el-select>
<!--                    <el-checkbox-->
<!--                      :checked="pC.StepPrice"-->
<!--                      @change="editPriceContentDataOnChange({ index: pCIndex, key: 'StepPrice', value: $event })"-->
<!--                    >阶梯电价</el-checkbox>-->
                    <template v-if="pC.StepPrice">
                      <label>每月结算日</label>
                      <eg-input
                        :value="pC.SettlDay"
                        is-number
                        is-integer
                        @input="editPriceContentDataOnChange({ index: pCIndex, key: 'SettlDay', value: $event })"
                      ></eg-input>
                    </template>
                  </div>
                  <!-- 阶梯电价 -->
                  <template v-if="pC.StepPrice">
                    <div
                      class="price-block__price-row"
                      v-for="(p, pIndex) in pC.PricePeriod"
                      :key="`period-${pIndex}`"
                    >
                      <label>第{{pIndex + 1}}阶梯</label>
                      <!-- 统一电价 -->
                      <eg-input
                        v-if="pC.PriceType"
                        placeholder="总电价"
                        :value="pC.PricePeriod[pIndex].AvgPrice"
                        suffixText="kWh"
                        is-number
                        @input="editPriceContentPeriodDataOnChange({ pCIndex, pIndex, key: 'AvgPrice', value: $event })">
                      </eg-input>
                      <!-- 分时电价 -->
                      <template v-else>
                        <eg-input
                          :placeholder="pIndex === pC.PricePeriod.length - 1 ? '电量上限' : '电量下限'"
                          :value="pIndex === pC.PricePeriod.length - 1 ? pC.PricePeriod[pIndex].EleDownLine : pC.PricePeriod[pIndex].EleUpLine"
                          suffixText="kWh"
                          is-number
                          :disabled="pIndex === pC.PricePeriod.length - 1"
                          @input="editPriceLineOnChange(pC, { pCIndex, pIndex, key: 'EleUpLine', value: $event })">
                        </eg-input>
                        <eg-input
                          placeholder="尖电价"
                          :value="pC.PricePeriod[pIndex].Point"
                          suffixText="kWh"
                          is-number
                          @input="editPriceContentPeriodDataOnChange({ pCIndex, pIndex, key: 'Point', value: $event })">
                        </eg-input>
                        <eg-input
                          placeholder="峰电价"
                          :value="pC.PricePeriod[pIndex].Peak"
                          suffixText="kWh"
                          is-number
                          @input="editPriceContentPeriodDataOnChange({ pCIndex, pIndex, key: 'Peak', value: $event })">
                        </eg-input>
                        <eg-input
                          placeholder="平电价"
                          :value="pC.PricePeriod[pIndex].Flat"
                          suffixText="kWh"
                          is-number
                          @input="editPriceContentPeriodDataOnChange({ pCIndex, pIndex, key: 'Flat', value: $event })">
                        </eg-input>
                        <eg-input
                          placeholder="谷电价"
                          :value="pC.PricePeriod[pIndex].Valley"
                          suffixText="kWh"
                          is-number
                          @input="editPriceContentPeriodDataOnChange({ pCIndex, pIndex, key: 'Valley', value: $event })">
                        </eg-input>
                      </template>
                    </div>
                  </template>
                  <!-- 非阶梯电价 -->
                  <div class="price-block__price-row" v-else>
                    <!-- 统一电价 -->
                    <eg-input
                      v-if="pC.PriceType"
                      placeholder="总电价"
                      :value="pC.PricePeriod[0].AvgPrice"
                      suffixText="kWh"
                      is-number
                      @input="editPriceContentPeriodDataOnChange({ pCIndex, pIndex: 0, key: 'AvgPrice', value: $event })">
                    </eg-input>
                    <!-- 分时电价 -->
                    <template v-else>
                      <eg-input
                        placeholder="尖电价"
                        :value="pC.PricePeriod[0].Point"
                        suffixText="kWh"
                        is-number
                        @input="editPriceContentPeriodDataOnChange({ pCIndex, pIndex: 0, key: 'Point', value: $event })">
                      </eg-input>
                      <eg-input
                        placeholder="峰电价"
                        :value="pC.PricePeriod[0].Peak"
                        suffixText="kWh"
                        is-number
                        @input="editPriceContentPeriodDataOnChange({ pCIndex, pIndex: 0, key: 'Peak', value: $event })">
                      </eg-input>
                      <eg-input
                        placeholder="平电价"
                        :value="pC.PricePeriod[0].Flat"
                        suffixText="kWh"
                        is-number
                        @input="editPriceContentPeriodDataOnChange({ pCIndex, pIndex: 0, key: 'Flat', value: $event })">
                      </eg-input>
                      <eg-input
                        placeholder="谷电价"
                        :value="pC.PricePeriod[0].Valley"
                        suffixText="kWh"
                        is-number
                        @input="editPriceContentPeriodDataOnChange({ pCIndex, pIndex: 0, key: 'Valley', value: $event })">
                      </eg-input>
                    </template>
                  </div>
                </div>
                <eg-button type="text" @click="addEditPriceContentItem">添加时段</eg-button>
              </div>
              <i class="iconfont icon-content_icon_required"></i>
            </div>
            <div class="price-edit__row">
              <label class="price-edit__lable">执行房间</label>
              <div class="price-edit__room" v-loading="isLoadingEditRoomList || isLoadingSchemeDetail">
                <eg-input
                  placeholder="房间名称搜索"
                  v-model="editRoomSearchName"
                >
                  <i slot="suffix" class="iconfont icon-content_icon_search"></i>
                </eg-input>
                <el-tree
                  v-if="!isLoadingEditRoomList && !isLoadingSchemeDetail"
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
            <div class="price-edit__footer">
              <eg-button style="margin-right: 2rem" type="minor" @click="showEdit(false)">取消</eg-button>
              <eg-button @click="saveEdit">保存</eg-button>
            </div>
          </div>
        </template>
      </eg-box>
    </template>
  </div>
</template>

<script>
  import './price.scss'
  import { createNamespacedHelpers } from 'vuex'
  import moment from 'moment'
  const { mapGetters, mapActions, mapState } = createNamespacedHelpers('config/price')
  export default {
    name: 'config-price',
    data () {
      return {
        editRoomSearchName: ''
      }
    },
    components: {},
    computed: {
      ...mapState([
        'searchPriceName',
        'searchRoomName',
        'priceList',
        'isLoadingPriceList',
        'currentPricePage',
        'totalPriceCount',
        'currentRoomPage',
        'totalRoomCount',
        'isLoadingRoomList',
        'roomList',
        'searchSchemeType',
        'isShowEdit',
        'isModify',
        'editData',
        'editPriceContent',
        'editRoomTree',
        'schemeDetail',
        'isLoadingEditRoomList',
        'isLoadingSchemeDetail'
      ]),
      ...mapGetters([
        'projectId'
      ])
    },
    methods: {
      ...mapActions([
        'updateFormData',
        'getPriceList',
        'showEdit',
        'getRoomList',
        'updateObjectData',
        'editPriceContentDataOnChange',
        'editPriceContentPeriodDataOnChange',
        'addEditPriceContentItem',
        'removeEditPriceContentItem',
        'editScheme',
        'modifySchemeStatus'
      ]),
      currentPageOnChange (item, value) {
        this.updateFormData({ item, value })
      },
      search (type) {
        switch (type) {
          case 'price':
            this.currentPageOnChange('currentPricePage', 1)
            this.getPriceList()
            break
          case 'room':
            this.currentPageOnChange('currentRoomPage', 1)
            this.getRoomList()
            break
        }
      },
      editDataOnChange (key, value) {
        this.updateObjectData({ obj: 'editData', item: key, value })
      },
      editPriceDateOnChange (index, value) {
        this.editPriceContentDataOnChange({ index, key: 'DateStart', value: value[0] })
        this.editPriceContentDataOnChange({ index, key: 'DateEnd', value: value[1] })
      },
      roomTreeFilter (value, data) {
        return data.label.indexOf(value) > -1
      },
      priceDateRangeDisabled (pCIndex) {
        let periods = this.editPriceContent.map(pC => [pC.DateStart, pC.DateEnd])
        return (date) => {
          let start = moment().startOf('year').toDate()
          let end = moment().endOf('year').toDate()
          return !(date >= start && date <= end) || periods.some((p, index) => ((index !== pCIndex) && (date >= p[0] && date <= p[1])))
        }
      },
      saveEdit () {
        let ids = this.$refs.editRoomTree.getCheckedKeys(true)
        this.editDataOnChange('GroupIds', ids)
        this.editScheme()
      },
      editPriceLineOnChange (pC, { pCIndex, pIndex, key, value }) {
        if (pIndex === pC.PricePeriod.length - 2) {
          this.editPriceContentPeriodDataOnChange({ pCIndex, pIndex: pIndex + 1, key: 'EleDownLine', value })
        }
        this.editPriceContentPeriodDataOnChange({ pCIndex, pIndex, key, value })
      }
    },
    watch: {
      projectId (newValue) {
        if (!isEmpty(newValue)) {
          this.getPriceList()
          this.getRoomList()
        }
      },
      editRoomSearchName (newValue) {
        this.$refs.editRoomTree.filter(newValue)
      }
    },
    created () {
      if (!isEmpty(this.projectId)) {
        this.getPriceList()
        this.getRoomList()
      }
    },
    beforeDestroy () {
      this.showEdit({ isShow: false })
    }
  }
</script>
