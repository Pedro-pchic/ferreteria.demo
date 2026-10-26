# CODEX — ALCANCE DEFINITIVO DE FERREERP

Modificar el prototipo actual de DEVSYSGT FerreERP desarrollado con React + Vite.

El sistema será una demostración comercial para una ferretería física en Guatemala y se publicará en GitHub Pages.

## Módulos definitivos

1. Dashboard.
2. Punto de venta (POS).
3. Productos e inventario.
4. Control de stock.
5. Historial de ventas.
6. Compras y proveedores.
7. Caja y gastos.
8. Reportes.
9. Facturación FEL simulada.
10. Configuración.

No implementar módulos adicionales fuera de este alcance.

## Requisitos principales

- Mantener el diseño actual de DEVSYSGT, mejorando el punto de venta con un catálogo visual de productos y carrito lateral.
- Agregar datos ficticios coherentes a todos los módulos.
- Permitir registrar ventas de demostración.
- Descontar el inventario al registrar una venta.
- Actualizar las existencias cuando se reciba una compra.
- Registrar ingresos por ventas cobradas y gastos de operación.
- Mostrar reportes relacionados con las operaciones.
- Permitir consultar el historial de ventas y generar tickets imprimibles.
- Incluir un módulo de simulación FEL que permita visualizar e imprimir facturas ficticias.
- La simulación FEL no debe conectarse a SAT ni utilizar autorizaciones tributarias reales.
- Identificar las facturas como "DOCUMENTO DE DEMOSTRACIÓN — SIN VALIDEZ FISCAL".
- Mantener una sola bodega.
- Utilizar moneda GTQ.
- Guardar las operaciones en almacenamiento local del navegador.
- Incluir un botón para restaurar los datos de demostración.
- Garantizar compatibilidad con GitHub Pages.

## Fuera del alcance

No implementar créditos, límites de crédito, contabilidad avanzada, pasarela de pagos en línea, facturación FEL real, múltiples sucursales, nómina ni módulos financieros empresariales complejos.

## Validaciones

Todas las secciones deben tener contenido funcional, datos ficticios y botones operativos.

Las ventas, compras, existencias, caja y reportes deben mantener información consistente.

Revisar el proyecto existente antes de modificarlo. Conservar los componentes funcionales y ejecutar las pruebas y el build de producción.

El objetivo es un sistema sencillo, atractivo y convincente para demostraciones comerciales, no un ERP empresarial completo.