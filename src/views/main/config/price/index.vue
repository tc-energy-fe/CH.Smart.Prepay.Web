<template>
  <div class="main-container config-price">
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
          <eg-button>新建电价方案</eg-button>
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
            placeholder="房间编号搜索"
            :value="searchRoomNo"
            @input="updateFormData({ item: 'searchRoomNo', value: $event })"
          ></eg-input>
          <eg-input
            placeholder="房间名称搜索"
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
        'searchRoomNo',
        'searchRoomName',
        'priceList',
        'isLoadingPriceList',
        'currentPricePage',
        'totalPriceCount',
        'currentRoomPage',
        'totalRoomCount',
        'isLoadingRoomList',
        'roomList',
        'searchSchemeType'
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
        'getRoomList'
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
