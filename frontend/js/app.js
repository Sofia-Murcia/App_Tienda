import {
  categoriaApi, productoApi, clienteApi,
  proveedorApi, ventaApi, compraApi, reporteApi
} from './api.js';

const fmt = (n) => new Intl.NumberFormat('es-CO', {
  style: 'currency', currency: 'COP', minimumFractionDigits: 0
}).format(Number(n) || 0);

const nowLocal = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
  .toISOString().slice(0, 16);

const fmtFecha = (s) => s ? new Date(s).toLocaleString('es-CO', {
  day: '2-digit', month: 'short', year: 'numeric',
  hour: '2-digit', minute: '2-digit'
}) : '—';

function toast(msg, tipo = 'default') {
  const c = document.getElementById('toast-container');
  const t = document.createElement('div');
  t.className = `toast ${tipo}`;
  t.textContent = msg;
  c.appendChild(t);
  setTimeout(() => t.remove(), 3800);
}

const loadingHtml = `<div class="loading-wrapper"><div class="spinner"></div><p>Cargando...</p></div>`;

const emptyHtml = (msg = 'No hay registros aún') =>
  `<div class="empty-state"><div class="empty-icon">◯</div><p>${msg}</p></div>`;

function badgeCat(nombre) {
  const map = {
    'Papelería': 'papeleria', 'Droguería': 'drogueria',
    'Supermercado': 'supermercado', 'Aseo': 'aseo'
  };
  const cls = map[nombre] || 'default';
  return `<span class="badge badge-${cls}">${nombre}</span>`;
}

function badgeEmpaque(tipo) {
  const labels = { carton: ' Cartón', plastico: ' Plástico', otro: '◻ Otro' };
  return `<span class="badge badge-default">${labels[tipo] || tipo}</span>`;
}

function stockBadge(cantidad, stockMinimo = 5) {
  if (cantidad === 0)
    return `<span class="stock-badge">⚠ Sin stock</span>`;
  if (cantidad < stockMinimo)
    return `<span class="stock-badge">${cantidad}</span>`;
  return `<span class="stock-ok">${cantidad}</span>`;
}

function rowAlerta(cantidad, stockMinimo = 5) {
  if (cantidad === 0) return 'alerta-stock-critico';
  if (cantidad < stockMinimo) return 'alerta-stock-bajo';
  return '';
}

let paginaActual = 'dashboard';

function navegar(pagina) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const el = document.getElementById(`page-${pagina}`);
  if (el) el.classList.add('active');

  const nav = document.querySelector(`[data-page="${pagina}"]`);
  if (nav) nav.classList.add('active');

  const titulo = document.getElementById('topbar-titulo');
  if (titulo) titulo.textContent = nav?.dataset.label || '';

  paginaActual = pagina;
  cargarPagina(pagina);

  document.querySelector('.sidebar')?.classList.remove('open');
}

function cargarPagina(pagina) {
  switch (pagina) {
    case 'dashboard':   cargarDashboard(); break;
    case 'productos':   cargarProductos(); break;
    case 'clientes':    cargarClientes();  break;
    case 'proveedores': cargarProveedores(); break;
    case 'ventas':      iniciarWizardVenta(); break;
    case 'compras':     cargarCompras(); break;
    case 'historial':   cargarHistorialVentas(); break;
    case 'categorias':  cargarCategorias(); break;
  }
}

