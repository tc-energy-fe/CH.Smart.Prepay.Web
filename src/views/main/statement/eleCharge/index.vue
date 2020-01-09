<template>
  <div class="main-container statement-elecharge has-search">
    <div class="main-search">
      <p class="main-search__title">选择区域</p>
    </div>
    <div class="main-content"></div>
  </div>
</template>

<script>
  import './eleCharge.scss'
  import { createNamespacedHelpers } from 'vuex'
  const { mapGetters, mapActions, mapState } = createNamespacedHelpers('statement/eleCharge')
  export default {
    name: 'statement-elecharge',
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
