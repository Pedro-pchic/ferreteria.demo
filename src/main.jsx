import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  AlertTriangle, Archive, BarChart3, Boxes, Building2, Check, ChevronLeft, ChevronRight,
  CircleDollarSign, ClipboardList, Download, Landmark, LayoutDashboard, Menu,
  Minus, Package, Plus, Printer, ReceiptText, RotateCcw, Search, Settings, ShieldCheck,
  ShoppingBag, ShoppingCart, Store, Trash2, Truck, Wallet, X,
} from 'lucide-react';
import { CATEGORIES, createSeedData, WAREHOUSES } from './data.js';
import {
  addExpense, addProduct, adjustStock, completeSale, loadState, persistState,
  productStock, receivePurchase,
} from './domain.js';
import './style.css';

const NAV = [
  ['Principal', 'Dashboard', LayoutDashboard], ['Ventas', 'Punto de venta', ShoppingCart],
  ['Ventas', 'Historial de ventas', ReceiptText], ['Inventario', 'Productos e inventario', Package],
  ['Inventario', 'Control de stock', Boxes], ['Abastecimiento', 'Compras y proveedores', ShoppingBag],
  ['Operación', 'Caja y gastos', Wallet], ['Análisis', 'Reportes', BarChart3],
  ['Documentos', 'Facturación FEL simulada', ReceiptText], ['Sistema', 'Configuración', Settings],
];

