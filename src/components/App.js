import debounce from 'lodash.debounce'
import React, { Component, Fragment } from 'react'
import Dropzone from 'react-dropzone'

import Footer from './Footer'
import Header from './Header'
import Message from './Message'
import Results from './Results'

// import sampleImg from '../img/faces.jpg'
import { FaceFinder } from '../ml/face'
import { EmotionNet } from '../ml/models'
import { readFile, nextFrame, drawBox, drawText } from '../util'

class App extends Component {
  state = {
    ready: false,
    loading: false,
    imgUrl: null,
    detections: [],
    faces: [],
    emotions: [],
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

    this.models = { face: faceModel, emotion: emotionModel }
    this.setState({ ready: true }, this.initPredict)
  }

  initPredict = () => {
    if (!this.img || !this.img.complete) return
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
      emotions: [],
    })
  }

  analyzeFaces = async () => {
    await nextFrame()

    if (!this.models) return

    // get face bounding boxes and canvases
    const faceResults = await this.models.face.findAndExtractFaces(this.img)
    const { detections, faces } = faceResults

    // get emotion predictions
    let emotions = await Promise.all(
      faces.map(async face => await this.models.emotion.classify(face))
    )

    this.setState(
      { loading: false, detections, faces, emotions },
      this.drawDetections
    )
  }

  clearCanvas = () => {
    this.canvas.width = 0
    this.canvas.height = 0
  }

  drawDetections = () => {
    const { detections, emotions } = this.state
    if (!detections.length) return

    const { width, height } = this.img
    this.canvas.width = width
    this.canvas.height = height

    const ctx = this.canvas.getContext('2d')
    const detectionsResized = detections.map(d => d.forSize(width, height))

    detectionsResized.forEach((det, i) => {
      const { x, y } = det.box
      const { emoji } = emotions[i][0].label

      drawBox({ ctx, ...det.box })
      drawText({ ctx, x, y, text: emoji })
    })
  }

  render() {
    const { ready, imgUrl, loading, faces, emotions } = this.state
    const noFaces = ready && !loading && imgUrl && !faces.length

    return (
      <div className="px2 mx-auto container app">
        <Header />
        <main>
          <div className="py1">
            <Dropzone
              className="btn btn-small btn-primary btn-upload bg-black h5"
              accept="image/jpeg, image/png"
              multiple={false}
              disabled={!ready}
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
            </div>
          )}
          {!ready && <Message>Loading machine learning models...</Message>}
          {loading && <Message>Analyzing image...</Message>}
          {noFaces && (
            <Message bg="red" color="white">
              <strong>Sorry!</strong> No faces were detected. Please try another
              image.
            </Message>
          )}
          {faces.length > 0 && <Results faces={faces} emotions={emotions} />}
        </main>
        <Footer />
      </div>
    )
  }
}

export default App
