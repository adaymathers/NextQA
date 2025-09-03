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
		<div className="inspector-panel-root matrix-bg min-h-screen flex flex-col text-xs">
			{pdfUrl && (
				<div className="bg-matrix-yellow p-4 mb-4 text-center rounded-lg">
					<b>Reporte PDF generado:</b> <a href={pdfUrl} target="_blank" rel="noopener noreferrer">Descargar/Ver PDF</a>
				</div>
			)}
			{/* Encabezado sticky arriba */}
			<div className="inspector-header product-create-sticky">
				<div className="flex flex-wrap gap-4 items-center">
					<div className="flex flex-col">
						<label className="font-bold text-matrix-green">Inspector:</label>
						<span className="text-matrix-green">{userEmail || '...'}</span>
					</div>
					<div className="flex flex-col">
						<label className="font-bold text-matrix-green">Línea:</label>
						<select value={selectedLine} onChange={e => setSelectedLine(e.target.value)} className="matrix-input text-[11px] py-0.5 px-1">
							<option value="">Seleccionar</option>
							{lines.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
						</select>
					</div>
					<div className="flex flex-col">
						<label className="font-bold text-matrix-green">Proyecto:</label>
						<select value={selectedProject} onChange={e => setSelectedProject(e.target.value)} className="matrix-input text-[11px] py-0.5 px-1">
							<option value="">Seleccionar</option>
							{projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
						</select>
					</div>
					<div className="flex flex-col">
						<label className="font-bold text-matrix-green">Producto:</label>
						<select value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)} disabled={!selectedProject} className="matrix-input text-[11px] py-0.5 px-1">
							<option value="">Seleccionar</option>
							{products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
						</select>
					</div>
				</div>
				<div className="flex flex-wrap gap-2 items-center">
					<span className="text-matrix-green font-bold text-xs">{currentTime.toLocaleString()}</span>
					<button className="matrix-btn text-[11px] py-0.5 px-1" onClick={handleLoadChecklist} disabled={!selectedProduct || loadingChecklist}>
						{loadingChecklist ? 'Cargando...' : 'Cargar Checklist'}
					</button>
					<button className="matrix-btn text-[11px] py-0.5 px-1" onClick={handleSaveInspection} disabled={saving || !checklist || inspectionResults.length === 0}>
						{saving ? 'Guardando...' : 'Registrar Inspección'}
					</button>
				</div>
			</div>
				{/* Layout principal: panel izquierdo (puntos) y derecho (visor) en desktop, vertical en mobile */}
				<div className="flex flex-row md:flex-col flex-1 overflow-hidden">
					{/* Panel izquierdo: puntos de inspección */}
					<div className="product-create-panel matrix-widget matrix-border w-1/2 md:w-full h-full md:h-1/2 overflow-y-auto">
						<h2 className="matrix-title mb-2 text-base font-bold text-matrix-green">Puntos de Inspección</h2>
						{inspectionPoints.length === 0 ? (
							<div className="text-matrix-green text-center mt-8">Seleccione producto y cargue checklist.</div>
						) : (
							<>
								<table className="points-table product-create-table mt-1">
									<thead className="bg-matrix-dark text-matrix-green text-[11px]">
										<tr>
											<th className="px-2 py-1">#</th>
											<th className="px-2 py-1">Tipo</th>
											<th className="px-2 py-1">Etiqueta</th>
											<th className="px-2 py-1">Gravedad</th>
											<th className="px-2 py-1">Resultado</th>
											<th className="px-2 py-1">Comentarios</th>
											<th className="px-2 py-1">Acciones</th>
										</tr>
									</thead>
									<tbody>
										{inspectionPoints.map((pt, idx) => (
											<tr key={pt.id || idx} className={selectedPointIdx === idx ? 'selected-row selected' : ''} onClick={() => setSelectedPointIdx(idx)}>
												<td className="px-0.5 py-0.5">{pt.num}</td>
												<td className="px-0.5 py-0.5">{pt.type === 'dimensional' ? 'Dimensional' : 'Visual'}</td>
												<td className="px-0.5 py-0.5">{pt.label}</td>
												<td className="px-0.5 py-0.5">{pt.severity || '-'}</td>
																	<td className="px-0.5 py-0.5">
																		<div className="result-radio-group">
																			<label><input type="radio" name={`result-${idx}`} value="OK" checked={inspectionResults[idx]?.status === 'OK'} onChange={e => handleResultChange(idx, 'status', e.target.value)} /> OK</label>
																			<label><input type="radio" name={`result-${idx}`} value="NO-OK" checked={inspectionResults[idx]?.status === 'NO-OK'} onChange={e => handleResultChange(idx, 'status', e.target.value)} /> NO-OK</label>
																			<label><input type="radio" name={`result-${idx}`} value="N/A" checked={inspectionResults[idx]?.status === 'N/A'} onChange={e => handleResultChange(idx, 'status', e.target.value)} /> N/A</label>
																		</div>
																		{/* Campos extra para dimensional */}
																								{inspectionPoints[idx]?.type === 'dimensional' && (
																									<>
																										<div className="dim-fields">
																											<label>Valor Real:</label>
																											<input type="text" className="matrix-input w-12 text-[11px] py-0.5 px-1" value={inspectionResults[idx]?.valorReal || ''} onChange={e => handleResultChange(idx, 'valorReal', e.target.value)} />
																										</div>
																										<div className="dim-fields mt-1">
																											<label>Diferencia:</label>
																											<input type="text" className="matrix-input w-8 text-[11px] py-0.5 px-1 text-center" value={inspectionResults[idx]?.diferencia || ''} onChange={e => handleResultChange(idx, 'diferencia', e.target.value)} />
																										</div>
																									</>
																								)}
																	</td>
																	<td className="px-0.5 py-0.5">
																		<input type="text" className="comment-input" placeholder="Comentarios..." value={inspectionResults[idx]?.comment || ''} onChange={e => handleResultChange(idx, 'comment', e.target.value)} />
																	</td>
												<td className="px-0.5 py-0.5">
													<button className="matrix-btn text-[11px] py-0.5 px-1" onClick={() => handleFocusPoint(idx)}>Enfocar</button>
												</td>
											</tr>
										))}
									</tbody>
								</table>
								<div className="mt-4 text-right">
									<button className="matrix-btn text-[11px] py-0.5 px-1" onClick={handleSaveInspection} disabled={saving}>
										{saving ? 'Guardando...' : 'Registrar Inspección'}
									</button>
								</div>
							</>
						)}
					</div>
					{/* Panel derecho: visor de plano */}
					<div className="matrix-widget matrix-border w-1/2 md:w-full h-full md:h-1/2 flex flex-col items-center justify-center" ref={visorRef}>
						<h2 className="matrix-title mb-2 text-base font-bold text-matrix-green">Visor</h2>
								{planoUrl ? (
									<>
										<PlanoKonva src={planoUrl.startsWith('/') ? `${api.BASE}${planoUrl}` : planoUrl}
											focus={selectedPointIdx !== null && inspectionPoints[selectedPointIdx] ? {
												x: inspectionPoints[selectedPointIdx].x,
												y: inspectionPoints[selectedPointIdx].y,
												zoom: inspectionPoints[selectedPointIdx].zoom || 100
											} : undefined}
										/>
													<div style={{marginTop: '8px', fontSize: '11px', color: '#0f0', wordBreak: 'break-all'}}>
														<b>URL plano:</b> {planoUrl.startsWith('/') ? `${api.BASE}${planoUrl}` : planoUrl}<br/>
														<b>api.BASE:</b> {String(api.BASE)}
													</div>
									</>
								) : (
									<div className="visor-placeholder text-matrix-green">Plano del producto aquí</div>
								)}
					</div>
				</div>
		</div>
	);
};

export default InspectorPanel;
