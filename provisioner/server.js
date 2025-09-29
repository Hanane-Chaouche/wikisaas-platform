// ============================
// Import des modules nécessaires
// ============================

// Express → framework pour créer une API/serveur web facilement
const express = require("express");
a
// body-parser → permet de lire le corps (body) des requêtes HTTP en JSON
const bodyParser = require("body-parser");

// child_process.exec → permet d’exécuter des commandes système (ex: ansible-playbook)
const { exec } = require("child_process");

// ============================
// Initialisation du serveur
// ============================
const app = express();  // Création d'une application Express
const PORT = 3000;      // Port sur lequel le serveur écoute

// ============================
// Middlewares
// ============================
// On dit à Express de parser automatiquement les corps de requêtes JSON
app.use(bodyParser.json());

// ============================
// Route par défaut (GET /)
// ============================
// Si tu ouvres http://localhost:3000 dans ton navigateur → tu verras ce message
app.get("/", (req, res) => {
  res.send("Provisioner API is running ✅");
});

// ============================
// Endpoint POST /deploy-new-wiki
// ============================
// C’est ce que n8n ou Stripe vont appeler pour lancer le déploiement
app.post("/deploy-new-wiki", (req, res) => {
  // On récupère les paramètres envoyés dans le corps JSON de la requête
  const { subdomain, pg_db, pg_user, pg_pass } = req.body;

  // Vérification basique : certains champs sont obligatoires
  if (!subdomain || !pg_db) {
    return res.status(400).json({ error: "❌ Missing required parameters" });
  }

  // Construction de la commande Ansible
  // Ici on passe des variables dynamiques (--extra-vars) au playbook site.yml
  const cmd = `ansible-playbook ../ansible/site.yml --extra-vars "subdomain=${subdomain} pg_db=${pg_db} pg_user=${pg_user} pg_pass=${pg_pass}"`;

  // ============================
  // Exécution de la commande
  // ============================
  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      // Si erreur (ex: ansible pas installé ou échec du déploiement)
      console.error(`❌ Erreur Ansible: ${error.message}`);
      return res.status(500).json({ error: "Deployment failed", details: stderr });
    }

    // Si tout s’est bien passé → on logge la sortie Ansible
    console.log(`✅ Ansible output: ${stdout}`);

    // Et on renvoie une réponse à l’API appelante
    res.json({ message: "Wiki deployment started 🚀", details: stdout });
  });
});

// ============================
// Lancer le serveur
// ============================
// Le serveur écoute sur le port défini et affiche un message dans la console
app.listen(PORT, () => {
  console.log(`✅ Provisioner running at http://localhost:${PORT}`);
});
