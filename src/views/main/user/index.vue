<template>
  <div class="main-container user-info">
    <eg-box class="edit-wrapper info-edit">
      <template v-slot:headerLeft>
        <div class="edit-header">
          <h4 class="edit-header__title">修改个人信息</h4>
          <eg-button type="text" @click="returnClick">返回</eg-button>
        </div>
      </template>
      <template v-slot:content>
        <div v-loading="isLoadingInfo">
          <div class="info-edit__row">
            <label class="info-edit__row-title">用户姓名</label>
            <eg-input
              width-type="medium"
              :value="editData.UserName"
              @input="updateObjectData({obj: 'editData', item: 'UserName', value: $event})"
            />
            <i class="iconfont icon-content_icon_required"/>
          </div>
          <div class="info-edit__row">
            <label class="info-edit__row-title">手机号</label>
            <eg-input
              width-type="medium"
              is-integer
              :value="editData.PhoneNo"
              @input="updateObjectData({obj: 'editData', item: 'PhoneNo', value: $event})"
            />
            <i class="iconfont icon-content_icon_required"/>
          </div>
          <div class="info-edit__row">
            <label class="info-edit__row-title">登录名</label>
            <eg-input
              width-type="medium"
              disabled
              :value="editData.AccountName"
            />
            <i class="iconfont icon-content_icon_required"/>
          </div>
          <div class="info-edit__row">
            <label class="info-edit__row-title">密码</label>
            <eg-input
              width-type="medium"
              :type="isShowPassword ? 'text' : 'password'"
              :value="editData.Password"
              @input="updateObjectData({obj: 'editData', item: 'Password', value: $event})"
            />
            <el-checkbox v-model="isShowPassword">显示密码</el-checkbox>
          </div>
          <div class="info-edit__row">
            <label class="info-edit__row-title"></label>
            <eg-button type="minor" @click="returnClick">取消</eg-button>
            <eg-button @click="saveUserInfo">保存</eg-button>
          </div>
        </div>
      </template>
    </eg-box>
  </div>
</template>

<script>
  import Vuex from 'vuex'
  const { mapState, mapGetters, mapActions } = Vuex.createNamespacedHelpers('user')
  export default {
    name: 'User',
    data () {
      return {
        isShowPassword: true
      }
    },
    components: {},
    computed: {
      ...mapState([
        'editData',
        'isLoadingInfo'
      ]),
      ...mapGetters([
      ])
    },
    methods: {
      ...mapActions([
        'resetFormData',
        'getUserInfo',
        'saveUserInfo',
        'updateStateData',
        'updateObjectData'
      ]),
      returnClick () {
        this.$router.back()
      }
    },
    watch: {
    },
    created () {
      this.getUserInfo()
    },
    beforeDestroy () {
      this.resetFormData()
    }
  }
</script>

<style lang="scss" src="./user.scss" />
