<template>
  <div class="app-wrapper">
    <canvas id="canvas" ref="canvas">
    </canvas>
    <div class="cursor" id="cursor"></div>
    <div class="controls">
      <div class="btn-row">
        <div class="history" title="history">
          {{ history.length }}
        </div>
      </div>
      <div class="btn-row">
        <button type="button"
                v-on:click="removeHistoryItem"
                v-bind:class="{ disabled: !history.length }" title="Undo">
          <i class="ion ion-reply"></i>
        </button>
        <button type="button"
                v-on:click="removeAllHistory"
                v-bind:class="{ disabled: !history.length }" title="Clear all">
          <i class="ion ion-trash-a"></i>
        </button>
      </div>
      
      <div class="btn-row">
        <button title="Brush options"
                v-on:click="popups.showOptions = !popups.showOptions">
          <i class="ion ion-android-create"></i>
        </button>
        
        <div class="popup" v-if="popups.showOptions">
          <div class="popup-title">
            Options
          </div>
          <button title="Restrict movement vertical"
                  v-on:click="options.restrictY = !options.restrictY; options.restrictX = false"
                  v-bind:class="{ active: options.restrictY }">
            <i class="ion ion-arrow-right-c"></i>
            Restrict vertical
          </button>
          <button title="Restrict movement horizontal"
                  v-on:click="options.restrictX = !options.restrictX; options.restrictY = false"
                  v-bind:class="{ active: options.restrictX }">
            <i class="ion ion-arrow-up-c"></i>
            Restrict horizontal
          </button>
          <button type="button"
                v-on:click="simplify"
                v-bind:class="{ disabled: !history.length }" title="Simplify paths">
            <i class="ion ion-wand"></i>
            Simplify paths
          </button>
          <button type="button"
                  v-on:click="jumble"
                  v-bind:class="{ disabled: !history.length }" title="Go nutz">
            <i class="ion ion-shuffle"></i>
            Go nutz
          </button>
        </div>
        
      </div>

      <div class="btn-row">
        <button title="Pick a brush size"
                v-on:click="popups.showSize = !popups.showSize"
                v-bind:class="{ active: popups.showSize }">
          <i class="ion ion-android-radio-button-on"></i>
          <span class="size-icon">
            {{ size }}
          </span>
        </button>
        
        <div class="popup" v-if="popups.showSize">
          <div class="popup-title">
            Brush size
          </div>
          <label v-for="sizeItem in sizes" class="size-item">
            <input type="radio" name="size" v-model="size" v-bind:value="sizeItem">
            <span class="size"
                  v-bind:style="{width: sizeItem + 'px', height: sizeItem + 'px'}"
                  v-on:click="popups.showSize = !popups.showSize"></span>
          </label>
        </div>
      </div>
      
      <div class="btn-row">
        <button title="Pick a color"
                v-on:click="popups.showColor = !popups.showColor"
                v-bind:class="{ active: popups.showColor }">
          <i class="ion ion-android-color-palette"></i>
          <span class="color-icon"
                v-bind:style="{backgroundColor: color}">
          </span>
        </button>
        
        <div class="popup" v-if="popups.showColor">
          <div class="popup-title">
            Brush color
          </div>
          <label v-for="colorItem in colors" class="color-item">
            <input type="radio"
                  name="color"
                  v-model="color"
                  v-bind:value="colorItem">
            <span v-bind:class="'color color-' + colorItem"
                  v-bind:style="{backgroundColor: colorItem}"
                  v-on:click="popups.showColor = !popups.showColor"></span>
          </label>
        </div>
      </div>
      
      <div class="btn-row" style="display:none">
        <button title="Save"
                v-on:click="popups.showSave = !popups.showSave">
          <i class="ion ion-android-cloud-outline"></i>
        </button>
        
        <div class="popup" v-if="popups.showSave">
          <div class="popup-title">
            Save your design
          </div>
          <div class="form">
            <input type="text"
                  placeholder="Save name"
                  v-model="save.name">
            <div v-if="save.name.length < 3" class="text-faded">
              <i>
                Min 3 characters
              </i>
            </div>
            <span class="btn"
                  v-on:click="saveItem">
              Save as
              <span class="text-faded"> 
                {{ save.name }}
              </span>
            </span>
          </div>
          
          <div class="saves" v-if="save.saveItems.length">
            <div class="popup-title">
              Load a save
            </div>

            <div class="save-item"
                v-for="item in save.saveItems">
              <h3>{{ item.name }}</h3>
              <span class="btn"
                    v-on:click="loadSave(item)">load</span>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  </div>
</template>

<script>
class Draw {
  constructor (canvas, app) {
    this.c = canvas
    this.app = app
    this.ctx = this.c.getContext('2d')

    this.mouseDown = false
    this.mouseX = 0
    this.mouseY = 0

    this.tempHistory = []

    this.setSize()

    this.listen()

    this.redraw()
  }

