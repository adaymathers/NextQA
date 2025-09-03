import React, { useEffect, useState } from "react";
import { getProducts, BASE } from "../api";
import { useNavigate } from "react-router-dom";

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editProjectId, setEditProjectId] = useState("");
  const [editLineId, setEditLineId] = useState("");
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  // Opcional: cargar proyectos y líneas si se requiere edición avanzada
  // const [projects, setProjects] = useState([]);
  // const [lines, setLines] = useState([]);

  useEffect(() => {
    getProducts()
      .then((data) => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        setError("Error al cargar productos: " + err.message);
        setLoading(false);
      });
  }, []);

  // Eliminar producto
  // Eliminar producto, checklist y PDF
  async function handleDelete(id) {
    if (!window.confirm("¿Seguro que deseas eliminar este producto y su checklist?")) return;
    setSaving(true);
    try {
      const api = await import("../api");
      // Buscar checklist asociado
      const checklists = await api.getChecklistsByProduct(id);
      if (checklists && checklists.length > 0) {
        // Eliminar checklist
        await Promise.all(checklists.map(async (ch) => {
          // Eliminar PDF físico si existe (solo backend, aquí solo informativo)
          // Eliminar checklist en backend
          await fetch(`${BASE}/api/checklists/${ch.id}`, { method: "DELETE" });
        }));
      }
      // Eliminar producto
      await api.deleteProduct(id);
      setProducts(products => products.filter(p => p.id !== id));
      alert("Producto y checklist eliminados correctamente.");
    } catch (err) {
      alert("Error al eliminar: " + err.message);
    }
    setSaving(false);
  }

  // Regenerar PDF del checklist asociado al producto
  async function handleRegenerarPDF(productId) {
    setSaving(true);
    try {
      const api = await import("../api");
      const checklists = await api.getChecklistsByProduct(productId);
      if (!checklists || checklists.length === 0) {
        alert("No hay checklist asociado a este producto.");
        setSaving(false);
        return;
      }
      const checklist = checklists[0];
      // Regenerar PDF y obtener ruta
      const res = await api.regenerarChecklistPDF(checklist.id);
      let pdfUrl = res.pdfPath;
      const fileName = pdfUrl.split('ChecklistPDF').pop().replace(/\\/g, '/').replace(/\//g, '/');
      // Usar la URL base del backend
      const publicUrl = `${BASE}/ChecklistPDF${fileName}`;
      window.open(publicUrl, '_blank');
    } catch (err) {
      alert("Error al regenerar PDF: " + err.message);
    }
    setSaving(false);
  }

  // Iniciar edición
  // Editar producto: obtener datos y navegar a ProductCreate.jsx con estado de edición
  async function startEdit(product) {
    setSaving(true);
    try {
      const api = await import("../api");
      // Obtener checklist y puntos de inspección
      const checklists = await api.getChecklistsByProduct(product.id);
      let checklist = checklists && checklists.length > 0 ? checklists[0] : null;
      // Obtener imagen/plano
      let planoUrl = checklist && checklist.imageUrl ? checklist.imageUrl : "";
      // Mapear todos los campos relevantes de los puntos de inspección
      const inspectionPoints = checklist ? checklist.items.map(item => ({
        number: item.num,
        type: item.type,
        dimensionType: item.dimensionType || item.subtype || "longitudinal",
        valor: item.valor || "",
        unidad: item.unidad || "mm",
        tolerancia: item.tolerancia || "",
        severity: item.severity || "",
        team: item.team || "",
        zoom: item.zoom || 100,
        x: item.xPct || 0,
        y: item.yPct || 0,
        label: item.label || ""
      })) : [];
      const editData = {
        id: product.id,
        name: product.name,
        projectId: product.project?.id || "",
        lineId: product.line?.id || "",
        inspectionPoints,
        imageUrl: planoUrl,
        editMode: true
      };
      // Navegar a ProductCreate.jsx con datos
      navigate("/product-create", { state: editData });
    } catch (err) {
      alert("Error al cargar datos para edición: " + err.message);
    }
    setSaving(false);
  }

  // Guardar edición
  async function saveEdit() {
    setSaving(true);
    try {
      await import("../api").then(api => api.updateProduct(editId, { name: editName, projectId: editProjectId, lineId: editLineId }));
      setProducts(products => products.map(p => p.id === editId ? { ...p, name: editName, project: { ...p.project, id: editProjectId }, line: { ...p.line, id: editLineId } } : p));
      setEditId(null);
      setEditName("");
      setEditProjectId("");
      setEditLineId("");
    } catch (err) {
      alert("Error al editar: " + err.message);
    }
    setSaving(false);
  }

  function cancelEdit() {
    setEditId(null);
    setEditName("");
    setEditProjectId("");
    setEditLineId("");
  }

  if (loading) return <div>Cargando productos...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div style={{ padding: 24 }}>
      <h2>Productos guardados</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Proyecto</th>
            <th>Línea</th>
            <th>Fecha de creación</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>
                {editId === p.id ? (
                  <input value={editName} onChange={e => setEditName(e.target.value)} style={{ width: 120 }} />
                ) : p.name}
              </td>
              <td>{p.project?.name || "-"}</td>
              <td>{p.line?.name || "-"}</td>
              <td>{p.createdAt ? new Date(p.createdAt).toLocaleString() : "-"}</td>
              <td>
                {editId === p.id ? (
                  <>
                    <button onClick={saveEdit} disabled={saving}>Guardar</button>
                    <button onClick={cancelEdit} style={{ marginLeft: 4 }}>Cancelar</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => startEdit(p)} disabled={saving}>Editar</button>
                    <button onClick={() => handleDelete(p.id)} style={{ marginLeft: 4 }} disabled={saving}>Eliminar</button>
                    <button onClick={() => handleRegenerarPDF(p.id)} style={{ marginLeft: 4 }} disabled={saving}>Re-generar PDF</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Documentación: Los botones permiten editar el nombre del producto, eliminarlo y regenerar el PDF del checklist asociado. */}
    </div>
  );
}
