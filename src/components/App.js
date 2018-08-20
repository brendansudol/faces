import React, { Component } from 'react'
import Dropzone from 'react-dropzone'

// import facesImg from '../img/faces.jpg'

import { FaceFinder } from '../ml/face'
import { EmotionNet } from '../ml/models'
import { readFile, nextFrame, emojiLookup, drawBox, drawText } from '../util'

class App extends Component {
  state = { modelsReady: false, imgUrl: null, loading: false, results: [] }

  componentDidMount() {
    this.initModels()
  }

  initModels = async () => {
    const faceModel = new FaceFinder()
    await faceModel.load()

    const emotionModel = new EmotionNet()
    await emotionModel.load()

    this.models = { faces: faceModel, emotions: emotionModel }
    this.setState({ modelsReady: true })
  }

  handleUpload = async files => {
    if (!files.length) return

    const results = await readFile(files[0])
    console.log(results)

    this.setState({ imgUrl: results.url, loading: true, results: [] })
  }

  handleImgLoaded = async () => {
    this.initCanvas()
    this.analyzeFaces()
  }

  analyzeFaces = async () => {
    await nextFrame()

    const { width, height } = this.img

    const {
      detections,
      faceImgs,
    } = await this.models.faces.findAndExtractFaces(this.img)

    const detectionsResized = detections.map(d => d.forSize(width, height))
    const emotionResults = await Promise.all(
      faceImgs.map(async img => await this.models.emotions.classify(img))
    )
    const emojis = emotionResults.map(r => emojiLookup[r[0].label] || '🤷')

    console.log(detectionsResized)
    console.log(emotionResults)

    this.drawStuff(detectionsResized, emojis)
    this.setState({ loading: false, results: emojis })
    // faceImgs.forEach(canvas => this.facesContainer.appendChild(canvas));
  }

  drawStuff = (faceBoxes, emojis) => {
    const ctx = this.canvas.getContext('2d')

    faceBoxes.forEach((box, i) => {
      const { x, y } = box.box
      drawBox({ ctx, ...box.box })
      drawText({ ctx, x, y, text: emojis[i] })
    })
  }

  initCanvas = () => {
    const { width, height } = this.img
    const ctx = this.canvas.getContext('2d')

    this.canvas.width = width
    this.canvas.height = height
    drawBox({ ctx, x: 0, y: 0, width, height })
  }

  render() {
    const { modelsReady, imgUrl, loading, results } = this.state

    return (
      <div className="container py3">
        <div className="mb1">
          models {modelsReady ? 'ready!' : 'loading...'}
        </div>
        <div className="mb1">
          <Dropzone
            className="btn btn-primary btn-upload"
            accept="image/jpeg, image/png"
            multiple={false}
            onDrop={this.handleUpload}
          >
            Upload image
          </Dropzone>
        </div>
        {imgUrl && (
          <div className="relative">
            <img
              ref={el => (this.img = el)}
              onLoad={this.handleImgLoaded}
              src={imgUrl}
              alt=""
            />
            <canvas ref={el => (this.canvas = el)} className="overlay" />
            <div ref={el => (this.facesContainer = el)} className="faces" />
          </div>
        )}
        {results.length > 0 && <p>{results.join(', ')}</p>}
        {loading && <p>Loading...</p>}
      </div>
    )
  }
}

export default App
