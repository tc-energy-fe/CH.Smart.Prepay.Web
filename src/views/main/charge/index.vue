<template>
  <router-view></router-view>
</template>

<script>
  export default {
    name: 'charge',
    data () {
      return {
        payDetailGroup: null,
        isJumpToDetail: false
      }
    },
    mounted () {
      this.$on('toDetailPage', (name) => {
        this.payDetailGroup = name
        this.isJumpToDetail = true
      })
    }
  }
</script>