async function cargarDashboard() {
  try {
    const [ingresos, gastos, stockBajoData, top, unaCompra, frecuente] = await Promise.all([
      reporteApi.ingresos(),
      reporteApi.gastos(),
      reporteApi.stockBajo(),
      reporteApi.topCompradores(),
      reporteApi.unaCompra(),
      reporteApi.masFrecuente(),
    ]);

    const totalIngr = Number(ingresos.total_ingresos) || 0;
    const totalGast = Number(gastos.total_gastos) || 0;
    const utilidad  = totalIngr - totalGast;
    const maxVal    = Math.max(totalIngr, totalGast, 1);

    document.getElementById('stat-ingresos').textContent  = totalIngr.toLocaleString('es-CO');
    document.getElementById('stat-gastos').textContent    = totalGast.toLocaleString('es-CO');
    document.getElementById('stat-utilidad').textContent  = utilidad.toLocaleString('es-CO');
    document.getElementById('stat-stock-alerta').textContent = stockBajoData.length;

    document.getElementById('bar-ingresos').style.width = `${(totalIngr / maxVal) * 100}%`;
    document.getElementById('bar-gastos').style.width   = `${(totalGast / maxVal) * 100}%`;
    document.getElementById('bar-label-ingr').textContent = fmt(totalIngr);
    document.getElementById('bar-label-gast').textContent = fmt(totalGast);

    const topEl = document.getElementById('top-compradores-list');
    if (!top.length) {
      topEl.innerHTML = emptyHtml('Sin ventas registradas');
    } else {
      topEl.innerHTML = top.slice(0, 5).map((c, i) => `
        <div class="analytics-item">
          <div class="analytics-rank ${i === 0 ? 'top' : ''}">${i + 1}</div>
          <div class="analytics-info">
            <div class="analytics-name">${c.nombre} ${c.apellido}</div>
            <div class="analytics-detail">${c.cedula}</div>
          </div>
          <div>
            <div class="analytics-value dinero">${fmt(c.ventas_sum_total)}</div>
            <div class="text-sm text-muted text-right">${c.ventas_count} compra${c.ventas_count !== 1 ? 's' : ''}</div>
          </div>
        </div>`).join('');
    }

    const unaEl = document.getElementById('una-compra-list');
    if (!unaCompra.length) {
      unaEl.innerHTML = emptyHtml('Ninguno por ahora');
    } else {
      unaEl.innerHTML = unaCompra.map(c => `
        <div class="analytics-item">
          <div class="analytics-info">
            <div class="analytics-name">${c.nombre} ${c.apellido}</div>
            <div class="analytics-detail">${c.correo}</div>
          </div>
          <span class="badge badge-warning">1 compra</span>
        </div>`).join('');
    }

    const frecEl = document.getElementById('mas-frecuente');
    if (!frecuente) {
      frecEl.innerHTML = emptyHtml('Sin datos');
    } else {
      const inicial = (frecuente.nombre?.[0] || '?').toUpperCase();
      frecEl.innerHTML = `
        <div class="frecuente-card">
          <div class="frecuente-avatar">${inicial}</div>
          <div class="frecuente-info">
            <h4>${frecuente.nombre} ${frecuente.apellido}</h4>
            <p>${frecuente.correo} · ${frecuente.telefono}</p>
          </div>
          <div class="frecuente-badge">${frecuente.ventas_count} visitas</div>
        </div>`;
    }

    const bannerEl = document.getElementById('stock-alerta-banner');
    if (stockBajoData.length > 0) {
      bannerEl.innerHTML = `
        <span>⚠</span>
        <span><strong>${stockBajoData.length} producto${stockBajoData.length !== 1 ? 's' : ''}</strong> con stock bajo mínimo.
        <a href="#" onclick="navegar('productos')" style="color:inherit;text-decoration:underline">Ver productos →</a></span>`;
      bannerEl.classList.remove('hidden');
    } else {
      bannerEl.classList.add('hidden');
    }

  } catch (e) {
    toast(e.message, 'error');
  }
}

let _categorias = [];
let _editProductoId = null;

async function cargarProductos() {
  const tbody = document.getElementById('tabla-productos');
  tbody.innerHTML = loadingHtml;
  try {
    const [productos, cats] = await Promise.all([
      productoApi.listar(), categoriaApi.listar()
    ]);
    _categorias = cats;
    llenarSelectCategorias('prod-categoria');
    llenarSelectCategorias('filtro-cat-prod');
    renderTablaProductos(productos);
    window._productosData = productos;
  } catch (e) { toast(e.message, 'error'); }
}

function renderTablaProductos(productos) {
  const tbody = document.getElementById('tabla-productos');
  if (!productos.length) { tbody.innerHTML = `<tr><td colspan="9">${emptyHtml()}</td></tr>`; return; }

  tbody.innerHTML = productos.map(p => {
    const catNombre = p.categoria?.nombre || '—';
    const alerta    = rowAlerta(p.cantidad, p.stock_minimo);
    return `
    <tr class="${alerta}">
      <td class="td-code">${p.codigo}</td>
      <td><strong>${p.nombre}</strong></td>
      <td>${badgeCat(catNombre)}</td>
      <td>${p.peso} kg</td>
      <td>${badgeEmpaque(p.tipo_empaque)}</td>
      <td class="dinero">${fmt(p.precio)}</td>
      <td>${p.categoria?.impuesto ?? '—'}%</td>
      <td>${stockBadge(p.cantidad, p.stock_minimo)}</td>
      <td class="td-actions">
        <button class="btn btn-ghost btn-sm btn-icon" onclick="abrirEditProducto(${p.id})" title="Editar">✏</button>
        <button class="btn btn-ghost btn-sm btn-icon" onclick="confirmarBorrar('producto',${p.id},'${p.nombre}')" title="Eliminar">🗑</button>
      </td>
    </tr>`;
  }).join('');
}

