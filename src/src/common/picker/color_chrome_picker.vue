<template>
  <button style="position: relative;display: -ms-inline-flexbox;display: inline-flex;vertical-align: middle;" v-bind:style="{color:actualColor}">
    <i class="ion ion-android-color-palette" @click="showColor = !showColor">
      <span class="color-icon" v-bind:style="{backgroundColor: bgColor}"></span>
    </i>
    <chrome-picker v-click-outside="hide" v-model="color" v-if="showColor" style="position: absolute;bottom: 50px;"></chrome-picker>
  </button>
</template>
<script>
  import ClickOutside from 'vue-click-outside'
  import { Chrome } from 'vue-color'

  export default {
    components: {
      'chrome-picker': Chrome
    },
    directives: {
      ClickOutside
    },
    props: {
      value: String
    },
    watch: {
      color (val) {
        this.bgColor = val
      }
    },
    data () {
      return {
        showColor: false,
        color: {},
        actualColor: '#efefef',
        bgColor: ''
      }
    },
    mounted () {
      this.actualColor = this.value
    },
    methods: {
      hide () {
        this.showColor = false
        this.actualColor = this.color.hex
        this.$emit('change', this.actualColor)
        this.$emit('input', this.actualColor)
      }
    }
  }
</script>
<style lang="scss" scoped>
  .color-icon {
    position: absolute;
    top: 10px;
    width: 5px;
    height: 5px;
    border-radius: 50%;
  }
</style>
