<!--
 slot: right-bottom 放置在右侧中部文字下部的副内容
 @icon 左侧图片（require）
 @title 左侧标题
 @date 左侧标题下的日期
 @text 右侧中部文字
 @unit 右侧中部单位（非必须）
-->

<template>
  <div class="overview-block">
    <div class="overview-block--left">
      <img class="overview-block__icon" :src="icon"/>
      <span>{{title}}</span>
    </div>
    <div class="overview-block--right">
      <div class="right-center">
        <span class="text">{{text}}</span><span class="unit" v-if="unit">{{unit}}</span>
      </div>
      <div class="right-bottom">
        <slot name="rightBottom"></slot>
      </div>
    </div>
  </div>
</template>

<script>
  import './style.scss'
  export default {
    name: 'overview-block',
    props: {
      icon: {
        required: true
      },
      unit: String,
      text: {
        type: [String, Number],
        default: '-'
      },
      title: {
        type: String,
        required: true
      }
    }
  }
</script>
