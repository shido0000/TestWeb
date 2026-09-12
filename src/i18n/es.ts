// Traducciones al español para TestHub

export const translations = {
  // Navegación
  nav: {
    dashboard: 'Panel',
    projects: 'Proyectos',
    targets: 'Objetivos',
    scans: 'Escaneos',
    findings: 'Hallazgos',
    crawler: 'Rastreador',
    performance: 'Rendimiento',
    accessibility: 'Accesibilidad',
    security: 'Seguridad',
    visualRegression: 'Regresión Visual',
    e2eTests: 'Pruebas E2E',
    aiInsights: 'Análisis IA',
    anomalyDetection: 'Detección de Anomalías',
    organizations: 'Organizaciones',
    billing: 'Facturación',
    cicd: 'CI/CD',
    apiDocs: 'Documentación API',
    reports: 'Informes',
    settings: 'Configuración',
  },

  // Estados
  status: {
    completed: 'completado',
    running: 'en ejecución',
    failed: 'fallido',
    pending: 'pendiente',
    cancelled: 'cancelado',
  },

  // Severidad
  severity: {
    critical: 'crítico',
    high: 'alto',
    medium: 'medio',
    low: 'bajo',
    info: 'informativo',
    warning: 'advertencia',
  },

  // Suites de prueba
  suites: {
    console_errors: 'Errores de Consola',
    broken_links: 'Enlaces Rotos',
    accessibility: 'Accesibilidad',
    performance: 'Rendimiento',
    security: 'Seguridad',
    visual_regression: 'Regresión Visual',
    seo: 'SEO',
    e2e: 'Pruebas E2E',
  },

  // Dashboard
  dashboard: {
    title: 'Panel de Control',
    subtitle: 'Resumen de tu actividad de pruebas y hallazgos',
    totalProjects: 'Total Proyectos',
    totalScans: 'Total Escaneos',
    totalFindings: 'Total Hallazgos',
    criticalIssues: 'Problemas Críticos',
    thisWeek: 'esta semana',
    fromLastScan: 'desde último escaneo',
    requiresAttention: 'Requiere atención',
    findingsTrend: 'Tendencia de Hallazgos',
    last7Days: 'Últimos 7 días',
    severityDistribution: 'Distribución por Severidad',
    allFindingsBySeverity: 'Todos los hallazgos por severidad',
    findingsBySuite: 'Hallazgos por Suite',
    distributionAcrossSuites: 'Distribución a través de suites de prueba',
    recentScans: 'Escaneos Recientes',
    latestScanActivity: 'Última actividad de escaneo',
    viewAll: 'Ver todos',
    suites: 'suites',
    pages: 'páginas',
    criticalFindingsAlert: 'Hallazgos Críticos que Requieren Atención Inmediata',
    allSystemsOperational: 'Todos los sistemas operativos',
  },

  // Proyectos
  projects: {
    title: 'Proyectos',
    subtitle: 'Gestiona tus proyectos de prueba y sus configuraciones',
    newProject: 'Nuevo Proyecto',
    createProject: 'Crear Proyecto',
    projectName: 'Nombre del Proyecto',
    description: 'Descripción',
    tags: 'Etiquetas',
    tagsHelp: 'Separadas por comas',
    findings: 'hallazgos',
    lastScan: 'Último escaneo',
    cancel: 'Cancelar',
  },

  // Objetivos
  targets: {
    title: 'Objetivos',
    subtitle: 'Configura las aplicaciones web y endpoints a probar',
    addTarget: 'Agregar Objetivo',
    targetName: 'Nombre del Objetivo',
    url: 'URL',
    environment: 'Entorno',
    authentication: 'Autenticación',
    required: 'Requerida',
    notRequired: 'No requerida',
    scope: 'Alcance',
    maxDepth: 'Profundidad máxima',
    allowedDomains: 'Dominios permitidos',
    excludedPaths: 'Rutas excluidas',
    authorizationWarning: 'Solo escanea sistemas que tengas autorización explícita para probar',
    production: 'producción',
    staging: 'staging',
    development: 'desarrollo',
  },

  // Escaneos
  scans: {
    title: 'Escaneos',
    subtitle: 'Lanza y monitorea suites de pruebas automatizadas',
    newScan: 'Nuevo Escaneo',
    launchScan: 'Lanzar Escaneo',
    selectTarget: 'Seleccionar objetivo',
    selectSuites: 'Seleccionar suites',
    progress: 'Progreso',
    triggeredBy: 'Iniciado por',
    duration: 'Duración',
    pagesScanned: 'Páginas escaneadas',
    totalRequests: 'Peticiones totales',
    all: 'Todos',
  },

  // Hallazgos
  findings: {
    title: 'Hallazgos',
    subtitle: 'problemas detectados en todos los escaneos',
    filterBySeverity: 'Filtrar por severidad',
    filterByStatus: 'Filtrar por estado',
    filterBySuite: 'Filtrar por suite',
    allSeverities: 'Todas las severidades',
    allStatuses: 'Todos los estados',
    allSuites: 'Todas las suites',
    clearFilters: 'Limpiar filtros',
    selectFinding: 'Selecciona un hallazgo para ver detalles',
    findingDetails: 'Detalles del Hallazgo',
    updateStatus: 'Actualizar Estado',
    openUrl: 'Abrir URL',
    riskScore: 'Puntuación de Riesgo',
    evidence: 'Evidencia',
    recommendation: 'Recomendación',
  },

  // Estados de hallazgos
  findingStatus: {
    open: 'abierto',
    accepted: 'aceptado',
    false_positive: 'falso positivo',
    fixed: 'corregido',
    retest: 'retest',
  },

  // Común
  common: {
    search: 'Buscar proyectos, hallazgos, escaneos...',
    profile: 'Perfil',
    settings: 'Configuración',
    signOut: 'Cerrar Sesión',
    save: 'Guardar',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    edit: 'Editar',
    view: 'Ver',
    download: 'Descargar',
    export: 'Exportar',
    import: 'Importar',
    loading: 'Cargando...',
    noData: 'Sin datos',
    error: 'Error',
    success: 'Éxito',
    warning: 'Advertencia',
    info: 'Información',
  },
};

export default translations;
