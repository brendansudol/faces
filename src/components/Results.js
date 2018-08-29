import React from 'react'
import { format } from 'd3-format'

import Message from './Message'

const fmt = (x, digits = 1) => format(`.${digits}%`)(x)

const Summary = ({ total, happy }) => (
  <Message bg="yellow">
    <strong>Results:</strong> Of <strong>{total}</strong>{' '}
    {total > 1 ? 'people' : 'person'} detected,{' '}
    <strong>
      {happy} ({fmt(happy / total, 0)})
    </strong>{' '}
    {happy === 1 ? 'is' : 'are'} happy.
  </Message>
)

const Results = ({ faces, emotions }) => (
  <div>
    <Summary
      total={faces.length}
      happy={emotions.filter(r => r[0].label.emoji === '😄').length}
    />
    <div className="flex flex-wrap mxn1 mt1">
      {faces.map((face, i) => (
        <div key={i} className="col col-4 sm-col-3 md-col-5th px1">
          <div className="mb1 border border-silver rounded overflow-hidden">
            <img
              src={face.toDataURL()}
              alt={`face ${i + 1}`}
              className="block col-12"
            />
            <div className="p05 fs-tiny">
              {emotions[i].slice(0, 2).map(({ label, value }) => (
                <div key={label.name} className="flex justify-between">
                  <div className="mr05 truncate">
                    {label.emoji}
                    {label.name}
                  </div>
                  <div className="bold">{fmt(value)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
)

export default Results
