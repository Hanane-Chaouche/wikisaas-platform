/* eslint-disable no-console */
const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors");
const path = require("path");
const axios = require("axios");

const {
  PORT = 3000,
  DOMAIN,
  STRIPE_PUBLIC_KEY,
  STRIPE_SECRET_KEY,
  STRIPE_PRICE_STARTER,
  STRIPE_PRICE_PRO,
  STRIPE_PRICE_ENTERPRISE,
  N8N_WEBHOOK_URL = "",
  PROVISIONER_URL
} = process.env;

if (!STRIPE_SECRET_KEY) {
  console.error("❌ STRIPE_SECRET_KEY manquant dans l'env");
  process.exit(1);
}

const stripe = require("stripe")(STRIPE_SECRET_KEY);
const app = express();

app.disable("x-powered-by");
app.use(helmet());
app.use(cors());
app.use(morgan("combined"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, "public")));

// Health
app.get("/api/health", (_req, res) => res.json({ ok: true, service: "portal", time: new Date().toISOString() }));

// Liste des plans exposés au front
app.get("/api/plans", (_req, res) => {
  res.json({
    publicKey: STRIPE_PUBLIC_KEY,
    plans: [
      { id: "starter", name: "Starter", priceId: STRIPE_PRICE_STARTER, priceText: "29.99€ / mois", features: ["Accès DevOps"] },
      { id: "pro",     name: "Pro",     priceId: STRIPE_PRICE_PRO,     priceText: "99€ / mois",    features: ["Accès IA", "Accès DevOps"] },
      { id: "ent",     name: "Enterprise", priceId: STRIPE_PRICE_ENTERPRISE, priceText: "299€ / mois", features: ["IA + DevOps + Cyber"] }
    ]
  });
});

// Créer une session Stripe Checkout
app.post("/api/checkout", async (req, res) => {
  try {
    const { planId, customerEmail } = req.body || {};
    const map = {
      starter: STRIPE_PRICE_STARTER,
      pro: STRIPE_PRICE_PRO,
      ent: STRIPE_PRICE_ENTERPRISE
    };
    const priceId = map[planId];
    if (!priceId) return res.status(400).json({ error: "Plan invalide" });

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: customerEmail || undefined,
      success_url: `https://app.${DOMAIN}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `https://app.${DOMAIN}/cancel`,
      metadata: { plan: planId }
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe Checkout error:", err.message);
    res.status(500).json({ error: "Impossible de créer la session de paiement" });
  }
});

// (Optionnel) Provision Enterprise+ dédié depuis le portail
app.post("/api/provision", async (req, res) => {
  try {
    const { subdomain, email } = req.body || {};
    if (!subdomain || !email) return res.status(400).json({ error: "subdomain et email requis" });
    if (!PROVISIONER_URL) return res.status(400).json({ error: "PROVISIONER_URL non configuré" });

    const r = await axios.post(PROVISIONER_URL, { subdomain, email });
    return res.json(r.data);
  } catch (err) {
    console.error("Provision error:", err.message);
    return res.status(500).json({ error: "Provisioning failed" });
  }
});

// Pages success/cancel (servies en statique)
app.get("/success", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "success.html"));
});
app.get("/cancel", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "cancel.html"));
});

app.listen(PORT, () => {
  console.log(`✅ Portal en écoute sur : ${PORT} (https://app.${DOMAIN})`);
});
