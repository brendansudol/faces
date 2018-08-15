import React, { Component } from 'react'
import Dropzone from 'react-dropzone'

// import facesImg from '../img/faces.jpg'

import { FaceFinder } from '../ml/face'
import { EmotionNet } from '../ml/models'
import { readFile, nextFrame } from '../util'

class App2 extends Component {
  state = { modelsReady: false, imgUrl: null, loading: false }

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

    this.setState({ imgUrl: results.url, loading: true })
  }

  handleImgLoaded = async () => {
    this.initCanvas()
    this.analyzeFaces()
  }

  analyzeFaces = async () => {
    await nextFrame()

    const {
      detections,
      faceImgs
    } = await this.models.faces.findAndExtractFaces(this.img)

    console.log(detections)
    console.log(faceImgs)

    this.setState({ loading: false })

    // this.canvas.width = width
    // this.canvas.height = height
    // drawDetection(this.canvas, detections) // something is busted here
    // faceImgs.forEach(canvas => this.facesContainer.appendChild(canvas))
  }

  initCanvas = () => {
    const { width, height } = this.img
    const ctx = this.canvas.getContext('2d')

    this.canvas.width = width
    this.canvas.height = height

    ctx.strokeStyle = 'red'
    ctx.lineWidth = 5
    ctx.strokeRect(0, 0, width, height)
  }

  render() {
    const { modelsReady, imgUrl, loading } = this.state

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
        {loading && <p>Loading...</p>}
      </div>
    )
  }
}

export default App2
