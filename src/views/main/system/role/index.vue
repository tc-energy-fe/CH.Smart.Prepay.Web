<template>
  <div class="system-role main-container">
    <eg-box class="role-box">
      <template v-slot:headerLeft>
        <eg-input placeholder="角色名称搜索"/>
        <el-select
          placeholder="角色类型"
          :value="searchTypeId"
        >
<!--          <el-option></el-option>-->
        </el-select>
        <eg-button>查询</eg-button>
      </template>
      <template v-slot:headerRight>
        <eg-button>新建角色</eg-button>
      </template>
      <template v-slot:content>
      </template>
    </eg-box>
  </div>
</template>

<script>
  import { createNamespacedHelpers } from 'vuex'
  const { mapState, mapGetters, mapActions } = createNamespacedHelpers('system/role')
  export default {
    name: 'Role',
    data () {
      return {
      }
    },
    components: {},
    computed: {
      ...mapState([
        'searchTypeId',
        'roleList'
      ]),
      ...mapGetters([
      ])
    },
    methods: {
      ...mapActions([
      ])
    },
    watch: {
    },
    created () {
    }
  }
</script>

<style src="./role.scss" lang="scss" scoped/>
