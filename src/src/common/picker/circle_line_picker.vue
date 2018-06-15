<template>
  <b-dropdown variant="link" size="lg" no-caret>
    <template slot="button-content">
      <i class="ion ion-android-radio-button-on"></i>
      <span class="size-icon">
                {{ size }}
              </span>
    </template>
    <b-dropdown-item v-for="(sizeItem, index) in sizes" href="#" v-bind:key="index">
      <label class="size-item"
             v-on:click="change(sizeItem)">
                <span class="size"
                      v-bind:class="{'checked':size==sizeItem}"
                      v-bind:style="{width: sizeItem + 'px', height: sizeItem + 'px'}"></span>
      </label>
    </b-dropdown-item>
  </b-dropdown>
</template>
<script>
  export default {
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
        size: 0
      }
    },
    mounted () {
      this.size = this.value
    },
    methods: {
      change (sizeItem) {
        this.size = sizeItem
        this.$emit('input', sizeItem)
      }
    }
  }
</script>
<style lang="scss" scoped>
  $prim: rgb(0, 149, 255);

  .size-icon, .color-icon {
    position: absolute;
    top: 10px;
    right: 0;
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