const money = number => `Q ${Number(number || 0).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const shortDate = value => new Intl.DateTimeFormat('es-GT', { dateStyle: 'medium' }).format(new Date(value));
const dateTime = value => new Intl.DateTimeFormat('es-GT', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
const byId = (items, id) => items.find(item => item.id === id);
const statusClass = status => `pill ${['Completada','Recibida','Vigente','Abierta','Activo'].includes(status) ? 'ok' : ['Pendiente','Ordenada','Recibida parcialmente','Stock bajo'].includes(status) ? 'warn' : 'neutral'}`;

function App() {
  const [data, setData] = useState(loadState);
  const [page, setPage] = useState('Dashboard');
  const [mobileNav, setMobileNav] = useState(false);
  const [modal, setModal] = useState(null);
  const [notice, setNotice] = useState(null);
  const [cart, setCart] = useState([]);

  useEffect(() => persistState(data), [data]);

  const notify = (message, tone = 'ok') => {
    setNotice({ message, tone });
    window.clearTimeout(notify.timer);
    notify.timer = window.setTimeout(() => setNotice(null), 3800);
  };
  const run = (operation, success) => {
    try {
      const result = operation(data);
      setData(result?.state || result);
      if (success) notify(typeof success === 'function' ? success(result) : success);
      return result;
    } catch (error) {
      notify(error.message, 'error');
      return null;
    }
  };
  const go = destination => { setPage(destination); setMobileNav(false); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const reset = () => {
    if (!window.confirm('¿Restablecer todos los datos locales de esta demostración?')) return;
    setData(createSeedData()); setCart([]); setModal(null); notify('Datos de demostración restablecidos.');
  };

  const views = {
    Dashboard: <Dashboard data={data} go={go} />,
    'Punto de venta': <POS data={data} cart={cart} setCart={setCart} onCheckout={order => {
      const result = run(state => completeSale(state, order), resultValue => `Venta ${resultValue.sale.number} registrada.`);
      if (result) { setCart([]); setModal({ type: 'receipt', sale: result.sale }); }
    }} notify={notify} />,
    'Historial de ventas': <Sales data={data} showReceipt={sale => setModal({ type: 'receipt', sale })} />,
    'Productos e inventario': <Products data={data} openForm={product => setModal({ type: 'product', product })} toggle={id => run(state => ({ ...state, products: state.products.map(product => product.id === id ? { ...product, active: !product.active } : product) }), 'Estado del producto actualizado.')} />,
    'Control de stock': <Stock data={data} openAdjustment={() => setModal({ type: 'adjustment' })} />,
    'Compras y proveedores': <Purchases data={data} openForm={() => setModal({ type: 'purchase' })} receive={id => run(state => receivePurchase(state, id), 'Mercadería recibida e inventario actualizado.')} />,
    'Caja y gastos': <Cash data={data} openAction={action => setModal({ type: 'cash', action })} openExpense={() => setModal({ type: 'expense' })} />,
    Reportes: <Reports data={data} />,
    'Facturación FEL simulada': <FelSimulation data={data} showReceipt={sale => setModal({ type: 'receipt', sale })} />,
    Configuración: <Configuration data={data} setData={setData} reset={reset} />,
  };

  return <div className="app-shell">
    <Sidebar page={page} go={go} open={mobileNav} close={() => setMobileNav(false)} />
    <main className="main-shell">
      <Header page={page} toggleNav={() => setMobileNav(value => !value)} />
      <div className="page-content">{views[page]}</div>
      <footer>© 2026 DEVSYSGT · FerreERP comercial · Datos completamente ficticios</footer>
    </main>
    {mobileNav && <button className="nav-scrim" aria-label="Cerrar menú" onClick={() => setMobileNav(false)} />}
    {modal && <Modal close={() => setModal(null)}>
      {modal.type === 'receipt' && <Receipt sale={modal.sale} data={data} />}
      {modal.type === 'product' && <ProductForm initial={modal.product} data={data} save={values => {
        if (modal.product) run(state => ({ ...state, products: state.products.map(product => product.id === modal.product.id ? { ...product, ...values, price: Number(values.price), cost: Number(values.cost), minStock: Number(values.minStock) } : product) }), 'Producto actualizado.');
        else run(state => addProduct(state, values), 'Producto agregado al inventario.');
        setModal(null);
      }} />}
      {modal.type === 'adjustment' && <AdjustmentForm data={data} save={values => { const result = run(state => adjustStock(state, values), 'Ajuste de inventario registrado.'); if (result) setModal(null); }} />}
      {modal.type === 'expense' && <ExpenseForm save={values => { const result = run(state => addExpense(state, values), 'Egreso registrado.'); if (result) setModal(null); }} />}
      {modal.type === 'purchase' && <PurchaseForm data={data} save={values => { run(state => ({ ...state, purchases: [{ id: `OC-${Date.now()}`, date: new Date().toISOString(), supplierId: values.supplierId, status: 'Ordenada', paid: false, items: [{ productId: values.productId, name: byId(state.products, values.productId).name, qty: Number(values.qty), cost: Number(values.cost) }], total: Number(values.qty) * Number(values.cost) }, ...state.purchases] }), 'Orden creada; el stock no cambia hasta recibirla.'); setModal(null); }} />}
      {modal.type === 'cash' && <CashForm action={modal.action} data={data} save={values => {
        run(state => updateCash(state, modal.action, values), modal.action === 'open' ? 'Caja abierta.' : 'Caja cerrada y arqueo registrado.'); setModal(null);
      }} />}
    </Modal>}
    {notice && <div className={`toast ${notice.tone}`}><span>{notice.tone === 'ok' ? <Check size={18}/> : <AlertTriangle size={18}/>}</span>{notice.message}</div>}
  </div>;
}

function Sidebar({ page, go, open, close }) {
  let currentGroup = '';
  return <aside className={`sidebar ${open ? 'open' : ''}`}>
    <div className="brand"><div className="brand-mark">D</div><div><strong>DEVSYSGT</strong><span>FERREERP</span></div><button onClick={close} aria-label="Cerrar"><X/></button></div>
    <div className="demo-panel"><span className="live-dot"/><div><strong>Modo demostración</strong><small>Sin integraciones ni cobros reales</small></div></div>
    <nav>{NAV.map(([group, label, Icon]) => {
      const heading = group !== currentGroup; currentGroup = group;
      return <React.Fragment key={label}>{heading && <span className="nav-label">{group}</span>}<button className={page === label ? 'active' : ''} onClick={() => go(label)}><Icon size={18}/><span>{label}</span></button></React.Fragment>;
    })}</nav>
    <div className="sidebar-foot"><ShieldCheck size={17}/><span>Datos guardados localmente<small>Prototipo sin autenticación real</small></span></div>
  </aside>;
}

function Header({ page, toggleNav }) {
  return <header className="topbar"><div className="title-row"><button className="menu-button" onClick={toggleNav} aria-label="Abrir menú"><Menu/></button><div><span className="breadcrumb">DEVSYSGT / FERREERP</span><h1>{page}</h1></div></div><div className="top-actions"><span className="mode-badge"><span/> MODO DEMO</span><div className="profile"><div>AD</div><span><strong>Andrea Díaz</strong><small>Administrador</small></span></div></div></header>;
}

function Dashboard({ data, go }) {
  const completed = data.sales.filter(sale => sale.status === 'Completada');
  const month = new Date().getMonth();
  const today = new Date().toDateString();
  const daySales = completed.filter(sale => new Date(sale.date).toDateString() === today);
  const monthSales = completed.filter(sale => new Date(sale.date).getMonth() === month);
  const revenue = monthSales.reduce((sum, sale) => sum + sale.total, 0);
  const costs = monthSales.reduce((sum, sale) => sum + sale.items.reduce((itemSum, item) => itemSum + item.cost * item.qty, 0), 0);
  const low = data.products.filter(product => product.active && productStock(product) <= product.minStock);
  const expenses = data.expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const chart = Array.from({ length: 7 }, (_, offset) => {
    const date = new Date(); date.setDate(date.getDate() - (6 - offset));
    return { label: new Intl.DateTimeFormat('es-GT', { weekday: 'short' }).format(date), value: completed.filter(sale => new Date(sale.date).toDateString() === date.toDateString()).reduce((sum, sale) => sum + sale.total, 0) };
  });
  const max = Math.max(1, ...chart.map(item => item.value));
  return <>
    <section className="hero"><div><span className="eyebrow">RESUMEN DEL NEGOCIO</span><h2>Todo tu negocio, en un solo lugar.</h2><p>Ventas, inventario y caja conectados con datos consistentes.</p><button className="light-button" onClick={() => go('Punto de venta')}>Nueva venta <ShoppingCart size={17}/></button></div><div className="hero-visual"><Store/><span>FERRETERÍA<br/><b>EL CONSTRUCTOR</b></span></div></section>
    <div className="metric-grid"><Metric label="Ventas de hoy" value={money(daySales.reduce((sum, sale) => sum + sale.total, 0))} note={`${daySales.length} operaciones`} icon={ShoppingCart}/><Metric label="Ventas del mes" value={money(revenue)} note={`${monthSales.length} completadas`} icon={BarChart3}/><Metric label="Utilidad bruta estimada" value={money(revenue - costs)} note="Ventas menos costo" icon={CircleDollarSign}/><Metric label="Gastos registrados" value={money(expenses)} note="Operación demo" icon={ReceiptText}/></div>
    <div className="dashboard-grid"><section className="panel chart-panel"><PanelTitle title="Ventas de los últimos 7 días" subtitle="Calculadas desde el historial de ventas"/><div className="bar-chart">{chart.map(item => <div className="bar-column" key={item.label}><span>{item.value ? money(item.value).replace('.00','') : ''}</span><div style={{ height: `${Math.max(5, item.value / max * 150)}px` }}/><small>{item.label}</small></div>)}</div></section><section className="panel"><PanelTitle title="Inventario en atención" subtitle={`${low.length} productos agotados o bajo mínimo`}/>{low.slice(0, 6).map(product => <div className="list-row" key={product.id}><div className="list-avatar">{product.emoji}</div><span><strong>{product.name}</strong><small>{product.sku} · mínimo {product.minStock}</small></span><b className="warning-text">{productStock(product)}</b></div>)}<button className="text-button" onClick={() => go('Control de stock')}>Revisar existencias →</button></section></div>
    <section className="panel"><PanelTitle title="Actividad reciente" subtitle="Últimas operaciones registradas"/>{data.sales.slice(0,5).map(sale => <div className="activity-row" key={sale.id}><div className="activity-icon"><ReceiptText size={17}/></div><span><strong>{sale.number}</strong><small>{byId(data.clients, sale.clientId)?.name || 'Consumidor Final'} · {dateTime(sale.date)}</small></span><span className={statusClass(sale.status)}>{sale.status}</span><b>{money(sale.total)}</b></div>)}</section>
  </>;
}

function POS({ data, cart, setCart, onCheckout, notify }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Todas');
  const [clientId, setClientId] = useState(data.clients.at(-1).id);
  const [method, setMethod] = useState('Efectivo');
  const [discount, setDiscount] = useState(0);
  const products = data.products.filter(product => product.active && (category === 'Todas' || product.category === category) && `${product.name} ${product.sku} ${product.barcode}`.toLowerCase().includes(search.toLowerCase()));
  const add = product => {
    const available = Number(product.stockByWarehouse['WH-01'] || 0);
    const line = cart.find(item => item.productId === product.id);
    if ((line?.qty || 0) >= available) return notify('No hay más existencias disponibles.', 'error');
    setCart(line ? cart.map(item => item.productId === product.id ? { ...item, qty: item.qty + 1 } : item) : [...cart, { productId: product.id, name: product.name, sku: product.sku, price: product.price, qty: 1, emoji: product.emoji }]);
  };
  const updateQty = (id, delta) => {
    const line = cart.find(item => item.productId === id);
    if (delta > 0) return add(byId(data.products, id));
    if (line.qty <= 1) setCart(cart.filter(item => item.productId !== id));
    else setCart(cart.map(item => item.productId === id ? { ...item, qty: item.qty - 1 } : item));
  };
  const subtotal = cart.reduce((sum, item) => sum + item.qty * item.price, 0);
  const taxable = Math.max(0, subtotal - Number(discount || 0));
  const tax = taxable * data.settings.taxRate / 100;
  return <div className="pos-layout"><section className="panel catalog-panel"><div className="pos-heading"><div><span className="eyebrow">CATÁLOGO</span><h2>¿Qué vendemos hoy?</h2></div><span>{products.length} productos</span></div><div className="search-box"><Search size={18}/><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Buscar por producto, SKU o código de barras…"/></div><div className="category-strip"><button className={category === 'Todas' ? 'selected' : ''} onClick={() => setCategory('Todas')}>Todos</button>{CATEGORIES.map(([name, emoji]) => <button className={category === name ? 'selected' : ''} key={name} onClick={() => setCategory(name)}>{emoji} {name}</button>)}</div><div className="product-grid">{products.map(product => { const available = product.stockByWarehouse['WH-01']; return <button className="product-card" key={product.id} onClick={() => add(product)} disabled={!available}><div className={`product-media tone-${CATEGORIES.findIndex(([name]) => name === product.category) % 5}`}><span>{product.emoji}</span><small>{product.category}</small></div><div className="product-body"><span className="sku">{product.sku}</span><strong>{product.name}</strong><div><b>{money(product.price)}</b><span className={available <= product.minStock ? 'stock-low' : ''}>{available} {product.unit}</span></div></div></button>; })}</div></section><aside className="panel cart-panel"><div className="cart-header"><div><span className="eyebrow">VENTA ACTUAL</span><h2>Carrito</h2></div><button className="icon-button" onClick={() => setCart([])} disabled={!cart.length} title="Limpiar carrito"><Trash2 size={18}/></button></div><label className="field">Cliente del comprobante<select value={clientId} onChange={event => setClientId(event.target.value)}>{data.clients.filter(client => client.active).map(client => <option value={client.id} key={client.id}>{client.name}</option>)}</select></label><div className="cart-items">{cart.length ? cart.map(item => <div className="cart-line" key={item.productId}><div className="cart-emoji">{item.emoji}</div><span><strong>{item.name}</strong><small>{money(item.price)} c/u</small><div className="quantity"><button onClick={() => updateQty(item.productId, -1)}><Minus size={14}/></button><b>{item.qty}</b><button onClick={() => updateQty(item.productId, 1)}><Plus size={14}/></button></div></span><b>{money(item.price * item.qty)}</b></div>) : <Empty icon={ShoppingCart} text="Selecciona productos del catálogo para iniciar una venta."/>}</div><div className="sale-options"><label>Descuento Q<input type="number" min="0" max={subtotal} step="0.01" value={discount} onChange={event => setDiscount(event.target.value)}/></label><label>Método<select value={method} onChange={event => setMethod(event.target.value)}><option>Efectivo</option><option>Tarjeta (demo)</option><option>Transferencia</option></select></label></div><div className="totals"><span>Subtotal <b>{money(subtotal)}</b></span><span>Descuento <b>- {money(discount)}</b></span><span>IVA ({data.settings.taxRate}%) <b>{money(tax)}</b></span><strong>Total <b>{money(taxable + tax)}</b></strong></div><button className="primary-button wide" disabled={!cart.length} onClick={() => onCheckout({ items: cart, clientId, method, seller: 'Andrea Díaz', discount })}><Wallet size={18}/> Confirmar cobro demo</button><p className="safe-note"><ShieldCheck size={15}/> No se procesan pagos ni datos bancarios reales.</p></aside></div>;
}

function Sales({ data, showReceipt }) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('Todas');
  const rows = data.sales.filter(sale => (status === 'Todas' || sale.status === status) && `${sale.number} ${byId(data.clients, sale.clientId)?.name || ''}`.toLowerCase().includes(search.toLowerCase()));
  return <section className="panel"><PanelTitle title="Historial de ventas" subtitle={`${rows.length} documentos encontrados`} action={<div className="inline-filters"><SearchInput value={search} setValue={setSearch} placeholder="Documento o cliente"/><select value={status} onChange={event => setStatus(event.target.value)}><option>Todas</option><option>Completada</option><option>Pendiente</option><option>Anulada</option><option>Devuelta</option></select></div>}/><DataTable heads={['Documento','Fecha','Cliente','Vendedor','Pago','Estado','Total','Comprobante']} rows={rows.map(sale => [<b>{sale.number}</b>, dateTime(sale.date), byId(data.clients,sale.clientId)?.name, sale.seller, sale.method, <span className={statusClass(sale.status)}>{sale.status}</span>, <b>{money(sale.total)}</b>, <button className="table-action" onClick={() => showReceipt(sale)}><Printer size={15}/> Ver</button>])}/></section>;
}

function Products({ data, openForm, toggle }) {
  const [search, setSearch] = useState(''); const [sort, setSort] = useState('name'); const [page, setPage] = useState(0);
  const filtered = useMemo(() => data.products.filter(product => `${product.name} ${product.sku} ${product.category}`.toLowerCase().includes(search.toLowerCase())).sort((a,b) => sort === 'stock' ? productStock(a)-productStock(b) : a[sort].localeCompare(b[sort])), [data.products, search, sort]);
  const pages = Math.ceil(filtered.length / 12); const rows = filtered.slice(page * 12, page * 12 + 12);
  useEffect(() => setPage(0), [search, sort]);
  return <section className="panel"><PanelTitle title="Catálogo de productos" subtitle="Consulta, edita o desactiva sin perder historial" action={<button className="primary-button" onClick={() => openForm()}><Plus size={17}/> Nuevo producto</button>}/><div className="toolbar"><SearchInput value={search} setValue={setSearch} placeholder="Nombre, SKU o categoría"/><label>Ordenar por <select value={sort} onChange={event => setSort(event.target.value)}><option value="name">Nombre</option><option value="category">Categoría</option><option value="stock">Menor stock</option></select></label></div><DataTable heads={['Producto','Categoría / marca','Costo','Precio','Existencias','Mínimo','Estado','Acciones']} rows={rows.map(product => [<span className="product-name"><i>{product.emoji}</i><span><b>{product.name}</b><small>{product.sku} · {product.unit}</small></span></span>, <span>{product.category}<small>{product.brand}</small></span>, money(product.cost), <b>{money(product.price)}</b>, productStock(product), product.minStock, <span className={statusClass(product.active ? (productStock(product) <= product.minStock ? 'Stock bajo' : 'Activo') : 'Inactivo')}>{product.active ? (productStock(product) <= product.minStock ? 'Stock bajo' : 'Activo') : 'Inactivo'}</span>, <div className="row-actions"><button onClick={() => openForm(product)}>Editar</button><button onClick={() => toggle(product.id)}>{product.active ? 'Desactivar' : 'Activar'}</button></div>])}/><Pagination page={page} pages={pages} setPage={setPage}/></section>;
}

function Stock({ data, openAdjustment }) {
  const total = data.products.reduce((sum, product) => sum + productStock(product), 0);
  const out = data.products.filter(product => productStock(product) === 0).length;
  const low = data.products.filter(product => productStock(product) > 0 && productStock(product) <= product.minStock).length;
  return <><div className="metric-grid"><Metric label="Unidades totales" value={total.toLocaleString('es-GT')} note="Bodega principal" icon={Boxes}/><Metric label="Productos activos" value={data.products.filter(product => product.active).length} note="Catálogo disponible" icon={Archive}/><Metric label="Agotados" value={out} note="Sin existencia" icon={AlertTriangle}/><Metric label="Stock bajo" value={low} note="Bajo el mínimo" icon={Package}/></div><section className="panel"><PanelTitle title="Existencias de bodega" subtitle="Una sola ubicación operativa" action={<button className="primary-button" onClick={openAdjustment}><Plus size={17}/> Registrar ajuste</button>}/><DataTable heads={['Producto','SKU','Categoría','Existencia','Unidad','Situación']} rows={data.products.map(product => { const qty = Number(product.stockByWarehouse['WH-01'] || 0); return [<b>{product.name}</b>, product.sku, product.category, <b>{qty}</b>, product.unit, <span className={statusClass(qty === 0 ? 'Agotado' : qty <= product.minStock ? 'Stock bajo' : 'Activo')}>{qty === 0 ? 'Agotado' : qty <= product.minStock ? 'Stock bajo' : 'Disponible'}</span>]; }).slice(0,25)}/></section><section className="panel"><PanelTitle title="Kardex reciente" subtitle="Entradas, salidas y ajustes de la bodega"/><DataTable heads={['Fecha','Movimiento','Producto','Cantidad','Ubicación','Responsable','Motivo']} rows={data.movements.slice(0,30).map(movement => [dateTime(movement.date), movement.type, byId(data.products,movement.productId)?.name, movement.qty, WAREHOUSES[0].name, movement.responsible, movement.reason])}/></section></>;
}

function Purchases({ data, openForm, receive }) {
  const pending = data.purchases.filter(item => ['Ordenada','Recibida parcialmente'].includes(item.status));
  return <><div className="metric-grid"><Metric label="Órdenes" value={data.purchases.length} note="Historial completo" icon={ClipboardList}/><Metric label="Pendientes de recibir" value={pending.length} note="Aún no suman stock" icon={Truck}/><Metric label="Compras recibidas" value={money(data.purchases.filter(item => item.status.startsWith('Recibida')).reduce((sum,item)=>sum+item.total,0))} note="Mercadería ingresada" icon={CircleDollarSign}/><Metric label="Proveedores" value={data.suppliers.length} note="Directorio ficticio" icon={Building2}/></div><section className="panel"><PanelTitle title="Órdenes de compra" subtitle="El inventario sólo aumenta al recibir mercadería" action={<button className="primary-button" onClick={openForm}><Plus size={17}/> Nueva orden</button>}/><DataTable heads={['Orden','Fecha','Proveedor','Productos','Total','Estado','Acción']} rows={data.purchases.map(purchase => [<b>{purchase.id}</b>, shortDate(purchase.date), byId(data.suppliers,purchase.supplierId)?.name, purchase.items.map(item => `${item.name} × ${item.qty}`).join(', '), money(purchase.total), <span className={statusClass(purchase.status)}>{purchase.status}</span>, ['Ordenada','Recibida parcialmente'].includes(purchase.status) ? <button className="table-action" onClick={() => receive(purchase.id)}>Recibir</button> : '—'])}/></section><section className="panel"><PanelTitle title="Directorio de proveedores" subtitle="Contactos ficticios para la demostración"/><div className="card-grid">{data.suppliers.map(supplier => <article className="contact-card" key={supplier.id}><div className="contact-icon"><Building2/></div><span className="pill ok">Activo</span><h3>{supplier.name}</h3><p>{supplier.specialty}</p><dl><dt>NIT</dt><dd>{supplier.nit}</dd><dt>Teléfono</dt><dd>{supplier.phone}</dd><dt>Correo</dt><dd>{supplier.email}</dd></dl></article>)}</div></section></>;
}

function Cash({ data, openAction, openExpense }) {
  const current = data.cashRegisters.find(register=>register.status==='Abierta');
  const cashSales = current ? data.sales.filter(sale=>sale.status==='Completada'&&sale.method==='Efectivo'&&new Date(sale.date)>=new Date(current.openedAt)).reduce((sum,sale)=>sum+sale.total,0) : 0;
  const cashExpenses = current ? data.expenses.filter(item=>item.method==='Efectivo'&&new Date(item.date)>=new Date(current.openedAt)).reduce((sum,item)=>sum+item.amount,0) : 0;
  const expected = current ? current.opening + cashSales - cashExpenses : 0;
  return <><section className={`cash-banner ${current?'open':''}`}><div className="cash-status"><span><Wallet/></span><div><small>ESTADO ACTUAL</small><h2>Caja {current?'abierta':'cerrada'}</h2><p>{current?`Desde ${dateTime(current.openedAt)} por ${current.responsible}`:'No se permiten movimientos en efectivo hasta abrir una caja.'}</p></div></div>{current?<button className="light-button" onClick={()=>openAction('close')}>Cerrar y arquear</button>:<button className="primary-button" onClick={()=>openAction('open')}>Abrir caja</button>}</section><div className="metric-grid"><Metric label="Monto inicial" value={money(current?.opening)} note="Fondo de caja" icon={Wallet}/><Metric label="Cobros en efectivo" value={money(cashSales)} note="Desde la apertura" icon={CircleDollarSign}/><Metric label="Salidas en efectivo" value={money(cashExpenses)} note="Gastos del turno" icon={ReceiptText}/><Metric label="Monto esperado" value={money(expected)} note="Inicial + entradas − salidas" icon={Landmark}/></div><section className="panel"><PanelTitle title="Gastos operativos" subtitle="Los pagos en efectivo requieren caja abierta" action={<button className="primary-button" onClick={openExpense}><Plus size={17}/> Registrar gasto</button>}/><DataTable heads={['Fecha','Concepto','Categoría','Método','Referencia','Responsable','Monto']} rows={data.expenses.map(expense=>[shortDate(expense.date),expense.concept,expense.category,expense.method,expense.reference,expense.responsible,<b>{money(expense.amount)}</b>])}/></section><section className="panel"><PanelTitle title="Historial de cierres" subtitle="Arqueos y diferencias de caja"/><DataTable heads={['Caja','Apertura','Cierre','Responsable','Inicial','Esperado','Contado','Diferencia','Estado']} rows={data.cashRegisters.map(register=>[register.id,dateTime(register.openedAt),register.closedAt?dateTime(register.closedAt):'—',register.responsible,money(register.opening),register.expected!=null?money(register.expected):'—',register.counted!=null?money(register.counted):'—',register.difference!=null?money(register.difference):'—',<span className={statusClass(register.status)}>{register.status}</span>])}/></section></>;
}

function Reports({ data }) {
  const [report, setReport] = useState('Ventas');
  const reports = {
    Ventas: { heads:['Fecha','Documento','Cliente','Vendedor','Estado','Total'], rows:data.sales.map(sale=>[shortDate(sale.date),sale.number,byId(data.clients,sale.clientId)?.name,sale.seller,sale.status,sale.total]) },
    Compras: { heads:['Fecha','Orden','Proveedor','Estado','Total'], rows:data.purchases.map(purchase=>[shortDate(purchase.date),purchase.id,byId(data.suppliers,purchase.supplierId)?.name,purchase.status,purchase.total]) },
    Inventario: { heads:['SKU','Producto','Categoría','Unidades','Costo promedio','Valor'], rows:data.products.map(product=>[product.sku,product.name,product.category,productStock(product),product.averageCost,productStock(product)*product.averageCost]) },
    Kardex: { heads:['Fecha','Tipo','Producto','Cantidad','Origen','Destino'], rows:data.movements.map(movement=>[shortDate(movement.date),movement.type,byId(data.products,movement.productId)?.name,movement.qty,movement.from||'',movement.to||'']) },
    Gastos: { heads:['Fecha','Concepto','Categoría','Método','Monto'], rows:data.expenses.map(expense=>[shortDate(expense.date),expense.concept,expense.category,expense.method,expense.amount]) },
  };
  const selected = reports[report];
  const exportCSV = () => {
    const quote = value => `"${String(value ?? '').replaceAll('"','""')}"`;
    const csv = [selected.heads.map(quote).join(','),...selected.rows.map(row=>row.map(quote).join(','))].join('\n');
    const link=document.createElement('a'); link.href=URL.createObjectURL(new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8'})); link.download=`reporte-${report.toLowerCase()}.csv`; link.click(); URL.revokeObjectURL(link.href);
  };
  return <><div className="metric-grid"><Metric label="Inventario valorizado" value={money(data.products.reduce((sum,product)=>sum+productStock(product)*product.averageCost,0))} note="Costo promedio" icon={Boxes}/><Metric label="Ventas históricas" value={money(data.sales.filter(s=>s.status==='Completada').reduce((sum,sale)=>sum+sale.total,0))} note="Sólo completadas" icon={BarChart3}/><Metric label="Gastos registrados" value={money(data.expenses.reduce((sum,item)=>sum+item.amount,0))} note="Operación demo" icon={ReceiptText}/></div><section className="panel"><PanelTitle title="Centro de reportes" subtitle="Los valores provienen de los módulos operativos" action={<button className="secondary-button" onClick={exportCSV}><Download size={17}/> Exportar CSV</button>}/><div className="tabs">{Object.keys(reports).map(name=><button className={report===name?'active':''} onClick={()=>setReport(name)} key={name}>{name}</button>)}</div><DataTable heads={selected.heads} rows={selected.rows.slice(0,50).map(row=>row.map((cell,index)=>typeof cell==='number'&&index===row.length-1?money(cell):cell))}/></section></>;
}

