<template>
  <div id="app">
    main
    <router-view></router-view>
  </div>
</template>

<script>
  import { mapState, mapGetters, mapActions } from 'vuex'
  export default {
    data () {
      return {}
    },
    computed: {
      ...mapState([
      ]),
      ...mapGetters([
      ])
    },
    methods: {
      ...mapActions([
      ])
    },
    created () {
    },
    beforeDestroy () {
    }
  }
</script>

<style lang="scss" src="../assets/css/common.scss"></style>
<style lang="scss" src="./app.scss"></style>
