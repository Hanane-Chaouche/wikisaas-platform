/* eslint-disable no-console */
const express = require("express");
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
// DEBUG: Afficher les variables chargées (à retirer en production)
console.log('Variables chargées:', {
  PORT,
  DOMAIN,
  KEYCLOAK_URL,
  KEYCLOAK_REALM,
  KEYCLOAK_CLIENT_ID,
  KEYCLOAK_CLIENT_SECRET: KEYCLOAK_CLIENT_SECRET || 'NON DÉFINI'
});

const app = express();

// Middlewares
app.disable("x-powered-by");

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
    req.session.destroy(() => {
      // ✅ URL où l'utilisateur revient après le logout complet
      const redirectUri = encodeURIComponent(`https://app.${DOMAIN}/`);

      // ✅ Utilisation du paramètre officiel post_logout_redirect_uri + client_id
      const logoutUrl = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/logout?client_id=${KEYCLOAK_CLIENT_ID}&post_logout_redirect_uri=${redirectUri}`;

      console.log("➡️ Redirection vers Keycloak logout:", logoutUrl);

      // ✅ Redirige vers Keycloak → efface la session SSO et revient au portail
      res.redirect(logoutUrl);
    });
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
      res.json({ ok: true, service: "app", time: new Date().toISOString() })
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
      console.log("Userinfo reçu :", user);
      const groups = user.groups || [];

      let services = [];
      if (groups.includes("STARTER")) {
        services.push({ name: "Wiki IA", url: "https://ia.wikiplatform.app" });
      }
      if (groups.includes("PRO")) {
        services.push({ name: "Wiki IA", url: "https://ia.wikiplatform.app" });
        services.push({ name: "Wiki DevOps", url: "https://devops.wikiplatform.app" });
      }
      if (groups.includes("ENTERPRISE")) {
        services.push({ name: "Wiki IA", url: "https://ia.wikiplatform.app" });
        services.push({ name: "Wiki DevOps", url: "https://devops.wikiplatform.app" });
        services.push({ name: "Wiki Cyber", url: "https://cyber.wikiplatform.app" });
      }
       // Ajouter un lien vers le compte Keycloak (changement de mot de passe)
      const accountUrl = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/account/#/security/signingin`;

      res.render("dashboard", { user, services, accountUrl });
    });

    // Lancer le serveur
    app.listen(PORT, () => {
      console.log(`Portal en écoute sur https://app.${DOMAIN}:${PORT}`);
    });

  } catch (err) {
    console.error("Erreur configuration Keycloak :", err);
  }
})();
