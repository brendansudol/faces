import React, { Component } from 'react'
import Dropzone from 'react-dropzone'

import { FaceFinder } from '../ml/face'
import { EmotionNet } from '../ml/models'
import { readFile, nextFrame, drawBox, drawText } from '../util'

class App extends Component {
  state = {
    modelsReady: false,
    imgUrl: null,
    loading: false,
    faces: [],
    results: [],
  }

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
    const fileData = await readFile(files[0])
    this.setState({ imgUrl: fileData.url, loading: true, results: [] })
  }

  handleImgLoaded = () => {
    this.initCanvas()
    this.analyzeFaces()
  }

  analyzeFaces = async () => {
    await nextFrame()

    // get face bounding boxes and canvases
    const {
      detectionsResized,
      faces,
    } = await this.models.faces.findAndExtractFaces(this.img)

    // get emotion predictions
    let results = await Promise.all(
      faces.map(async face => await this.models.emotions.classify(face))
    )

    this.drawDetections(detectionsResized, results)
    this.setState({ loading: false, faces, results })
  }

  drawDetections = (detections, predictions) => {
    const ctx = this.canvas.getContext('2d')

    detections.forEach((det, i) => {
      const { x, y } = det.box
      const text = predictions[i][0].label.emoji

      drawBox({ ctx, ...det.box })
      drawText({ ctx, x, y, text })
    })
  }

  initCanvas = () => {
    const { width, height } = this.img
    const ctx = this.canvas.getContext('2d')

    window.canvas = this.canvas

    this.canvas.width = width
    this.canvas.height = height
    drawBox({ ctx, x: 0, y: 0, width, height })
  }

  render() {
    const { modelsReady, imgUrl, loading, faces, results } = this.state

    return (
      <div className="container px2 py3">
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
          </div>
        )}
        {loading && <p>Loading...</p>}
        {faces.length > 0 && (
          <div className="flex flex-wrap mxn1 mt1">
            {faces.map((face, i) => (
              <div key={i} className="mb1 px1">
                <img
                  src={face.toDataURL()}
                  alt={`face ${i + 1}`}
                  className="w-90"
                />
                <div className="fs-12 w-90">
                  {results[i].slice(0, 3).map(({ label }) => (
                    <div key={label.name} className="truncate">
                      {label.emoji} ({label.name})
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }
}

export default App
