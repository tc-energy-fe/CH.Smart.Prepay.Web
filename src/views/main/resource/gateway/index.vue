<template>
  <div class="main-container resource-gateway">
    <eg-box></eg-box>
  </div>
</template>

<script>
  import './gateway.scss'
  import { createNamespacedHelpers } from 'vuex'
  const { mapGetters, mapActions, mapState } = createNamespacedHelpers('resource/gateway')
  export default {
    name: 'resource-gateway',
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
