import React, { useState, useRef, useEffect } from "react";
import '../ProductCreate.css';
import { useLocation } from "react-router-dom";
import * as api from "../api";
import PlanoKonva from '../components/PlanoKonva';

const initialInspectionPoint = {
  type: "visual",
  dimensionType: "longitudinal",
  valor: "",
  unidad: "mm",
  tolerancia: "",
  severity: "",
  team: "",
  zoom: 100,
  x: 0,
  y: 0,
  label: "", // Para visuales y resumen dimensional
  // Asegura que los campos existan en todos los puntos
};

export default function ProductCreate() {
  const location = useLocation();
  const editData = location.state || {};
  // Depuración avanzada: mostrar datos recibidos al entrar en modo edición
  useEffect(() => {
    if (editData.editMode) {
      console.group('[QA] Modo edición: datos recibidos del backend');
      console.log('editData:', editData);
      console.log('[QA] imageUrl recibido en modo edición:', editData.imageUrl);
      if (editData.inspectionPoints) {
        editData.inspectionPoints.forEach((pt, idx) => {
          console.log(`[QA] Recibido punto #${idx + 1}: num=${pt.number}, zoom=${pt.zoom}, x=${pt.x}, y=${pt.y}`);
        });
      }
      console.groupEnd();
    }
  }, [editData]);
  const [editMode, setEditMode] = useState(editData.editMode || false);
  const [productId, setProductId] = useState(editData.id || "");
  const [productName, setProductName] = useState(editData.name || "");
  const [projectId, setProjectId] = useState(editData.projectId || "");
  const [projects, setProjects] = useState([]);
  const [saving, setSaving] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  // Normaliza los puntos al cargar en modo edición
  function normalizeInspectionPoints(points) {
    return (points || []).map(pt => {
      const base = {
        ...initialInspectionPoint,
        ...pt,
        dimensionType: typeof pt.dimensionType !== 'undefined' ? pt.dimensionType : 'longitudinal',
      };
      if (pt.type === 'dimensional') {
        base.valor = typeof pt.valor !== 'undefined' ? pt.valor : '';
        base.unidad = typeof pt.unidad !== 'undefined' ? pt.unidad : 'mm';
        base.tolerancia = typeof pt.tolerancia !== 'undefined' ? pt.tolerancia : '';
        base.label = typeof pt.label !== 'undefined' ? pt.label : '';
      } else {
        base.label = typeof pt.label !== 'undefined' ? pt.label : '';
        // Elimina campos innecesarios para visual
        base.valor = undefined;
        base.unidad = undefined;
        base.tolerancia = undefined;
      }
      return base;
    });
  }
  const [inspectionPoints, setInspectionPoints] = useState([]);

  // Normaliza los puntos cada vez que editData.inspectionPoints cambie (modo edición)
  useEffect(() => {
    if (editMode && Array.isArray(editData.inspectionPoints)) {
      setInspectionPoints(normalizeInspectionPoints(editData.inspectionPoints));
    }
  }, [editMode, editData.inspectionPoints]);
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState(editData.imageUrl || "");
  const [imageSize, setImageSize] = useState({ width: 1980, height: 1080 });
  const [teams, setTeams] = useState([]); // To be fetched from API
  const [notifyTeams, setNotifyTeams] = useState([]);
  const planoContainerRef = useRef(null);
  const planoImgRef = useRef(null);
  const [selectedPointIdx, setSelectedPointIdx] = useState(null);
  const [canvasPoints, setCanvasPoints] = useState(editData.inspectionPoints || []);
  const [canvasImage, setCanvasImage] = useState(editData.imageUrl || "");
  const [selectedCanvasPoint, setSelectedCanvasPoint] = useState(null);

  // Simulate fetching teams from API
  useEffect(() => {
    // Integración real con la API de equipos
    api.getTeams()
      .then((data) => {
        if (Array.isArray(data)) {
          setTeams(data);
        }
      });
    // Obtener proyectos
    api.getProjects()
      .then((data) => {
        if (Array.isArray(data)) {
          setProjects(data);
        }
      })
      .catch(() => {
        setProjects([]);
      });
    // Si es edición y hay imagen, cargar tamaño real
    if (editMode && imageUrl) {
      const img = new window.Image();
      img.onload = () => {
        setImageSize({ width: img.width, height: img.height });
      };
      img.src = imageUrl;
    }
    // El visor solo se ajusta al hacer click en "Enfocar" de cada punto.
  }, [editMode, imageUrl, inspectionPoints]);

  useEffect(() => {
    // Si hay imagen en modo edición, asegúrate de que la URL sea absoluta
    if (editMode && editData.imageUrl) {
      let url = editData.imageUrl;
      if (url.startsWith("/uploads/")) {
        // Prepend BASE si es una ruta relativa
        url = (api.BASE || "") + url;
      }
      setCanvasImage(url);
    }
  }, [editMode, editData.imageUrl]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && ["image/png", "image/jpeg"].includes(file.type)) {
      const url = URL.createObjectURL(file);
      setImage(file);
      setImageUrl(url);
      setCanvasImage(url); // Asegura que el visor reciba la imagen cargada
      // Detectar tamaño real de la imagen
      const img = new window.Image();
      img.onload = () => {
        setImageSize({ width: img.width, height: img.height });
        if (planoContainerRef.current) {
          planoContainerRef.current.scrollLeft = 0;
          planoContainerRef.current.scrollTop = 0;
        }
      };
      img.src = url;
    }
  };

  const addInspectionPoint = () => {
    setInspectionPoints([
      ...inspectionPoints,
      {
        ...initialInspectionPoint,
        number: inspectionPoints.length + 1,
        valor: "",
        unidad: "mm",
        tolerancia: "",
        label: "",
      },
    ]);
    setSelectedPointIdx(null);
  };

  const updateInspectionPoint = (idx, field, value) => {
    setInspectionPoints((prev) =>
      prev.map((point, i) =>
        i === idx ? { ...point, [field]: value } : point
      )
    );
  };

  // Mouse drag para mover el visor
  const handleMouseDown = (e) => {
    setDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };
  const handleMouseUp = () => {
    setDragging(false);
  };
  const handleMouseMove = (e) => {
    if (!dragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    setScroll((prev) => {
      const newX = Math.max(0, Math.min(1980, prev.x - dx));
      const newY = Math.max(0, Math.min(1080, prev.y - dy));
      if (selectedPointIdx !== null) {
        updateInspectionPoint(selectedPointIdx, "x", newX);
        updateInspectionPoint(selectedPointIdx, "y", newY);
      }
      return { x: newX, y: newY };
    });
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  // Al seleccionar un punto, actualizar el zoom y scroll con los valores del punto
  const focusOnPoint = (idx) => {
    setSelectedPointIdx(idx);
  };

  // Guardar zoom y posición actual en el punto seleccionado
  const saveViewportToPoint = () => {
    if (selectedPointIdx === null) return;
    // No usar zoom ni scroll locales, solo los valores del punto
    alert("Vista guardada en el punto de inspección.");
  };

  // Guardar producto y checklist
  const handleSave = async () => {
    if (!productName || !imageUrl || inspectionPoints.length === 0) {
      alert("Completa todos los campos y sube el plano.");
      return;
    }
    setSaving(true);
    try {
      // No actualizar el punto seleccionado con zoom/scroll locales
      // Depuración avanzada en consola
      console.group('[QA] Guardando producto y checklist');
      console.log('Datos enviados al backend:', {
        productId,
        productName,
        inspectionPoints,
        imageUrl,
      });
      inspectionPoints.forEach((pt, idx) => {
        console.log(`[QA] Enviando punto #${idx + 1}: num=${pt.number}, zoom=${pt.zoom}, x=${pt.x}, y=${pt.y}`);
      });
      console.groupEnd();
      let prod = null;
      if (editMode && productId) {
        prod = { id: productId, name: productName };
      } else {
        prod = await api.createProduct(projectId || "1", productName);
      }
      // Subir imagen al backend si es nueva
      let urlPlano = imageUrl;
      if (image && image instanceof File) {
        // Leer imagen como base64
        const reader = new FileReader();
        const imageDataUrl = await new Promise((resolve) => {
          reader.onload = (e) => resolve(e.target.result);
          reader.readAsDataURL(image);
        });
        // Subir imagen al backend usando la API /uploads
        const nombrePlano = `Plano-Producto-${productName.replace(/\s+/g,'_')}`;
        const resp = await api.upload(imageDataUrl, nombrePlano);
        console.log('[QA] Respuesta de subida de imagen:', resp);
        if (resp && resp.url) {
          urlPlano = resp.url;
          console.log('[QA] urlPlano asignado tras subida:', urlPlano);
        } else {
          throw new Error('No se pudo subir el plano al servidor');
        }
      }
      // Checklist: enviar todos los campos relevantes
      const checklistItems = inspectionPoints.map(pt => {
        const base = {
          num: pt.number,
          type: pt.type,
          severity: pt.severity,
          team: pt.team,
          xPct: pt.x,
          yPct: pt.y,
          zoom: pt.zoom || 100
        };
        if (pt.type === "dimensional") {
          base.dimensionType = pt.dimensionType;
          base.valor = pt.valor;
          base.unidad = pt.unidad;
          base.tolerancia = pt.tolerancia;
          base.label = `${pt.valor} ${pt.unidad} ±${pt.tolerancia}`.trim();
        }
        if (pt.type === "visual") {
          base.label = pt.label;
        }
        return base;
      });
      // Guardar checklist en backend
      const checklistResp = await api.createChecklist(prod.id, checklistItems, null, null, urlPlano);
      console.log('[QA] Respuesta al guardar checklist:', checklistResp);
      if (checklistResp && checklistResp.imageUrl) {
        console.log('[QA] imageUrl guardado en checklist:', checklistResp.imageUrl);
      } else {
        console.warn('[QA] No se recibió imageUrl en la respuesta del checklist');
      }
      setPdfUrl(checklistResp.pdfUrl || "");
      alert("Producto y checklist guardados correctamente.");
    } catch (err) {
      alert("Error al guardar: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Sincroniza el visor con el punto seleccionado (Enfocar)
  useEffect(() => {
    if (selectedPointIdx !== null && inspectionPoints[selectedPointIdx]) {
      const punto = inspectionPoints[selectedPointIdx];
      // Si hay plano cargado, enfoca el visor
      if (canvasImage) {
        // Enviar los valores al visor usando una prop especial
        setFocusKonva({ x: punto.x, y: punto.y, zoom: punto.zoom });
      }
    }
  }, [selectedPointIdx, inspectionPoints, canvasImage]);

  // Estado para comunicar el enfoque al visor
  const [focusKonva, setFocusKonva] = useState(null);

  // Normaliza la URL del PDF para que apunte al backend
  function getPdfUrl(pdfUrl) {
    if (!pdfUrl) return "";
    if (pdfUrl.startsWith("http")) return pdfUrl;
    // Si la URL es relativa, prepende la base del backend
    return (api.BASE || "http://localhost:5000") + pdfUrl;
  }

  return (
  <div className="matrix-bg h-screen flex flex-row md:flex-col overflow-hidden text-xs">
  {/* Panel izquierdo: tabla de puntos de inspección */}
  <div className="w-1/2 md:w-full h-full md:h-1/2 flex-1 p-1 matrix-widget matrix-border product-create-panel">
    <div className="product-create-sticky">
      <h2 className="matrix-title mb-2 text-base font-bold text-matrix-green">Gestión de Producto</h2>
      <input
        type="text"
        placeholder="Nombre del producto"
        value={productName}
        onChange={(e) => setProductName(e.target.value)}
        className="matrix-input w-full mb-1 text-[11px] py-0.5 px-1"
      />
      <select
        value={projectId}
        onChange={e => setProjectId(e.target.value)}
        className="matrix-input w-full mb-1 text-[11px] py-0.5 px-1"
      >
        <option value="">Selecciona un proyecto</option>
        {projects.map(project => (
          <option key={project.id} value={project.id}>
            {project.client?.name ? `${project.client.name} - ${project.name}` : project.name}
          </option>
        ))}
      </select>
      <div className="mb-1 flex items-center">
        <label className="text-matrix-green font-semibold">Plano del producto:</label>
        <input
          type="file"
          accept="image/png, image/jpeg"
          onChange={handleImageUpload}
          className="ml-2 matrix-input text-[11px] py-0.5 px-1"
          style={{maxWidth: '120px'}}
        />
      </div>
      <div className="flex flex-wrap gap-0.5 mb-1">
        <button onClick={addInspectionPoint} className="matrix-btn text-[11px] py-0.5 px-1">Agregar punto de inspección</button>
        <button onClick={handleSave} disabled={saving} className="matrix-btn ml-1 text-[11px] py-0.5 px-1">
          {saving ? "Guardando..." : "Guardar producto y checklist"}
        </button>
      </div>
    </div>
  <table className="product-create-table mt-1">
          <thead className="bg-matrix-dark text-matrix-green text-[11px]">
            <tr>
              <th className="px-2 py-1">#</th>
              <th className="px-2 py-1">Tipo</th>
              <th className="px-2 py-1">Dimensión</th>
              <th className="px-2 py-1">Gravedad</th>
              <th className="px-2 py-1">Equipo</th>
              <th className="px-2 py-1">Zoom</th>
              <th className="px-2 py-1">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {inspectionPoints.map((point, idx) => (
              <tr
                key={idx}
                className={selectedPointIdx === idx ? "selected" : ""}
                onClick={() => setSelectedPointIdx(idx)}
              >
                <td className="px-0.5 py-0.5">{point.number}</td>
                <td className="px-0.5 py-0.5">
                  <select
                    value={point.type}
                    onChange={(e) => updateInspectionPoint(idx, "type", e.target.value)}
                    className="matrix-input text-[11px] py-0.5 px-1"
                  >
                    <option value="visual">Visual</option>
                    <option value="dimensional">Dimensional</option>
                  </select>
                </td>
                <td className="px-0.5 py-0.5">
                  {point.type === "dimensional" ? (
                    <div className="flex flex-wrap gap-0.5 items-center">
                      <select
                        value={point.dimensionType}
                        onChange={(e) => updateInspectionPoint(idx, "dimensionType", e.target.value)}
                        className="matrix-input text-[11px] py-0.5 px-1"
                      >
                        <option value="longitudinal">Longitudinal</option>
                        <option value="angular">Angular</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Valor"
                        value={point.valor}
                        onChange={(e) => updateInspectionPoint(idx, "valor", e.target.value)}
                        className="matrix-input w-12 text-[11px] py-0.5 px-1"
                      />
                      <select
                        value={point.unidad}
                        onChange={(e) => updateInspectionPoint(idx, "unidad", e.target.value)}
                        className="matrix-input w-10 text-[11px] py-0.5 px-1"
                      >
                        <option value="mm">mm</option>
                        <option value="cm">cm</option>
                        <option value="m">m</option>
                        <option value="in">pulgadas</option>
                        <option value="ft">pies</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Tolerancia"
                        value={point.tolerancia}
                        onChange={(e) => updateInspectionPoint(idx, "tolerancia", e.target.value)}
                        className="matrix-input w-10 text-[11px] py-0.5 px-1"
                      />
                    </div>
                  ) : (
                    <input
                      type="text"
                      placeholder="Descripción visual"
                      value={point.label || ""}
                      onChange={(e) => updateInspectionPoint(idx, "label", e.target.value)}
                      className="matrix-input w-24 text-[11px] py-0.5 px-1"
                    />
                  )}
                </td>
                <td className="px-0.5 py-0.5">
                  <select
                    value={point.severity}
                    onChange={(e) => updateInspectionPoint(idx, "severity", e.target.value)}
                    className="matrix-input text-[11px] py-0.5 px-1"
                  >
                    <option value="">Seleccionar</option>
                    <option value="baja">Baja</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                  </select>
                </td>
                <td className="px-0.5 py-0.5">
                  <select
                    value={point.team}
                    onChange={(e) => updateInspectionPoint(idx, "team", e.target.value)}
                    className="matrix-input text-[11px] py-0.5 px-1"
                  >
                    <option value="">Seleccionar</option>
                    {teams.map((team) => (
                      <option key={String(team.id)} value={String(team.id)}>
                        {String(team.name)}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-0.5 py-0.5">
                  <div className="flex flex-wrap gap-0.5 items-center">
                    <input
                      type="number"
                      min={100}
                      max={800}
                      value={point.zoom}
                      onChange={(e) => updateInspectionPoint(idx, "zoom", Number(e.target.value))}
                      className="matrix-input w-10 text-[11px] py-0.5 px-1"
                    />
                    <input
                      type="number"
                      min={0}
                      max={1980}
                      value={point.x}
                      onChange={(e) => updateInspectionPoint(idx, "x", Number(e.target.value))}
                      className="matrix-input w-10 text-[11px] py-0.5 px-1"
                      placeholder="X"
                    />
                    <input
                      type="number"
                      min={0}
                      max={1080}
                      value={point.y}
                      onChange={(e) => updateInspectionPoint(idx, "y", Number(e.target.value))}
                      className="matrix-input w-10 text-[11px] py-0.5 px-1"
                      placeholder="Y"
                    />
                    <button onClick={() => focusOnPoint(idx)} className="matrix-btn ml-1 text-[11px] py-0.5 px-1">Enfocar</button>
                  </div>
                </td>
                <td className="px-0.5 py-0.5">
                  <button
                    onClick={() =>
                      setInspectionPoints((prev) => prev.filter((_, i) => i !== idx))
                    }
                    className="matrix-btn bg-red-600 hover:bg-red-800 text-white text-[11px] py-0.5 px-1"
                  >Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
  {/* Panel derecho: CanvasEditor reemplaza visor plano y controles manuales */}
  <div className="w-1/2 md:w-full h-full md:h-1/2 flex-1 flex flex-col items-center justify-center matrix-widget matrix-border" style={{borderLeft: '2px solid #0f0', padding: '4px'}}>
        <PlanoKonva
          src={canvasImage}
          focus={focusKonva}
          onSaveView={({ x, y, zoom }) => {
            if (selectedPointIdx !== null) {
              updateInspectionPoint(selectedPointIdx, "x", x);
              updateInspectionPoint(selectedPointIdx, "y", y);
              updateInspectionPoint(selectedPointIdx, "zoom", zoom);
              alert("Vista guardada en el punto de inspección.");
            }
          }}
        />
      </div>
    {/* PDF y correo */}
    {pdfUrl && (
      <div className="matrix-widget matrix-border p-4 my-4">
        <div className="flex flex-wrap gap-2 mb-2">
          <button
            onClick={() => {
              const url = getPdfUrl(pdfUrl);
              const link = document.createElement('a');
              link.href = url;
              link.download = url.split('/').pop();
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="matrix-btn"
          >Descargar reporte PDF</button>
          <button
            onClick={() => window.open(getPdfUrl(pdfUrl), '_blank')}
            className="matrix-btn"
          >Ver reporte PDF</button>
        </div>
        <div className="mt-2 flex items-center">
          <label className="text-matrix-green font-semibold">Equipos a notificar:</label>
          <select
            multiple
            value={notifyTeams}
            onChange={e => {
              const options = Array.from(e.target.selectedOptions).map(opt => opt.value);
              setNotifyTeams(options);
            }}
            className="matrix-input ml-2 min-w-[200px]"
          >
            {teams.map(team => (
              <option key={String(team.id)} value={String(team.id)}>
                {String(team.name)}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          <button
            className="matrix-btn"
            onClick={() => {
              // Buscar contexto
              const currentProject = projects.find(p => p.id === projectId);
              const cliente = currentProject?.client?.name || "";
              const proyecto = currentProject?.name || "";
              const producto = productName;
              const tipo = "Alta"; // O "Modificación" si se implementa edición
              // Obtener correos de los equipos seleccionados
              const selectedTeams = teams.filter(t => notifyTeams.includes(String(t.id)));
              const emails = selectedTeams.flatMap(t => Array.isArray(t.emails) ? t.emails : []).join(",");
              const subject = encodeURIComponent(`Notificación: ${tipo} de producto ${producto} | Cliente: ${cliente} | Proyecto: ${proyecto}`);
              const body = encodeURIComponent(`Se notifica a los equipos seleccionados sobre el alta/modificación del producto.\n\nCliente: ${cliente}\nProyecto: ${proyecto}\nProducto: ${producto}\n\nDescargar PDF: ${pdfUrl}`);
              window.location.href = `mailto:${emails}?subject=${subject}&body=${body}`;
            }}
          >Enviar por correo</button>
          <button
            className="matrix-btn bg-red-600 hover:bg-red-800 text-white"
            onClick={() => setPdfUrl("")}
          >Cerrar sección PDF</button>
        </div>
      </div>
    )}
    </div>
  );
}