function llenarSelectCategorias(selectId) {
  const sel = document.getElementById(selectId);
  if (!sel) return;
  const opts = _categorias.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');
  if (selectId.startsWith('filtro')) {
    sel.innerHTML = `<option value="">Todas las categorías</option>${opts}`;
  } else {
    sel.innerHTML = `<option value="">Selecciona categoría</option>${opts}`;
  }
}

window.filtrarProductos = function () {
  const q   = document.getElementById('buscador-prod').value.toLowerCase();
  const cat = document.getElementById('filtro-cat-prod').value;
  const fil = (window._productosData || []).filter(p => {
    const matchQ   = p.nombre.toLowerCase().includes(q) || p.codigo.toLowerCase().includes(q);
    const matchCat = !cat || String(p.categoria_id) === cat;
    return matchQ && matchCat;
  });
  renderTablaProductos(fil);
};

window.abrirModalProducto = function () {
  _editProductoId = null;
  document.getElementById('modal-prod-titulo').textContent = 'Nuevo Producto';
  document.getElementById('form-producto').reset();
  document.getElementById('modal-producto').classList.add('open');
};

window.abrirEditProducto = async function (id) {
  try {
    const p = await productoApi.detalle(id);
    _editProductoId = id;
    document.getElementById('modal-prod-titulo').textContent = 'Editar Producto';
    document.getElementById('prod-codigo').value     = p.codigo;
    document.getElementById('prod-nombre').value     = p.nombre;
    document.getElementById('prod-peso').value       = p.peso;
    document.getElementById('prod-cantidad').value   = p.cantidad;
    document.getElementById('prod-stock-min').value  = p.stock_minimo;
    document.getElementById('prod-empaque').value    = p.tipo_empaque;
    document.getElementById('prod-precio').value     = p.precio;
    document.getElementById('prod-categoria').value  = p.categoria_id;
    document.getElementById('modal-producto').classList.add('open');
  } catch (e) { toast(e.message, 'error'); }
};

window.cerrarModalProducto = function () {
  document.getElementById('modal-producto').classList.remove('open');
};

window.guardarProducto = async function () {
  const data = {
    codigo:      document.getElementById('prod-codigo').value.trim(),
    nombre:      document.getElementById('prod-nombre').value.trim(),
    peso:        parseFloat(document.getElementById('prod-peso').value),
    cantidad:    parseInt(document.getElementById('prod-cantidad').value),
    stock_minimo: parseInt(document.getElementById('prod-stock-min').value) || 5,
    tipo_empaque: document.getElementById('prod-empaque').value,
    precio:      parseFloat(document.getElementById('prod-precio').value),
    categoria_id: parseInt(document.getElementById('prod-categoria').value),
  };
  try {
    if (_editProductoId) {
      await productoApi.editar(_editProductoId, data);
      toast('Producto actualizado', 'success');
    } else {
      await productoApi.crear(data);
      toast('Producto creado', 'success');
    }
    cerrarModalProducto();
    cargarProductos();
  } catch (e) { toast(e.message, 'error'); }
};

let _editClienteId = null;

async function cargarClientes() {
  const tbody = document.getElementById('tabla-clientes');
  tbody.innerHTML = loadingHtml;
  try {
    const clientes = await clienteApi.listar();
    window._clientesData = clientes;
    renderTablaClientes(clientes);
  } catch (e) { toast(e.message, 'error'); }
}

function renderTablaClientes(clientes) {
  const tbody = document.getElementById('tabla-clientes');
  if (!clientes.length) { tbody.innerHTML = `<tr><td colspan="7">${emptyHtml()}</td></tr>`; return; }
  tbody.innerHTML = clientes.map(c => `
    <tr>
      <td class="td-code">${c.cedula}</td>
      <td><strong>${c.nombre} ${c.apellido}</strong></td>
      <td>${c.telefono}</td>
      <td>${c.correo}</td>
      <td class="td-actions">
        <button class="btn btn-ghost btn-sm btn-icon" onclick="abrirEditCliente(${c.id})" title="Editar">✏</button>
        <button class="btn btn-ghost btn-sm btn-icon" onclick="confirmarBorrar('cliente',${c.id},'${c.nombre} ${c.apellido}')" title="Eliminar">🗑</button>
      </td>
    </tr>`).join('');
}

window.filtrarClientes = function () {
  const q = document.getElementById('buscador-cli').value.toLowerCase();
  const fil = (window._clientesData || []).filter(c =>
    (c.nombre + ' ' + c.apellido).toLowerCase().includes(q) ||
    c.cedula.toLowerCase().includes(q) || c.correo.toLowerCase().includes(q)
  );
  renderTablaClientes(fil);
};