function FelSimulation({ data, showReceipt }) {
  const invoices = data.sales.filter(sale => sale.status === 'Completada');
  return <><div className="info-banner"><ShieldCheck/><div><strong>Simulación FEL sin conexión externa</strong><p>Estos documentos nunca se envían a SAT, no tienen UUID ni autorización tributaria real.</p></div></div><section className="panel"><PanelTitle title="Facturas FEL simuladas" subtitle={`${invoices.length} documentos demostrativos disponibles`}/><DataTable heads={['Documento','Fecha','Cliente','NIT','Total','Estado FEL','Acción']} rows={invoices.map(sale => { const client=byId(data.clients,sale.clientId); return [<b>{sale.number}</b>,dateTime(sale.date),client?.name||'Consumidor Final',client?.nit||'CF',<b>{money(sale.total)}</b>,<span className="pill neutral">NO ENVIADO A SAT</span>,<button className="table-action" onClick={()=>showReceipt(sale)}><Printer size={15}/> Ver factura</button>]; })}/></section></>;
}

function Configuration({ data, setData, reset }) {
  const [settings,setSettings]=useState(data.settings);
  const save=event=>{event.preventDefault();setData(state=>({...state,settings:{...settings,taxRate:Number(settings.taxRate)}}));};
  return <div className="settings-grid"><section className="panel"><PanelTitle title="Datos del negocio" subtitle="Información ficticia usada en comprobantes"/><form className="form-grid" onSubmit={save}><label className="field span-2">Nombre comercial<input value={settings.businessName} onChange={event=>setSettings({...settings,businessName:event.target.value})} required/></label><label className="field">NIT demostrativo<input value={settings.nit} onChange={event=>setSettings({...settings,nit:event.target.value})} required/></label><label className="field">IVA configurado (%)<input type="number" min="0" max="100" value={settings.taxRate} onChange={event=>setSettings({...settings,taxRate:event.target.value})} required/></label><label className="field span-2">Dirección ficticia<input value={settings.address} onChange={event=>setSettings({...settings,address:event.target.value})} required/></label><button className="primary-button" type="submit">Guardar configuración</button></form></section><section className="panel danger-zone"><PanelTitle title="Datos de demostración" subtitle="Persistencia local versionada en este navegador"/><p>Restablecer elimina los cambios locales y vuelve a cargar 70 productos, 60 ventas y el resto de datos semilla.</p><button className="danger-button" onClick={reset}><RotateCcw size={17}/> Restablecer datos demo</button></section></div>;
}

