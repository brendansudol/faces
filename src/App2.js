import React, { Component } from 'react'
import * as faceapi from 'face-api.js/dist/face-api.js'

import img from './img/faces.jpg'

const getImg = src =>
  new Promise(resolve => {
    const img = new Image()
    img.src = src
    img.crossOrigin = '*'
    img.onload = () => resolve(img)
  })

class App2 extends Component {
  componentDidMount() {
    this.initModel()
  }

  initModel = async () => {
    const model = new faceapi.FaceDetectionNet()
    const path =
      `${process.env.PUBLIC_URL}/static/model/face/` +
      'ssd_mobilenetv1_model-weights_manifest.json'

    await model.load(path)

    const myImg = await getImg(img)
    const detections = await model.locateFaces(myImg, 0.4, 50)
    console.log(detections)

    this.canvas.width = myImg.width
    this.canvas.height = myImg.height
    faceapi.drawDetection(this.canvas, detections, { withScore: true })
  }

  render() {
    return (
      <div className="container">
        <div className="relative">
          <img src={img} alt="demo" />
          <canvas ref={el => (this.canvas = el)} className="overlay" />
        </div>
      </div>
    )
  }
}

export default App2
