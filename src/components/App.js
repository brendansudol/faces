import debounce from 'lodash.debounce'
import React, { Component, Fragment } from 'react'
import Dropzone from 'react-dropzone'

import sampleImgUrl from '../img/faces.jpg'
import { FaceFinder } from '../ml/face'
import { EmotionNet } from '../ml/models'
import { readFile, nextFrame, drawBox, drawText } from '../util'

class App extends Component {
  state = {
    modelsReady: false,
    imgUrl: sampleImgUrl,
    loading: false,
    detections: [],
    faces: [],
    results: [],
  }

  componentDidMount() {
    this.initModels()
    window.addEventListener('resize', this.handleResize)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize)
  }

  initModels = async () => {
    const faceModel = new FaceFinder()
    await faceModel.load()

    const emotionModel = new EmotionNet()
    await emotionModel.load()

    this.models = { faces: faceModel, emotions: emotionModel }
    this.setState({ modelsReady: true }, this.initPredict)
  }

  initPredict = () => {
    if (!this.img.complete) return
    this.setState({ loading: true })
    this.analyzeFaces()
  }

  handleImgLoaded = () => {
    this.clearCanvas()
    this.analyzeFaces()
  }

  handleResize = debounce(() => this.drawDetections(), 100)

  handleUpload = async files => {
    if (!files.length) return
    const fileData = await readFile(files[0])
    this.setState({
      imgUrl: fileData.url,
      loading: true,
      detections: [],
      faces: [],
      results: [],
    })
  }

  analyzeFaces = async () => {
    await nextFrame()

    if (!this.models) return

    // get face bounding boxes and canvases
    const faceResults = await this.models.faces.findAndExtractFaces(this.img)
    const { detections, faces } = faceResults

    // get emotion predictions
    let results = await Promise.all(
      faces.map(async face => await this.models.emotions.classify(face))
    )

    this.setState(
      { loading: false, detections, faces, results },
      this.drawDetections
    )
  }

  clearCanvas = () => {
    this.canvas.width = 0
    this.canvas.height = 0
  }

  drawDetections = () => {
    const { detections, results } = this.state
    const { width, height } = this.img

    if (!detections.length) return

    this.canvas.width = width
    this.canvas.height = height

    const ctx = this.canvas.getContext('2d')
    const detectionsResized = detections.map(d => d.forSize(width, height))

    drawBox({ ctx, x: 0, y: 0, width, height })

    detectionsResized.forEach((det, i) => {
      const { x, y } = det.box
      const text = results[i][0].label.emoji

      drawBox({ ctx, ...det.box })
      drawText({ ctx, x, y, text })
    })
  }

  render() {
    const { modelsReady, imgUrl, loading, faces, results } = this.state

    return (
      <Fragment>
        <div className="container mx-auto px2 py3">
          <div className="mb2">
            <h1 className="m0 h2">Face & Emotion Net</h1>
            <p className="h3">Lorem ipsum...</p>
          </div>
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
              <canvas
                ref={el => (this.canvas = el)}
                className="absolute top-0 left-0"
              />
              <canvas
                ref={el => (this.canvasTmp = el)}
                className="display-none"
              />
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
        <footer className="footer h5 center">footer stuff</footer>
      </Fragment>
    )
  }
}

export default App
