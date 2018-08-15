import * as faceapi from 'face-api.js'
import React, { Component } from 'react'
import Dropzone from 'react-dropzone'

import img from '../img/faces.jpg'
import cat from '../img/cat.jpg'

import { FaceFinder } from '../ml/face'
import { EmotionNet, GenderNet, MobileNet } from '../ml/models'
import { getImg } from '../ml/img'

const readFile = file =>
  new Promise(resolve => {
    const reader = new FileReader()
    reader.onload = () => resolve({ file, url: reader.result })
    reader.readAsDataURL(file)
  })

class App extends Component {
  state = { imgUrl: null }

  componentDidMount() {
    this.initModel3()
    // this.tryMobileNet()
  }

  initModel = async () => {
    const model = new faceapi.FaceDetectionNet()
    const path =
      `${process.env.PUBLIC_URL}/static/models/face/` +
      'ssd_mobilenetv1_model-weights_manifest.json'

    await model.load(path)

    const myImg = await getImg(img)
    const detections = await model.locateFaces(myImg, 0.4, 50)
    console.log(detections)

    this.canvas.width = myImg.width
    this.canvas.height = myImg.height
    faceapi.drawDetection(this.canvas, detections, { withScore: true })
  }

  initModel2 = async () => {
    const model = new faceapi.Mtcnn()
    const path =
      `${process.env.PUBLIC_URL}/static/models/face/` +
      'mtcnn_model-weights_manifest.json'

    await model.load(path)

    const myImg = await getImg(img)
    const input = await faceapi.toNetInput(myImg, false, true)

    const params = {
      minFaceSize: 50,
      scaleFactor: 0.709,
      maxNumScales: 10,
      scoreThresholds: [0.7, 0.7, 0.7]
    }

    const results = await model.forward(input, params)
    const detections = results.map(res => res.faceDetection)
    console.log(results)

    this.canvas.width = myImg.width
    this.canvas.height = myImg.height
    faceapi.drawDetection(this.canvas, detections)

    const faceImgs = await faceapi.extractFaces(input.inputs[0], detections)
    faceImgs.forEach(canvas => this.facesContainer.appendChild(canvas))

    this.tryEmotionNet(faceImgs)
    this.tryGenderNet(faceImgs)
  }

  initModel3 = async () => {
    const model = new FaceFinder()
    await model.load()

    const myImg = await getImg(img)
    const { detections, faceImgs } = await model.findAndExtractFaces(myImg)

    this.canvas.width = myImg.width
    this.canvas.height = myImg.height
    faceapi.drawDetection(this.canvas, detections)
    faceImgs.forEach(canvas => this.facesContainer.appendChild(canvas))
  }

  tryEmotionNet = async imgs => {
    console.log(imgs)

    const img = imgs[0]
    console.log(img)

    const model = new EmotionNet()
    await model.load()

    const results = await model.classify(img)
    console.log(JSON.stringify(results, null, 2))
  }

  tryGenderNet = async imgs => {
    console.log(imgs)

    const img = imgs[0]
    console.log(img)

    const model = new GenderNet()
    await model.load()

    const results = await model.classify(img)
    console.log(JSON.stringify(results, null, 2))
  }

  tryMobileNet = async () => {
    const model = new MobileNet()
    await model.load()
    const img = await getImg(cat)
    const results = await model.classify(img)
    console.log(JSON.stringify(results, null, 2))
  }

  handleUpload = async files => {
    if (!files.length) return

    const results = await readFile(files[0])
    console.log(results)

    this.setState({ imgUrl: results.url })
  }

  render() {
    const { imgUrl } = this.state

    return (
      <div className="container">
        <div className="my3">
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
          {imgUrl && <img src={imgUrl} alt="uploaded" />}
        </div>

        <div className="relative">
          <img src={img} alt="demo" />
          <canvas ref={el => (this.canvas = el)} className="overlay" />
          <div ref={el => (this.facesContainer = el)} className="faces" />
        </div>
      </div>
    )
  }
}

export default App
