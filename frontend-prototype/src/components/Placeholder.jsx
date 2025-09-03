import React from 'react'
export default function Placeholder({title, children}){
  return (
    <div className="card">
      <h4>{title}</h4>
      {children}
    </div>
  )
}
