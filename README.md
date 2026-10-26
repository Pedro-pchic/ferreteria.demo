# FerreERP Demo — DEVSYSGT

Prototipo comercial de un ERP para una ferretería guatemalteca, creado con React y Vite. Funciona enteramente en el navegador y está preparado para GitHub Pages.

> Todo el contenido es ficticio. No procesa pagos, no se conecta con SAT/FEL, bancos ni servicios privados, y no implementa autenticación real.

## Módulos disponibles

- Dashboard con indicadores calculados desde las operaciones.
- Punto de venta con catálogo, categorías, carrito, descuentos, IVA y validación de stock.
- Historial de ventas y comprobantes imprimibles marcados como demostración.
- Productos, inventario de una sola bodega, ajustes y kardex.
- Órdenes de compra, recepción de mercadería y directorio de proveedores.
- Caja, arqueos y gastos operativos relacionados con los reportes.
- Reportes exportables a CSV y configuración del negocio.
- Simulación FEL imprimible, siempre marcada como documento sin validez fiscal y sin conexión a SAT.
- Datos semilla versionados y persistencia en `localStorage`.

## Ejecutar localmente

Requiere Node.js 20 o superior.

```bash
npm ci
npm run dev
```

Vite mostrará la URL local, normalmente `http://localhost:5173`.

## Verificar antes de publicar

```bash
npm test
npm run build
npm run preview
```

El build estático se genera en `dist/`. La configuración `base: './'` permite que los recursos funcionen tanto en un dominio raíz como bajo `/nombre-del-repositorio/`.

## Publicar en GitHub Pages

1. Inicializa Git y crea el primer commit si este directorio aún no es un repositorio:

   ```bash
   git init
   git add .
   git commit -m "Preparar demo FerreERP para GitHub Pages"
   git branch -M master
   ```

2. Crea un repositorio vacío en GitHub y conecta el remoto:

   ```bash
   git remote add origin https://github.com/TU-USUARIO/ferreerp-demo.git
   git push -u origin master
   ```

3. En GitHub abre **Settings → Pages** y selecciona **GitHub Actions** como fuente.
4. El workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) instala con `npm ci`, genera `dist/` y publica el sitio.
5. La URL será `https://TU-USUARIO.github.io/ferreerp-demo/` cuando finalice la acción.

También puede iniciarse manualmente desde **Actions → Deploy GitHub Pages → Run workflow**.

## Persistencia y restablecimiento

Los cambios se guardan sólo en el navegador actual. Desde **Configuración → Restablecer datos demo** se puede volver al conjunto inicial. Al cambiar la versión del esquema, el prototipo vuelve a generar datos compatibles.

## Límites deliberados

- Sin backend, créditos, multiusuario real, seguridad, respaldo remoto o sincronización entre dispositivos.
- Sin autorización fiscal, FEL, UUID reales, pasarela de pago ni datos sensibles.
- La impresión usa el diálogo del navegador; allí puede elegirse “Guardar como PDF”.
