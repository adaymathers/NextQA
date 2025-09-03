import React, { useEffect, useState, useRef } from 'react';
import './InspectorPanel.css';
import api from '../api';
import PlanoKonva from '../components/PlanoKonva';

const InspectorPanel = ({ userEmail }) => {
	// Estado de sesión y datos
	const [token, setToken] = useState('');
		// El inspector se obtiene directamente del prop userEmail
	const [lines, setLines] = useState([]);
	const [projects, setProjects] = useState([]);
	const [products, setProducts] = useState([]);
	const [selectedLine, setSelectedLine] = useState('');
	const [selectedProject, setSelectedProject] = useState('');
	const [selectedProduct, setSelectedProduct] = useState('');
	const [checklist, setChecklist] = useState(null);
	const [inspectionPoints, setInspectionPoints] = useState([]);
	const [inspectionResults, setInspectionResults] = useState([]); // Estado para los resultados
	const [selectedPointIdx, setSelectedPointIdx] = useState(null); // Para enfocar plano
	const [planoUrl, setPlanoUrl] = useState('');
	const visorRef = useRef(); // Referencia para el visor
	const [currentTime, setCurrentTime] = useState(new Date());
	const [loadingChecklist, setLoadingChecklist] = useState(false);

	// Obtener token y usuario actual (asume que el token está en localStorage)
			useEffect(() => {
				const t = localStorage.getItem('qa_token');
        setToken(t || '');
			}, []);

	// Cargar líneas
		useEffect(() => {
			api.getLines().then(setLines).catch(() => setLines([]));
		}, []);

	// Cargar proyectos
		useEffect(() => {
			api.getProjects().then(setProjects).catch(() => setProjects([]));
		}, []);

	// Cargar productos al seleccionar proyecto
		useEffect(() => {
			if (selectedProject) {
				api.getProducts().then(ps => {
					setProducts(ps.filter(p => p.projectId === selectedProject));
				}).catch(() => setProducts([]));
			} else {
				setProducts([]);
			}
		}, [selectedProject]);

	// Actualizar hora actual cada segundo
	useEffect(() => {
		const timer = setInterval(() => setCurrentTime(new Date()), 1000);
		return () => clearInterval(timer);
	}, []);

		// Cargar checklist al seleccionar producto y presionar botón
					const handleLoadChecklist = async () => {
							if (!selectedProduct) return;
							setLoadingChecklist(true);
							try {
								const chs = await api.getChecklistsByProduct(selectedProduct);
								console.log('[InspectorPanel] Resultado de getChecklistsByProduct:', chs);
								if (chs && chs.length > 0) {
									const checklist = chs[0];
									const inspectionPoints = Array.isArray(checklist.items)
										? checklist.items.map(item => ({
												...item,
												number: item.num,
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
											}) )
										: [];
									console.log('[InspectorPanel] Puntos de inspección mapeados:', inspectionPoints);
											setChecklist(checklist);
											setInspectionPoints(inspectionPoints);
													setInspectionResults(inspectionPoints.map(pt => ({
														checklistItemId: pt.id,
														status: '',
														comment: '',
														photoUrl: '',
														severityObserved: pt.severity || '',
														valorReal: pt.type === 'dimensional' ? '' : undefined,
														diferencia: pt.type === 'dimensional' ? '' : undefined
													})));
											setPlanoUrl(checklist.imageUrl || '');
								} else {
									console.log('[InspectorPanel] No se encontró checklist para el producto seleccionado.');
								setChecklist(null);
								setInspectionPoints([]);
								setInspectionResults([]);
								setPlanoUrl('');
								}
							} catch (e) {
								console.error('[InspectorPanel] Error al cargar checklist:', e);
							setChecklist(null);
							setInspectionPoints([]);
							setInspectionResults([]);
							setPlanoUrl('');
							}
							setLoadingChecklist(false);
						};
	// Manejar cambios en resultados
	const handleResultChange = (idx, field, value) => {
		setInspectionResults(results => results.map((r, i) => {
			if (i !== idx) return r;
			let updated = { ...r, [field]: value };
			const pt = inspectionPoints[idx];
			// Solo para puntos dimensionales
			if (pt.type === 'dimensional') {
				// Si cambia valorReal, recalcula diferencia y resultado
				if (field === 'valorReal') {
					const requerido = parseFloat(pt.valor);
					const real = parseFloat(value);
					if (!isNaN(requerido) && !isNaN(real)) {
						const diferencia = real - requerido;
						updated.diferencia = diferencia.toFixed(2);
						// Calcular resultado según tolerancia
						const tolerancia = parseFloat(pt.tolerancia);
						if (!isNaN(tolerancia)) {
							if (Math.abs(diferencia) <= tolerancia) {
								updated.status = 'OK';
							} else {
								updated.status = 'NO-OK';
							}
						} else {
							updated.status = 'N/A';
						}
					} else {
						updated.diferencia = '';
						updated.status = 'N/A';
					}
				}
				// Si cambia diferencia manualmente, recalcula resultado
				if (field === 'diferencia') {
					const tolerancia = parseFloat(pt.tolerancia);
					const diferencia = parseFloat(value);
					if (!isNaN(tolerancia) && !isNaN(diferencia)) {
						if (Math.abs(diferencia) <= tolerancia) {
							updated.status = 'OK';
						} else {
							updated.status = 'NO-OK';
						}
					} else {
						updated.status = 'N/A';
					}
				}
			}
			return updated;
		}));
	};

	// Enfocar plano al seleccionar punto
	const handleFocusPoint = idx => {
		setSelectedPointIdx(idx);
		// Aquí se puede llamar a visorRef.current.focusPoint si PlanoKonva.jsx lo expone
	};

	// Guardar inspección
	const [saving, setSaving] = useState(false);
	const [pdfUrl, setPdfUrl] = useState('');
	const handleSaveInspection = async () => {
		if (!checklist || inspectionResults.length === 0) return;
		setSaving(true);
		try {
			// Usar helper API para registrar inspección
			const resp = await api.createInspection(checklist.id, userEmail, inspectionResults, selectedLine, selectedProject, selectedProduct);
			if (resp && resp.pdfUrl) {
				setPdfUrl(resp.pdfUrl.startsWith('/') ? `http://localhost:5000${resp.pdfUrl}` : resp.pdfUrl);
			} else {
				setPdfUrl('');
			}
			alert('Inspección registrada correctamente');
			setChecklist(null);
			setInspectionPoints([]);
			setInspectionResults([]);
		} catch (e) {
			alert('Error al guardar inspección: ' + e.message);
			setPdfUrl('');
		}
		setSaving(false);
	};

	// Render principal
	return (
		<div className="inspector-panel-root">
			{pdfUrl && (
				<div style={{ background: '#EAB308', padding: '1rem', marginBottom: '1rem', textAlign: 'center', borderRadius: 8 }}>
					<b>Reporte PDF generado:</b> <a href={pdfUrl} target="_blank" rel="noopener noreferrer">Descargar/Ver PDF</a>
				</div>
			)}
			{/* Encabezado superior */}
			<div className="inspector-header">
						<div className="header-left">
										<div className="header-field">
											<label>Inspector:</label>
											<span>{userEmail || '...'}</span>
										</div>
							<div className="header-field">
								<label>Línea:</label>
								<select value={selectedLine} onChange={e => setSelectedLine(e.target.value)}>
									<option value="">Seleccionar</option>
									{lines.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
								</select>
							</div>
							<div className="header-field">
								<label>Proyecto:</label>
								<select value={selectedProject} onChange={e => setSelectedProject(e.target.value)}>
									<option value="">Seleccionar</option>
									{projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
								</select>
							</div>
							<div className="header-field">
								<label>Producto:</label>
								<select value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)} disabled={!selectedProject}>
									<option value="">Seleccionar</option>
									{products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
								</select>
							</div>
						</div>
						<div className="header-right">
							<span className="header-time">{currentTime.toLocaleString()}</span>
							<button className="btn-yellow" onClick={handleLoadChecklist} disabled={!selectedProduct || loadingChecklist}>
								{loadingChecklist ? 'Cargando...' : 'Cargar Checklist'}
							</button>
							<button className="btn-yellow" onClick={handleSaveInspection} disabled={saving || !checklist || inspectionResults.length === 0} style={{ marginLeft: '1rem' }}>
								{saving ? 'Guardando...' : 'Registrar Inspección'}
							</button>
						</div>
			</div>

			{/* Layout principal: puntos de inspección y visor */}
					<div className="inspector-main">
						{/* Sección izquierda: puntos de inspección */}
						<div className="inspection-points">
							<h2>Puntos de Inspección</h2>
							{inspectionPoints.length === 0 ? (
								<div className="no-checklist">Seleccione producto y cargue checklist.</div>
							) : (
								<>
									<table className="points-table">
										<thead>
											<tr>
												<th>#</th>
												<th>Tipo</th>
												<th>Etiqueta</th>
												<th>Gravedad</th>
												<th>Resultado</th>
												<th>Comentarios</th>
												<th>Acciones</th>
											</tr>
										</thead>
										<tbody>
											{inspectionPoints.map((pt, idx) => (
												<tr key={pt.id || idx} className={selectedPointIdx === idx ? 'selected-row' : ''}>
													<td>{pt.num}</td>
													<td>{pt.type === 'dimensional' ? 'Dimensional' : 'Visual'}</td>
													<td>{pt.label}</td>
													<td>{pt.severity || '-'}</td>
																			<td>
																				<div className="result-radio-group">
																					<label><input type="radio" name={`result-${idx}`} value="OK" checked={inspectionResults[idx]?.status === 'OK'} onChange={e => handleResultChange(idx, 'status', e.target.value)} /> OK</label>
																					<label><input type="radio" name={`result-${idx}`} value="NO-OK" checked={inspectionResults[idx]?.status === 'NO-OK'} onChange={e => handleResultChange(idx, 'status', e.target.value)} /> NO-OK</label>
																					<label><input type="radio" name={`result-${idx}`} value="N/A" checked={inspectionResults[idx]?.status === 'N/A'} onChange={e => handleResultChange(idx, 'status', e.target.value)} /> N/A</label>
																				</div>
																				{/* Campos extra para dimensional */}
																				{inspectionPoints[idx]?.type === 'dimensional' && (
																					<div style={{ marginTop: 6 }}>
																						<label style={{ marginRight: 8 }}>Valor Real:</label>
																						<input type="text" style={{ width: 60, marginRight: 8 }} value={inspectionResults[idx]?.valorReal || ''} onChange={e => handleResultChange(idx, 'valorReal', e.target.value)} />
																						<label style={{ marginRight: 8 }}>Diferencia:</label>
																						<input type="text" style={{ width: 60 }} value={inspectionResults[idx]?.diferencia || ''} onChange={e => handleResultChange(idx, 'diferencia', e.target.value)} />
																					</div>
																				)}
																			</td>
																			<td>
																				<input type="text" className="comment-input" placeholder="Comentarios..." value={inspectionResults[idx]?.comment || ''} onChange={e => handleResultChange(idx, 'comment', e.target.value)} />
																			</td>
													<td>
														<button className="btn-focus" onClick={() => handleFocusPoint(idx)}>Enfocar</button>
													</td>
												</tr>
											))}
										</tbody>
									</table>
									<div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
										<button className="btn-yellow" onClick={handleSaveInspection} disabled={saving}>
											{saving ? 'Guardando...' : 'Registrar Inspección'}
										</button>
									</div>
								</>
							)}
						</div>

						{/* Sección derecha: visor de plano */}
								<div className="inspection-visor" ref={visorRef}>
									<h2>Visor</h2>
									{planoUrl ? (
										<PlanoKonva src={planoUrl.startsWith('/') ? `http://localhost:5000${planoUrl}` : planoUrl}
											focus={selectedPointIdx !== null && inspectionPoints[selectedPointIdx] ? {
												x: inspectionPoints[selectedPointIdx].x,
												y: inspectionPoints[selectedPointIdx].y,
												zoom: inspectionPoints[selectedPointIdx].zoom || 100
											} : undefined}
										/>
									) : (
										<div className="visor-placeholder">Plano del producto aquí</div>
									)}
								</div>
					</div>
		</div>
	);
};

export default InspectorPanel;
