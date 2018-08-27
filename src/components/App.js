import debounce from 'lodash.debounce'
import React, { Component, Fragment } from 'react'
import Dropzone from 'react-dropzone'

import Alert from './Alert'
import Footer from './Footer'
import Header from './Header'
import Results from './Results'

import sampleImgUrl from '../img/faces.jpg'
import { FaceFinder } from '../ml/face'
import { EmotionNet } from '../ml/models'
import { readFile, nextFrame, drawBox, drawText } from '../util'

class App extends Component {
  state = {
    ready: false,
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
    this.setState({ ready: true }, this.initPredict)
  }

  initPredict = () => {
    // return
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

    detectionsResized.forEach((det, i) => {
      const { x, y } = det.box
      const text = results[i][0].label.emoji

      drawBox({ ctx, ...det.box })
      drawText({ ctx, x, y, text })
    })
  }

  render() {
    const { ready, imgUrl, loading, faces, results } = this.state

    console.log(results)

    return (
      <Fragment>
        <div className="container mx-auto p2">
          <Header />
          <div className="mb1">
            <Dropzone
              className="btn btn-small btn-primary btn-upload bg-yellow black h5"
              accept="image/jpeg, image/png"
              multiple={false}
              disabled={!ready}
              onDrop={this.handleUpload}
            >
              Upload another image
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
          {!ready && <Alert>Loading machine learning models...</Alert>}
          {loading && <Alert>Analyzing image...</Alert>}
          {faces.length > 0 && <Results faces={faces} results={results} />}
        </div>
        <Footer />
      </Fragment>
    )
  }
}

export default App
