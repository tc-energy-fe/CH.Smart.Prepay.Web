<template>
  <div id="app">
    <header class="app-header">
      <div class="app-header--left">
        <p class="app-title">预付费管理系统</p>
        <el-select
          class="no-border"
          :value="areaId"
          @change="projectOnChange"
        >
          <el-option
            v-for="item in userAreas"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </div>
      <div class="app-header--right">
        <span>欢迎您，</span>
        <span class="app-header_user">{{account.Name || 'master'}}</span>
        <i class="app-header_split"></i>
        <div class="app-logout">
          <span class="app-logout_text" @click="logout">退出</span>
        </div>
      </div>
    </header>
    <div class="app-content">
      <div class="app-side-bar">
        <p><router-link to="/resource/project">项目管理</router-link></p>
        <p><router-link to="/resource/group">区域管理</router-link></p>
        <p><router-link to="/resource/room">房间管理</router-link></p>
        <p><router-link to="/resource/roomUser">开户销户管理</router-link></p>
        <p><router-link to="/resource/meter">表计管理</router-link></p>
        <p><router-link to="/system/role">角色管理</router-link></p>
      </div>
      <div class="app-main">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script>
  import './app.scss'
  import { mapState, mapGetters, mapActions } from 'vuex'
  export default {
    data () {
      return {}
    },
    computed: {
      ...mapState([
        'userAreas',
        'areaId',
        'account',
        'isLoadingMainGroupList'
      ]),
      ...mapGetters([
      ])
    },
    methods: {
      ...mapActions([
        'getUserManage',
        'updateFormData'
      ]),
      projectOnChange (val) {
        this.updateFormData({ item: 'areaId', value: val })
      },
      logout () {
        sessionStorage.removeItem('Token')
        sessionStorage.removeItem('FileToken')
        location.replace(location.origin + '/login')
      }
    },
    created () {
      this.getUserManage()
    },
    beforeDestroy () {
    }
  }
</script>

<style lang="scss" src="@/assets/css/common.scss"></style>
