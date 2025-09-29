const express = require("express");
const { spawn } = require("child_process");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());

// ============================
// Route GET /
// ============================
app.get("/", (_req, res) => {
  res.send("Provisioner API is running ");
});

// ============================
// Route POST /deploy-new-wiki
// ============================
app.post("/deploy-new-wiki", (req, res) => {
  console.log("Requête reçue sur /deploy-new-wiki");

  // Variables envoyées par n8n ou valeurs par défaut
  const payload = {
    subdomain: req.body.subdomain || "client1",
    pg_db: req.body.pg_db || "db_client1",
    pg_user: req.body.pg_user || "wikijs",
    pg_pass: req.body.pg_pass || "Client1Pass!",
    admin_email: req.body.admin_email || "admin@client1.wikiplatform.app",
    admin_password: req.body.admin_password || "Client1AdminPass!",
    site_url: req.body.site_url || "https://client1.wikiplatform.app",
  };

  // Chemins vers playbook et inventaire
  const playbookPath = path.resolve(__dirname, "../ansible/site.yml");
  const inventoryPath = path.resolve(
    __dirname,
    "../ansible/inventories/prod/hosts.ini"
  );

  const extraVars = JSON.stringify(payload);

  // Commande Ansible
  const args = ["-i", inventoryPath, playbookPath, "--extra-vars", extraVars];
  console.log(`▶️ Commande exécutée : ansible-playbook ${args.join(" ")}`);

  // Désactiver la vérification de clé SSH (plus de blocage fingerprint)
  const env = {
    ...process.env,
    ANSIBLE_HOST_KEY_CHECKING: "False",
  };

  // Lancer Ansible
  const child = spawn("ansible-playbook", args, { env });

  let logs = "";

  // stdout
  child.stdout.on("data", (data) => {
    const s = data.toString();
    process.stdout.write(s);
    logs += s;
  });

  // stderr
  child.stderr.on("data", (data) => {
    const s = data.toString();
    process.stderr.write(s);
    logs += s;
  });

  // Fin d’exécution
  child.on("close", (code) => {
    if (code !== 0) {
      console.error(`Ansible terminé avec erreurs (code ${code})`);
      return res.status(500).json({
        error: "Deployment failed",
        code,
        logs,
      });
    }
    console.log("Déploiement terminé avec succès");
    res.json({
      message: `Deployment finished for ${payload.subdomain} 🚀`,
      code,
      logs,
    });
  });
});

// ============================
// Lancer le serveur
// ============================
app.listen(PORT, () => {
  console.log(`Provisioner running at http://localhost:${PORT}`);
});
