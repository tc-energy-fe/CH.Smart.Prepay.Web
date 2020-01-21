<template>
  <div class="login">
    <div class="login-form">
      <p class="login-title">预付费管理系统</p>
      <p class="login-form__item">
        <i class="iconfont icon-login_icon_user"></i>
        <label for="username">用户名</label>
        <span class="split"></span>
        <input
          id="username"
          v-model="username"
          autocomplete="off"
          placeholder="点击此处输入">
      </p>
      <p class="login-form__item">
        <i class="iconfont icon-login_icon_password"></i>
        <label for="password">密码</label>
        <span class="split"></span>
        <input
          id="password"
          v-model="password"
          autocomplete="off"
          type="password"
          placeholder="点击此处输入">
      </p>
      <p class="login-form__submit" @click="loginOnClick">登<span class="space"></span>录</p>
    </div>
  </div>
</template>

<script>
  import md5 from 'blueimp-md5'
  import api from '@/api/login'
  import ERROR_CODE from '@/api/error-code'
  export default {
    name: 'login',
    data () {
      return {
        username: '',
        password: '',
        loginCancel: new Map(),
        isLogin: false
      }
    },
    components: {
    },
    computed: {
      md5Password () {
        return md5(this.password)
      }
    },
    methods: {
      loginOnClick () {
        if (this.username === '' || this.password === '') {
          ElAlert('用户名或登录密码不能为空！', '提示').then(() => {})
          return
        }
        this.login()
      },
      login () {
        let username = this.username
        let postData = {
          PwdMode: 1,
          AccountName: username,
          CurPwd: this.md5Password,
          ClientId: 3
        }

        // username类型判断
        if (/^1[345789]\d{9}$/gi.test(username)) {
          postData.LoginType = 2
        } else if (/[^@]+@[^@]+\.[^@]+$/gi.test(username)) {
          postData.LoginType = 3
        } else {
          postData.LoginType = 1
        }

        // 发起请求
        let loginReq = api.getToken(postData)
        this.isLogin = true
        this.loginCancel.set('login', loginReq.cancel)
        loginReq.request.then(res => {
          console.log(res)
          let data = res.Data
          sessionStorage.setItem('Token', data.Token)
          sessionStorage.setItem('FileToken', data.FileToken)
          location.replace(location.origin + '/')
        }).catch(err => {
          console.error(err)
          if (!err.hasOwnProperty('code')) {
            ElAlert('数据处理出错!', '错误').then(() => {})
          } else if (!err.abort) {
            let code = err.code.toString()
            let errorMsg = err.msg || err.desc || ERROR_CODE['login'][code] || `未知错误：${code}`
            ElAlert(errorMsg, '错误').then(() => {})
          }
        }).finally(() => {
          this.isLogin = false
        })
      }
    },
    watch: {},
    created () {
    },
    beforeDestroy () {}
  }
</script>

<style lang="scss" src="./login.scss"></style>
<style lang="scss" src="@/assets/css/common.scss"></style>
