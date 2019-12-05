<template>
  <div class="login">
    <input v-model="username" placeholder="username"/><br/>
    <input v-model="password" placeholder="password"/>
    <button @click="loginOnClick">login</button>
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
          alert('请输入用户名和登录密码')
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
            alert('数据处理出错！')
          } else if (!err.abort) {
            let code = err.code.toString()
            let errorMsg = ERROR_CODE['login'][code] || err.desc || `未知错误：${code}`
            alert(errorMsg)
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
