<template>
  <div class="main-container config-price">
    <div class="config-scheme">
      <p class="scheme-title">电价方案查询</p>
      <eg-box slot="content">
        <template v-slot:headerLeft>
          <eg-input
            placeholder="方案名称搜索"
            :value="searchName"
            @input="updateFormData({ item: 'searchName', value: $event })"
          ></eg-input>
          <eg-button @click="getPriceList">查询</eg-button>
        </template>
        <template v-slot:headerRight>
          <eg-button>新建电价方案</eg-button>
        </template>
        <template v-slot:content>
          <el-table v-loading="isLoadingPriceList" :data="priceList">
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
        </template>
      </eg-box>
    </div>
    <div class="config-room">
      <p class="scheme-title">房间方案查询</p>
      <eg-box slot="content">
        <template v-slot:headerLeft>
          <eg-input
            placeholder="房间编号/名称搜索"
          ></eg-input>
          <eg-input
            placeholder="电价方案搜索"
          ></eg-input>
          <eg-button>查询</eg-button>
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
        'searchName',
        'priceList',
        'isLoadingPriceList'
      ]),
      ...mapGetters([
        'projectId'
      ])
    },
    methods: {
      ...mapActions([
        'updateFormData',
        'getPriceList',
        'showEdit'
      ])
    },
    watch: {
      projectId (newValue) {
        if (!isEmpty(newValue)) {
          this.getPriceList()
        }
      }
    },
    created () {
      if (!isEmpty(this.projectId)) {
        this.getPriceList()
      }
    },
    beforeDestroy () {}
  }
</script>
