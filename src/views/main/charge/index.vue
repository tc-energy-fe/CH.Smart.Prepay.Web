<template>
  <router-view></router-view>
</template>

<script>
  export default {
    name: 'charge',
    data () {
      return {
        payDetailGroup: null
      }
    },
    mounted () {
      this.$on('toDetailPage', (name) => {
        this.payDetailGroup = name
      })
    }
  }
</script>
