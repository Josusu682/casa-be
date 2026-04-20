# Fintoc – Prueba de integración (Node.js)

Flujo completo: **Backend crea sesión → usuario paga en checkout de Fintoc → webhook confirma el resultado**.

---

## Estructura de archivos

```
Fintoc_Test/
├── server.js          ← Backend Express (API + webhook)
├── package.json
├── .env               ← Tu archivo de variables (NO subir a git)
├── .env.example       ← Plantilla de variables
└── public/
    ├── index.html     ← Formulario de pago
    ├── success.html   ← Página de éxito
    └── cancel.html    ← Página de cancelación
```

---

## Paso 1 – Obtener tus llaves de prueba

1. Entra a [https://app.fintoc.com](https://app.fintoc.com) y crea una cuenta.
2. Ve a **Developers → API Keys**.
3. Copia tu **Secret Key** (`sk_test_...`) y tu **Public Key** (`pk_test_...`).

---

## Paso 2 – Configurar variables de entorno

Copia `.env.example` a `.env` y rellena tus llaves:

```bash
cp .env.example .env
```

Abre `.env` y edita:

```env
FINTOC_SECRET_KEY=sk_test_TU_LLAVE_SECRETA
FINTOC_PUBLIC_KEY=pk_test_TU_LLAVE_PUBLICA
FINTOC_WEBHOOK_SECRET=whsec_TU_SECRETO_WEBHOOK   # opcional por ahora
BASE_URL=http://localhost:3000
PORT=3000
```

---

## Paso 3 – Instalar dependencias

```bash
npm install
```

---

## Paso 4 – Ejecutar el servidor

```bash
# Modo normal
npm start

# Modo desarrollo (reinicio automático con nodemon)
npm run dev
```

El servidor arranca en **http://localhost:3000**

---

## Paso 5 – Probar el flujo

1. Abre **http://localhost:3000** en el navegador.
2. Completa el formulario (monto, moneda, email).
3. Haz clic en **Pagar con Fintoc** → se crea una `checkout_session` en la API.
4. Te redirigen al checkout de Fintoc → completa el pago con datos de prueba.
5. Fintoc te redirige a `success.html` o `cancel.html`.

---

## Paso 6 – Recibir webhooks (opcional en pruebas locales)

Para recibir webhooks de Fintoc en `localhost` necesitas un túnel público.
La opción más fácil es **ngrok**:

```bash
# Instalar ngrok (una sola vez)
npm install -g ngrok

# En una terminal aparte, exponer tu puerto:
ngrok http 3000
```

ngrok te dará una URL como `https://abc123.ngrok.io`.

Luego:
1. Entra al panel de Fintoc → **Developers → Webhooks**.
2. Agrega el endpoint: `https://abc123.ngrok.io/webhook`
3. Copia el **Webhook Secret** que te da Fintoc y ponlo en `.env` como `FINTOC_WEBHOOK_SECRET`.

---

## Rutas del backend

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/create-session` | Crea una Checkout Session en Fintoc |
| `GET`  | `/session/:id` | Consulta el estado de una sesión |
| `POST` | `/webhook` | Recibe eventos de Fintoc (con verificación de firma) |

### Ejemplo: crear sesión con curl

```bash
curl -X POST http://localhost:3000/create-session \
  -H "Content-Type: application/json" \
  -d '{"amount": 5000, "currency": "clp", "customer_email": "test@test.com", "product_name": "Plan Pro"}'
```

---

## Eventos de webhook manejados

| Evento | Cuándo ocurre |
|--------|--------------|
| `checkout_session.finished` | El usuario completó o abandonó el checkout |
| `payment_intent.succeeded`  | El pago fue procesado con éxito ✅ |
| `payment_intent.rejected`   | El pago fue rechazado ❌ |
| `payment_intent.failed`     | Error técnico en el pago ⚠️ |

---

## Notas importantes

- **Nunca** uses la `sk_test_...` en el frontend. Solo va en el backend.
- El monto en CLP va en **pesos** (sin decimales). Para USD/MXN va en **centavos**.
- Confirma siempre el resultado con webhooks, no con el redirect del frontend.
- Antes de ir a producción: configura webhooks en modo **live** y haz las pruebas de certificación que exige Fintoc.
