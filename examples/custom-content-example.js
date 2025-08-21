// ========================================
// EJEMPLO DE CÓMO PERSONALIZAR CONTENIDO
// ========================================
// 
// Para personalizar el contenido del template:
// 1. Copia esta función en tu script.js
// 2. Modifica el HTML según tus necesidades
// 3. Retorna el HTML personalizado

function getCustomContent(section) {
    // PERSONALIZACIÓN PARA APRENDIZAJE
    if (section === 'aprendizaje') {
        return `
            <div class="custom-dashboard">
                <h2>🎓 Mi Dashboard de Aprendizaje</h2>
                
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-number">85%</div>
                        <div class="stat-label">Progreso General</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">12</div>
                        <div class="stat-label">Cursos Completados</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">3</div>
                        <div class="stat-label">En Progreso</div>
                    </div>
                </div>
                
                <div class="courses-section">
                    <h3>Cursos Recientes</h3>
                    <div class="course-cards">
                        <div class="course-card">
                            <h4>React Avanzado</h4>
                            <p>Progreso: 75%</p>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 75%"></div>
                            </div>
                        </div>
                        <div class="course-card">
                            <h4>TypeScript Master</h4>
                            <p>Progreso: 45%</p>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 45%"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // PERSONALIZACIÓN PARA DIAGNÓSTICO
    if (section === 'diagnóstico') {
        return `
            <div class="diagnostic-dashboard">
                <h2>📊 Dashboard de Diagnóstico</h2>
                
                <div class="metrics-container">
                    <div class="metric-card">
                        <h3>KPIs Principales</h3>
                        <ul>
                            <li>Eficiencia: 92%</li>
                            <li>Productividad: 87%</li>
                            <li>Calidad: 94%</li>
                        </ul>
                    </div>
                    
                    <div class="metric-card">
                        <h3>Alertas</h3>
                        <div class="alert alert-warning">⚠️ Revisar métricas de rendimiento</div>
                        <div class="alert alert-success">✅ Todas las métricas en rango</div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // PERSONALIZACIÓN PARA DESEMPEÑO
    if (section === 'desempeño') {
        return `
            <div class="performance-dashboard">
                <h2>📈 Dashboard de Desempeño</h2>
                
                <div class="performance-grid">
                    <div class="chart-container">
                        <h3>Rendimiento Mensual</h3>
                        <div class="chart-placeholder">
                            📊 Gráfico de rendimiento aquí
                        </div>
                    </div>
                    
                    <div class="kpi-summary">
                        <h3>Resumen de KPIs</h3>
                        <div class="kpi-item">
                            <span class="kpi-label">Objetivos Cumplidos:</span>
                            <span class="kpi-value">18/20</span>
                        </div>
                        <div class="kpi-item">
                            <span class="kpi-label">Eficiencia:</span>
                            <span class="kpi-value">89%</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // PERSONALIZACIÓN PARA ENCUESTAS
    if (section === 'encuestas') {
        return `
            <div class="surveys-dashboard">
                <h2>📋 Dashboard de Encuestas</h2>
                
                <div class="surveys-overview">
                    <div class="survey-stats">
                        <div class="stat-item">
                            <div class="stat-value">24</div>
                            <div class="stat-label">Encuestas Activas</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">1,247</div>
                            <div class="stat-label">Respuestas Totales</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">4.8/5</div>
                            <div class="stat-label">Satisfacción Promedio</div>
                        </div>
                    </div>
                    
                    <div class="recent-surveys">
                        <h3>Encuestas Recientes</h3>
                        <div class="survey-list">
                            <div class="survey-item">Satisfacción del Cliente - 89% completada</div>
                            <div class="survey-item">Evaluación de Producto - 67% completada</div>
                            <div class="survey-item">Feedback del Equipo - 92% completada</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // PERSONALIZACIÓN PARA RECLUTAMIENTO
    if (section === 'reclutamiento') {
        return `
            <div class="recruitment-dashboard">
                <h2>👥 Dashboard de Reclutamiento</h2>
                
                <div class="recruitment-metrics">
                    <div class="metric-row">
                        <div class="metric-box">
                            <h3>Posiciones Abiertas</h3>
                            <div class="metric-number">8</div>
                        </div>
                        <div class="metric-box">
                            <h3>Candidatos Activos</h3>
                            <div class="metric-number">156</div>
                        </div>
                        <div class="metric-box">
                            <h3>Entrevistas Programadas</h3>
                            <div class="metric-number">23</div>
                        </div>
                    </div>
                    
                    <div class="candidates-pipeline">
                        <h3>Pipeline de Candidatos</h3>
                        <div class="pipeline-stages">
                            <div class="stage">
                                <h4>Reclutados</h4>
                                <div class="candidate-count">45</div>
                            </div>
                            <div class="stage">
                                <h4>En Revisión</h4>
                                <div class="candidate-count">32</div>
                            </div>
                            <div class="stage">
                                <h4>Entrevistados</h4>
                                <div class="candidate-count">18</div>
                            </div>
                            <div class="stage">
                                <h4>Contratados</h4>
                                <div class="candidate-count">5</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // PERSONALIZACIÓN PARA TAREAS
    if (section === 'tareas') {
        return `
            <div class="tasks-dashboard">
                <h2>📋 Dashboard de Tareas</h2>
                
                <div class="tasks-overview">
                    <div class="task-summary">
                        <div class="summary-card">
                            <h3>Total de Tareas</h3>
                            <div class="summary-number">47</div>
                        </div>
                        <div class="summary-card">
                            <h3>Completadas</h3>
                            <div class="summary-number">23</div>
                        </div>
                        <div class="summary-card">
                            <h3>En Progreso</h3>
                            <div class="summary-number">18</div>
                        </div>
                        <div class="summary-card">
                            <h3>Pendientes</h3>
                            <div class="summary-number">6</div>
                        </div>
                    </div>
                    
                    <div class="priority-tasks">
                        <h3>Tareas de Alta Prioridad</h3>
                        <div class="task-list">
                            <div class="task-item priority-high">
                                <span class="task-title">Revisar propuesta de cliente</span>
                                <span class="task-deadline">Hoy</span>
                            </div>
                            <div class="task-item priority-high">
                                <span class="task-title">Actualizar documentación</span>
                                <span class="task-deadline">Mañana</span>
                            </div>
                            <div class="task-item priority-medium">
                                <span class="task-title">Preparar presentación</span>
                                <span class="task-deadline">Esta semana</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Si no hay personalización para esta sección, retorna null
    // para usar el contenido por defecto del template
    return null;
}

// ========================================
// ESTILOS CSS RECOMENDADOS PARA EL EJEMPLO
// ========================================
/*
.custom-dashboard, .diagnostic-dashboard, .performance-dashboard,
.surveys-dashboard, .recruitment-dashboard, .tasks-dashboard {
    padding: 20px;
}

.stats-grid, .metric-row, .summary-card {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin: 20px 0;
}

.stat-card, .metric-box, .summary-card {
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    text-align: center;
}

.stat-number, .metric-number, .summary-number {
    font-size: 2rem;
    font-weight: bold;
    color: #3b82f6;
}

.course-cards, .pipeline-stages {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
    margin: 20px 0;
}

.course-card, .stage {
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.progress-bar {
    background: #e5e7eb;
    height: 8px;
    border-radius: 4px;
    overflow: hidden;
    margin-top: 10px;
}

.progress-fill {
    background: #10b981;
    height: 100%;
    transition: width 0.3s ease;
}

.alert {
    padding: 10px;
    border-radius: 4px;
    margin: 10px 0;
}

.alert-warning {
    background: #fef3c7;
    color: #92400e;
    border: 1px solid #f59e0b;
}

.alert-success {
    background: #d1fae5;
    color: #065f46;
    border: 1px solid #10b981;
}
*/