window.abrirModalCliente = function () {
  _editClienteId = null;
  document.getElementById('modal-cli-titulo').textContent = 'Nuevo Cliente';
  document.getElementById('form-cliente').reset();
  document.getElementById('modal-cliente').classList.add('open');
};

window.abrirEditCliente = async function (id) {
  try {
    const c = await clienteApi.detalle(id);
    _editClienteId = id;
    document.getElementById('modal-cli-titulo').textContent = 'Editar Cliente';
    document.getElementById('cli-cedula').value   = c.cedula;
    document.getElementById('cli-nombre').value   = c.nombre;
    document.getElementById('cli-apellido').value = c.apellido;
    document.getElementById('cli-telefono').value = c.telefono;
    document.getElementById('cli-correo').value   = c.correo;
    document.getElementById('modal-cliente').classList.add('open');
  } catch (e) { toast(e.message, 'error'); }
};

window.cerrarModalCliente = function () {
  document.getElementById('modal-cliente').classList.remove('open');
};

window.guardarCliente = async function () {
  const data = {
    cedula:   document.getElementById('cli-cedula').value.trim(),
    nombre:   document.getElementById('cli-nombre').value.trim(),
    apellido: document.getElementById('cli-apellido').value.trim(),
    telefono: document.getElementById('cli-telefono').value.trim(),
    correo:   document.getElementById('cli-correo').value.trim(),
  };
  try {
    if (_editClienteId) {
      await clienteApi.editar(_editClienteId, data);
      toast('Cliente actualizado', 'success');
    } else {
      await clienteApi.crear(data);
      toast('Cliente registrado', 'success');
    }
    cerrarModalCliente();
    cargarClientes();
  } catch (e) { toast(e.message, 'error'); }
};

let _editProveedorId = null;

async function cargarProveedores() {
  const tbody = document.getElementById('tabla-proveedores');
  tbody.innerHTML = loadingHtml;
  try {
    const proveedores = await proveedorApi.listar();
    window._proveedoresData = proveedores;
    renderTablaProveedores(proveedores);
  } catch (e) { toast(e.message, 'error'); }
}

function renderTablaProveedores(proveedores) {
  const tbody = document.getElementById('tabla-proveedores');
  if (!proveedores.length) { tbody.innerHTML = `<tr><td colspan="5">${emptyHtml()}</td></tr>`; return; }
  tbody.innerHTML = proveedores.map(p => `
    <tr>
      <td><strong>${p.nombre}</strong></td>
      <td>${p.telefono}</td>
      <td>${p.ciudad}</td>
      <td class="td-actions">
        <button class="btn btn-ghost btn-sm btn-icon" onclick="abrirEditProveedor(${p.id})" title="Editar">✏</button>
        <button class="btn btn-ghost btn-sm btn-icon" onclick="confirmarBorrar('proveedor',${p.id},'${p.nombre}')" title="Eliminar">🗑</button>
      </td>
    </tr>`).join('');
}

window.filtrarProveedores = function () {
  const q = document.getElementById('buscador-prov').value.toLowerCase();
  const fil = (window._proveedoresData || []).filter(p =>
    p.nombre.toLowerCase().includes(q) || p.ciudad.toLowerCase().includes(q)
  );
  renderTablaProveedores(fil);
};

window.abrirModalProveedor = function () {
  _editProveedorId = null;
  document.getElementById('modal-prov-titulo').textContent = 'Nuevo Proveedor';
  document.getElementById('form-proveedor').reset();
  document.getElementById('modal-proveedor').classList.add('open');
};

window.abrirEditProveedor = async function (id) {
  try {
    const p = await proveedorApi.detalle(id);
    _editProveedorId = id;
    document.getElementById('modal-prov-titulo').textContent = 'Editar Proveedor';
    document.getElementById('prov-nombre').value   = p.nombre;
    document.getElementById('prov-telefono').value = p.telefono;
    document.getElementById('prov-ciudad').value   = p.ciudad;
    document.getElementById('modal-proveedor').classList.add('open');
  } catch (e) { toast(e.message, 'error'); }
};

window.cerrarModalProveedor = function () {
  document.getElementById('modal-proveedor').classList.remove('open');
};

window.guardarProveedor = async function () {
  const data = {
    nombre:   document.getElementById('prov-nombre').value.trim(),
    telefono: document.getElementById('prov-telefono').value.trim(),
    ciudad:   document.getElementById('prov-ciudad').value.trim(),
  };
  try {
    if (_editProveedorId) {
      await proveedorApi.editar(_editProveedorId, data);
      toast('Proveedor actualizado', 'success');
    } else {
      await proveedorApi.crear(data);
      toast('Proveedor registrado', 'success');
    }
    cerrarModalProveedor();
    cargarProveedores();
  } catch (e) { toast(e.message, 'error'); }
};

