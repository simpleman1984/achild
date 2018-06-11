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
export default Draw
