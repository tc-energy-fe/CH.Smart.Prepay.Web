<template>
  <div id="app">
    <header class="app-header">
      <div class="app-header--left">
        <p class="app-title">
          <span>预付费管理系统</span>
          <i class="iconfont icon-tab_icon_fold" @click="navCollapseOnChange"></i>
        </p>
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
      <div :class="['app-side-bar', {collapse: isNavCollapse}]">
        <el-menu
          router
          unique-opened
          :collapse="isNavCollapse"
          :default-active="defaultUrl"
        >
          <template v-for="lv1 in userMenus">
            <el-submenu
              v-if="lv1.children && lv1.children.length"
              :key="lv1.value"
              :index="lv1.Url"
            >
              <template slot="title">
                <i :class="['iconfont', `icon-nav_icon_${lv1.ModuleName}`]"></i>
                <span>{{lv1.label}}</span>
              </template>
              <el-menu-item
                v-for="lv2 in lv1.children"
                :key="lv2.value"
                :index="lv2.Url"
              >{{lv2.label}}</el-menu-item>
            </el-submenu>
            <el-menu-item
              v-else
              :key="lv1.value"
              :index="lv1.Url"
            >
              <i :class="['iconfont', `icon-nav_icon_${lv1.ModuleName}`]"></i>
              <span>{{lv1.label}}</span>
            </el-menu-item>
          </template>
        </el-menu>
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
      return {
        isNavCollapse: false
      }
    },
    computed: {
      ...mapState([
        'userAreas',
        'userMenus',
        'areaId',
        'account',
        'isLoadingMainGroupList'
      ]),
      ...mapGetters([
      ]),
      defaultUrl () {
        return location.pathname
      }
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
      },
      navCollapseOnChange () {
        this.isNavCollapse = !this.isNavCollapse
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
