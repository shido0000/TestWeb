import { useState } from 'react';
import { useApp } from '../store/useStore';
import { Book, Code, Key, Copy, CheckCircle2, ChevronDown, ChevronRight, Globe, Shield, Zap, AlertTriangle } from 'lucide-react';

interface Endpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  auth: boolean;
  params?: { name: string; type: string; required: boolean; description: string }[];
  body?: string;
  response: string;
}

const methodColors: Record<string, string> = {
  GET: 'bg-low/10 text-low border-low/20',
  POST: 'bg-primary-500/10 text-primary-400 border-primary-500/20',
  PUT: 'bg-medium/10 text-medium border-medium/20',
  DELETE: 'bg-critical/10 text-critical border-critical/20',
  PATCH: 'bg-warning/10 text-warning border-warning/20',
};

const endpoints: { group: string; items: Endpoint[] }[] = [
  {
    group: 'Projects',
    items: [
      {
        method: 'GET', path: '/api/v1/projects', description: 'List all projects', auth: true,
        response: `{ "data": [{ "id": "p1", "name": "E-Commerce", "tags": ["production"], "findingsCount": {...} }], "total": 4 }`
      },
      {
        method: 'POST', path: '/api/v1/projects', description: 'Create a new project', auth: true,
        body: `{ "name": "New Project", "description": "...", "tags": ["staging"] }`,
        response: `{ "id": "p5", "name": "New Project", "createdAt": "..." }`
      },
      {
        method: 'GET', path: '/api/v1/projects/:id', description: 'Get project details', auth: true,
        params: [{ name: 'id', type: 'string', required: true, description: 'Project ID' }],
        response: `{ "id": "p1", "name": "E-Commerce", "targets": [...], "findingsCount": {...} }`
      },
      {
        method: 'DELETE', path: '/api/v1/projects/:id', description: 'Delete a project', auth: true,
        params: [{ name: 'id', type: 'string', required: true, description: 'Project ID' }],
        response: `{ "success": true }`
      },
    ],
  },
  {
    group: 'Scans',
    items: [
      {
        method: 'POST', path: '/api/v1/scans', description: 'Launch a new scan', auth: true,
        body: `{ "targetId": "t1", "suites": ["security", "accessibility", "performance"], "callbackUrl": "https://..." }`,
        response: `{ "id": "s6", "status": "pending", "targetUrl": "https://shop.example.com" }`
      },
      {
        method: 'GET', path: '/api/v1/scans/:id', description: 'Get scan status and results', auth: true,
        params: [{ name: 'id', type: 'string', required: true, description: 'Scan ID' }],
        response: `{ "id": "s1", "status": "completed", "progress": 100, "findingsSummary": {...}, "duration": 1800 }`
      },
      {
        method: 'GET', path: '/api/v1/scans/:id/findings', description: 'Get findings for a scan', auth: true,
        params: [
          { name: 'id', type: 'string', required: true, description: 'Scan ID' },
          { name: 'severity', type: 'string', required: false, description: 'Filter by severity' },
        ],
        response: `{ "data": [{ "id": "f1", "severity": "critical", "title": "...", "url": "..." }], "total": 12 }`
      },
      {
        method: 'POST', path: '/api/v1/scans/:id/cancel', description: 'Cancel a running scan', auth: true,
        response: `{ "id": "s3", "status": "cancelled" }`
      },
    ],
  },
  {
    group: 'Findings',
    items: [
      {
        method: 'GET', path: '/api/v1/findings', description: 'List all findings', auth: true,
        params: [
          { name: 'projectId', type: 'string', required: false, description: 'Filter by project' },
          { name: 'severity', type: 'string', required: false, description: 'Filter by severity' },
          { name: 'status', type: 'string', required: false, description: 'Filter by status' },
          { name: 'suite', type: 'string', required: false, description: 'Filter by suite' },
        ],
        response: `{ "data": [...], "total": 58, "page": 1, "perPage": 20 }`
      },
      {
        method: 'PATCH', path: '/api/v1/findings/:id', description: 'Update finding status', auth: true,
        body: `{ "status": "fixed" }`,
        response: `{ "id": "f1", "status": "fixed", "updatedAt": "..." }`
      },
    ],
  },
  {
    group: 'Targets',
    items: [
      {
        method: 'GET', path: '/api/v1/targets', description: 'List all targets', auth: true,
        response: `{ "data": [{ "id": "t1", "url": "https://...", "name": "...", "environment": "production" }] }`
      },
      {
        method: 'POST', path: '/api/v1/targets', description: 'Add a new target', auth: true,
        body: `{ "projectId": "p1", "url": "https://example.com", "name": "Main Site", "environment": "production", "scope": { "maxDepth": 5 } }`,
        response: `{ "id": "t6", "url": "https://example.com", "createdAt": "..." }`
      },
    ],
  },
  {
    group: 'Reports',
    items: [
      {
        method: 'POST', path: '/api/v1/reports', description: 'Generate a report', auth: true,
        body: `{ "scanId": "s1", "format": "pdf", "includeEvidence": true }`,
        response: `{ "id": "r1", "format": "pdf", "url": "/api/v1/reports/r1/download" }`
      },
      {
        method: 'GET', path: '/api/v1/reports/:id/download', description: 'Download report file', auth: true,
        response: `Binary file (PDF/HTML/JSON)`
      },
    ],
  },
];

