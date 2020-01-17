<template>
  <div class="main-container status-gateway">
    <div class="gateway-overview">
      <overview-block
        class="gateway-overview__item"
        :icon="Icons.total"
        unit="个"
        name="网关总数"
        :color="{left: '#cfe0ff', right: 'white', text: '#3d7dff'}"
        :text="gatewayStaticData.Total"
      />
      <overview-block
        class="gateway-overview__item"
        :icon="Icons.on"
        unit="个"
        name="在线数"
        :color="{left: '#bfefbb', right: 'white', text: '#67c23a'}"
        :text="gatewayStaticData.Offline"
      />
      <overview-block
        class="gateway-overview__item"
        :icon="Icons.off"
        unit="个"
        name="离线数"
        :color="{left: '#f9cfcf', right: 'white', text: '#f56c6c'}"
        :text="gatewayStaticData.Online"
      />
    </div>
    <div class="gateway-list">
      <eg-box>
        <template v-slot:headerLeft>
          <eg-input
            :value="searchName"
            @input="updateStateData({item: 'searchName', value: $event})"
            placeholder="房间编号/名称搜索"
          />
          <el-select
            :value="searchState"
            @input="updateStateData({item: 'searchState', value: $event})"
            placeholder="状态"
          >
            <el-option
              v-for="(item, index) of searchStateOptions"
              :label="item.label"
              :value="item.value"
              :key="index"
            />
          </el-select>
          <eg-button @click="searchClick">查询</eg-button>
        </template>
        <template v-slot:content>
          <el-table
            :data="gatewayList"
            row-key="DeviceId"
            v-loading="isLoadingGatewayList"
          >
            <el-table-column prop="Name" label="设备名称" align="center" />
            <el-table-column prop="GatewaySN" label="设备编码" align="center" />
            <el-table-column prop="Address" label="安装位置" align="center" />
            <el-table-column prop="StatusText" label="状态" align="center" />
          </el-table>
          <el-pagination
            background
            :current-page="currentPage"
            :page-size="pageSize"
            :total="totalCount"
            :page-sizes="[10, 15, 20, 25]"
            layout="total, ->, prev, pager, next, sizes"
            @current-change="handleCurrentPageChange"
            @size-change="handlePageSizeChange"
          />
        </template>
      </eg-box>
    </div>
  </div>
</template>

<script>
  import Icons from '@/assets/icon/main'
  import Vuex from 'vuex'
  import OverviewBlock from '@/components/overview-block/index'
  const { mapGetters, mapActions, mapState } = Vuex.createNamespacedHelpers('status/gateway')
  export default {
    name: 'status-gateway',
    data () {
      return {
        Icons: {
          total: Icons.icon_meter_total,
          on: Icons.tab_icon_online,
          off: Icons.tab_icon_offline
        }
      }
    },
    components: { OverviewBlock },
    computed: {
      ...mapState([
        'searchName',
        'searchState',
        'searchStateOptions',
        'gatewayList',
        'currentPage',
        'pageSize',
        'totalCount',
        'isLoadingGatewayList',
        'gatewayStaticData'
      ]),
      ...mapGetters([
      ]),
      projectId () {
        return this.$store.state.areaId
      }
    },
    methods: {
      ...mapActions([
        'getGatewayStatusList',
        'getGatewayStatic',
        'updateStateData'
      ]),
      handleCurrentPageChange (current) {
        this.updateStateData({ item: 'currentPage', value: current })
        this.getGatewayStatusList()
      },
      handlePageSizeChange (size) {
        this.updateStateData({ item: 'pageSize', value: size })
        this.searchClick()
      },
      searchClick () {
        this.handleCurrentPageChange(1)
      },
      searchMethod () {
        this.getGatewayStatic()
        this.searchClick()
      }
    },
    watch: {
      projectId (newValue, oldValue) {
        if (!isEmpty(newValue) && newValue !== oldValue) {
          this.searchMethod()
        }
      }
    },
    created () {
      if (!isEmpty(this.projectId)) {
        this.searchMethod()
      }
    },
    beforeDestroy () {
    }
  }
</script>

<style src="./gateway.scss" lang="scss" scoped />
