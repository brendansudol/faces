import React from 'react'
import { format } from 'd3-format'

const formatValue = format('.1%')

const Results = ({ faces, results }) => (
  <div className="flex flex-wrap mxn1 mt1">
    {faces.map((face, i) => (
      <div key={i} className="col col-4 sm-col-3 md-col-5th px1">
        <div className="mb1 border border-silver rounded overflow-hidden">
          <img
            src={face.toDataURL()}
            alt={`face ${i + 1}`}
            className="block col-12"
          />
          <div className="p05 fs-11">
            {results[i].slice(0, 2).map(({ label, value }) => (
              <div key={label.name} className="flex justify-between">
                <div className="mr05 truncate">
                  {label.emoji}
                  {label.name}
                </div>
                <div className="bold">{formatValue(value)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ))}
  </div>
)

export default Results
