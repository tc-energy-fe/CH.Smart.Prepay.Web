<template>
  <div class="main-container resource-gateway">
    <eg-box v-if="!isShowEdit">
      <template v-slot:headerLeft>
        <eg-input
          placeholder="设备编码/名称搜索"
          :value="searchName"
          @input="updateFormData({item:'searchName', value:$event})"
        ></eg-input>
        <el-select
          :value="searchDeviceTypeId"
          placeholder="设备类型"
          @change="updateFormData({ item: 'searchDeviceTypeId', value: $event })"
        >
          <el-option :value="-1" label="全部设备类型"></el-option>
          <el-option
            v-for="item in deviceTypeList"
            :value="item.value"
            :label="item.label"
            :key="item.value"
          ></el-option>
        </el-select>
        <eg-button @click="search">查询</eg-button>
      </template>
      <template v-slot:headerRight>
        <eg-button style="margin-right: 1rem" @click="getTemplateFile" type="text">下载导入模板</eg-button>
        <eg-button style="margin-right: 1rem" @click="uploadFile">导入设备</eg-button>
        <eg-button @click="showAddEdit(true)">添加设备</eg-button>
      </template>
      <template v-slot:content>
        <el-table :data="gatewayList" v-loading="isLoadingGatewayList">
          <el-table-column label="设备编码" prop="GatewaySN" align="center"></el-table-column>
          <el-table-column label="设备名称" prop="Name" align="center"></el-table-column>
          <el-table-column label="设备类型" prop="TypeName" align="center"></el-table-column>
          <el-table-column label="安装位置" prop="Address" align="center"></el-table-column>
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
        <el-dialog
          width="35rem"
          title="导入结果"
          :visible="isShowImportResult"
          @close="importResultOnClose"
        >
          <div class="resource-gateway__import">
            <p class="gateway-import__static">
              <label>导入总数：</label><span style="font-weight: bold">{{importResultStatic.total | currency}}</span>
              <label>成功数：</label><span style="color: #67c23a;">{{importResultStatic.success | currency}}</span>
              <label>失败数：</label><span style="color: #f56c6c;">{{importResultStatic.fail | currency}}</span>
              <label>重复数：</label><span style="color: #3d7dff;">{{importResultStatic.repeat | currency}}</span>
            </p>
            <el-table :data="importResultTableData">
              <el-table-column prop="Row" label="错误行数" align="center" width="100"></el-table-column>
              <el-table-column prop="Error" label="错误信息" align="center"></el-table-column>
            </el-table>
            <el-pagination
              @current-change="importCurrentOnChange"
              @size-change="importPageSizeOnChange"
              :page-sizes="[5, 10, 15]"
              :current-page.sync="importCurrentPage"
              :page-size="importPageSize"
              layout="total, ->, prev, pager, next, sizes, jumper"
              :total="importResultTableData.length"
            ></el-pagination>
          </div>
          <eg-button type="minor" slot="footer" @click="importResultOnClose">关闭</eg-button>
        </el-dialog>
      </template>
    </eg-box>
    <eg-box v-else>
      <template v-slot:headerLeft>
        <span class="gateway-edit__title">添加网关设备</span>
        <eg-button type="text" @click="showAddEdit(false)">返回列表</eg-button>
      </template>
      <template v-slot:content>
        <div class="gateway-edit__row">
          <label>设备编码</label>
          <eg-input
            placeholder="请输入内容"
            :value="editData.GatewaySN"
            @input="editDataOnChange('GatewaySN', $event)"
          ></eg-input>
          <i class="iconfont icon-content_icon_required"></i>
        </div>
        <div class="gateway-edit__row">
          <label>设备名称</label>
          <eg-input
            placeholder="请输入内容"
            :value="editData.Name"
            @input="editDataOnChange('Name', $event)"
          ></eg-input>
          <i class="iconfont icon-content_icon_required"></i>
        </div>
<!--        <div class="gateway-edit__row">-->
<!--          <label>设备类型</label>-->
<!--          <el-select-->
<!--            :value="editData.TypeId"-->
<!--            placeholder="请选择类型"-->
<!--            @change="editDataOnChange('TypeId', $event)"-->
<!--          >-->
<!--            <el-option-->
<!--              v-for="item in deviceTypeList"-->
<!--              :value="item.value"-->
<!--              :label="item.label"-->
<!--              :key="item.value"-->
<!--            ></el-option>-->
<!--          </el-select>-->
<!--          <i class="iconfont icon-content_icon_required"></i>-->
<!--        </div>-->
        <div class="gateway-edit__row">
          <label>安装位置</label>
          <eg-input
            placeholder="请输入内容"
            :value="editData.Address"
            @input="editDataOnChange('Address', $event)"
          ></eg-input>
        </div>
        <p class="gateway-edit__footer">
          <eg-button style="margin-right: 2rem" type="minor" @click="showAddEdit(false)">取消</eg-button>
          <eg-button @click="addGateway">保存</eg-button>
        </p>
      </template>
    </eg-box>
  </div>
</template>

<script>
  import './gateway.scss'
  import { createNamespacedHelpers } from 'vuex'
  const { mapGetters, mapActions, mapState } = createNamespacedHelpers('resource/gateway')
  export default {
    name: 'resource-gateway',
    data () {
      return {
        importCurrentPage: 1,
        importPageSize: 5
      }
    },
    components: {},
    computed: {
      ...mapState([
        'searchName',
        'searchDeviceTypeId',
        'deviceTypeList',
        'gatewayList',
        'isLoadingGatewayList',
        'currentPage',
        'pageSize',
        'totalCount',
        'isShowEdit',
        'editData',
        'isShowImportResult',
        'isImportingRoom',
        'importResultStatic',
        'importResultTableData'
      ]),
      ...mapGetters([
        'projectId'
      ])
    },
    methods: {
      ...mapActions([
        'updateFormData',
        'getGatewayType',
        'getGatewayList',
        'pageSizeOnChange',
        'uploadFile',
        'showAddEdit',
        'updateObjectData',
        'addGateway',
        'getTemplateFile'
      ]),
      search () {
        this.updateFormData({ item: 'currentPage', value: 1 })
        this.getGatewayList()
      },
      currentPageOnChange (value) {
        this.updateFormData({ item: 'currentPage', value })
        this.getGatewayList()
      },
      editDataOnChange (key, value) {
        this.updateObjectData({ obj: 'editData', item: key, value })
      },
      importResultOnClose () {
        this.updateFormData({ item: 'isShowImportResult', value: false })
        this.importCurrentPage = 1
      },
      importCurrentOnChange (val) {
        this.importCurrentPage = val
      },
      importPageSizeOnChange (val) {
        this.importPageSize = val
      }
    },
    watch: {
      projectId (newValue) {
        if (!isEmpty(newValue)) {
          this.search()
        }
        this.showAddEdit(false)
      }
    },
    created () {
      this.getGatewayType()
      if (!isEmpty(this.projectId)) {
        this.search()
      }
    },
    beforeDestroy () {
      this.showAddEdit(false)
    }
  }
</script>