let _ventaCliente   = null;
let _ventaProductos = [];
let _ventaCategoria = null;

async function iniciarWizardVenta() {
  _ventaCliente   = null;
  _ventaProductos = [];
  _ventaCategoria = null;
  irPasoVenta(1);

  try {
    const [clientes, categorias] = await Promise.all([
      clienteApi.listar(), categoriaApi.listar()
    ]);
    const selCli = document.getElementById('venta-cliente');
    selCli.innerHTML = `<option value="">— Selecciona cliente —</option>` +
      clientes.map(c => `<option value="${c.id}" data-json='${JSON.stringify(c)}'>${c.nombre} ${c.apellido} (${c.cedula})</option>`).join('');

    const selCat = document.getElementById('venta-categoria');
    selCat.innerHTML = `<option value="">— Selecciona categoría —</option>` +
      categorias.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');
  } catch (e) { toast(e.message, 'error'); }
}

function irPasoVenta(paso) {
  document.querySelectorAll('.wizard-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.wstep').forEach((s, i) => {
    s.classList.remove('active', 'done');
    if (i + 1 < paso) s.classList.add('done');
    if (i + 1 === paso) s.classList.add('active');
  });
  document.getElementById(`venta-paso-${paso}`).classList.add('active');
}

window.venta_paso1 = function () {
  const sel = document.getElementById('venta-cliente');
  if (!sel.value) { toast('Selecciona un cliente', 'warning'); return; }
  const opt = sel.options[sel.selectedIndex];
  _ventaCliente = JSON.parse(opt.dataset.json);
  irPasoVenta(2);
};

window.venta_cargarProductos = async function () {
  const catId = document.getElementById('venta-categoria').value;
  if (!catId) return;
  _ventaCategoria = catId;
  const selProd = document.getElementById('venta-producto');
  selProd.innerHTML = `<option value="">Cargando...</option>`;
  try {
    const todos = await productoApi.listar();
    const fil   = todos.filter(p => String(p.categoria_id) === catId && p.cantidad > 0);
    selProd.innerHTML = fil.length
      ? `<option value="">— Selecciona producto —</option>` +
        fil.map(p => `<option value="${p.id}" data-json='${JSON.stringify(p)}'>${p.nombre} — Stock: ${p.cantidad} — ${fmt(p.precio)}</option>`).join('')
      : `<option value="">Sin productos disponibles</option>`;
  } catch (e) { toast(e.message, 'error'); }
};

window.venta_agregarItem = function () {
  const selProd = document.getElementById('venta-producto');
  const cantEl  = document.getElementById('venta-cantidad');
  if (!selProd.value) { toast('Selecciona un producto', 'warning'); return; }

  const opt      = selProd.options[selProd.selectedIndex];
  const producto = JSON.parse(opt.dataset.json);
  const cantidad = parseInt(cantEl.value) || 1;

  if (cantidad <= 0) { toast('Cantidad inválida', 'warning'); return; }
  if (cantidad > producto.cantidad) {
    toast(`Stock insuficiente. Disponible: ${producto.cantidad}`, 'warning'); return;
  }

  const yaEsta = _ventaProductos.findIndex(i => i.producto.id === producto.id);
  if (yaEsta >= 0) { toast('Ese producto ya está en el carrito', 'warning'); return; }

  _ventaProductos.push({ producto, cantidad });
  cantEl.value = 1;
  selProd.value = '';
  renderCarrito();
};

function renderCarrito() {
  const el = document.getElementById('carrito-list');
  const btnSig = document.getElementById('btn-venta-paso3');
  if (!_ventaProductos.length) {
    el.innerHTML = `<div class="empty-state" style="padding:var(--sp-8)"><p>Agrega productos al carrito</p></div>`;
    btnSig.disabled = true;
    return;
  }
  btnSig.disabled = false;
  el.innerHTML = _ventaProductos.map((item, i) => {
    const sub = item.cantidad * item.producto.precio;
    const imp  = item.producto.categoria?.impuesto || 0;
    const total = sub * (1 + imp / 100);
    return `
    <div class="carrito-item">
      <div class="carrito-item-info">
        <div class="carrito-item-name">${item.producto.nombre}</div>
        <div class="carrito-item-detail">Cant: ${item.cantidad} × ${fmt(item.producto.precio)} · IVA ${imp}%</div>
      </div>
      <div class="carrito-item-price">${fmt(total)}</div>
      <button class="carrito-remove" onclick="quitarItemCarrito(${i})" title="Quitar">✕</button>
    </div>`;
  }).join('');
}

