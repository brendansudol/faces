import React from 'react'

const Emoji = ({ label, value }) => (
  <span role="img" aria-label={label}>
    {value}
  </span>
)

export default Emoji