function Receipt({ sale, data }) {
  const client=byId(data.clients,sale.clientId);
  return <div className="receipt"><div className="receipt-demo">DOCUMENTO DE DEMOSTRACIÓN — SIN VALIDEZ FISCAL</div><div className="receipt-head"><div className="receipt-logo">D</div><div><h2>{data.settings.businessName}</h2><p>NIT: {data.settings.nit}<br/>{data.settings.address}</p></div></div><div className="receipt-meta"><span><small>DOCUMENTO</small><b>{sale.number}</b></span><span><small>FECHA</small><b>{dateTime(sale.date)}</b></span><span><small>ESTADO</small><b>{sale.status}</b></span></div><div className="receipt-client"><small>CLIENTE</small><b>{client?.name || 'Consumidor Final'}</b><span>NIT {client?.nit || 'CF'} · {client?.address || ''}</span></div><DataTable heads={['Producto','SKU','Cantidad','Precio','Total']} rows={sale.items.map(item=>[item.name,item.sku,item.qty,money(item.price),money(item.price*item.qty)])}/><div className="receipt-totals"><span>Subtotal <b>{money(sale.subtotal)}</b></span><span>Descuento <b>- {money(sale.discount)}</b></span><span>IVA <b>{money(sale.tax)}</b></span><strong>Total <b>{money(sale.total)}</b></strong><span>Método <b>{sale.method}</b></span></div><p className="receipt-foot">Comprobante ficticio. No autorizado por SAT y sin UUID, serie o autorización FEL.</p><button className="primary-button print-button" onClick={()=>window.print()}><Printer size={17}/> Imprimir comprobante</button></div>;
}

