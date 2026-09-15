# Cuentas Claras

PWA para sacar cuentas de un negocio de venta de productos por libra, kilo, gramo o unidad (verduras, frutas, etc.). Hecha con React + TypeScript, Zustand, Tailwind, pnpm, y Firebase (Auth con Google + Firestore).

## Qué incluye

- **Conversión automática de precios**: registras un producto con un precio en la unidad que uses (kg, libra, gramo o unidad) y la app calcula el equivalente en las demás unidades de peso al instante. Por convención se usa **1 libra = 500 g** (uso comercial colombiano); si prefieres la libra imperial (453.592 g) cambia `DEFAULT_GRAMS_PER_LB` en `src/lib/units.ts` o expón el toggle que ya existe en `src/store/settingsStore.ts`.
- **Productos**: nombre, foto (se comprime a ~320px antes de guardar) o ícono/emoji, precio, unidad, y stock.
- **Calculadora**: elige producto → cantidad → unidad → "Calcular" muestra el total; "Guardar como compra" lo registra en el historial, descuenta del inventario y suma al contador de uso del producto.
- **Buscador** con autocompletado (filtra mientras escribes) y búsquedas recientes guardadas en el dispositivo.
- **Orden por más usados**: la cuadrícula de productos se ordena por defecto por `usageCount` descendente.
- **Inventarios múltiples**: cada usuario puede crear varios inventarios (ej. "Mi negocio", "Mi casa"), cada uno con sus propios productos, stock y compras. Se cambia desde el selector en el encabezado.
- **Historial** de compras agrupado por día, con total acumulado.
- **PWA**: instalable, funciona offline gracias al caché local de Firestore y al service worker generado por `vite-plugin-pwa`.

## Estructura

```
src/
  types.ts                Modelos: Inventory, Product, Purchase
  firebase.ts              Inicialización de Firebase (Auth + Firestore con caché offline)
  lib/
    units.ts                Conversión g / kg / libra / unidad y cálculo de totales
    format.ts                Formato de moneda (COP) y números
    image.ts                  Compresión de fotos subidas a data URL
  store/                       Zustand: auth, settings, inventories, products, purchases, search
  components/                  UI: login, selector de inventario, buscador, tarjetas de producto,
                                formulario de producto, panel calculadora, historial
  App.tsx                      Layout: encabezado, pestañas Calcular/Historial, modales
```

## Configurar Firebase

1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com/).
2. **Authentication** → Sign-in method → habilita **Google**.
3. **Firestore Database** → créala en modo producción (las reglas ya vienen restringidas, ver abajo).
4. Ve a *Configuración del proyecto* → *Tus apps* → agrega una app web, copia sus credenciales.
5. Copia `.env.example` a `.env.local` y pega tus credenciales:

   ```bash
   cp .env.example .env.local
   ```

   ```
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   ```

6. Despliega las reglas de seguridad incluidas en `firestore.rules` (limitan cada documento al usuario dueño):

   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init firestore   # selecciona tu proyecto, usa el firestore.rules existente
   firebase deploy --only firestore:rules
   ```

   O simplemente pega el contenido de `firestore.rules` en Firestore → Reglas, desde la consola web.

## Desarrollo

Requiere [pnpm](https://pnpm.io/).

```bash
pnpm install
pnpm dev        # servidor local con recarga en caliente
pnpm build      # build de producción a dist/ (incluye el service worker de la PWA)
pnpm preview    # sirve el build de producción localmente
```

## Notas de diseño

- Las fotos de producto se guardan como data URL comprimidas directamente en el documento de Firestore (no se usa Firebase Storage), para mantener la configuración simple. Si vas a subir muchas fotos grandes, considera migrar a Firebase Storage más adelante.
- El stock siempre se guarda en gramos para productos de peso (así se puede mostrar en kg, libra o gramo sin perder precisión); para productos por unidad se guarda como conteo simple.
- Al instalar la PWA en el celular (Android: menú ⋮ → "Instalar app"; iPhone: compartir → "Agregar a inicio"), funciona a pantalla completa y sigue funcionando sin señal para consultar precios e inventario ya cargados.
# cuentas-app
