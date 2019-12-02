<template>
  <div class="">
    home
  </div>
</template>

<script>
  import { createNamespacedHelpers } from 'vuex'
  const { mapGetters, mapActions, mapState } = createNamespacedHelpers('/home')
  export default {
    name: '',
    data () {
      return {
      }
    },
    components: {},
    computed: {
      ...mapState([]),
      ...mapGetters([])
    },
    methods: {
      ...mapActions([])
    },
    watch: {},
    created () {},
    beforeDestroy () {}
  }
</script>
