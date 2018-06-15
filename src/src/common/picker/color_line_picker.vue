<template>
  <b-dropdown variant="link" size="lg" no-caret>
    <template slot="button-content">
      <i class="ion ion-android-color-palette"></i>
      <span class="color-icon"
            v-bind:style="{backgroundColor: color}">
              </span>
    </template>
    <b-dropdown-item v-for="(colorItem, index)  in colors" v-bind:key="index" v-on:click="change(colorItem)">
      <label class="color-item" >
                <span v-bind:class="'color color-' + colorItem"
                      v-bind:style="{backgroundColor: colorItem}"></span>
      </label>
    </b-dropdown-item>
  </b-dropdown>
</template>
<script>
  export default {
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
        color: 0
      }
    },
    mounted () {
      this.color = this.value
    },
    methods: {
      change (sizeItem) {
        this.color = sizeItem
        this.$emit('input', sizeItem)
      }
    }
  }
</script>
<style lang="scss" scoped>
  $prim: rgb(0, 149, 255);

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
