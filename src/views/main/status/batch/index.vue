<template>
  <div class="main-container system-user">
    User
  </div>
</template>

<script>
  import { createNamespacedHelpers } from 'vuex'
  const { mapState, mapGetters, mapActions } = createNamespacedHelpers('status/batch')
  export default {
    name: 'Batch',
    data () {
      return {
      }
    },
    components: {},
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
    watch: {
    },
    created () {
    },
    beforeDestroy () {
    }
  }
</script>

<style scoped />
