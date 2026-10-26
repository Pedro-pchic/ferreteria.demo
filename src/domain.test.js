import test from 'node:test';
import assert from 'node:assert/strict';
import { createSeedData, WAREHOUSES } from './data.js';
import { addExpense, adjustStock, completeSale, productStock, receivePurchase } from './domain.js';

test('el alcance utiliza una sola bodega', () => {
  const state = createSeedData();
  assert.equal(WAREHOUSES.length, 1);
  assert.ok(state.products.every(product => Object.keys(product.stockByWarehouse).join() === 'WH-01'));
});

test('una venta descuenta stock y registra movimiento de forma atómica', () => {
  const state = createSeedData();
  const product = state.products.find(item => item.stockByWarehouse['WH-01'] > 2);
  const before = productStock(product);
  const { state: next, sale } = completeSale(state, { items: [{ productId: product.id, qty: 2 }], clientId: state.clients[0].id, method: 'Efectivo' });
  assert.equal(productStock(next.products.find(item => item.id === product.id)), before - 2);
  assert.equal(next.movements[0].reason, sale.number);
  assert.equal(next.sales[0].id, sale.id);
});

test('un ajuste nunca permite existencias negativas', () => {
  const state = createSeedData();
  const product = state.products.find(item => productStock(item) >= 5);
  const before = productStock(product);
  const next = adjustStock(state, { productId: product.id, qty: -5, reason: 'Conteo físico' });
  assert.equal(productStock(next.products.find(item => item.id === product.id)), before - 5);
  assert.throws(() => adjustStock(state, { productId: product.id, qty: -(before + 1), reason: 'Conteo físico' }), /negativas/);
});

test('recibir una compra aumenta stock una sola vez', () => {
  const state = createSeedData();
  const purchase = state.purchases.find(item => item.status === 'Ordenada');
  const before = productStock(state.products.find(item => item.id === purchase.items[0].productId));
  const next = receivePurchase(state, purchase.id);
  assert.equal(productStock(next.products.find(item => item.id === purchase.items[0].productId)), before + purchase.items[0].qty);
  assert.throws(() => receivePurchase(next, purchase.id), /no está disponible/);
});

test('un gasto en efectivo requiere caja abierta', () => {
  const state = createSeedData();
  const closed = { ...state, cashRegisters: state.cashRegisters.map(register => ({ ...register, status: 'Cerrada' })) };
  assert.throws(() => addExpense(closed, { concept: 'Prueba', amount: 25, method: 'Efectivo' }), /Abre una caja/);
  assert.equal(addExpense(state, { concept: 'Prueba', amount: 25, method: 'Efectivo' }).expenses[0].amount, 25);
});

test('los saldos semilla del kardex coinciden con las existencias', () => {
  const state = createSeedData();
  for (const product of state.products) {
    const balance = state.movements.filter(movement => movement.productId === product.id).reduce((sum, movement) => {
      if (movement.type === 'Salida por venta' || movement.type === 'Ajuste de salida') return sum - movement.qty;
      return sum + movement.qty;
    }, 0);
    assert.equal(balance, productStock(product), product.sku);
  }
});