export default function ApiDocs() {
  const { apiKeys } = useApp();
  const [expandedEndpoint, setExpandedEndpoint] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">API Documentation</h1>
          <p className="text-sm text-text-secondary mt-1">RESTful API reference — OpenAPI 3.0 specification</p>
        </div>
        <div className="flex items-center gap-2">
          <a href="#" className="flex items-center gap-2 px-4 py-2.5 bg-surface-light border border-border hover:border-border-light text-text-primary text-sm font-medium rounded-lg transition-colors">
            <Book className="w-4 h-4" /> Swagger UI
          </a>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors">
            <Code className="w-4 h-4" /> OpenAPI Spec
          </button>
        </div>
      </div>

      {/* Base URL & Auth */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-surface-light border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary-400" /> Base URL
          </h3>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-3 py-2 bg-surface border border-border rounded-lg text-sm text-primary-400 font-mono">
              https://api.testhub.io/v1
            </code>
            <button
              onClick={() => copyToClipboard('https://api.testhub.io/v1', 'base')}
              className="p-2 text-text-muted hover:text-text-primary rounded-lg hover:bg-surface-lighter"
            >
              {copiedKey === 'base' ? <CheckCircle2 className="w-4 h-4 text-low" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div className="bg-surface-light border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary-400" /> Authentication
          </h3>
          <p className="text-xs text-text-secondary mb-2">Include your API key in the Authorization header:</p>
          <code className="block px-3 py-2 bg-surface border border-border rounded-lg text-xs text-text-secondary font-mono">
            Authorization: Bearer &lt;your-api-key&gt;
          </code>
        </div>
      </div>

      {/* API Keys */}
      <div className="bg-surface-light border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
          <Key className="w-4 h-4 text-primary-400" /> Your API Keys
        </h3>
        <div className="space-y-2">
          {apiKeys.map(key => (
            <div key={key.id} className="flex items-center gap-3 p-3 rounded-lg bg-surface/50 border border-border/50">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary">{key.name}</p>
                <p className="text-xs text-text-muted font-mono mt-0.5">{key.prefix}••••••••••••</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-muted">Permissions: {key.permissions.length}</span>
                <button
                  onClick={() => copyToClipboard(key.key, key.id)}
                  className="p-1.5 text-text-muted hover:text-text-primary rounded hover:bg-surface-lighter"
                >
                  {copiedKey === key.id ? <CheckCircle2 className="w-3.5 h-3.5 text-low" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rate Limiting */}
      <div className="bg-surface-light border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary-400" /> Rate Limiting
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-surface/50 border border-border/50 text-center">
            <p className="text-lg font-bold text-text-primary">100</p>
            <p className="text-xs text-text-muted">Requests/min</p>
          </div>
          <div className="p-3 rounded-lg bg-surface/50 border border-border/50 text-center">
            <p className="text-lg font-bold text-text-primary">1000</p>
            <p className="text-xs text-text-muted">Requests/hour</p>
          </div>
          <div className="p-3 rounded-lg bg-surface/50 border border-border/50 text-center">
            <p className="text-lg font-bold text-text-primary">5</p>
            <p className="text-xs text-text-muted">Concurrent Scans</p>
          </div>
          <div className="p-3 rounded-lg bg-surface/50 border border-border/50 text-center">
            <p className="text-lg font-bold text-text-primary">50MB</p>
            <p className="text-xs text-text-muted">Max Upload</p>
          </div>
        </div>
        <p className="text-xs text-text-muted mt-3">
          Rate limit headers: <code className="px-1 bg-surface rounded">X-RateLimit-Limit</code>, <code className="px-1 bg-surface rounded">X-RateLimit-Remaining</code>, <code className="px-1 bg-surface rounded">X-RateLimit-Reset</code>
        </p>
      </div>

      {/* Endpoints */}
      <div className="space-y-4">
        {endpoints.map(group => (
          <div key={group.group} className="bg-surface-light border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-border bg-surface/30">
              <h3 className="text-sm font-semibold text-text-primary">{group.group}</h3>
            </div>
            <div className="divide-y divide-border/50">
              {group.items.map((endpoint, i) => {
                const key = `${group.group}-${i}`;
                const isExpanded = expandedEndpoint === key;
                return (
                  <div key={key}>
                    <button
                      onClick={() => setExpandedEndpoint(isExpanded ? null : key)}
                      className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-surface/30 transition-colors"
                    >
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${methodColors[endpoint.method]}`}>
                        {endpoint.method}
                      </span>
                      <code className="text-sm text-text-primary font-mono flex-1">{endpoint.path}</code>
                      <span className="text-xs text-text-muted hidden sm:block">{endpoint.description}</span>
                      {endpoint.auth && <Shield className="w-3 h-3 text-primary-400" />}
                      {isExpanded ? <ChevronDown className="w-4 h-4 text-text-muted" /> : <ChevronRight className="w-4 h-4 text-text-muted" />}
                    </button>
                    {isExpanded && (
                      <div className="px-5 pb-4 animate-slide-in">
                        <p className="text-sm text-text-secondary mb-3">{endpoint.description}</p>

                        {endpoint.params && endpoint.params.length > 0 && (
                          <div className="mb-3">
                            <p className="text-xs font-medium text-text-muted uppercase mb-1.5">Parameters</p>
                            <div className="space-y-1">
                              {endpoint.params.map(param => (
                                <div key={param.name} className="flex items-center gap-2 text-xs">
                                  <code className="px-1.5 py-0.5 bg-surface border border-border rounded font-mono text-text-primary">{param.name}</code>
                                  <span className="text-text-muted">{param.type}</span>
                                  {param.required && <span className="text-critical text-[10px]">required</span>}
                                  <span className="text-text-muted ml-auto">{param.description}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {endpoint.body && (
                          <div className="mb-3">
                            <p className="text-xs font-medium text-text-muted uppercase mb-1.5">Request Body</p>
                            <pre className="p-3 bg-surface rounded-lg border border-border text-xs text-text-secondary font-mono overflow-x-auto">
                              {endpoint.body}
                            </pre>
                          </div>
                        )}

                        <div>
                          <p className="text-xs font-medium text-text-muted uppercase mb-1.5">Response</p>
                          <pre className="p-3 bg-surface rounded-lg border border-border text-xs text-text-secondary font-mono overflow-x-auto">
                            {endpoint.response}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Error Codes */}
      <div className="bg-surface-light border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-medium" /> Error Codes
        </h3>
        <div className="space-y-2">
          {[
            { code: 400, desc: 'Bad Request — Invalid parameters or malformed request body' },
            { code: 401, desc: 'Unauthorized — Missing or invalid API key' },
            { code: 403, desc: 'Forbidden — Insufficient permissions for this resource' },
            { code: 404, desc: 'Not Found — Resource does not exist' },
            { code: 429, desc: 'Too Many Requests — Rate limit exceeded' },
            { code: 500, desc: 'Internal Server Error — Something went wrong on our end' },
          ].map(err => (
            <div key={err.code} className="flex items-center gap-3 p-2 rounded-lg bg-surface/50 border border-border/50">
              <span className={`px-2 py-0.5 text-xs font-bold rounded ${
                err.code < 500 ? 'bg-medium/10 text-medium' : 'bg-critical/10 text-critical'
              }`}>{err.code}</span>
              <span className="text-xs text-text-secondary">{err.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
