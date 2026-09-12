# TestHub Backend - Automated Web Testing Platform

Backend completo para TestHub, una plataforma de testing automatizado de aplicaciones web.

## 🏗️ Arquitectura

```
testhub-backend/
├── apps/
│   ├── api/          → NestJS REST API (puerto 3000)
│   ├── worker/       → Playwright workers para escaneos
│   └── web/          → Frontend React (puerto 5173)
├── packages/
│   ├── shared/       → Tipos y utilidades compartidas
│   ├── scanners/     → Módulos de escaneo (Lighthouse, axe-core, etc.)
│   └── database/     → Prisma schema y migraciones
├── docker-compose.yml
├── .env.example
└── README.md
```

## 🚀 Inicio Rápido

### Prerrequisitos

- Docker y Docker Compose
- Node.js 20+ (para desarrollo local sin Docker)
- npm 10+

### Instalación con Docker (Recomendado)

1. **Clonar el repositorio**
```bash
git clone <repo-url>
cd testhub/backend
```

2. **Configurar variables de entorno**
```bash
cp .env.example .env
# Editar .env con tus valores
```

3. **Levantar todos los servicios**
```bash
docker-compose up -d
```

4. **Inicializar base de datos**
```bash
docker-compose exec api npm run db:migrate
docker-compose exec api npm run db:seed
```

5. **Acceder a la aplicación**
- Frontend: http://localhost:5173
- API: http://localhost:3000
- API Docs (Swagger): http://localhost:3000/api/docs
- MinIO Console: http://localhost:9001

### Instalación Local (Sin Docker)

1. **Instalar dependencias**
```bash
npm install
```

2. **Configurar base de datos PostgreSQL**
```bash
# Crear base de datos
createdb testhub

# Ejecutar migraciones
npm run db:migrate

# Cargar datos de ejemplo
npm run db:seed
```

3. **Iniciar Redis**
```bash
redis-server
```

4. **Iniciar MinIO**
```bash
minio server ./data --console-address ":9001"
```

5. **Iniciar servicios**
```bash
# Terminal 1: API
npm run dev:api

# Terminal 2: Worker
npm run dev:worker

# Terminal 3: Frontend
npm run dev:web
```

## 📚 API Endpoints (Fase 1)

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/refresh` - Renovar token
- `POST /api/auth/logout` - Cerrar sesión

### Proyectos
- `GET /api/projects` - Listar proyectos
- `POST /api/projects` - Crear proyecto
- `GET /api/projects/:id` - Obtener proyecto
- `PATCH /api/projects/:id` - Actualizar proyecto
- `DELETE /api/projects/:id` - Eliminar proyecto

### Targets
- `GET /api/targets` - Listar targets
- `POST /api/targets` - Crear target
- `GET /api/targets/:id` - Obtener target
- `PATCH /api/targets/:id` - Actualizar target
- `DELETE /api/targets/:id` - Eliminar target

### Scans
- `GET /api/scans` - Listar escaneos
- `POST /api/scans` - Iniciar escaneo
- `GET /api/scans/:id` - Obtener escaneo
- `POST /api/scans/:id/cancel` - Cancelar escaneo
- `GET /api/scans/:id/progress` - Progreso en tiempo real (SSE)

### Findings
- `GET /api/findings` - Listar findings
- `GET /api/findings/:id` - Obtener finding
- `PATCH /api/findings/:id` - Actualizar finding
- `POST /api/findings/:id/duplicate` - Marcar como duplicado
- `POST /api/findings/:id/false-positive` - Marcar como falso positivo

### Reports
- `GET /api/reports` - Listar reportes
- `POST /api/reports/generate` - Generar reporte
- `GET /api/reports/:id/download` - Descargar reporte

### Crawler
- `GET /api/crawler/:targetId/results` - Obtener resultados del crawler
- `GET /api/crawler/:targetId/sitemap` - Obtener sitemap generado

## 🔧 Suites de Escaneo (Fase 1)

### 1. Console & Network Errors
- Captura de errores de consola (error, warn)
- Excepciones JavaScript no capturadas
- Requests fallidos (4xx, 5xx)
- Errores CORS
- Mixed content warnings

### 2. Broken Links & SEO
- Verificación de enlaces internos/externos
- Meta tags (title, description, og:*)
- Sitemap XML validation
- robots.txt validation
- Structured data (JSON-LD)

### 3. Accessibility (axe-core)
- WCAG 2.1 AA compliance
- Color contrast validation
- ARIA attributes validation
- Keyboard navigation testing
- Screen reader compatibility

### 4. Performance (Lighthouse)
- Core Web Vitals (LCP, FID, CLS)
- Performance score
- Resource optimization
- Bundle size analysis
- Rendering performance

### 5. Visual Regression
- Screenshot capture (multiple viewports)
- Pixel-level comparison
- Diff generation
- Baseline management
- Threshold configuration

### 6. E2E Tests
- Playwright-based test execution
- Custom test flows (YAML/JSON)
- Step-by-step execution
- Screenshot on failure
- Video recording

## 🗄️ Base de Datos

### Modelos Principales

- **User**: Usuarios del sistema
- **Project**: Proyectos de testing
- **Target**: URLs objetivo
- **Scan**: Escaneos ejecutados
- **Finding**: Hallazgos detectados
- **Evidence**: Evidencias (screenshots, logs)
- **CrawlResult**: Resultados del crawler
- **Report**: Reportes generados

### Migraciones

```bash
# Crear nueva migración
npx prisma migrate dev --name add_new_field

