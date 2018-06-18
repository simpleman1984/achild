<template>
  <button style="position: relative;display: -ms-inline-flexbox;display: inline-flex;vertical-align: middle;color: #323232;">
    <i class="ion ion-android-radio-button-on" @click="show = !show">
      <span class="size-icon">{{ size }}</span>
    </i>
    <ul v-click-outside="hide" v-if="show" class="popup-container">
      <li class="item" v-for="(sizeItem, index) in sizes" href="#" v-bind:key="index" v-on:click="change(sizeItem)">
        <label class="size-item">
          <span class="size" v-bind:class="{'checked':size==sizeItem}" v-bind:style="{width: sizeItem + 'px', height: sizeItem + 'px'}"></span>
        </label>
      </li>
    </ul>
  </button>
</template>
<script>
  import ClickOutside from 'vue-click-outside'

  export default {
    directives: {
      ClickOutside
    },
    props: {
      sizes: {
        default () {
          return [6, 12, 24]
        },
        type: Array
      },
      value: Number
    },
    data () {
      return {
        size: 0,
        show: false
      }
    },
    mounted () {
      this.size = this.value
    },
    methods: {
      change (sizeItem) {
        this.size = sizeItem
        this.$emit('input', sizeItem)
      },
      hide () {
        this.show = false
      }
    }
  }
</script>
<style lang="scss" scoped>
  $prim: rgb(0, 149, 255);

  .popup-container {
    position: absolute;
    bottom: 50px;
    background-color:#fff;
    list-style-type: none;
    padding: 0;
    border: 1px solid rgba(0,0,0,.15);
    border-radius: .25rem;

    .item {
      width: 80px;
      padding-top: 5px;
      padding-bottom: 5px;
    }

    .item:hover {
      background-color: #efefef;
      drop-shadow: .5rem .5rem 1rem .3rem #e23
    }
  }

  .size-icon, .color-icon {
    position: absolute;
    top: 10px;
    font-size: 6px;
    text-align: right;
  }

  .size-item {
    width: 30px;
    height: 30px;
    display: inline-flex;
    position: relative;
    justify-content: center;
    align-items: center;
    vertical-align: top;
    cursor: pointer;

    input {
      position: absolute;
      top: 0;
      left: 0;
      width: 0;
      height: 0;
      opacity: 0;
    }

    .size {
      background-color: rgb(140, 140, 140);
      display: inline-block;
      border-radius: 50%;
      transition: all .15s;
      transform: translate(-50%, -50%) scale(.6);
      position: absolute;
      top: 50%;
      left: 50%;

      &:hover {
        opacity: .8;
      }
    }

    .size.checked {
      background-color: $prim;
    }
  }
</style>