window.quitarItemCarrito = function (idx) {
  _ventaProductos.splice(idx, 1);
  renderCarrito();
};

window.venta_paso3 = function () {
  if (!_ventaProductos.length) { toast('El carrito está vacío', 'warning'); return; }
  irPasoVenta(3);
  renderResumenVenta();
};

window.venta_volver2 = function () { irPasoVenta(2); };
window.venta_volver1 = function () { irPasoVenta(1); };

function renderResumenVenta() {
  let subtotal = 0, impTotal = 0;
  const itemsHtml = _ventaProductos.map(({ producto, cantidad }) => {
    const imp     = Number(producto.categoria?.impuesto || 0);
    const sub     = cantidad * producto.precio;
    const impVal  = sub * (imp / 100);
    const linea   = sub + impVal;
    subtotal += sub; impTotal += impVal;
    return `
    <div class="resumen-item">
      <div class="resumen-item-left">
        <div class="resumen-item-name">${producto.nombre}</div>
        <div class="resumen-item-detail">${cantidad} × ${fmt(producto.precio)} · IVA ${imp}%</div>
      </div>
      <div class="resumen-item-total">${fmt(linea)}</div>
    </div>`;
  }).join('');

  const total = subtotal + impTotal;
  const ahora = new Date().toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' });

  document.getElementById('resumen-venta').innerHTML = `
    <div class="resumen-compra">
      <div class="resumen-header">
        <h3>Resumen de Compra</h3>
        <p>${ahora}</p>
      </div>
      <div class="resumen-cliente">
        <div class="resumen-field"><span>Cliente</span>${_ventaCliente.nombre} ${_ventaCliente.apellido}</div>
        <div class="resumen-field"><span>Cédula</span>${_ventaCliente.cedula}</div>
        <div class="resumen-field"><span>Teléfono</span>${_ventaCliente.telefono}</div>
        <div class="resumen-field"><span>Correo</span>${_ventaCliente.correo}</div>
      </div>
      <div class="resumen-items">${itemsHtml}</div>
      <div class="resumen-totales">
        <div class="total-row"><span>Subtotal</span><span class="dinero">${fmt(subtotal)}</span></div>
        <div class="total-row"><span>Impuestos</span><span class="dinero">${fmt(impTotal)}</span></div>
        <div class="total-row total-final"><span>Total</span><span class="dinero">${fmt(total)}</span></div>
      </div>
    </div>`;
}

window.confirmarVenta = async function () {
  const btn = document.getElementById('btn-confirmar-venta');
  btn.disabled = true;
  btn.textContent = 'Procesando…';
  try {
    const body = {
      cliente_id: _ventaCliente.id,
      fecha: nowLocal() + ':00',
      detalles: _ventaProductos.map(i => ({
        producto_id: i.producto.id,
        cantidad: i.cantidad
      }))
    };
    const venta = await ventaApi.crear(body);
    toast(`✓ Venta #${venta.id} registrada exitosamente`, 'success');
    const resumen = await reporteApi.resumenVenta(venta.id);
    renderResumenFinal(resumen);
    _ventaProductos = [];
  } catch (e) {
    toast(e.message, 'error');
    btn.disabled = false;
    btn.textContent = 'Confirmar Venta';
  }
};

function renderResumenFinal(r) {
  const itemsHtml = r.detalles.map(d => `
    <div class="resumen-item">
      <div class="resumen-item-left">
        <div class="resumen-item-name">${d.producto}</div>
        <div class="resumen-item-detail">${d.cantidad} × ${fmt(d.precio_unitario)} · IVA ${d.impuesto_porcentaje}%</div>
      </div>
      <div class="resumen-item-total">${fmt(d.total_linea)}</div>
    </div>`).join('');

  document.getElementById('resumen-venta').innerHTML = `
    <div class="resumen-compra">
      <div class="resumen-header">
        <h3>✓ Venta #${r.id} Confirmada</h3>
        <p>${fmtFecha(r.fecha)}</p>
      </div>
      <div class="resumen-cliente">
        <div class="resumen-field"><span>Cliente</span>${r.cliente}</div>
        <div class="resumen-field"><span>Cédula</span>${r.cedula}</div>
        <div class="resumen-field"><span>Teléfono</span>${r.telefono}</div>
        <div class="resumen-field"><span>Correo</span>${r.correo}</div>
      </div>
      <div class="resumen-items">${itemsHtml}</div>
      <div class="resumen-totales">
        <div class="total-row"><span>Subtotal</span><span class="dinero">${fmt(r.subtotal)}</span></div>
        <div class="total-row"><span>Impuestos</span><span class="dinero">${fmt(r.impuesto_total)}</span></div>
        <div class="total-row total-final"><span>Total</span><span class="dinero">${fmt(r.total)}</span></div>
      </div>
    </div>
    <div class="mt-6 flex gap-3">
      <button class="btn btn-secondary" onclick="iniciarWizardVenta()">Nueva Venta</button>
    </div>`;
  document.getElementById('btn-confirmar-venta').classList.add('hidden');
}

