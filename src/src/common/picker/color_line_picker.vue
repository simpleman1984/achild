<template>
  <button style="position: relative;display: -ms-inline-flexbox;display: inline-flex;vertical-align: middle;color: #323232;">
    <i class="ion ion-android-color-palette" @click="show = !show">
      <span class="color-icon" v-bind:style="{backgroundColor: color}"></span>
    </i>
    <ul v-click-outside="hide" v-if="show" class="popup-container">
      <li class="item" v-for="(colorItem, index)  in colors" v-bind:key="index" v-on:click="change(colorItem)">
        <label class="color-item" style="margin: auto;">
              <span v-bind:class="'color color-' + colorItem" v-bind:style="{backgroundColor: colorItem}"></span>
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
      colors: {
        type: Array,
        default () {
          return [
            // '#d4f713',
            // '#13f7ab',
            // '#13f3f7',
            // '#13c5f7',
            // '#138cf7',
            // '#1353f7',
            // '#2d13f7',
            // '#7513f7',
            // '#a713f7',
            // '#d413f7',
            // '#f713e0',
            // '#f71397',
            // '#f7135b',
            // '#f71313',
            // '#f76213',
            // '#f79413',
            // '#f7e013',
            '#efefef',
            '#000000'
          ]
        }
      },
      value: String
    },
    data () {
      return {
        color: 0,
        show: false
      }
    },
    mounted () {
      this.color = this.value
    },
    methods: {
      change (sizeItem) {
        this.color = sizeItem
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
      background-color:#efefef;
      drop-shadow: .5rem .5rem 1rem .3rem #e23
    }
  }

  .color-item {
    position: relative;
    display: inline-block;
    cursor: pointer;
    width: 20px;
    height: 20px;
    display: flex;
    justify-content: center;
    align-items: center;

    input {
      position: absolute;
      opacity: 0;
      top: 0;
      left: 0;
      width: 0;
      height: 0;
    }

    input:checked + .color {
      opacity: 1;
      border: 2px solid $prim;
    }

    .color {
      display: block;
      width: 20px;
      height: 20px;
      background-color: white;
      border-radius: 50%;

        &:hover {
         opacity: .8;
       }
    }
  }

  .color-icon {
    position: absolute;
    top: 10px;
    width: 5px;
    height: 5px;
    border-radius: 50%;
  }
</style>
