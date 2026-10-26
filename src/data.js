export const STORE_VERSION = 3;

export const CATEGORIES = [
  ['Herramientas', '🔨'], ['Tornillería', '🔩'], ['Electricidad', '⚡'],
  ['Plomería', '💧'], ['Pinturas', '🎨'], ['Construcción', '🧱'],
  ['Cerraduras', '🔐'], ['Accesorios', '🧰'], ['Maquinaria', '⚙️'], ['Seguridad', '🪖'],
];

export const WAREHOUSES = [
  { id: 'WH-01', name: 'Bodega principal' },
];

const PRODUCT_NAMES = [
  ['Martillo de uña 16 oz','Herramientas','unidad'],['Alicate universal 8 pulgadas','Herramientas','unidad'],['Destornillador Phillips #2','Herramientas','unidad'],['Juego de llaves combinadas','Herramientas','juego'],['Cinta métrica 5 metros','Herramientas','unidad'],['Serrucho profesional 20 pulgadas','Herramientas','unidad'],['Nivel de aluminio 24 pulgadas','Herramientas','unidad'],
  ['Tornillo para madera 2 pulgadas','Tornillería','caja'],['Tornillo autorroscante 1 pulgada','Tornillería','caja'],['Clavo de acero 2 pulgadas','Tornillería','libra'],['Perno hexagonal 3/8','Tornillería','docena'],['Tuerca galvanizada 1/2','Tornillería','docena'],['Arandela plana 3/8','Tornillería','ciento'],['Anclaje expansivo 1/4','Tornillería','docena'],
  ['Cable THHN calibre 12','Electricidad','metro'],['Interruptor sencillo blanco','Electricidad','unidad'],['Tomacorriente doble polarizado','Electricidad','unidad'],['Bombilla LED 12W luz fría','Electricidad','unidad'],['Cinta aislante profesional','Electricidad','rollo'],['Tubo conduit PVC 3/4','Electricidad','unidad'],['Centro de carga 8 circuitos','Electricidad','unidad'],
  ['Tubo PVC 1/2 pulgada','Plomería','unidad'],['Codo PVC 1/2 pulgada','Plomería','unidad'],['Pegamento PVC 1/4 galón','Plomería','unidad'],['Llave de paso 1/2 pulgada','Plomería','unidad'],['Grifo cromado para lavamanos','Plomería','unidad'],['Manguera reforzada 1/2','Plomería','metro'],['Sifón flexible universal','Plomería','unidad'],
  ['Pintura látex blanca','Pinturas','galón'],['Pintura anticorrosiva roja','Pinturas','galón'],['Esmalte sintético negro','Pinturas','cuarto'],['Rodillo profesional 9 pulgadas','Pinturas','unidad'],['Brocha cerda mixta 3 pulgadas','Pinturas','unidad'],['Bandeja plástica para pintura','Pinturas','unidad'],['Thinner multipropósito','Pinturas','galón'],
  ['Cemento gris 42.5 kg','Construcción','saco'],['Cal hidratada 20 kg','Construcción','saco'],['Block de concreto 14 cm','Construcción','unidad'],['Varilla corrugada 3/8','Construcción','unidad'],['Arena de río cernida','Construcción','metro³'],['Lámina galvanizada 10 pies','Construcción','unidad'],['Adhesivo cerámico 20 kg','Construcción','saco'],
  ['Cerradura de pomo dormitorio','Cerraduras','unidad'],['Cerradura de sobreponer','Cerraduras','unidad'],['Candado laminado 50 mm','Cerraduras','unidad'],['Pasador de seguridad 4 pulgadas','Cerraduras','unidad'],['Bisagra reforzada 3 pulgadas','Cerraduras','par'],['Cilindro europeo llave-mariposa','Cerraduras','unidad'],['Cerrojo de seguridad doble','Cerraduras','unidad'],
  ['Silicón transparente 280 ml','Accesorios','unidad'],['Cinta de teflón 1/2','Accesorios','rollo'],['Lija para madera grano 120','Accesorios','pliego'],['Disco de corte 4.5 pulgadas','Accesorios','unidad'],['Extensión eléctrica 10 metros','Accesorios','unidad'],['Escalera aluminio 6 peldaños','Accesorios','unidad'],['Carretilla reforzada 5 pies³','Accesorios','unidad'],
  ['Taladro percutor 650W','Maquinaria','unidad'],['Pulidora angular 4.5 pulgadas','Maquinaria','unidad'],['Sierra circular 7.25 pulgadas','Maquinaria','unidad'],['Compresor de aire 24 litros','Maquinaria','unidad'],['Hidrolavadora 1600 PSI','Maquinaria','unidad'],['Soldadora inverter 200A','Maquinaria','unidad'],['Generador gasolina 3000W','Maquinaria','unidad'],
  ['Guantes de cuero reforzado','Seguridad','par'],['Lentes transparentes de seguridad','Seguridad','unidad'],['Casco industrial con ajuste','Seguridad','unidad'],['Mascarilla para polvo N95','Seguridad','unidad'],['Chaleco reflectivo naranja','Seguridad','unidad'],['Botas PVC talla surtida','Seguridad','par'],['Protector auditivo tipo copa','Seguridad','unidad'],
];

