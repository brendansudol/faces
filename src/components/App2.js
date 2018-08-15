import React, { Component } from 'react'
import Dropzone from 'react-dropzone'

// import facesImg from '../img/faces.jpg'

import { FaceFinder } from '../ml/face'
import { EmotionNet } from '../ml/models'
import { imgLoaded, readFile } from '../util'

class App2 extends Component {
  state = { modelsReady: false, imgUrl: null, loading: false }

  componentDidMount() {
    this.initModels()
  }

  initModels = async () => {
    const face = new FaceFinder()
    await face.load()

    const emotion = new EmotionNet()
    await emotion.load()

    this.models = { face, emotion }
    this.setState({ modelsReady: true })
  }

  handleUpload = async files => {
    if (!files.length) return

    const results = await readFile(files[0])
    console.log(results)

    this.setState({ imgUrl: results.url, loading: true }, this.analyzeFaces)
  }

  analyzeFaces = async () => {
    await imgLoaded(this.img)

    this.adjustCanvas()
  }

  adjustCanvas = () => {
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
            <img ref={el => (this.img = el)} src={imgUrl} alt="uploaded" />
            <canvas ref={el => (this.canvas = el)} className="overlay" />
          </div>
        )}
        {loading && <p>Loading...</p>}
      </div>
    )
  }
}

export default App2
