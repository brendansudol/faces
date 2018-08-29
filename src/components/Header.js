import React from 'react'

import Emoji from './Emoji'

const Header = ({ children }) => (
  <header className="my2">
    <h2 className="m0 h3">
      <Emoji label="grin" value="😄" />
      <Emoji label="neutral" value="😐" />
      <Emoji label="sad" value="🙁" />
    </h2>
    <h1 className="my1 h2">Emotion Extractor</h1>
    <p className="m0">
      Upload a photo and see who’s happy to be there. This demo uses{' '}
      <a href="https://js.tensorflow.org/">Tensorflow.js</a> and neural networks
      to detect faces and classify emotions. More details <a href="#!">here</a>.
    </p>
  </header>
)

export default Header