function ProductForm({ initial, save }) {
  const [values,setValues]=useState(initial||{name:'',sku:'',category:'Herramientas',unit:'unidad',brand:'',cost:'',price:'',stock:0,minStock:10});
  return <Form title={initial?'Editar producto':'Nuevo producto'} subtitle="Todos los campos corresponden a datos de demostración." submit="Guardar producto" onSubmit={()=>save(values)}><label className="field span-2">Nombre<input required value={values.name} onChange={e=>setValues({...values,name:e.target.value})}/></label><label className="field">SKU<input value={values.sku} disabled={!!initial} onChange={e=>setValues({...values,sku:e.target.value})} placeholder="Automático"/></label><label className="field">Categoría<select value={values.category} onChange={e=>setValues({...values,category:e.target.value,emoji:CATEGORIES.find(item=>item[0]===e.target.value)[1]})}>{CATEGORIES.map(([name])=><option key={name}>{name}</option>)}</select></label><label className="field">Marca<input value={values.brand} onChange={e=>setValues({...values,brand:e.target.value})}/></label><label className="field">Unidad<input value={values.unit} onChange={e=>setValues({...values,unit:e.target.value})}/></label><label className="field">Costo Q<input type="number" min="0" step=".01" required value={values.cost} onChange={e=>setValues({...values,cost:e.target.value})}/></label><label className="field">Precio Q<input type="number" min=".01" step=".01" required value={values.price} onChange={e=>setValues({...values,price:e.target.value})}/></label>{!initial&&<label className="field">Existencia inicial<input type="number" min="0" value={values.stock} onChange={e=>setValues({...values,stock:e.target.value})}/></label>}<label className="field">Stock mínimo<input type="number" min="0" value={values.minStock} onChange={e=>setValues({...values,minStock:e.target.value})}/></label></Form>;
}

