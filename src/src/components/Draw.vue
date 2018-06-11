<template>
  <div class="app-wrapper">
    <canvas id="canvas" ref="canvas"></canvas>
    <div class="cursor" id="cursor"></div>
    <b-container class="bv-example-row">
      <b-row>
        <b-col>
          <!-- 曲线数字 -->
          <b-badge variant="light">
            {{ history.length }}
          </b-badge>
          <!-- 撤销 -->
          <button type="button"
                v-on:click="removeHistoryItem"
                v-bind:class="{ disabled: !history.length }" title="Undo">
            <i class="ion ion-reply"></i>
          </button>
          <!-- 清空 -->
          <button type="button"
                  v-on:click="removeAllHistory"
                  v-bind:class="{ disabled: !history.length }" title="Clear all">
            <i class="ion ion-trash-a"></i>
          </button>
          <!-- 画线方向 -->
          <b-dropdown variant="link" size="lg" no-caret style="display:none;">
            <template slot="button-content">
              <i class="ion ion-android-create"></i>
            </template>
            <b-dropdown-item href="#" v-on:click="options.restrictY = !options.restrictY; options.restrictX = false">
              <i class="ion ion-arrow-right-c"></i>
            </b-dropdown-item>
            <b-dropdown-item href="#" v-on:click="options.restrictX = !options.restrictX; options.restrictY = false">
              <i class="ion ion-arrow-up-c"></i>
            </b-dropdown-item>
            <b-dropdown-item href="#" v-on:click="simplify">
              <i class="ion ion-wand"></i>
            </b-dropdown-item>
            <b-dropdown-item href="#" v-on:click="jumble">
              <i class="ion ion-shuffle"></i>
            </b-dropdown-item>
          </b-dropdown>
          <!-- 画线方向 -->
          <b-dropdown variant="link" size="lg" no-caret>
            <template slot="button-content">
              <i class="ion ion-android-radio-button-on"></i>
              <span class="size-icon">
                {{ size }}
              </span>
            </template>
            <b-dropdown-item v-for="(sizeItem, index) in sizes" href="#" v-bind:key="index">
              <label class="size-item">
                <span class="size"
                      v-bind:class="{'checked':size==sizeItem}"
                      v-bind:style="{width: sizeItem + 'px', height: sizeItem + 'px'}"
                      v-on:click="size=sizeItem;popups.showSize = !popups.showSize"></span>
              </label>
            </b-dropdown-item>
          </b-dropdown>
          <!-- 颜色 -->
          <b-dropdown variant="link" size="lg" no-caret>
            <template slot="button-content">
              <i class="ion ion-android-color-palette"></i>
              <span class="color-icon"
                    v-bind:style="{backgroundColor: color}">
              </span>
            </template>
            <b-dropdown-item v-for="(colorItem, index)  in colors" v-bind:key="index" >
              <label class="color-item">
                <span v-bind:class="'color color-' + colorItem"
                      v-bind:style="{backgroundColor: colorItem}"
                      v-on:click="color=colorItem;popups.showColor = !popups.showColor"></span>
              </label>
            </b-dropdown-item>
          </b-dropdown>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
import Draw from './js/CanvasDraw'

var draw
export default {
  name: 'hello',
  mounted () {
    this.showCanvas()
  },
  data () {
    return {
      options: {
        restrictY: false,
        restrictX: false
      },
      history: [],
      color: '#13c5f7',
      size: 12,
      popups: {
        showColor: false,
        showSize: false,
        showSave: false,
        showOptions: false
      },
      save: {
        name: '',
        saveItems: []
      },
      colors: [
        '#d4f713',
        '#13f7ab',
        // '#13f3f7',
        // '#13c5f7',
        '#138cf7',
        // '#1353f7',
        '#2d13f7',
        '#7513f7',
        // '#a713f7',
        // '#d413f7',
        '#f713e0',
        // '#f71397',
        // '#f7135b',
        // '#f71313',
        '#f76213',
        // '#f79413',
        '#f7e013',
        '#000000'
      ],
      sizes: [6, 12, 24],
      weights: [2, 4, 6]
    }
  },
  methods: {
    showCanvas () {
      draw = new Draw(this.$refs.canvas, this)
    },
    removeHistoryItem () {
      this.history.splice(this.history.length - 2, 1)
      draw.redraw()
    },
    removeAllHistory () {
      this.history = []
      draw.redraw()
    },
    simplify () {
      var simpleHistory = []
      this.history.forEach((item, i) => {
        if (i % 6 !== 1 || item.isDummy) {
          simpleHistory.push(item)
        }
      })
      this.history = simpleHistory
      draw.redraw()
    },
    jumble () {
      this.history.forEach((item, i) => {
        item.r += Math.sin(i * 20) * 5
      })
      this.history = this.shuffle(this.history)
      draw.redraw()
    },
    shuffle (a) {
      var b = []

      a.forEach((item, i) => {
        if (!item.isDummy) {
          var l = b.length
          var r = Math.floor(l * Math.random())
          b.splice(r, 0, item)
        }
      })

      for (var i = 0; i < b.length; i++) {
        if (i % 20 === 1) {
          b.push(draw.getDummyItem())
        }
      }

      return b
    },
    saveItem () {
      if (this.save.name.length > 2) {
        var historyItem = {
          history: this.history.slice(),
          name: this.save.name
        }

        this.save.saveItems.push(historyItem)
        this.save.name = ''
      }
    },
    loadSave (item) {
      console.info(item)
      this.history = item.history.slice()
      draw.redraw()
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
@import url("https://fonts.googleapis.com/css?family=Roboto:300,400,500");

$prim: rgb(0, 149, 255);

.text-faded {
  opacity: 0.5;
}

.cursor {
  position: fixed;
  top: 0;
  left: 0;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 3px solid rgb(30, 30, 30);
  pointer-events: none;
  user-select: none;
  mix-blend-mode: difference;
  opacity: 0;
  transition: opacity 1s;
}

canvas {
  width: 100%;
  height: calc(100vh - 60px);
  background-color: white;
  vertical-align: bottom;
  cursor: none;

  &:hover + .cursor {
    opacity: 1;
  }

  &:active + .cursor {
    border-color: rgb(60, 60, 60);
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

button {
  appearance: none;
  border: 0;
  border-radius: 0;
  box-shadow: 0;
  width: 40px;
  height: 60px;
  display: inline-block;
  background-color: transparent;
  color: rgb(140, 140, 140);
  font-size: 22px;
  transition: all 0.15s;
  cursor: pointer;
  outline: 0;
  position: relative;

  .size-icon,
  .color-icon {
    position: absolute;
    top: 10px;
    right: 0;
  }

  .color-icon {
    width: 5px;
    height: 5px;
    border-radius: 50%;
  }

  .size-icon {
    font-size: 6px;
    text-align: right;
  }

  &:hover {
    opacity: 0.8;
  }

  &:active,
  &.active {
    color: white;
  }

  &.disabled {
    color: rgb(50, 50, 50);
    cursor: not-allowed;
  }
}
</style>