let _compraDetalles = [];

async function cargarCompras() {
  const contenedor = document.getElementById('compra-form-area');
  contenedor.innerHTML = loadingHtml;
  try {
    const [proveedores, productos] = await Promise.all([
      proveedorApi.listar(), productoApi.listar()
    ]);
    window._proveedoresData = proveedores;
    window._productosData   = productos;

    const selProv = document.getElementById('compra-proveedor');
    selProv.innerHTML = `<option value="">— Selecciona proveedor —</option>` +
      proveedores.map(p => `<option value="${p.id}">${p.nombre} · ${p.ciudad}</option>`).join('');

    document.getElementById('compra-fecha').value = nowLocal();
    _compraDetalles = [{ id: Date.now() }];
    renderDetallesCompra();
    contenedor.innerHTML = '';
  } catch (e) { toast(e.message, 'error'); }
}

function renderDetallesCompra() {
  const productos = window._productosData || [];
  const prodOpts  = productos.map(p => `<option value="${p.id}">${p.nombre} (${p.codigo})</option>`).join('');
  const el        = document.getElementById('compra-detalles');

  el.innerHTML = _compraDetalles.map((d, i) => `
    <div class="detalle-row" data-idx="${i}">
      <div class="form-group">
        ${i === 0 ? '<label>Producto</label>' : ''}
        <select class="det-prod" data-i="${i}">
          <option value="">— Producto —</option>${prodOpts}
        </select>
      </div>
      <div class="form-group">
        ${i === 0 ? '<label>Cantidad</label>' : ''}
        <input type="number" class="det-cant" min="1" value="1" data-i="${i}">
      </div>
      <div class="form-group">
        ${i === 0 ? '<label>Costo Unitario</label>' : ''}
        <input type="number" class="det-costo" min="0" step="0.01" placeholder="0.00" data-i="${i}">
      </div>
      <div style="display:flex;align-items:flex-end;padding-bottom:1px">
        ${_compraDetalles.length > 1
          ? `<button class="btn btn-ghost btn-sm btn-icon" onclick="quitarDetalleCompra(${i})" title="Quitar">✕</button>`
          : '<div style="width:34px"></div>'}
      </div>
    </div>`).join('');
}

window.agregarDetalleCompra = function () {
  _compraDetalles.push({ id: Date.now() });
  renderDetallesCompra();
};

window.quitarDetalleCompra = function (idx) {
  _compraDetalles.splice(idx, 1);
  renderDetallesCompra();
};

window.registrarCompra = async function () {
  const proveedorId = document.getElementById('compra-proveedor').value;
  const fecha       = document.getElementById('compra-fecha').value;

  if (!proveedorId) { toast('Selecciona un proveedor', 'warning'); return; }
  if (!fecha)        { toast('Ingresa la fecha', 'warning'); return; }

  const prods  = document.querySelectorAll('.det-prod');
  const cants  = document.querySelectorAll('.det-cant');
  const costos = document.querySelectorAll('.det-costo');

  const detalles = [];
  let valido = true;
  prods.forEach((sel, i) => {
    if (!sel.value) { valido = false; return; }
    detalles.push({
      producto_id:   parseInt(sel.value),
      cantidad:      parseInt(cants[i].value) || 1,
      costo_unitario: parseFloat(costos[i].value) || 0
    });
  });

  if (!valido || !detalles.length) {
    toast('Completa todos los productos del detalle', 'warning'); return;
  }

  try {
    const compra = await compraApi.crear({
      proveedor_id: parseInt(proveedorId),
      fecha: fecha + ':00',
      detalles
    });
    toast(`✓ Compra #${compra.id} registrada. Stock actualizado.`, 'success');
    cargarCompras();
    productoApi.listar().then(p => window._productosData = p);
  } catch (e) { toast(e.message, 'error'); }
};