# Aplicar migraciones
npm run db:migrate

# Resetear base de datos
npx prisma migrate reset

# Ver esquema visual
npm run db:studio
```

## 🧪 Testing

```bash
# Tests unitarios
npm run test

# Tests de integración
npm run test:integration

# Coverage
npm run test:coverage

# Tests E2E
npm run test:e2e
```

## 📊 Monitoreo

### Health Checks
- API: `GET /health`
- Worker: `GET /worker/health`
- Database: Verificado automáticamente
- Redis: Verificado automáticamente
- MinIO: Verificado automáticamente

### Logs
```bash
# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f api
docker-compose logs -f worker
```

### Métricas
- Prometheus metrics: `GET /metrics`
- Scan duration
- Finding detection rate
- Worker queue length
- API response times

## 🔐 Seguridad

### Autenticación
- JWT tokens con expiración configurable
- Refresh tokens
- Role-based access control (RBAC)
- API key authentication para CI/CD

### Autorización
- Roles: admin, tester, viewer
- Permisos por proyecto
- Scope限制 para crawlers

### Rate Limiting
- 100 requests/minute por usuario
- 1000 requests/hour por usuario
- Configurable por endpoint

## 🚀 Deployment

### Producción con Docker

```bash
# Build imágenes
docker-compose -f docker-compose.prod.yml build

# Levantar servicios
docker-compose -f docker-compose.prod.yml up -d

# Verificar estado
docker-compose ps
```

### Variables de Entorno Críticas

```bash
# Cambiar en producción
JWT_SECRET=<generar-uno-seguro>
POSTGRES_PASSWORD=<password-fuerte>
MINIO_ROOT_PASSWORD=<password-fuerte>

# Configurar SSL
API_SSL=true
API_SSL_CERT=/path/to/cert.pem
API_SSL_KEY=/path/to/key.pem
```

## 📝 Desarrollo

### Estructura de un Scanner

```typescript
// packages/scanners/src/accessibility/index.ts
export class AccessibilityScanner implements Scanner {
  async scan(page: Page, url: string): Promise<Finding[]> {
    const results = await axe.run(page);
    return this.normalizeFindings(results);
  }
  
  private normalizeFindings(results: AxeResults): Finding[] {
    // Convertir resultados de axe-core al formato Finding
  }
}
```

### Agregar Nuevo Scanner

1. Crear clase en `packages/scanners/src/<nombre>/`
2. Implementar interfaz `Scanner`
3. Registrar en `packages/scanners/src/index.ts`
4. Agregar tipo en `packages/shared/src/types.ts`
5. Actualizar worker para ejecutar el scanner

### Worker Job Processing

```typescript
// apps/worker/src/jobs/scan.job.ts
export class ScanJob {
  async process(job: Job<ScanPayload>) {
    const { scanId, targetId, suites } = job.data;
    
    // 1. Crawl target
    const pages = await this.crawler.crawl(targetId);
    
    // 2. Execute suites
    for (const suite of suites) {
      const scanner = this.getScanner(suite);
      const findings = await scanner.scan(pages);
      await this.saveFindings(scanId, findings);
    }
    
    // 3. Generate report
    await this.generateReport(scanId);
  }
}
```

## 🔄 CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: TestHub Scan
on: [push, pull_request]
jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run TestHub Scan
        run: |
          curl -X POST http://api.testhub.io/scans \
            -H "Authorization: Bearer ${{ secrets.TESTHUB_API_KEY }}" \
            -d '{"targetUrl": "https://staging.example.com", "suites": ["accessibility", "performance"]}'
```

## 📚 Documentación Adicional

- [API Documentation](http://localhost:3000/api/docs) - Swagger UI
- [Database Schema](packages/database/prisma/schema.prisma) - Prisma schema
- [Architecture Decision Records](docs/adr/) - ADRs

## 🤝 Contribuir

1. Fork el repositorio
2. Crear branch feature (`git checkout -b feature/amazing-feature`)
3. Commit cambios (`git commit -m 'Add amazing feature'`)
4. Push al branch (`git push origin feature/amazing-feature`)
5. Abrir Pull Request

## 📄 Licencia

MIT License - ver [LICENSE](LICENSE) para detalles

## 🆘 Soporte

- Issues: [GitHub Issues](https://github.com/your-org/testhub/issues)
- Email: support@testhub.io
- Docs: https://docs.testhub.io

---

**Nota**: Este es el backend de TestHub. Para el frontend, ver [apps/web](apps/web/).
