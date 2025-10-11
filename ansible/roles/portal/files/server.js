/* eslint-disable no-console */
const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors");
const path = require("path");
const session = require("express-session");
const passport = require("passport");
const { Issuer, Strategy } = require("openid-client");

const {
  PORT,
  DOMAIN,
  KEYCLOAK_URL,
  KEYCLOAK_REALM,
  KEYCLOAK_CLIENT_ID,
  KEYCLOAK_CLIENT_SECRET,
} = process.env;

const app = express();

// Middlewares
app.disable("x-powered-by");
app.use(helmet());
app.use(cors());
app.use(morgan("combined"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sessions pour Passport
app.use(session({
  secret: "supersecret", // ⚠️ Mets une vraie clé secrète en variable d’env
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// Découverte Keycloak + stratégie OIDC
(async () => {
  try {
    const keycloakIssuer = await Issuer.discover(`${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}`);
    const client = new keycloakIssuer.Client({
      client_id: KEYCLOAK_CLIENT_ID,
      client_secret: KEYCLOAK_CLIENT_SECRET,
      redirect_uris: [`https://app.${DOMAIN}/callback`],
      response_types: ["code"]
    });

    passport.use("oidc", new Strategy({ client }, (tokenSet, userinfo, done) => {
      return done(null, { ...userinfo, tokenSet });
    }));

    passport.serializeUser((user, done) => done(null, user));
    passport.deserializeUser((user, done) => done(null, user));

    // Routes d’auth
    app.get("/login", passport.authenticate("oidc"));
    app.get("/callback", passport.authenticate("oidc", { failureRedirect: "/" }), (req, res) => {
      res.redirect("/dashboard");
    });
    app.get("/logout", (req, res) => {
      req.logout(() => {
        res.redirect("/");
      });
    });

    // Middleware de protection
    function ensureAuth(req, res, next) {
      if (req.isAuthenticated()) return next();
      res.redirect("/login");
    }

    // Static files
    app.use(express.static(path.join(__dirname, "public")));

    // Health check
    app.get("/api/health", (_req, res) =>
      res.json({ ok: true, service: "portal", time: new Date().toISOString() })
    );

    // Pages success/cancel
    app.get("/success", (_req, res) =>
      res.sendFile(path.join(__dirname, "public", "success.html"))
    );
    app.get("/cancel", (_req, res) =>
      res.sendFile(path.join(__dirname, "public", "cancel.html"))
    );

    // Dashboard protégé par login Keycloak
    app.set("view engine", "ejs");
    app.set("views", path.join(__dirname, "views"));

    app.get("/dashboard", ensureAuth, (req, res) => {
      const user = req.user;
      const groups = user.groups || [];

      let services = [];
      if (groups.includes("starter")) {
        services.push({ name: "Wiki IA", url: "https://ia.wikiplatform.app" });
      }
      if (groups.includes("pro")) {
        services.push({ name: "Wiki IA", url: "https://ia.wikiplatform.app" });
        services.push({ name: "Wiki DevOps", url: "https://devops.wikiplatform.app" });
      }
      if (groups.includes("enterprise")) {
        services.push({ name: "Wiki IA", url: "https://ia.wikiplatform.app" });
        services.push({ name: "Wiki DevOps", url: "https://devops.wikiplatform.app" });
        services.push({ name: "Wiki Cyber", url: "https://cyber.wikiplatform.app" });
      }

      res.render("dashboard", { user, services });
    });

    // Lancer le serveur
    app.listen(PORT, () => {
      console.log(`Portal en écoute sur https://app.${DOMAIN}:${PORT}`);
    });

  } catch (err) {
    console.error("Erreur configuration Keycloak :", err);
  }
})();