  listen () {
    var startMove = (e) => {
      let clientX = e.offsetX || e.touches[0].clientX
      let clientY = e.offsetY || e.touches[0].clientY
      this.mouseDown = true
      this.mouseX = clientX
      this.mouseY = clientY
      this.setDummyPoint()
    }

    var onMove = (e) => {
      let clientX = e.offsetX || e.touches[0].clientX
      let clientY = e.offsetY || e.touches[0].clientY
      this.moveMouse(e)

      if (this.mouseDown) {
        this.mouseX = this.mouseX
        this.mouseY = this.mouseY

        if (!this.app.options.restrictX) {
          this.mouseX = clientX
        }

        if (!this.app.options.restrictY) {
          this.mouseY = clientY
        }

        var item = {
          isDummy: false,
          x: this.mouseX,
          y: this.mouseY,
          c: this.app.color,
          r: this.app.size
        }

        this.app.history.push(item)
        this.draw(item, this.app.history.length)
      }
    }

    var endMove = (e) => {
      if (this.mouseDown) {
        this.setDummyPoint()
      }
      this.mouseDown = false
    }

    var onLeave = (e) => {
      if (this.mouseDown) {
        this.setDummyPoint()
      }
      this.mouseDown = false
    }

    this.c.addEventListener('touchstart', startMove)
    this.c.addEventListener('touchmove', onMove)

    this.c.addEventListener('mousedown', startMove)
    this.c.addEventListener('mouseup', endMove)
    this.c.addEventListener('mouseleave', onLeave)
    this.c.addEventListener('mousemove', onMove)

    window.addEventListener('resize', () => {
      this.setSize()
      this.redraw()
    })
  }

  setSize () {
    this.c.width = window.innerWidth
    this.c.height = window.innerHeight - 60
  }

  moveMouse (e) {
    let x = e.offsetX || e.touches[0].clientX
    let y = e.offsetY || e.touches[0].clientY

    var cursor = document.getElementById('cursor')

    cursor.style.transform = `translate(${x - 10}px, ${y - 10}px)`
  }

  getDummyItem () {
    var lastPoint = this.app.history[this.app.history.length - 1]

    if (!lastPoint) {
      lastPoint = {
        x: -1,
        y: -1
      }
    }

    return {
      isDummy: true,
      x: lastPoint.x,
      y: lastPoint.y,
      c: null,
      r: null
    }
  }

  setDummyPoint () {
    var item = this.getDummyItem()
    this.app.history.push(item)
    this.draw(item, this.app.history.length)
  }

  redraw () {
    this.ctx.clearRect(0, 0, this.c.width, this.c.height)
    this.drawBgDots()

    if (!this.app.history.length) {
      return true
    }

    this.app.history.forEach((item, i) => {
      this.draw(item, i)
    })
  }

  drawBgDots () {
    var gridSize = 50
    this.ctx.fillStyle = 'rgba(0, 0, 0, .2)'

    for (var i = 0; i * gridSize < this.c.width; i++) {
      for (var j = 0; j * gridSize < this.c.height; j++) {
        if (i > 0 && j > 0) {
          this.ctx.beginPath()
          this.ctx.rect(i * gridSize, j * gridSize, 2, 2)
          this.ctx.fill()
          this.ctx.closePath()
        }
      }
    }
  }

  draw (item, i) {
    this.ctx.lineCap = 'round'
    this.ctx.lineJoin = 'round'

    var prevItem = this.app.history[i - 2]

    if (i < 2) {
      return false
    }

    if (!item.isDummy && !this.app.history[i - 1].isDummy && !prevItem.isDummy) {
      this.ctx.strokeStyle = item.c
      this.ctx.lineWidth = item.r

      this.ctx.beginPath()
      this.ctx.moveTo(prevItem.x, prevItem.y)
      this.ctx.lineTo(item.x, item.y)
      this.ctx.stroke()
      this.ctx.closePath()
    } else if (!item.isDummy) {
      this.ctx.strokeStyle = item.c
      this.ctx.lineWidth = item.r

      this.ctx.beginPath()
      this.ctx.moveTo(item.x, item.y)
      this.ctx.lineTo(item.x, item.y)
      this.ctx.stroke()
      this.ctx.closePath()
    }
  }
}

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
      color: '13c5f7',
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
        '#13f3f7',
        '#13c5f7',
        '#138cf7',
        '#1353f7',
        '#2d13f7',
        '#7513f7',
        '#a713f7',
        '#d413f7',
        '#f713e0',
        '#f71397',
        '#f7135b',
        '#f71313',
        '#f76213',
        '#f79413',
        '#f7e013'
      ],
      sizes: [6, 12, 24, 48],
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
  cursor: none;

  &:hover + .cursor {
    opacity: 1;
  }

  &:active + .cursor {
    border-color: rgb(60, 60, 60);
  }
}