function AdjustmentForm({ data, save }) {
  const [values,setValues]=useState({productId:data.products[0].id,qty:1,reason:'Conteo físico de demostración'});
  return <Form title="Ajustar existencias" subtitle="Usa cantidades positivas para entradas y negativas para salidas." submit="Registrar ajuste" onSubmit={()=>save(values)}><label className="field span-2">Producto<select value={values.productId} onChange={e=>setValues({...values,productId:e.target.value})}>{data.products.map(product=><option value={product.id} key={product.id}>{product.sku} · {product.name} ({productStock(product)})</option>)}</select></label><label className="field">Cantidad del ajuste<input type="number" step="1" value={values.qty} onChange={e=>setValues({...values,qty:e.target.value})}/></label><label className="field">Motivo<input required value={values.reason} onChange={e=>setValues({...values,reason:e.target.value})}/></label></Form>;
}

function ExpenseForm({ save }) { const [values,setValues]=useState({concept:'',category:'Servicios',amount:'',method:'Efectivo',reference:''}); return <Form title="Registrar gasto" subtitle="Este egreso afectará los reportes y el saldo operativo." submit="Guardar egreso" onSubmit={()=>save(values)}><label className="field span-2">Concepto<input required value={values.concept} onChange={e=>setValues({...values,concept:e.target.value})}/></label><label className="field">Categoría<select value={values.category} onChange={e=>setValues({...values,category:e.target.value})}>{['Alquiler','Servicios','Transporte','Mantenimiento','Administrativo','Otros'].map(item=><option key={item}>{item}</option>)}</select></label><label className="field">Monto Q<input type="number" min=".01" step=".01" required value={values.amount} onChange={e=>setValues({...values,amount:e.target.value})}/></label><label className="field">Método<select value={values.method} onChange={e=>setValues({...values,method:e.target.value})}><option>Efectivo</option><option>Transferencia</option><option>Cheque demo</option></select></label><label className="field">Referencia<input required value={values.reference} onChange={e=>setValues({...values,reference:e.target.value})}/></label></Form> }
function PurchaseForm({ data, save }) { const [values,setValues]=useState({supplierId:data.suppliers[0].id,productId:data.products[0].id,qty:1,cost:data.products[0].cost}); const choose=id=>setValues({...values,productId:id,cost:byId(data.products,id).cost}); return <Form title="Nueva orden de compra" subtitle="Crear la orden no modifica existencias." submit="Crear orden" onSubmit={()=>save(values)}><label className="field span-2">Proveedor<select value={values.supplierId} onChange={e=>setValues({...values,supplierId:e.target.value})}>{data.suppliers.map(item=><option value={item.id} key={item.id}>{item.name}</option>)}</select></label><label className="field span-2">Producto<select value={values.productId} onChange={e=>choose(e.target.value)}>{data.products.map(item=><option value={item.id} key={item.id}>{item.sku} · {item.name}</option>)}</select></label><label className="field">Cantidad<input type="number" min="1" step="1" value={values.qty} onChange={e=>setValues({...values,qty:e.target.value})}/></label><label className="field">Costo unitario Q<input type="number" min=".01" step=".01" value={values.cost} onChange={e=>setValues({...values,cost:e.target.value})}/></label></Form> }
function CashForm({ action, data, save }) { const current=data.cashRegisters.find(item=>item.status==='Abierta'); const sales=current?data.sales.filter(sale=>sale.status==='Completada'&&sale.method==='Efectivo'&&new Date(sale.date)>=new Date(current.openedAt)).reduce((sum,sale)=>sum+sale.total,0):0; const expenses=current?data.expenses.filter(item=>item.method==='Efectivo'&&new Date(item.date)>=new Date(current.openedAt)).reduce((sum,item)=>sum+item.amount,0):0; const expected=current?current.opening+sales-expenses:0; const [amount,setAmount]=useState(action==='open'?500:expected); return <Form title={action==='open'?'Abrir caja':'Cerrar y arquear caja'} subtitle={action==='open'?'Habilita cobros en efectivo.':`Monto esperado: ${money(expected)}`} submit={action==='open'?'Abrir caja':'Registrar cierre'} onSubmit={()=>save({amount,expected})}><label className="field span-2">{action==='open'?'Monto inicial Q':'Monto contado Q'}<input type="number" min="0" step=".01" required value={amount} onChange={e=>setAmount(e.target.value)}/></label></Form> }

