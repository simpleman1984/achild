<template>
  <div>
    <!--<div id="d31" @touchstart="mousedown" @touchmove="mousemove" @touchend="mouseup" @mousedown="mousedown" @mousemove="mousemove" @mouseup="mouseup"></div>-->
    <div id="d31"></div>
    <div class="cursor" id="cursor"></div>
  </div>
</template>
<script>
import * as d3 from 'd3'

class Draw {
  constructor (container, context) {
    // 设置上下文
    this.ctx = context
    this.page = 1
    this.pages = 1
    this.history = []
    this.fontColor = 'black'
    this.lineWidth = 12
    this.bgColor = '#efefef'
    this.editMode = '' // digital random letter
    this.init(container)
  }

  init (container) {
    let d3Dom = d3.select(container)
    this.d3Dom = d3Dom
    let svg = d3Dom.append('svg')
      .attr('width', window.innerWidth)
      .attr('height', window.innerHeight - 60)
      .attr('id', 'svg_' + container)
    this.svg = svg
    // 初始化背景色
    this.initBgColor()
    // 初始化围墙线
    this.initLineRect()
    // 初始化拖拉事件
    this.initDragEvent()
    // let canvas = this.svg.append('canvas')
    // canvas.attr('width', window.innerWidth)
    // canvas.attr('height', window.innerHeight - 60)
    //
    // let context = canvas.node().getContext('2d')
    // context.fillStyle = '#efefef'
    // context.fillRect(0, 0, 300, 300)
  }
  initBgColor () {
    let bgRect = this.svg.append('rect')
    bgRect.attr('width', '100%')
      .attr('height', '100%')
      .attr('fill', this.bgColor)
    this.bgRect = bgRect
  }
  initLineRect () {
    let rect = this.getRect()
    let width = rect.width
    let height = rect.height
    let halfWidth = width / 2
    let halfHeight = height / 2
    let centerPoint = {x: width / 2, y: height / 2}
    // 设置内容宽度
    this.contentWidth = Math.min(halfWidth, halfHeight)
    // 设置画板中心
    this.centerPoint = centerPoint
    let line1
    let line2
    if (width > height) {
      line1 = {
        x1: halfWidth - halfHeight,
        y1: 0,
        x2: halfWidth - halfHeight,
        y2: height
      }
      line2 = {
        x1: centerPoint.x + halfHeight,
        y1: 0,
        x2: centerPoint.x + halfHeight,
        y2: height
      }
    } else {
      line1 = {
        x1: 0,
        y1: halfHeight - halfWidth,
        x2: width,
        y2: halfHeight - halfWidth
      }
      line2 = {
        x1: 0,
        y1: centerPoint.y + halfWidth,
        x2: width,
        y2: centerPoint.y + halfWidth
      }
    }
    console.info(line1)
    this.drawLine({x: line1.x1, y: line1.y1}, {x: line1.x2, y: line1.y2}, {stroke: 'black'})
    this.drawLine({x: line2.x1, y: line2.y1}, {x: line2.x2, y: line2.y2}, {stroke: 'black'})
  }
  initDragEvent () {
    var line = d3.line().curve(d3.curveBasis)
    let dragstarted = () => {
      var d = d3.event.subject
      var x0 = d3.event.x
      var y0 = d3.event.y
      // settings from UI
      var active = this.svg.append('path').datum(d)
      this.history.push(active)
      d3.event
        .on('drag', () => {
          var x1 = d3.event.x
          var y1 = d3.event.y
          var dx = x1 - x0
          var dy = y1 - y0
          var cursor = document.getElementById('cursor')
          cursor.style.transform = `translate(${x1 - 10}px, ${y1 - 10}px)`
          if (dx * dx + dy * dy > 36) {
            d.push([x0 = x1, y0 = y1])
          } else {
            d[d.length - 1] = [x1, y1]
          }
          active.attr('d', line)
            .style('stroke-width', this.lineWidth + 'px')
            .style('stroke', this.fontColor)
            .style('fill', 'none')
            // .style('stroke', '#000')
            .style('stroke-linejoin', 'round')
            .style('stroke-linecap', 'round')
          this.updateHistory()
        })
        .on('end', () => {
          this.history.push(active)
        })
    }
    d3.select('svg')
      .on('mousemove', () => {
        var x1 = d3.event.x
        var y1 = d3.event.y
        var cursor = document.getElementById('cursor')
        cursor.style.transform = `translate(${x1 - 10}px, ${y1 - 10}px)`
      })
      .call(d3.drag()
        .container(function () {
          return this
        })
        .subject(function () {
          var p = [d3.event.x, d3.event.y]
          return [p, p]
        })
        .on('start', dragstarted))
  }
  getHistory () {
    return this.history
  }
  getContentWidth () {
    return this.contentWidth
  }
  getCenterPoint () {
    return this.centerPoint
  }
  updateHistory () {
    this.ctx.$emit('history:update')
  }
  undo () {
    // 历史大于0，才能够撤销
    if (this.history.length > 0) {
      this.history[this.history.length - 1].remove()
      this.history.splice(this.history.length - 1, 1)
    }
    this.updateHistory()
  }
  clearHistory () {
    this.history = []
    this.svg.selectAll('*').remove()
    this.updateHistory()
  }
  changeFontColor (color) {
    this.fontColor = color
  }
  // 变更字都默认颜色
  changeLineWidth (lineWidth) {
    this.lineWidth = lineWidth
  }
  // 变更背景
  changeBgColor (bgColor) {
    this.bgColor = bgColor
    this.bgRect.attr('fill', this.bgColor)
  }
  // 画线
  drawLine (from, to, styles, pushHistory) {
    let line = this.svg.append('line')
    Object.keys(styles).forEach((key) => {
      line.style(key, styles[key])
    })
    line.attr('x1', from.x)
      .attr('y1', from.y)
      .attr('x2', to.x)
      .attr('y2', to.y)
    if (pushHistory) {
      this.history.push({
        action: 'line',
        params: {
          from,
          to,
          styles
        }
      })
    }
  }
  drawText (text, center, width, styles = {stroke: 'black'}) {
    return this.svg.selectAll()
      .data([text])
      .enter()
      .append('text')
      .attr('x', center.x)
      .attr('y', center.y)
      .attr('alignment-baseline', 'middle')
      .attr('text-anchor', 'middle')
      .style('font-size', width + 'px')
      .attr('stroke', 'red')
      .attr('stroke-width', 1)
      .attr('fill', 'none')
      .text(function (d) {
        return d
      })
  }
  // 获取基本宽度等属性
  getRect () {
    return {
      width: parseInt(this.svg.attr('width'), 10),
      height: parseInt(this.svg.attr('height'), 10)
    }
  }
}

let draw
export default {
  props: {
    fontColor: String,
    lineWidth: Number,
    bgColor: [String, Object],
    editMode: String // digital random letter
  },
  mounted () {
    draw = new Draw('#d31', this)
    draw.changeFontColor(this.fontColor)
    draw.changeLineWidth(this.lineWidth)
    draw.changeBgColor(this.bgColor)
  },
  methods: {
    getInstance () {
      return draw
    }
  }
}
</script>
<style scoped lang="scss">
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

  #d31 {
    height: calc(100vh - 60px);
    vertical-align: bottom;
    cursor:none;

    &:hover + .cursor {
      opacity: 1;
    }

    &:active + .cursor {
      border-color: rgb(60, 60, 60);
    }
  }
</style>

