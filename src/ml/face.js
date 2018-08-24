import * as faceapi from 'face-api.js'

const MODEL_PATH =
  `${process.env.PUBLIC_URL}/static/models/face/` +
  'mtcnn_model-weights_manifest.json'

const PARAMS = {
  minFaceSize: 50,
  scaleFactor: 0.709,
  maxNumScales: 10,
  scoreThresholds: [0.7, 0.7, 0.7],
}

export class FaceFinder {
  constructor(path = MODEL_PATH, params = PARAMS) {
    this.path = path
    this.params = params
  }

  async load() {
    this.model = new faceapi.Mtcnn()
    await this.model.load(this.path)
  }

  async findFaces(img) {
    const input = await faceapi.toNetInput(img, false, true)
    const results = await this.model.forward(input, this.params)
    const detections = results.map(r => r.faceDetection)

    return { input, detections }
  }

  async findAndExtractFaces(img) {
    const { input, detections } = await this.findFaces(img)
    const faces = await faceapi.extractFaces(input.inputs[0], detections)

    return { detections, faces }
  }
}