function updateCash(state, action, values) {
  const open=state.cashRegisters.find(item=>item.status==='Abierta'); const amount=Number(values.amount);
  if (!(amount>=0)) throw new Error('Ingresa un monto válido.');
  if (action==='open') { if(open) throw new Error('Ya existe una caja abierta.'); return {...state,cashRegisters:[{id:`CAJA-${Date.now()}`,openedAt:new Date().toISOString(),opening:amount,status:'Abierta',responsible:'Andrea Díaz'},...state.cashRegisters]}; }
  if(!open) throw new Error('No existe una caja abierta.');
  return {...state,cashRegisters:state.cashRegisters.map(item=>item.id===open.id?{...item,closedAt:new Date().toISOString(),expected:Number(values.expected),counted:amount,difference:Math.round((amount-Number(values.expected))*100)/100,status:'Cerrada'}:item)};
}

function Modal({ children, close }) { return <div className="modal-backdrop" onMouseDown={close}><div className="modal" onMouseDown={event=>event.stopPropagation()}><button className="modal-close" onClick={close} aria-label="Cerrar"><X/></button>{children}</div></div> }
function Form({ title, subtitle, submit, onSubmit, children }) { return <form onSubmit={event=>{event.preventDefault();onSubmit();}}><div className="modal-title"><h2>{title}</h2><p>{subtitle}</p></div><div className="form-grid">{children}</div><button className="primary-button wide form-submit" type="submit">{submit}</button></form> }
function Metric({ label, value, note, icon: Icon }) { return <div className="metric"><div className="metric-icon"><Icon size={20}/></div><span>{label}</span><strong>{value}</strong><small>{note}</small></div> }
function PanelTitle({ title, subtitle, action }) { return <div className="panel-title"><div><h2>{title}</h2>{subtitle&&<p>{subtitle}</p>}</div>{action}</div> }
function Empty({ icon: Icon, text }) { return <div className="empty"><Icon/><p>{text}</p></div> }
function SearchInput({ value, setValue, placeholder }) { return <div className="mini-search"><Search size={16}/><input value={value} onChange={event=>setValue(event.target.value)} placeholder={placeholder}/></div> }
function DataTable({ heads, rows }) { return <div className="table-wrap"><table><thead><tr>{heads.map(head=><th key={head}>{head}</th>)}</tr></thead><tbody>{rows.length?rows.map((row,index)=><tr key={index}>{row.map((cell,cellIndex)=><td key={cellIndex}>{cell ?? '—'}</td>)}</tr>):<tr><td colSpan={heads.length}><Empty icon={ClipboardList} text="No hay registros que mostrar."/></td></tr>}</tbody></table></div> }
function Pagination({ page, pages, setPage }) { if(pages<=1)return null; return <div className="pagination"><button disabled={!page} onClick={()=>setPage(page-1)}><ChevronLeft size={16}/></button><span>Página {page+1} de {pages}</span><button disabled={page>=pages-1} onClick={()=>setPage(page+1)}><ChevronRight size={16}/></button></div> }

createRoot(document.getElementById('root')).render(<App />);