const SUPPLIER_NAMES = [
  ['Distribuidora La Ceiba, S.A.','Herramientas y maquinaria'], ['Materiales del Norte','Construcción'],
  ['ElectroCentro Guatemala','Electricidad'], ['Tubotec, S.A.','Plomería'],
  ['Pinturas Chapinas','Pinturas'], ['Herrajes Modernos','Cerraduras'],
  ['Suministros El Quetzal','Accesorios'], ['Protección Industrial GT','Seguridad'],
];

const CLIENT_NAMES = [
  'Constructora Los Altos','María Fernanda López','Carlos Méndez','Arquitectura del Valle','José Ramírez',
  'Servicios Integrales Xela','Ana Lucía García','Obras Civiles Tecún','Luis Fernando Pérez','Inversiones Atitlán',
  'Marta Julia Hernández','Edifica Guatemala','Pedro Choc','Taller El Esfuerzo','Sofía Castillo',
  'Proyectos San Marcos','Diego Alvarado','Mantenimiento del Sur','Rosa Caal','Constructora Iximché',
  'Jorge Morales','Diseños del Bosque','Carmen Sosa','Multiservicios La Reforma','Consumidor Final',
];

const round = number => Math.round(number * 100) / 100;
const dateDaysAgo = days => {
  const date = new Date();
  date.setHours(9 + (days % 8), (days * 7) % 60, 0, 0);
  date.setDate(date.getDate() - days);
  return date.toISOString();
};

function seedProducts() {
  return PRODUCT_NAMES.map(([name, category, unit], index) => {
    const price = round(6.5 + ((index * 37) % 590) + (index % 3) * .5);
    let stock = 18 + ((index * 17) % 105);
    if (index % 23 === 0) stock = 0;
    else if (index % 11 === 0) stock = 4;
    return {
      id: `PRD-${String(index + 1).padStart(3, '0')}`,
      sku: `FER-${String(index + 1).padStart(3, '0')}`,
      barcode: `7401000${String(index + 1).padStart(5, '0')}`,
      name, description: `${name}, seleccionado para uso profesional y doméstico.`, category, unit,
      brand: ['Truper','Pretul','Bosch','Surtek','Cemex','Volteck','Foset'][index % 7],
      supplierId: `SUP-${String((index % 8) + 1).padStart(2, '0')}`,
      cost: round(price * (.64 + (index % 4) * .03)), price, averageCost: round(price * .67),
      minStock: 10 + (index % 5) * 3, maxStock: 160 + (index % 4) * 20,
      active: true, emoji: CATEGORIES.find(([categoryName]) => categoryName === category)[1],
      stockByWarehouse: { 'WH-01': stock },
    };
  });
}

function seedSuppliers() {
  return SUPPLIER_NAMES.map(([name, specialty], index) => ({
    id: `SUP-${String(index + 1).padStart(2, '0')}`, name, specialty,
    nit: `548${index + 2}91-${(index % 8) + 1}`, phone: `+502 22${40 + index}-10${20 + index}`,
    email: `ventas${index + 1}@proveedor-demo.gt`, address: `${index + 1}a avenida ${4 + index}-${10 + index}, Guatemala`, active: true,
  }));
}

function seedClients() {
  return CLIENT_NAMES.map((name, index) => ({
    id: `CLI-${String(index + 1).padStart(3, '0')}`, name,
    nit: index === 24 ? 'CF' : `${2780 + index * 113}${(index % 9) + 1}-${(index % 8) + 1}`,
    phone: `+502 ${4100 + index * 17}-${6200 + index * 11}`,
    address: `${(index % 12) + 1}a calle ${(index % 8) + 2}-${10 + index}, Guatemala`,
    active: true,
  }));
}

function seedSales(products, clients) {
  return Array.from({ length: 60 }, (_, index) => {
    const itemCount = 1 + (index % 3);
    const items = Array.from({ length: itemCount }, (_, itemIndex) => {
      const product = products[(index * 7 + itemIndex * 13) % products.length];
      const qty = 1 + ((index + itemIndex) % 4);
      return { productId: product.id, name: product.name, sku: product.sku, qty, price: product.price, cost: product.cost };
    });
    const subtotal = round(items.reduce((sum, item) => sum + item.qty * item.price, 0));
    const discount = index % 9 === 0 ? round(subtotal * .05) : 0;
    const tax = round((subtotal - discount) * .12);
    const status = index % 19 === 0 ? 'Anulada' : index % 13 === 0 ? 'Pendiente' : index % 29 === 0 ? 'Devuelta' : 'Completada';
    return {
      id: `V-${String(1060 - index).padStart(5, '0')}`, number: `DEMO-${String(1060 - index).padStart(6, '0')}`,
      date: dateDaysAgo(index), clientId: clients[(index * 3) % clients.length].id,
      seller: ['Andrea Díaz','Marco Castillo','Sofía Pérez'][index % 3],
      method: ['Efectivo','Tarjeta (demo)','Transferencia'][index % 3],
      status, items, subtotal, discount, tax, total: round(subtotal - discount + tax),
    };
  });
}