async function cargarHistorialVentas() {
  const tbody = document.getElementById('tabla-historial');
  tbody.innerHTML = loadingHtml;
  try {
    const ventas = await ventaApi.listar();
    if (!ventas.length) {
      tbody.innerHTML = `<tr><td colspan="6">${emptyHtml('Sin ventas registradas')}</td></tr>`;
      return;
    }
    tbody.innerHTML = ventas.reverse().map(v => `
      <tr>
        <td class="td-code">#${v.id}</td>
        <td>${fmtFecha(v.fecha)}</td>
        <td><strong>${v.cliente?.nombre ?? '—'} ${v.cliente?.apellido ?? ''}</strong></td>
        <td>${v.detalles?.length ?? 0} ítem(s)</td>
        <td class="dinero">${fmt(v.total)}</td>
        <td><button class="btn btn-ghost btn-sm" onclick="verResumenVenta(${v.id})">Ver resumen</button></td>
      </tr>`).join('');
  } catch (e) { toast(e.message, 'error'); }
}
async function cargarCategorias() {
  const tbody = document.getElementById('tabla-historial');
  tbody.innerHTML = loadingHtml;
  try {
    const categorias = await categoriaApi.listar();
    if (!categorias.length) {
      tbody.innerHTML = `<tr><td colspan="6">${emptyHtml('Sin categorías registradas')}</td></tr>`;
      return;
    }
    tbody.innerHTML = categorias.reverse().map(c => `
      <tr>
        <td class="td-code">#${c.id}</td>
        <td>${c.nombre}</td>
        <td>${c.descripcion}</td>
      </tr>`).join('');
  } catch (e) { toast(e.message, 'error'); }
}

window.verResumenVenta = async function (id) {
  try {
    const r = await reporteApi.resumenVenta(id);
    const itemsHtml = r.detalles.map(d => `
      <div class="resumen-item">
        <div class="resumen-item-left">
          <div class="resumen-item-name">${d.producto}</div>
          <div class="resumen-item-detail">${d.cantidad} × ${fmt(d.precio_unitario)} · IVA ${d.impuesto_porcentaje}%</div>
        </div>
        <div class="resumen-item-total">${fmt(d.total_linea)}</div>
      </div>`).join('');

    document.getElementById('modal-resumen-body').innerHTML = `
      <div class="resumen-compra">
        <div class="resumen-header">
          <h3>Venta #${r.id}</h3>
          <p>${fmtFecha(r.fecha)}</p>
        </div>
        <div class="resumen-cliente">
          <div class="resumen-field"><span>Cliente</span>${r.cliente}</div>
          <div class="resumen-field"><span>Cédula</span>${r.cedula}</div>
          <div class="resumen-field"><span>Teléfono</span>${r.telefono}</div>
          <div class="resumen-field"><span>Correo</span>${r.correo}</div>
        </div>
        <div class="resumen-items">${itemsHtml}</div>
        <div class="resumen-totales">
          <div class="total-row"><span>Subtotal</span><span class="dinero">${fmt(r.subtotal)}</span></div>
          <div class="total-row"><span>Impuestos</span><span class="dinero">${fmt(r.impuesto_total)}</span></div>
          <div class="total-row total-final"><span>Total</span><span class="dinero">${fmt(r.total)}</span></div>
        </div>
      </div>`;
    document.getElementById('modal-resumen').classList.add('open');
  } catch (e) { toast(e.message, 'error'); }
};

window.cerrarModalResumen = function () {
  document.getElementById('modal-resumen').classList.remove('open');
};

let _borrarPendiente = null;

window.confirmarBorrar = function (entidad, id, nombre) {
  _borrarPendiente = { entidad, id };
  document.getElementById('confirm-texto').textContent =
    `¿Eliminar ${nombre}? Esta acción no se puede deshacer.`;
  document.getElementById('modal-confirm').classList.add('open');
};

window.cerrarModalConfirm = function () {
  document.getElementById('modal-confirm').classList.remove('open');
  _borrarPendiente = null;
};

window.ejecutarBorrar = async function () {
  if (!_borrarPendiente) return;
  const { entidad, id } = _borrarPendiente;
  const apis = {
    producto: productoApi, cliente: clienteApi, proveedor: proveedorApi
  };
  try {
    await apis[entidad]?.borrar(id);
    toast(`Eliminado correctamente`, 'success');
    cerrarModalConfirm();
    if (entidad === 'producto')  cargarProductos();
    if (entidad === 'cliente')   cargarClientes();
    if (entidad === 'proveedor') cargarProveedores();
  } catch (e) { toast(e.message, 'error'); }
};

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => navegar(item.dataset.page));
  });

  document.getElementById('btn-hamburger')?.addEventListener('click', () => {
    document.querySelector('.sidebar')?.classList.toggle('open');
  });

  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('open');
      }
    });
  });

  navegar('dashboard');
});

window.navegar = navegar;