import React from 'react'
export default function Chat(){
  return (
    <div>
      <h3>Chat Global (mock)</h3>
      <div className="card">
        <div style={{height:300, overflow:'auto', background:'#fff', padding:8}}>
          <div><b>Ana:</b> ¿Alguien en línea?</div>
          <div><b>Carlos:</b> Sí, revisando proceso 3.</div>
        </div>
        <input placeholder="Escribe un mensaje..." style={{width:'80%'}} /> <button>Enviar</button>
      </div>
    </div>
  )
}
