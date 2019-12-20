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
                    <eg-button type="text" @click="showEdit({ data: row })" style="margin-right: 1.5rem;">编辑</eg-button>
                    <eg-button v-if="row.Status" type="text" color="success">停用</eg-button>
                    <eg-button v-else type="text" color="danger">启用</eg-button>
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
          <div class="price-edit__row">
            <label class="price-edit__lable">方案名称</label>
            <eg-input></eg-input>
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
                v-for="(pC, index) in editPriceContent"
                :key="`content-${index}`"
              >
                <p class="price-block__title">时段{{index + 1}}</p>
                <div class="price-block__condition">
                  <el-date-picker
                    type="daterange"
                    :editable="false"
                  ></el-date-picker>
                  <el-select
                    :value="pC.PriceType"
                    @change="editPriceContentDataOnChange('PriceType', $event)"
                  >
                    <el-option :value="0" label="分时电价"></el-option>
                    <el-option :value="1" label="统一电价"></el-option>
                  </el-select>
                  <el-checkbox
                    :checked="pC.StepPrice"
                    @change="editPriceContentDataOnChange(index, 'StepPrice', $event)"
                  >阶梯电价</el-checkbox>
                </div>
                <!-- 统一电价 -->
                <template v-if="pC.PriceType">
                  <template v-if="pC.StepPrice">
                    <eg-input
                      v-for="(p, index) in pC.PricePeriod"
                      :key="`period-${index}`"
                      suffixText="kWh">
                    </eg-input>
                  </template>
                  <template v-else>
                    <eg-input
                      suffixText="kWh">
                    </eg-input>
                  </template>
                </template>
              </div>
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
  const { mapGetters, mapActions, mapState } = createNamespacedHelpers('config/price')
  export default {
    name: 'config-price',
    data () {
      return {
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
        'editPriceContent'
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
        'editPriceContentDataOnChange'
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
      }
    },
    watch: {
      projectId (newValue) {
        if (!isEmpty(newValue)) {
          this.getPriceList()
          this.getRoomList()
        }
      }
    },
    created () {
      if (!isEmpty(this.projectId)) {
        this.getPriceList()
        this.getRoomList()
      }
    },
    beforeDestroy () {}
  }
</script>