.controls {
  position: fixed;
  z-index: 5;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 60px;
  background-color: rgb(10, 10, 10);
  display: flex;
  justify-content: center;
  align-items: center;
  user-select: none;
}

.stat {
  font-size: 20px;
  margin-bottom: 15px;
}

.btn-row {
  position: relative;
  margin-bottom: 5px;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  padding: 0 15px;
  border-radius: 4px;
}

.popup {
  position: absolute;
  width: 300px;
  bottom: 58px;
  padding: 30px;
  left: calc(50% - 150px);
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  background-color: white;
  color: rgb(30, 30, 30);
  border-radius: 10px 10px 0 0;
  border: 1px solid rgb(220, 220, 220);
  border-bottom-width: 0;
  opacity: 0;
  animation: popup 0.5s forwards cubic-bezier(0.2, 2, 0.4, 1);
  z-index: 2;
  overflow: hidden;
  max-height: 80vh;
  overflow-y: auto;

  .popup-title {
    flex: 0 0 100%;
    text-align: center;
    font-size: 16px;
    color: black;
    opacity: 0.5;
    margin-bottom: 10px;
  }

  button {
    height: 80px;
    width: 80px;
    text-align: center;
    font-size: 14px;
    color: rgba(0, 0, 0, 0.4);

    i {
      display: block;
      font-size: 30px;
      margin-bottom: 5px;
      color: rgba(0, 0, 0, 0.2);
    }

    &.disabled {
      color: rgba(0, 0, 0, 0.2);

      i {
        color: rgba(0, 0, 0, 0.1);
      }
    }

    &.active,
    &:active {
      color: rgba(0, 0, 0, 0.4);

      i {
        color: $prim;
      }
    }
  }
}

@keyframes popup {
  from {
    opacity: 0;
    transform: translateX(40px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

.welcome-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9;
  background-color: $prim;
  display: flex;
  justify-content: center;
  align-items: center;
}

.fade-up {
  opacity: 0;
  animation: fade-up 1s forwards cubic-bezier(0.2, 2, 0.4, 1);
}

.btn {
  display: inline-block;
  margin-top: 10px;
  padding: 10px 20px;
  font-weight: 400;
  font-size: 16px;
  border-radius: 4px;
  background-color: $prim;
  color: white;
  animation-delay: 1s;
  transition: all 0.15s;
  cursor: pointer;

  &:hover {
    background-color: lighten($prim, 10%);
  }
}

.welcome {
  width: 400px;
  height: 400px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;

  h1.fade-up {
    font-weight: 300;
    font-size: 40px;
    animation-delay: 0.25s;
  }

  h2.fade-up {
    font-weight: 400;
    color: rgba(255, 255, 255, 0.5);
    animation-delay: 0.5s;
  }

  a.fade-up {
    color: rgba(255, 255, 255, 0.5);
    display: inline-block;
    margin-top: 20px;
    text-decoration: none;
    animation-delay: 0.75s;
  }

  .btn.fade-up {
    background-color: rgba(255, 255, 255, 0.2);
    color: white;
    margin-top: 60px;

    &:hover {
      background-color: rgba(255, 255, 255, 0.3);
    }
  }
}

@keyframes fade-up {
  from {
    transform: translateY(80px);
    opacity: 0;
  }
  to {
    transform: none;
    opacity: 1;
  }
}

.form {
  flex: 0 0 100%;

  input {
    display: block;
    appearance: none;
    border: 0;
    box-shadow: 0;
    outline: 0;
    background-color: rgb(240, 240, 240);
    border-radius: 4px;
    padding: 10px 15px;
    width: 100%;
    margin-bottom: 4px;
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

.history {
  width: 30px;
  height: 30px;
  background-color: rgb(30, 30, 30);
  border-radius: 50%;
  text-align: center;
  line-height: 30px;
  font-size: 12px;
  overflow: hidden;
  color: rgb(140, 140, 140);
}

.color-item {
  position: relative;
  display: inline-block;
  cursor: pointer;
  width: 60px;
  height: 60px;
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
    width: 30px;
    height: 30px;
    background-color: white;
    border-radius: 50%;

    &:hover {
      opacity: 0.8;
    }
  }
}

@keyframes pulsate {
  0%,
  100% {
    transform: none;
  }
  50% {
    transform: scale(1.15);
  }
}

.size-item {
  width: 40px;
  height: 60px;
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
    transition: all 0.15s;
    transform: translate(-50%, -50%) scale(0.6);
    position: absolute;
    top: 50%;
    left: 50%;

    &:hover {
      opacity: 0.8;
    }
  }

  input:checked + .size {
    background-color: $prim;
  }
}

.saves {
  flex: 0 0 calc(100% + 60px);
  margin: 30px -30px -30px;
  padding: 30px;
  background-color: rgb(240, 240, 240);
  max-height: 250px;
  overflow-y: auto;

  .save-item {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
