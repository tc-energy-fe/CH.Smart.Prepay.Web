<template>
  <div class="main-container resource-meter">
    <eg-box v-show="!isShowEdit">
      <template v-slot:headerLeft>
        <eg-input
          placeholder="表号搜索"
          :value="searchName"
          @input="updateFormData({item:'searchName', value:$event})"
        ></eg-input>
        <el-select
          :value="searchBranchTypeId"
          placeholder="分支类型"
          @change="updateFormData({ item: 'searchBranchTypeId', value: $event })"
        >
          <el-option
            v-for="item in branchTypeList"
            :value="item.value"
            :label="item.label"
            :key="item.value"
          ></el-option>
        </el-select>
        <el-select
          :value="searchSettleTypeId"
          placeholder="是否结算"
          @change="updateFormData({ item: 'searchSettleTypeId', value: $event })"
        >
          <el-option
            v-for="item in settleTypeList"
            :value="item.value"
            :label="item.label"
            :key="item.value"
          ></el-option>
        </el-select>
        <eg-button @click="search">查询</eg-button>
      </template>
      <template v-slot:headerRight>
        <eg-button style="margin-right: 1rem" @click="uploadFile">导入仪表</eg-button>
        <eg-button @click="showEdit({ isShow: true })">添加仪表</eg-button>
      </template>
      <template v-slot:content>
        <el-table :data="deviceList" v-loading="isLoadingDeviceList">
          <el-table-column label="表号" prop="PDeviceSN" align="center">
            <template slot-scope="{ row }">
              <eg-button type="text" @click="showDetail(true, row)">{{row.PDeviceSN}}</eg-button>
            </template>
          </el-table-column>
          <el-table-column label="所属网关" prop="GatewaySN" align="center"></el-table-column>
          <el-table-column label="分支类型" prop="IsSumText" align="center"></el-table-column>
          <el-table-column label="是否结算" prop="IsSettleText" align="center"></el-table-column>
          <el-table-column label="倍率" prop="Rate" align="center"></el-table-column>
          <el-table-column label="安装位置" prop="Address" align="center"></el-table-column>
          <el-table-column label="操作" align="center">
            <template slot-scope="{ row }">
              <eg-button type="text" @click="showEdit({ isShow: true, data: row })">编辑</eg-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          @current-change="currentPageOnChange"
          @size-change="pageSizeOnChange"
          :page-sizes="[10, 15, 20, 25]"
          :current-page="currentPage"
          :page-size="pageSize"
          layout="total, ->, prev, pager, next, sizes, jumper"
          :total="totalCount"
        ></el-pagination>
      </template>
    </eg-box>
    <eg-box v-if="isShowEdit">
      <template v-slot:headerLeft>
        <span class="meter-edit__title">{{isModify ? '编辑' : '添加'}}仪表</span>
        <eg-button type="text" @click="showEdit({ isShow: false })">返回列表</eg-button>
      </template>
      <template v-slot:content>
        <template v-if="!isModify">
          <div class="meter-edit__row">
            <div class="meter-edit__item">
              <label class="meter-edit__label">仪表编号</label>
              <eg-input
                placeholder="请输入内容"
                :value="editData.PDeviceSN"
                @input="editDataChange('PDeviceSN', $event)"
              ></eg-input>
              <i class="iconfont icon-content_icon_required"></i>
            </div>
            <div class="meter-edit__item">
              <label class="meter-edit__label">所属网关</label>
              <el-select
                placeholder="请选择网关"
                :value="editData.GatewayId"
                @change="editDataChange('GatewayId', $event)"
              >
                <el-option
                  v-for="g in editGatewayList"
                  :value="g.GatewayId"
                  :label="g.GatewaySN"
                  :key="g.GatewayId"
                ></el-option>
              </el-select>
              <i class="iconfont icon-content_icon_required"></i>
            </div>
          </div>
          <div class="meter-edit__row">
            <div class="meter-edit__item">
              <label class="meter-edit__label">电表模块</label>
              <el-select
                placeholder="请选择"
                :value="editData.EMeterModel"
                @change="editDataChange('EMeterModel', $event)"
              >
                <el-option :value="'三相'" :label="'三相'" :key="'三相'"></el-option>
                <el-option :value="'单相'" :label="'单相'" :key="'单相'"></el-option>
              </el-select>
            </div>
            <div class="meter-edit__item">
              <label class="meter-edit__label">分支类型</label>
              <el-select
                placeholder="请选择"
                :value="editData.IsSum"
                @change="editDataChange('IsSum', $event)"
              >
                <el-option :value="true" :label="'总表'" :key="true"></el-option>
                <el-option :value="false" :label="'分表'" :key="false"></el-option>
              </el-select>
              <i class="iconfont icon-content_icon_required"></i>
            </div>
          </div>
          <div class="meter-edit__row">
            <div class="meter-edit__item">
              <label class="meter-edit__label">费控方式</label>
              <el-select
                placeholder="请选择"
                :value="editData.LDeviceType"
                @change="editDataChange('LDeviceType', $event)"
              >
                <el-option
                  v-for="type in editEleTypeList"
                  :value="type.value"
                  :label="type.label"
                  :key="type.value"
                ></el-option>
              </el-select>
              <i class="iconfont icon-content_icon_required"></i>
            </div>
            <div class="meter-edit__item">
              <label class="meter-edit__label">是否结算</label>
              <el-radio :value="editData.IsSettle" :label="true" @change="editDataChange('IsSettle', true)">是</el-radio>
              <el-radio :value="editData.IsSettle" :label="false" @change="editDataChange('IsSettle', false)">否</el-radio>
            </div>
          </div>
          <div class="meter-edit__row">
            <div class="meter-edit__item">
              <label class="meter-edit__label">倍率</label>
              <eg-input
                placeholder="请输入内容"
                :value="editData.Rate"
                @input="editDataChange('Rate', $event)"
              ></eg-input>
              <i class="iconfont icon-content_icon_required"></i>
            </div>
            <div class="meter-edit__item">
              <label class="meter-edit__label">初始总读数</label>
              <eg-input
                :is-number="true"
                :is-negative="true"
                :value="editData.StartTotal"
                @input="editDataChange('StartTotal', $event)"
              >
                <span slot="suffix">kWh</span>
              </eg-input>
              <i class="iconfont icon-content_icon_required"></i>
            </div>
          </div>
          <div class="meter-edit__row">
            <div class="meter-edit__item">
              <label class="meter-edit__label">初始尖读数</label>
              <eg-input
                :is-number="true"
                :is-negative="true"
                :value="editData.StartPointed"
                @input="editDataChange('StartPointed', $event)"
              >
                <span slot="suffix">kWh</span>
              </eg-input>
              <i class="iconfont icon-content_icon_required"></i>
            </div>
            <div class="meter-edit__item">
              <label class="meter-edit__label">初始峰读数</label>
              <eg-input
                :is-number="true"
                :is-negative="true"
                :value="editData.StartPeak"
                @input="editDataChange('StartPeak', $event)"
              >
                <span slot="suffix">kWh</span>
              </eg-input>
              <i class="iconfont icon-content_icon_required"></i>
            </div>
          </div>
          <div class="meter-edit__row">
            <div class="meter-edit__item">
              <label class="meter-edit__label">初始平读数</label>
              <eg-input
                :is-number="true"
                :is-negative="true"
                :value="editData.StartFlat"
                @input="editDataChange('StartFlat', $event)"
              >
                <span slot="suffix">kWh</span>
              </eg-input>
              <i class="iconfont icon-content_icon_required"></i>
            </div>
            <div class="meter-edit__item">
              <label class="meter-edit__label">初始谷读数</label>
              <eg-input
                :is-number="true"
                :is-negative="true"
                :value="editData.StartValley"
                @input="editDataChange('StartValley', $event)"
              >
                <span slot="suffix">kWh</span>
              </eg-input>
              <i class="iconfont icon-content_icon_required"></i>
            </div>
          </div>
          <div class="meter-edit__row">
            <div class="meter-edit__item">
              <label class="meter-edit__label">电表厂商</label>
              <eg-input
                placeholder="请输入内容"
                :value="editData.Manufacturer"
                @input="editDataChange('Manufacturer', $event)"
              ></eg-input>
            </div>
          </div>
          <div class="meter-edit__row">
            <div class="meter-edit__item">
              <label class="meter-edit__label">安装位置</label>
              <eg-input
                width-type="long"
                placeholder="请输入内容"
                :value="editData.Address"
                @input="editDataChange('Address', $event)"
              ></eg-input>
            </div>
          </div>
          <div class="meter-edit__row">
            <div class="meter-edit__item">
              <label class="meter-edit__label">启用状态</label>
              <el-radio :value="editData.Status" :label="0" @change="editDataChange('Status', 0)">启用</el-radio>
              <el-radio :value="editData.Status" :label="3" @change="editDataChange('Status', 3)">停用</el-radio>
            </div>
          </div>
        </template>
        <template v-else>
          <div class="meter-edit__row">
            <div class="meter-edit__item">
              <label class="meter-edit__label">仪表编号</label>
              <eg-input
                placeholder="请输入内容"
                :value="editData.PDeviceSN"
                disabled
              ></eg-input>
              <i class="iconfont icon-content_icon_required"></i>
            </div>
            <div class="meter-edit__item">
              <label class="meter-edit__label">倍率</label>
              <eg-input
                is-number
                placeholder="请输入内容"
                :value="editData.Rate"
                @input="editDataChange('Rate', $event)"
              ></eg-input>
              <i class="iconfont icon-content_icon_required"></i>
            </div>
          </div>
          <div class="meter-edit__row">
            <div class="meter-edit__item">
              <label class="meter-edit__label">电表厂商</label>
              <eg-input
                placeholder="请输入内容"
                :value="editData.Manufacturer"
                @input="editDataChange('Manufacturer', $event)"
              ></eg-input>
            </div>
            <div class="meter-edit__item">
              <label class="meter-edit__label">启用状态</label>
              <el-radio :value="editData.Status" :label="0" @change="editDataChange('Status', 0)">启用</el-radio>
              <el-radio :value="editData.Status" :label="3" @change="editDataChange('Status', 3)">停用</el-radio>
            </div>
          </div>
          <div class="meter-edit__row">
            <div class="meter-edit__item">
              <label class="meter-edit__label">安装位置</label>
              <eg-input
                width-type="long"
                placeholder="请输入内容"
                :value="editData.Address"
                @input="editDataChange('Address', $event)"
              ></eg-input>
            </div>
          </div>
        </template>
        <p class="meter-edit__footer">
          <eg-button style="margin-right: 2rem" type="minor" @click="showEdit({ isShow: false })">取消</eg-button>
          <eg-button @click="editDevice">保存</eg-button>
        </p>
      </template>
    </eg-box>
    <el-dialog
      width="25rem"
      title="设备详情"
      :visible.sync="isShowDetail"
    >
      <template>
        <div class="meter-detail__row">
          <label>设备编码</label>
          <span>{{detailDeviceData.PDeviceSN}}</span>
        </div>
        <div class="meter-detail__row">
          <label>电表模块</label>
          <span>{{detailDeviceData.EMeterModel || '-'}}</span>
        </div>
        <div class="meter-detail__row">
          <label>分支类型</label>
          <span>{{detailDeviceData.IsSumText}}</span>
        </div>
        <div class="meter-detail__row">
          <label>费控方式</label>
          <span>{{detailDeviceData.LDeviceTypeText}}</span>
        </div>
        <div class="meter-detail__row">
          <label>是否结费</label>
          <span>{{detailDeviceData.IsSettleText}}</span>
        </div>
        <div class="meter-detail__row">
          <label>倍率</label>
          <span>{{detailDeviceData.Rate | currency}}</span>
        </div>
        <div class="meter-detail__row">
          <label>电表厂商</label>
          <span>{{detailDeviceData.Manufacturer || '-'}}</span>
        </div>
        <div class="meter-detail__row">
          <label>安装位置</label>
          <span>{{detailDeviceData.Address || '-'}}</span>
        </div>
        <div class="meter-detail__row">
          <label>初始总读数</label>
          <span>{{detailDeviceData.StartTotal | currency}} kWh</span>
        </div>
        <div class="meter-detail__row">
          <label>初始尖读数</label>
          <span>{{detailDeviceData.StartPointed | currency}} kWh</span>
        </div>
        <div class="meter-detail__row">
          <label>初始峰读数</label>
          <span>{{detailDeviceData.StartPeak | currency}} kWh</span>
        </div>
        <div class="meter-detail__row">
          <label>初始平读数</label>
          <span>{{detailDeviceData.StartFlat | currency}} kWh</span>
        </div>
        <div class="meter-detail__row">
          <label>初始谷读数</label>
          <span>{{detailDeviceData.StartValley | currency}} kWh</span>
        </div>
      </template>
      <div class="meter-detail__footer" slot="footer">
        <eg-button type="minor" @click="showDetail(false)">关闭</eg-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import './meter.scss'
  import { createNamespacedHelpers } from 'vuex'
  const { mapGetters, mapActions, mapState } = createNamespacedHelpers('resource/meter')
  export default {
    name: 'resource-meter',
    data () {
      return {
        detailDeviceData: {},
        isShowDetail: false
      }
    },
    components: {},
    computed: {
      ...mapState([
        'searchName',
        'branchTypeList',
        'settleTypeList',
        'searchBranchTypeId',
        'searchSettleTypeId',
        'currentPage',
        'pageSize',
        'totalCount',
        'deviceList',
        'isLoadingDeviceList',
        'isShowEdit',
        'isModify',
        'editData',
        'editEleTypeList',
        'editGatewayList'
      ]),
      ...mapGetters([
        'projectId'
      ])
    },
    methods: {
      ...mapActions([
        'showEdit',
        'currentPageOnChange',
        'updateFormData',
        'getDeviceList',
        'pageSizeOnChange',
        'updateObjectData',
        'editDevice',
        'uploadFile'
      ]),
      search () {
        this.currentPageOnChange(1)
        this.getDeviceList()
      },
      editDataChange (key, value) {
        this.updateObjectData({ obj: 'editData', item: key, value })
      },
      showDetail (isShow, row) {
        if (isShow) {
          this.detailDeviceData = row
          if (row) {
            let type = this.editEleTypeList.find(t => t.value === row.LDeviceType)
            row.LDeviceTypeText = type ? type.label : '-'
          }
        }
        this.isShowDetail = isShow
      }
    },
    watch: {
      projectId (newValue) {
        if (!isEmpty(newValue)) {
          this.search()
        }
        this.showEdit({ isShow: false })
      },
      pageSize () {
        this.search()
      }
    },
    created () {
      if (!isEmpty(this.projectId)) {
        this.search()
      }
    },
    beforeDestroy () {
      this.showDetail(false)
      this.showEdit({ isShow: false })
    }
  }
</script>
