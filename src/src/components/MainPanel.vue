<template>
  <div class="app-wrapper">
    <d3-draw ref="draw" :fontColor="fontColor" :lineWidth="lineWidth" :bgColor="bgColor" v-on:history:update="updateHistory()"></d3-draw>
    <div class="tap-btn" @mouseover="showOp = true" @mouseleave="showOp = false" >
      <span>...</span>
      <ul v-show="showOp">
        <li @click="editMode = 'random';removeAllHistory()">随便画</li>
        <li @click="editMode = 'digital';removeAllHistory()">数字</li>
        <li @click="editMode = 'letter';removeAllHistory()">字母</li>
      </ul>
    </div>
    <b-container class="bv-example-row">
      <b-row>
        <b-col>
          <button @mousedown="startRecord" @mouseup="endRecord">录</button>
          <!-- 撤销 -->
          <button type="button" v-on:click="removeHistoryItem" v-bind:class="{active: historyLength > 0}" title="Undo">
            <i class="ion ion-reply" ></i>
          </button>
          <!-- 清空 -->
          <button type="button" v-on:click="removeAllHistory" v-bind:class="{active: historyLength > 0}" title="Clear all">
            <i class="ion ion-trash-a" ></i>
          </button>
          <!-- 颜色 -->
          <color-chrome-picker v-model="fontColor"></color-chrome-picker>
          <!-- 背景颜色 -->
          <color-line-picker v-model="bgColor"></color-line-picker>
          <!-- 画线粗细 -->
          <circle-line-picker v-model="lineWidth"></circle-line-picker>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>
<script>
  import D3Draw from './js/D3Draw.vue'
  import CircleLinePicker from '../common/picker/circle_line_picker'
  import ColorLinePicker from '../common/picker/color_line_picker'
  import ColorChromePicker from '../common/picker/color_chrome_picker'
  import randomstring from 'randomstring'
  import audio from './js/audio.js'
  import RecordRTC from 'recordrtc'
  import saveSvgAsPng from 'save-svg-as-png'

  let audioRecorder
  export default {
    components: {
      D3Draw,
      CircleLinePicker,
      ColorLinePicker,
      ColorChromePicker
    },
    data () {
      return {
        showOp: false,
        editMode: 'random', // digital random letter
        // 当前会话历史数量
        historyLength: 0,
        // 当前会话的状态
        fontColor: '#13c5f7',
        bgColor: '#efefef',
        lineWidth: 12
      }
    },
    watch: {
      bgColor (val) {
        let instance = this.$refs.draw.getInstance()
        instance.changeBgColor(val)
      },
      fontColor (val) {
        console.info(val)
        let instance = this.$refs.draw.getInstance()
        instance.changeFontColor(val)
      },
      lineWidth (val) {
        let instance = this.$refs.draw.getInstance()
        instance.changeLineWidth(val)
      }
    },
    mounted () {
    },
    methods: {
      updateHistory () {
        if (!this.$refs.draw) {
          this.historyLength = 0
        }
        this.historyLength = this.$refs.draw.getInstance().getHistory().length
      },
      removeAllHistory () {
        // 保存当前图片,然后再清空历史
        saveSvgAsPng.svgAsPngUri(document.getElementById('svg_#d31'), {}, (uri) => {
          saveSvgAsPng.download('test.png', uri)
          let instance = this.$refs.draw.getInstance()
          instance.clearHistory()
          // 初始化
          instance.initBgColor()
          instance.initLineRect()
          let str
          let hasLetter
          if (this.editMode === 'letter') {
            str = randomstring.generate({
              length: 4,
              charset: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
            })
            hasLetter = true
          } else if (this.editMode === 'digital') {
            str = randomstring.generate({
              length: 4,
              charset: 'numeric'
            })
            hasLetter = true
          }
          if (str && hasLetter) {
            this._drawLetter(str)
          }
        })
      },
      removeHistoryItem () {
        let instance = this.$refs.draw.getInstance()
        instance.undo()
      },
      _drawLetter (text) {
        // var imgs = instance.svg.selectAll('img').data([0])
        // imgs.enter()
        //   .append('image')
        //   .attr('xlink:href', 'https://i.stack.imgur.com/FT81f.png')
        //   .attr('x', '60')
        //   .attr('y', '60')
        //   .attr('width', '50')
        //   .attr('height', '50')
        let instance = this.$refs.draw.getInstance()
        let contentWidth = instance.getContentWidth()
        let centerPoint = instance.getCenterPoint()
        let txt = instance.drawText(text, centerPoint, 0.8 * contentWidth)
        txt.on('click', function () {
          audio.play(text)
          txt.transition()
            .style('fill', 'red')
            .transition()
            .delay(800)
            .style('fill', 'none')
        })
      },
      startRecord () {
        navigator.getUserMedia({ audio: true, video: false }, // { width: 1280, height: 720 }
          (stream) => {
            var options = {
              type: 'pcm',
              recorderType: RecordRTC.StereoAudioRecorder,
              // mimeType: 'audio/wav', // or video/webm\;codecs=h264 or video/webm\;codecs=vp9
              audioBitsPerSecond: 16000,
              // videoBitsPerSecond: 128000,
              numberOfAudioChannels: 1,
              // sampleRate: 16000,
              desiredSampleRate: 16000,
              ignoreMutedMedia: true
              // bitsPerSecond: 128000 // if this line is provided, skip above two
            }
            audioRecorder = RecordRTC(stream, options)
            audioRecorder.startRecording()
          }, (err) => {
            console.log('The following error occurred: ' + err.name)
          })
      },
      endRecord () {
        audioRecorder.stopRecording(function (audioVideoWebMURL) {
          window.open(audioVideoWebMURL)
          // const data = new FormData()
          // data.append('action', 'ADD')
          // data.append('file', audioVideoWebMURL, { type: 'audio/wav' })
          let data = {filename: 'xxx'}
          audio.upload(data, audioRecorder.getBlob())
        })
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

    &:hover {
      opacity: 0.8;
    }

    &:active,
    &.active {
      color: black;
    }

    &.disabled {
      color: rgb(50, 50, 50);
      cursor: not-allowed;
    }
  }
</style>
