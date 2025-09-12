#  WikiSaaS Platform – Infrastructure as Code avec Terraform

Ce dépôt contient l’infrastructure **WikiSaaS Platform** déployée avec **Terraform Cloud** et orchestrée via **GitHub Actions**.  
Il permet de provisionner automatiquement :

-  DNS avec **Cloudflare**  
-  Machines virtuelles **EC2** (hébergement Wiki.js + Traefik)  
-  Bases de données **RDS PostgreSQL** (multi-instances : ia, devops, cyber)  
-  Intégration CI/CD avec Terraform Cloud et GitHub  

---

## 📂 Structure du projet

wikisaas-platform/
├─ terraform/ # Fichiers Terraform (.tf)
│ ├─ providers.tf # Providers (AWS, Cloudflare, etc.)
│ ├─ variables.tf # Variables d’entrée (ex: région, clés, domaine)
│ ├─ dns.tf # Gestion DNS via Cloudflare
│ ├─ vm.tf # Machines EC2 (hébergement)
│ ├─ postgresql.tf # Bases RDS PostgreSQL
│ ├─ r2.tf # Stockage objets R2 (Cloudflare)
│ ├─ outputs.tf # Valeurs exportées (IP, endpoints, etc.)
│ └─ README.md # Documentation Terraform
├─ .github/
│ └─ workflows/
│ └─ terraform.yaml # CI/CD Terraform (GitHub → Terraform Cloud)

## ⚙️ Prérequis

- ✅ **Terraform Cloud** (organisation `wikisaas-org` + workspace `wikisaas-platform`)  
- ✅ **Compte AWS Free Tier** (EC2, RDS PostgreSQL)  
- ✅ **Compte Cloudflare** avec domaine (ex: `wikiplatform.app`)  
- ✅ **GitHub Secrets** :
  - `TF_API_TOKEN` → Token API Terraform Cloud (nécessaire pour GitHub Actions)

- **Terraform Cloud Variables** :
  - `AWS_ACCESS_KEY_ID` et `AWS_SECRET_ACCESS_KEY` → Clés IAM AWS pour provisionner EC2, RDS, S3, etc.
  - `CLOUDFLARE_API_TOKEN` → Token API Cloudflare (DNS principal)
  - `CLOUDFLARE_API_TOKEN_R2` → Token API Cloudflare R2 (stockage objets)
  ## 🚀 Déploiement

 ## 🚀 Déploiement

### 1. Initialiser le projet en local (optionnel)
tester le  projet Terraform en local (sans GitHub Actions) :  
```bash
cd terraform
terraform init
terraform plan
terraform apply -auto-approve

### 2. Déployer via GitHub Actions (recommandé)

Le pipeline CI/CD est déjà configuré dans **`.github/workflows/terraform.yaml`**.  
À chaque **push** sur la branche `main` :

1. **GitHub Actions** envoie la configuration vers **Terraform Cloud**.  
2. **Terraform Cloud** exécute automatiquement :  
   - `terraform plan` → calcul des changements  
   - `terraform apply` → applique directement (car **Auto-apply activé**)  

   ##  Outputs

Après un `terraform apply`, Terraform affiche plusieurs sorties utiles :  

###  EC2 (Wiki.js)
- `ec2_public_ip` → Adresse IP publique de l’instance Wiki.js  
- `ec2_public_dns` → Nom DNS public de l’instance Wiki.js  

###  RDS (PostgreSQL)
- `db_endpoints` → Endpoints des bases de données :  
  - `wiki-ia-db`  
  - `wiki-devops-db`  
  - `wiki-cyber-db`  

⚠️ Ces informations sont marquées **sensitive** → elles ne s’afficheront pas en clair dans Terraform Cloud.  
Pour les récupérer en local :  

```bash
terraform output db_endpoints
DNS (Cloudflare)

###  dns_records → Tous les enregistrements DNS créés (nom + contenu).

Cloudflare R2 (Stockage objets)
r2_bucket_name → Nom du bucket R2
r2_account_id → ID du compte Cloudflare
r2_location → Localisation (ex: WNAM)
r2_bucket_endpoint → Endpoint S3-compatible du bucket

###  Réseau AWS (VPC & Subnets)

vpc_id → ID du VPC principal

public_subnet_id → ID du subnet public utilisé pour EC2

rds_subnet_group → Nom du subnet group utilisé pour RDS

###  Security Groups

ec2_security_group_id → ID du security group de l’instance EC2
rds_security_group_id → ID du security group pour RDS

###  Nettoyage

Pour détruire toutes les ressources créées ( supprime EC2, RDS, DNS, etc.) :

terraform destroy -auto-approve
