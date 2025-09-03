import React, { useRef, useState, useEffect } from 'react'

export default function CanvasEditor({ initialPoints = [], onChange, imageData, setImageData, selectedPoint }){
  const containerRef = useRef()
  const imgRef = useRef()
  // Estado interno para la imagen mostrada en el canvas
  const [imageSrc, setImageSrc] = useState(imageData || null)

  // Sincronizar imageSrc con imageData cada vez que cambie (por ejemplo, al seleccionar producto)
  useEffect(() => {
    if (imageData && imageData !== imageSrc) {
      setImageSrc(imageData)
    }
    // Si imageData es null, limpiar imageSrc
    if (!imageData) {
      setImageSrc(null)
    }
  }, [imageData])
  const [points, setPoints] = useState(initialPoints)
  const [selected, setSelected] = useState(null)
  const [zoom, setZoom] = useState(1)

  useEffect(()=> { if(onChange) onChange({ points, imageSrc, zoom }) }, [points, imageSrc, zoom])

  // Enfoque automático al seleccionar punto con enfoque guardado
  useEffect(()=>{
    if(selectedPoint && selectedPoint.focus){
      setZoom(selectedPoint.focus.zoom || 1)
      // Centrar el scroll en el punto
      setTimeout(()=>{
        if(containerRef.current && imgRef.current){
          const container = containerRef.current
          const img = imgRef.current
          const x = selectedPoint.focus.x
          const y = selectedPoint.focus.y
          // Calcular posición en px
          const imgW = img.offsetWidth
          const imgH = img.offsetHeight
          const scrollLeft = (imgW * x / 100) - container.offsetWidth/2
          const scrollTop = (imgH * y / 100) - container.offsetHeight/2
          container.scrollLeft = Math.max(0, scrollLeft)
          container.scrollTop = Math.max(0, scrollTop)
        }
      }, 300)
    }
  }, [selectedPoint])

  function handleUpload(e){
    const f = e.target.files[0]
    if(!f) return
    const reader = new FileReader()
    reader.onload = ()=> setImageSrc(reader.result)
    reader.readAsDataURL(f)
  }

  function handleClick(e){
    if(!imgRef.current) return
    const rect = imgRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    const num = points.length + 1
    const id = `pt_${Date.now()}`
    const newPoint = { id, num, x: +x.toFixed(2), y: +y.toFixed(2), type:'visual', severity:'low', team:'' }
    setPoints(p=> { const next = [...p, newPoint]; return next })
    setSelected(id)
  }

  function removePoint(id){
    setPoints(p=> p.filter(pt=> pt.id !== id).map((pt, i)=> ({...pt, num: i+1})))
    setSelected(null)
  }

  function updatePoint(id, patch){
    setPoints(p=> p.map(pt=> pt.id===id? {...pt, ...patch}: pt))
  }

  return (
    <div>
      <div style={{display:'flex', gap:12, marginBottom:12}}>
        <input type="file" accept="image/*" onChange={handleUpload} />
        <div className="muted">Sube PNG/JPEG ideal 1980x720</div>
      </div>
      <div style={{display:'flex', alignItems:'center', gap:16, marginBottom:8}}>
        <label>Zoom:</label>
  <input type="range" min={0.5} max={8} step={0.05} value={zoom} onChange={e=>setZoom(Number(e.target.value))} style={{width:220}} />
        <span>{(zoom*100).toFixed(0)}%</span>
      </div>
      <div ref={containerRef} style={{position:'relative', width:660, height:360, overflow:'auto', border:'1px solid #ccc', borderRadius:8}}>
        {imageSrc ? (
          <img
            ref={imgRef}
            src={imageSrc}
            alt="plano"
            style={{
              width: `${zoom*100}%`,
              height: `${zoom*100}%`,
              objectFit:'contain',
              borderRadius:8,
              transition:'width 0.2s, height 0.2s'
            }}
            onClick={handleClick}
          />
        ) : (
          <div ref={imgRef} onClick={handleClick} className="canvas-placeholder" style={{width:'100%', height:'100%'}}>
            Haz click para añadir punto (sube imagen para referencia)
          </div>
        )}
        {points.map(pt=> (
          <div key={pt.id}
            onClick={(e)=>{ e.stopPropagation(); setSelected(pt.id) }}
            style={{
              position:'absolute',
              left:`calc(${pt.x}% - 18px)`,
              top:`calc(${pt.y}% - 18px)`,
              zIndex:2
            }}
            title={`Punto ${pt.num} (${pt.x}%, ${pt.y}%)`}>
            <div className={`inspector-point ${selected===pt.id? 'point-selected':''}`}>{pt.num}</div>
          </div>
        ))}
      </div>
      {selected && (
        <div style={{marginTop:10}} className="card">
          <h4>Editar punto</h4>
          {(() => {
            const pt = points.find(p=> p.id===selected)
            if(!pt) return <div>Seleccion invalida</div>
            return (
              <div style={{display:'flex', gap:8, alignItems:'center'}}>
                <div className="muted">#{pt.num}</div>
                <div>Tipo:
                  <select value={pt.type} onChange={(e)=> updatePoint(pt.id, {type:e.target.value})} style={{marginLeft:8}}>
                    <option value="visual">Visual</option>
                    <option value="dimensional">Dimensional</option>
                  </select>
                </div>
                <div>Severidad:
                  <select value={pt.severity} onChange={(e)=> updatePoint(pt.id, {severity:e.target.value})} style={{marginLeft:8}}>
                    <option>low</option>
                    <option>medium</option>
                    <option>high</option>
                  </select>
                </div>
                <div>Equipo:
                  <input value={pt.team} onChange={(e)=> updatePoint(pt.id, {team:e.target.value})} style={{marginLeft:8}} />
                </div>
                <button className="btn secondary" onClick={()=> removePoint(pt.id)}>Eliminar</button>
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )
}
