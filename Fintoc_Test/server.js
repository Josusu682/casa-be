require("dotenv").config();
const express = require("express");
const axios = require("axios");
const crypto = require("crypto");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const BASE_URL    = process.env.BASE_URL    || `http://localhost:${PORT}`;
const SUCCESS_URL  = process.env.SUCCESS_URL  || `${BASE_URL}/success.html`;
const CANCEL_URL   = process.env.CANCEL_URL   || `${BASE_URL}/cancel.html`;

// ─── Middleware ────────────────────────────────────────────────────────────────
// El webhook de Fintoc necesita el body RAW para verificar la firma.
// Por eso lo configuramos ANTES de parsear JSON de forma global.
app.use("/webhook", express.raw({ type: "application/json" }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ─── Fintoc API helper ─────────────────────────────────────────────────────────
const fintocAPI = axios.create({
  baseURL: "https://api.fintoc.com/v2",
  headers: {
    Authorization: process.env.FINTOC_SECRET_KEY,
    "Content-Type": "application/json",
  },
});

// ─── RUTA: Crear Checkout Session ─────────────────────────────────────────────
// El frontend llama a este endpoint con el monto y datos del cliente.
// NUNCA dejes que el monto venga del frontend sin validación en producción.
app.post("/create-session", async (req, res) => {
  const { amount, currency = "clp", customer_email, product_name } = req.body;

  if (!amount || isNaN(amount) || Number(amount) <= 0) {
    return res.status(400).json({ error: "El campo 'amount' es obligatorio y debe ser un número positivo." });
  }

  try {
    const payload = {
      amount: Math.round(Number(amount)),
      currency: currency.toLowerCase(),
      success_url: SUCCESS_URL,
      cancel_url: CANCEL_URL,
    };

    if (customer_email) payload.customer_email = customer_email;

    console.log("[Fintoc] Creando Checkout Session ->", payload);

    const { data } = await fintocAPI.post("/checkout_sessions", payload);

    console.log("[Fintoc] Session creada:", {
      id: data.id,
      status: data.status,
      redirect_url: data.redirect_url,
    });

    res.json({
      session_id: data.id,
      redirect_url: data.redirect_url,
      status: data.status,
    });
  } catch (err) {
    const fintocError = err.response?.data;
    console.error("[Fintoc] Error al crear sesion:", fintocError || err.message);
    res.status(err.response?.status || 500).json({
      error: "No se pudo crear la sesion de pago.",
      detail: fintocError || err.message,
    });
  }
});

// ─── RUTA: Consultar estado de una sesión ────────────────────────────────────
app.get("/session/:id", async (req, res) => {
  try {
    const { data } = await fintocAPI.get(`/checkout_sessions/${req.params.id}`);
    res.json({
      id: data.id,
      status: data.status,
      payment_intent: data.payment_intent,
    });
  } catch (err) {
    console.error("[Fintoc] Error consultando sesion:", err.response?.data || err.message);
    res.status(err.response?.status || 500).json({ error: "No se pudo consultar la sesion." });
  }
});

// ─── RUTA: Webhook ─────────────────────────────────────────────────────────────
// Fintoc llama a esta URL cuando ocurren eventos (pago exitoso, fallido, etc.).
// Configura la URL en: https://app.fintoc.com/developers -> Webhooks
app.post("/webhook", (req, res) => {
  const signature = req.headers["fintoc-signature"];
  const webhookSecret = process.env.FINTOC_WEBHOOK_SECRET;

  // ── Verificacion de firma (recomendado en produccion) ──────────────────────
  if (webhookSecret && signature) {
    try {
      // Formato de Fintoc: "t=TIMESTAMP,v1=HMAC_HEX"
      // El HMAC se calcula sobre: "${timestamp}.${rawBody}"
      const parts = {};
      signature.split(",").forEach((part) => {
        const [k, v] = part.split("=");
        parts[k] = v;
      });

      if (!parts.t || !parts.v1) {
        console.warn("[Webhook] Header fintoc-signature con formato inesperado:", signature);
        return res.status(401).json({ error: "Firma invalida." });
      }

      const signedPayload = `${parts.t}.${req.body.toString()}`;
      const expectedSig   = crypto
        .createHmac("sha256", webhookSecret)
        .update(signedPayload)
        .digest("hex");

      if (parts.v1 !== expectedSig) {
        console.warn("[Webhook] Firma invalida - peticion rechazada.");
        console.warn("  Recibida :", parts.v1);
        console.warn("  Esperada :", expectedSig);
        return res.status(401).json({ error: "Firma invalida." });
      }
      console.log("[Webhook] Firma verificada correctamente.");
    } catch (e) {
      console.error("[Webhook] Error al verificar firma:", e.message);
      return res.status(400).json({ error: "Error procesando firma." });
    }
  } else {
    console.warn("[Webhook] Sin secreto configurado - omitiendo verificacion de firma.");
  }

  // ── Parsear el payload ─────────────────────────────────────────────────────
  let event;
  try {
    event = JSON.parse(req.body.toString());
  } catch {
    return res.status(400).json({ error: "Payload invalido." });
  }

  console.log(`[Webhook] Evento recibido: ${event.type}`, JSON.stringify(event.data, null, 2));

  // ── Manejar eventos ────────────────────────────────────────────────────────
  switch (event.type) {
    case "checkout_session.finished":
      console.log("[Webhook] Checkout finalizado. Session ID:", event.data?.id);
      // Aqui puedes actualizar el estado de la orden en tu DB
      break;

    case "payment_intent.succeeded":
      console.log("[Webhook] Pago confirmado. Payment Intent ID:", event.data?.id);
      // Aqui marcas la orden como PAGADA y disparas tu logica de negocio
      // ej: enviar correo, activar despacho, emitir factura, etc.
      break;

    case "payment_intent.rejected":
      console.log("[Webhook] Pago rechazado. Payment Intent ID:", event.data?.id);
      break;

    case "payment_intent.failed":
      console.log("[Webhook] Pago fallido. Payment Intent ID:", event.data?.id);
      break;

    default:
      console.log(`[Webhook] Evento no manejado: ${event.type}`);
  }

  // Fintoc espera un 200 para saber que recibiste el evento
  res.status(200).json({ received: true });
});

// ─── Inicio del servidor ───────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\nServidor Fintoc Test corriendo en ${BASE_URL}`);
  console.log(`   Frontend  ->  ${BASE_URL}/index.html`);
  console.log(`   Webhook   ->  POST ${BASE_URL}/webhook`);
  console.log(`   Secret Key cargada: ${process.env.FINTOC_SECRET_KEY ? "SI" : "NO (revisa .env)"}\n`);
});