function seedPurchases(products, suppliers) {
  const eligible = products.filter(product => product.stockByWarehouse['WH-01'] > 8);
  return Array.from({ length: 20 }, (_, index) => {
    const product = eligible[(index * 5) % eligible.length];
    const qty = 2 + (index % 4);
    const status = index < 11 ? 'Recibida' : index < 14 ? 'Recibida parcialmente' : index < 18 ? 'Ordenada' : index === 18 ? 'Borrador' : 'Cancelada';
    return {
      id: `OC-${String(2020 - index).padStart(5, '0')}`, date: dateDaysAgo(4 + index * 3),
      supplierId: suppliers[index % suppliers.length].id, status,
      items: [{ productId: product.id, name: product.name, qty, cost: product.cost }],
      total: round(qty * product.cost), paid: index % 3 === 0,
    };
  });
}

function seedExpenses() {
  const concepts = [
    ['Alquiler del local','Alquiler'],['Servicio de energía eléctrica','Servicios'],['Servicio de agua','Servicios'],
    ['Internet empresarial','Servicios'],['Flete de mercadería','Transporte'],['Mantenimiento de equipo','Mantenimiento'],
    ['Papelería y útiles','Administrativo'],['Publicidad local','Mercadeo'],['Limpieza del local','Mantenimiento'],
  ];
  return Array.from({ length: 25 }, (_, index) => {
    const [concept, category] = concepts[index % concepts.length];
    return { id: `EGR-${String(5001 + index).padStart(5, '0')}`, date: dateDaysAgo(index * 2), concept, category,
      amount: round(90 + ((index * 211) % 2100)), method: ['Efectivo','Transferencia','Cheque demo'][index % 3],
      reference: `REF-DEMO-${700 + index}`, responsible: ['Andrea Díaz','Marco Castillo'][index % 2] };
  });
}

function seedMovements(products, sales, purchases) {
  const sold = Object.fromEntries(products.map(product => [product.id, 0]));
  sales.filter(sale => sale.status === 'Completada').forEach(sale => sale.items.forEach(item => { sold[item.productId] += item.qty; }));
  const received = Object.fromEntries(products.map(product => [product.id, 0]));
  purchases.filter(purchase => purchase.status.startsWith('Recibida')).forEach(purchase => purchase.items.forEach(item => { received[item.productId] += item.qty; }));
  const openings = products.map(product => (
    { id: `MOV-INI-${product.id}`, date: dateDaysAgo(100), productId: product.id, type: 'Saldo inicial', qty: product.stockByWarehouse['WH-01'] + sold[product.id] - received[product.id], to: 'WH-01', responsible: 'Sistema', reason: 'Carga inicial demostrativa' }
  ));
  const saleMovements = sales.filter(sale => sale.status === 'Completada').flatMap(sale => sale.items.map((item, itemIndex) => ({
    id: `MOV-${sale.id}-${itemIndex}`, date: sale.date, productId: item.productId, type: 'Salida por venta', qty: item.qty,
    from: 'WH-01', responsible: sale.seller, reason: sale.number,
  })));
  const purchaseMovements = purchases.filter(purchase => purchase.status.startsWith('Recibida')).flatMap(purchase => purchase.items.map((item, itemIndex) => ({
    id: `MOV-${purchase.id}-${itemIndex}`, date: purchase.date, productId: item.productId, type: 'Entrada por compra', qty: item.qty,
    to: 'WH-01', responsible: 'Andrea Díaz', reason: purchase.id,
  })));
  return [...saleMovements, ...purchaseMovements, ...openings].sort((a, b) => new Date(b.date) - new Date(a.date));
}

export function createSeedData() {
  const products = seedProducts();
  const suppliers = seedSuppliers();
  const clients = seedClients();
  const sales = seedSales(products, clients);
  const purchases = seedPurchases(products, suppliers);
  return {
    version: STORE_VERSION, products, suppliers, clients, sales, purchases,
    expenses: seedExpenses(), movements: seedMovements(products, sales, purchases),
    cashRegisters: [
      { id: 'CAJA-004', openedAt: dateDaysAgo(0), opening: 600, status: 'Abierta', responsible: 'Andrea Díaz' },
      { id: 'CAJA-003', openedAt: dateDaysAgo(1), closedAt: dateDaysAgo(1), opening: 500, expected: 4380.50, counted: 4375, difference: -5.50, status: 'Cerrada', responsible: 'Marco Castillo' },
      { id: 'CAJA-002', openedAt: dateDaysAgo(2), closedAt: dateDaysAgo(2), opening: 500, expected: 5212.20, counted: 5212.20, difference: 0, status: 'Cerrada', responsible: 'Andrea Díaz' },
    ],
    settings: { businessName: 'Ferretería El Constructor — Demo DEVSYSGT', nit: '1234567-8 (ficticio)', address: 'Zona 1, Ciudad de Guatemala (dirección ficticia)', taxRate: 12 },
  };
}
