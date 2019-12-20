<template>
  <div class="main-container config-warn">
    <template>
      <div class="config-scheme">
        <p class="scheme-title">方案查询</p>
        <eg-box></eg-box>
      </div>
      <div class="config-room">
        <p class="scheme-title">房间方案查询</p>
        <eg-box></eg-box>
      </div>
    </template>
  </div>
</template>

<script>
  // import './.scss'
  import { createNamespacedHelpers } from 'vuex'
  const { mapGetters, mapActions, mapState } = createNamespacedHelpers('config/warn')
  export default {
    name: 'config-warn',
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
