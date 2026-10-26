import { createSeedData, STORE_VERSION } from './data.js';

export const STORAGE_KEY = 'devsysgt_ferreerp_demo_v3';
export const round = number => Math.round((Number(number) + Number.EPSILON) * 100) / 100;
export const productStock = product => Object.values(product.stockByWarehouse || {}).reduce((sum, qty) => sum + Number(qty || 0), 0);

export function loadState(storage = window.localStorage) {
  try {
    const saved = JSON.parse(storage.getItem(STORAGE_KEY));
    return saved?.version === STORE_VERSION ? saved : createSeedData();
  } catch {
    return createSeedData();
  }
}

export function persistState(state, storage = window.localStorage) {
  storage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function completeSale(state, order) {
  if (!order.items?.length) throw new Error('Agrega al menos un producto.');
  const openRegister = state.cashRegisters.find(register => register.status === 'Abierta');
  if (order.method === 'Efectivo' && !openRegister) throw new Error('Abre una caja antes de cobrar en efectivo.');
  const items = order.items.map(line => {
    const product = state.products.find(item => item.id === line.productId && item.active);
    if (!product) throw new Error('Uno de los productos ya no está disponible.');
    const stock = Number(product.stockByWarehouse['WH-01'] || 0);
    if (line.qty < 1 || line.qty > stock) throw new Error(`Stock insuficiente de ${product.name}.`);
    return { productId: product.id, name: product.name, sku: product.sku, qty: line.qty, price: product.price, cost: product.cost };
  });
  const subtotal = round(items.reduce((sum, item) => sum + item.price * item.qty, 0));
  const discount = round(Math.min(subtotal, Math.max(0, Number(order.discount || 0))));
  const tax = round((subtotal - discount) * Number(state.settings.taxRate || 0) / 100);
  const now = new Date().toISOString();
  const sequence = Math.max(0, ...state.sales.map(sale => Number(sale.number?.replace(/\D/g, '')) || 0)) + 1;
  const sale = {
    id: `V-${Date.now()}`, number: `DEMO-${String(sequence).padStart(6, '0')}`, date: now,
    clientId: order.clientId, seller: order.seller || 'Andrea Díaz', method: order.method,
    status: 'Completada', items, subtotal, discount, tax, total: round(subtotal - discount + tax),
  };
  const products = state.products.map(product => {
    const line = items.find(item => item.productId === product.id);
    return line ? { ...product, stockByWarehouse: { 'WH-01': product.stockByWarehouse['WH-01'] - line.qty } } : product;
  });
  const movements = items.map((item, index) => ({
    id: `MOV-${Date.now()}-${index}`, date: now, productId: item.productId, type: 'Salida por venta', qty: item.qty,
    from: 'WH-01', responsible: sale.seller, reason: sale.number,
  }));
  return { state: { ...state, products, sales: [sale, ...state.sales], movements: [...movements, ...state.movements] }, sale };
}

export function adjustStock(state, { productId, qty, reason, responsible = 'Andrea Díaz' }) {
  const amount = Number(qty);
  if (!productId || !Number.isInteger(amount) || amount === 0 || !reason?.trim()) throw new Error('Completa un ajuste válido.');
  const product = state.products.find(item => item.id === productId);
  const current = Number(product?.stockByWarehouse['WH-01'] || 0);
  if (!product || current + amount < 0) throw new Error('El ajuste dejaría existencias negativas.');
  const products = state.products.map(item => item.id === productId ? { ...item, stockByWarehouse: { 'WH-01': current + amount } } : item);
  const movement = { id: `MOV-${Date.now()}`, date: new Date().toISOString(), productId, type: amount > 0 ? 'Ajuste de entrada' : 'Ajuste de salida', qty: Math.abs(amount), to: amount > 0 ? 'WH-01' : undefined, from: amount < 0 ? 'WH-01' : undefined, responsible, reason: reason.trim() };
  return { ...state, products, movements: [movement, ...state.movements] };
}

export function receivePurchase(state, purchaseId) {
  const purchase = state.purchases.find(item => item.id === purchaseId);
  if (!purchase || !['Ordenada', 'Recibida parcialmente'].includes(purchase.status)) throw new Error('Esta orden no está disponible para recepción.');
  const now = new Date().toISOString();
  const products = state.products.map(product => {
    const line = purchase.items.find(item => item.productId === product.id);
    return line ? { ...product, averageCost: round((product.averageCost + line.cost) / 2), stockByWarehouse: { ...product.stockByWarehouse, 'WH-01': Number(product.stockByWarehouse['WH-01'] || 0) + line.qty } } : product;
  });
  const movements = purchase.items.map((item, index) => ({ id: `MOV-${Date.now()}-${index}`, date: now, productId: item.productId, type: 'Entrada por compra', qty: item.qty, to: 'WH-01', responsible: 'Andrea Díaz', reason: purchase.id }));
  return { ...state, products, movements: [...movements, ...state.movements], purchases: state.purchases.map(item => item.id === purchaseId ? { ...item, status: 'Recibida', receivedAt: now } : item) };
}

export function addExpense(state, expense) {
  const amount = Number(expense.amount);
  if (!expense.concept?.trim() || !(amount > 0)) throw new Error('Ingresa un concepto y monto válidos.');
  if (expense.method === 'Efectivo' && !state.cashRegisters.some(register => register.status === 'Abierta')) throw new Error('Abre una caja antes de registrar un gasto en efectivo.');
  return { ...state, expenses: [{ id: `EGR-${Date.now()}`, date: new Date().toISOString(), ...expense, amount, responsible: 'Andrea Díaz' }, ...state.expenses] };
}

export function addProduct(state, input) {
  if (!input.name?.trim() || !(Number(input.price) > 0)) throw new Error('Ingresa nombre y precio válidos.');
  const id = `PRD-${Date.now()}`;
  const initial = Math.max(0, Number(input.stock || 0));
  const product = { id, sku: input.sku?.trim() || `FER-${String(Date.now()).slice(-5)}`, barcode: `7401${String(Date.now()).slice(-9)}`, name: input.name.trim(), description: input.description || 'Producto agregado en modo demostración.', category: input.category, unit: input.unit || 'unidad', brand: input.brand || 'Sin marca', supplierId: state.suppliers[0].id, cost: round(Number(input.cost || Number(input.price) * .7)), price: round(Number(input.price)), averageCost: round(Number(input.cost || Number(input.price) * .7)), minStock: Number(input.minStock || 10), maxStock: Number(input.maxStock || 100), active: true, emoji: input.emoji || '🧰', stockByWarehouse: { 'WH-01': initial } };
  const movement = { id: `MOV-${Date.now()}`, date: new Date().toISOString(), productId: id, type: 'Saldo inicial', qty: initial, to: 'WH-01', responsible: 'Andrea Díaz', reason: 'Alta de producto' };
  return { ...state, products: [product, ...state.products], movements: [movement, ...state.movements] };
}
