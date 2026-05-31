const API_BASE = 'http://localhost:8080';

// ─── Utilidad HTTP ───────────────────────────────────────────────

async function http(method, path, body = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
  };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${API_BASE}${path}`, options);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = data?.error || data?.message || `Error ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

const get    = (path)         => http('GET',    path);
const post   = (path, body)   => http('POST',   path, body);
const put    = (path, body)   => http('PUT',    path, body);
const del    = (path)         => http('DELETE', path);

// ─── Categorías ──────────────────────────────────────────────────

export const categoriaApi = {
  listar:  ()           => get('/categorias'),
  detalle: (id)         => get(`/categorias/${id}`),
  crear:   (data)       => post('/categorias', data),
  editar:  (id, data)   => put(`/categorias/${id}`, data),
  borrar:  (id)         => del(`/categorias/${id}`),
};

// ─── Productos ───────────────────────────────────────────────────

export const productoApi = {
  listar:           ()           => get('/productos'),
  detalle:          (id)         => get(`/productos/${id}`),
  crear:            (data)       => post('/productos', data),
  editar:           (id, data)   => put(`/productos/${id}`, data),
  borrar:           (id)         => del(`/productos/${id}`),
  syncProveedores:  (id, data)   => put(`/productos/${id}/proveedores`, data),
};

// ─── Clientes ────────────────────────────────────────────────────

export const clienteApi = {
  listar:  ()           => get('/clientes'),
  detalle: (id)         => get(`/clientes/${id}`),
  crear:   (data)       => post('/clientes', data),
  editar:  (id, data)   => put(`/clientes/${id}`, data),
  borrar:  (id)         => del(`/clientes/${id}`),
};

// ─── Proveedores ─────────────────────────────────────────────────

export const proveedorApi = {
  listar:  ()           => get('/proveedores'),
  detalle: (id)         => get(`/proveedores/${id}`),
  crear:   (data)       => post('/proveedores', data),
  editar:  (id, data)   => put(`/proveedores/${id}`, data),
  borrar:  (id)         => del(`/proveedores/${id}`),
};

// ─── Ventas ──────────────────────────────────────────────────────
// POST body: { cliente_id, fecha, detalles: [{ producto_id, cantidad }] }

export const ventaApi = {
  listar:  ()     => get('/ventas'),
  detalle: (id)   => get(`/ventas/${id}`),
  crear:   (data) => post('/ventas', data),
};

// ─── Compras (a proveedores) ─────────────────────────────────────
// POST body: { proveedor_id, fecha, detalles: [{ producto_id, cantidad, costo_unitario }] }

export const compraApi = {
  listar:  ()     => get('/compras'),
  detalle: (id)   => get(`/compras/${id}`),
  crear:   (data) => post('/compras', data),
};

// ─── Reportes ────────────────────────────────────────────────────

export const reporteApi = {
  ingresos:       ()   => get('/reportes/ingresos'),
  gastos:         ()   => get('/reportes/gastos'),
  stockBajo:      ()   => get('/reportes/stock-bajo'),
  topCompradores: ()   => get('/reportes/top-compradores'),
  unaCompra:      ()   => get('/reportes/una-compra'),
  masFrecuente:   ()   => get('/reportes/mas-frecuente'),
  resumenVenta:   (id) => get(`/reportes/ventas/${id}/resumen`),
};