import React, { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Image as KonvaImage } from 'react-konva';

/**
 * Componente profesional para visualizar planos con zoom y desplazamiento usando react-konva.
 * Permite guardar la posición (x, y) y el nivel de zoom del viewport, sin mostrar marcadores visuales.
 *
 * Props:
 * - src: string (URL/base64 de la imagen del plano)
 * - onSaveView: function({ x, y, zoom }) => void (callback para guardar la vista actual)
 */
export default function PlanoKonva({ src, onSaveView, focus }) {
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [imgObj, setImgObj] = useState(null);
  const stageRef = useRef();

  // Cargar la imagen del plano
  useEffect(() => {
    if (!src) return;
    const img = new window.Image();
    img.src = src;
    img.onload = () => setImgObj(img);
  }, [src]);

  // Enfocar el visor cuando cambian los valores de enfoque
  useEffect(() => {
    if (focus && typeof focus.x === 'number' && typeof focus.y === 'number' && typeof focus.zoom === 'number') {
      // Ajustar zoom y posición de forma segura
      setZoom(focus.zoom > 0 ? focus.zoom / 100 : 1);
      setPos({ x: focus.x, y: focus.y });
    }
  }, [focus]);

  // Evitar que el visor se quede en blanco si la imagen no está lista
  const stageWidth = imgObj ? imgObj.width : 800;
  const stageHeight = imgObj ? imgObj.height : 600;

  // Manejar zoom con la rueda del mouse
  const handleWheel = (e) => {
    e.evt.preventDefault();
    const scaleBy = 1.1;
    const oldScale = zoom;
    const pointer = stageRef.current.getPointerPosition();
    const mousePointTo = {
      x: (pointer.x - pos.x) / oldScale,
      y: (pointer.y - pos.y) / oldScale,
    };
    let newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
    newScale = Math.max(0.5, Math.min(3, newScale));
    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    setZoom(newScale);
    setPos(newPos);
  };

  // Manejar desplazamiento (drag)
  const handleDragEnd = (e) => {
    setPos({ x: e.target.x(), y: e.target.y() });
  };

  // Guardar la vista actual (posición y zoom)
  const guardarVista = () => {
    if (onSaveView) onSaveView({ x: pos.x, y: pos.y, zoom: zoom * 100 });
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Stage
        width={stageWidth}
        height={stageHeight}
        scaleX={zoom}
        scaleY={zoom}
        x={pos.x}
        y={pos.y}
        ref={stageRef}
        onWheel={handleWheel}
        draggable
        onDragEnd={handleDragEnd}
        style={{ background: '#f3f4f6', border: '1px solid #ccc' }}
      >
        <Layer>
          {imgObj && <KonvaImage image={imgObj} />}
        </Layer>
      </Stage>
      <button
        onClick={guardarVista}
        style={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}
      >
        Guardar vista actual
      </button>
    </div>
  );
}
