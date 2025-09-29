// ============================
// Import des modules nécessaires
// ============================

const express = require("express");
const bodyParser = require("body-parser");
const { exec } = require("child_process");

// ============================
// Initialisation du serveur
// ============================
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// ============================
// Route par défaut (GET /)
// ============================
app.get("/", (req, res) => {
  res.send("✅ Provisioner API is running (hardcoded mode)");
});

// ============================
// Endpoint POST /deploy-new-wiki
// ============================
// Ici on utilise des valeurs fixées en dur pour tester
app.post("/deploy-new-wiki", (req, res) => {
  // 🔹 Valeurs fixées (client1)
  const subdomain = "client1";
  const pg_db = "db_client1";   // 👈 corrigé
  const pg_user = "wikijs";
  const pg_pass = "Client1Pass!";
  const admin_email = "admin@client1.wikiplatform.app";
  const admin_password = "Client1AdminPass!";
  const site_url = "https://client1.wikiplatform.app";

  // 🔹 Construction de la commande Ansible
  const cmd = `ansible-playbook ../ansible/site.yml \
    --extra-vars "subdomain='${subdomain}' \
                  pg_db='${pg_db}' \
                  pg_user='${pg_user}' \
                  pg_pass='${pg_pass}' \
                  admin_email='${admin_email}' \
                  admin_password='${admin_password}' \
                  site_url='${site_url}'"`;

  console.log(`🚀 Lancement du déploiement avec valeurs fixes pour ${subdomain}...`);
  console.log(`📌 Commande exécutée: ${cmd}`);

  // 🔹 Exécution
  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ Erreur Ansible: ${error.message}`);
      return res.status(500).json({
        error: "Deployment failed",
        details: stderr || error.message,
      });
    }

    console.log(`✅ Ansible output:\n${stdout}`);
    res.json({
      message: `Wiki deployment for ${subdomain} started 🚀`,
      details: stdout,
    });
  });
});

// ============================
// Lancer le serveur
// ============================
app.listen(PORT, () => {
  console.log(`✅ Provisioner running at http://localhost:${PORT}`);
});
