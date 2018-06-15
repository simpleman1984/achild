<template>
  <div class="app-wrapper">
    <canvas id="canvas" ref="canvas"></canvas>
    <div class="cursor" id="cursor"></div>
    <div class="tap-btn" @mouseover="showOp = true" @mouseleave="showOp = false">
      <span>...</span>
      <ul v-show="showOp">
        <li @click="editMode = 'random'">随便画</li>
        <li @click="editMode = 'digital';_drawNumber()">数字</li>
        <li @click="editMode = 'letter';_drawLetter()">字母</li>
      </ul>
    </div>
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
                      v-on:click="color=colorItem;"></span>
              </label>
            </b-dropdown-item>
          </b-dropdown>
          <!-- 背景颜色 -->
          <div class="btn-group" >
            <i class="ion ion-android-color-palette" @click="popups.showColor = !popups.showColor">
            </i>
            <chrome-picker v-click-outside="hide" v-model="bgColor" v-if="popups.showColor" style="position: absolute;bottom: 20px;"></chrome-picker>
          </div>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
import Draw from './js/CanvasDraw'
import randomstring from 'randomstring'
import randomcolor from 'randomcolor'
import { Chrome } from 'vue-color'
import ClickOutside from 'vue-click-outside'

// https://www.npmjs.com/package/recordrtc
// import RecordRTC from 'recordrtc'

var draw
export default {
  name: 'hello',
  components: {
    'chrome-picker': Chrome
  },
  directives: {
    ClickOutside
  },
  mounted () {
    this.showCanvas()

    // navigator.getUserMedia({ audio: true, video: true }, // { width: 1280, height: 720 }
    //   (stream) => {
    //     var options = {
    //       mimeType: 'video/webm', // or video/webm\;codecs=h264 or video/webm\;codecs=vp9
    //       audioBitsPerSecond: 128000,
    //       videoBitsPerSecond: 128000,
    //       bitsPerSecond: 128000 // if this line is provided, skip above two
    //     }
    //     var audioRecorder = RecordRTC(stream, options)
    //     audioRecorder.startRecording()
    //     setTimeout(() => {
    //       audioRecorder.stopRecording(function (audioVideoWebMURL) {
    //         window.open(audioVideoWebMURL)
    //       })
    //     }, 10000)
    //   }, (err) => {
    //     console.log('The following error occurred: ' + err.name)
    //   })
  },
  data () {
    return {
      showOp: false,
      editMode: 'letter', // digital random letter
      options: {
        restrictY: false,
        restrictX: false
      },
      history: [],
      color: '#13c5f7',
      bgColor: '#efefef',
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
      bgColors: [
        '#efefef'
      ],
      sizes: [6, 12, 24],
      weights: [2, 4, 6]
    }
  },
  methods: {
    hide () {
      this.popups.showColor = false
    },
    showCanvas () {
      draw = new Draw(this.$refs.canvas, this)
      draw.drawText('1')
      draw.drawImage()
    },
    removeHistoryItem () {
      this.history.splice(this.history.length - 2, 1)
      draw.redraw()
    },
    _drawNumber () {
      draw.clearRect()
      let digtalstr = randomstring.generate({
        length: 4,
        charset: 'numeric'
      })
      draw.drawText(digtalstr)
    },
    _drawLetter () {
      draw.clearRect()
      draw.drawBgcolor(this.bgColor)
      let digtalstr = randomstring.generate({
        length: 4,
        charset: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
      })
      let color = randomcolor()
      console.info('1________', color)
      draw.drawText(digtalstr, color)
    },
    removeAllHistory () {
      this.history = []
      draw.redraw()

      if (this.editMode === 'digital') {
        this._drawNumber()
      } else if (this.editMode === 'letter') {
        this._drawLetter()
      }
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

/**
 * 超级按钮
 */
.tap-btn
{
  list-style: none;
  position: absolute;
  left: 30px;
  top: 30px;

  span {
    display:block;
    width: 30px;
    height: 30px;
    border-radius: 30px;
    background-color: aquamarine;
  }

  ul {
    margin: 0px;
    padding: 0px;
  }

  li {
    cursor:pointer;
    margin: 0px;
    padding: 0px;
    /*以上三行实现自适应start*/
    text-align: center;/*设置对齐方式*/
    /*float:left;*/
    /*以上三行实现自适应end*/
    list-style-type:none;/*去掉li的消圆点*/
    /*display: inline;*/
  }

  li:hover {
    background-color: blueviolet;
  }
}

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
