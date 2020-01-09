<template>
  <div class="main-container has-search status-emeter">
    <div class="main-search">
      <p class="main-search__title">选择区域</p>
      <el-tree
        ref="tree"
        :data="groupTree"
        node-key="value"
        default-expand-all
        auto-expand-parent
        :highlight-current="true"
        :current-node-key="currentNodeId"
        :expand-on-click-node="false"
        @current-change="nodeOnChange"
      ></el-tree>
    </div>
    <div class="main-content">
      <div class="emeter-overview">
        <overview-block
          :icon="Icons.total"
          title="在线总数"
          unit="个"
        ></overview-block>
      </div>
    </div>
  </div>
</template>

<script>
  import './emeter.scss'
  import Icons from '@/assets/icon/main'
  import { createNamespacedHelpers } from 'vuex'
  import OverviewBlock from '@/components/overview-block/index'
  const { mapGetters, mapActions, mapState } = createNamespacedHelpers('status/emeter')
  export default {
    name: 'status-emeter',
    data () {
      return {
        Icons: {
          total: Icons.icon_meter_total
        }
      }
    },
    components: { OverviewBlock },
    computed: {
      ...mapState([]),
      ...mapGetters([
        'currentNodeId'
      ]),
      groupTree () {
        return this.$store.state.mainGroupTreeHasRoot
      }
    },
    methods: {
      ...mapActions([
        'updateStateData'
      ]),
      nodeOnChange ($event) {
        this.updateStateData({ item: 'currentNode', value: $event })
      },
      search () {}
    },
    watch: {
      groupTree (newValue, oldValue) {
        if (newValue.length && newValue !== oldValue) {
          this.$nextTick(function () {
            this.$refs.tree.setCurrentKey(newValue[0].value)
          })
          this.updateStateData({ item: 'currentNode', value: newValue[0] || {} })
          this.search()
        }
      }
    },
    created () {
      if (this.groupTree.length) {
        this.$nextTick(function () {
          this.$refs.tree.setCurrentKey(this.currentNodeId)
        })
        if (isEmpty(this.currentNodeId)) {
          this.updateStateData({ item: 'currentNode', value: this.groupTree[0] || {} })
        }
        this.search()
      }
    },
    beforeDestroy () {}
  }
</script>
