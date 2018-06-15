<template>
  <div class="btn-group" >
    <i class="ion ion-android-color-palette" @click="showColor = !showColor">
      <span class="color-icon" v-bind:style="{backgroundColor: bgColor}">
      </span>
    </i>
    <chrome-picker v-click-outside="hide" v-model="color" v-if="showColor" style="position: absolute;bottom: 20px;"></chrome-picker>
  </div>
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
        color: '',
        bgColor: ''
      }
    },
    methods: {
      mounted () {
        this.color = this.value
      },
      hide () {
        this.showColor = false
        this.$emit('change', this.color.hex)
        this.$emit('input', this.color.hex)
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
