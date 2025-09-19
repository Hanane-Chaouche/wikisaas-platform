# WikiSaaS Platform – Infrastructure as Code avec Terraform*

Ce dépôt contient l’infrastructure **WikiSaaS Platform** déployée avec **Terraform Cloud** et orchestrée via ***GitHub Actions***.  
Il permet de provisionner automatiquement :

- DNS avec **Cloudflare**  
- Machines virtuelles **EC2** (hébergement Wiki.js + Traefik)  
- Bases de données **RDS PostgreSQL** (multi-instances : ia, devops, cyber)  
- Intégration CI/CD avec Terraform Cloud et GitHub  

## Structure du projet

```plaintext
wikisaas-platform/
├── terraform/                  # Fichiers Terraform (.tf)
│   ├── providers.tf            # Providers (AWS, Cloudflare, etc.)
│   ├── variables.tf            # Variables d’entrée (région, clés, domaine, etc.)
│   ├── dns.tf                  # Gestion DNS via Cloudflare
│   ├── vm.tf                   # Machines EC2 (hébergement Wiki.js + Traefik)
│   ├── postgresql.tf           # Bases RDS PostgreSQL (multi-instances : ia, devops, cyber)
│   ├── r2.tf                   # Stockage objets R2 (Cloudflare)
│   ├── outputs.tf              # Valeurs exportées (IP, endpoints, etc.)
│   └── README.md               # Documentation Terraform
├── .github/
│   └── workflows/
│       └── terraform.yaml      # CI/CD Terraform (GitHub → Terraform Cloud)
```

## Prérequis

1. Terraform Cloud  
   - Organisation : `wikisaas-org`  
   - Workspace : `wikisaas-platform`  

2. Compte AWS Free Tier  
   - Services utilisés : EC2, RDS PostgreSQL, S3  

3. Compte Cloudflare  
   - Domaine configuré (ex : `wikiplatform.app`)  

4. Secrets GitHub (Settings → Secrets and variables → Actions)  
   - `TF_API_TOKEN` : Token API Terraform Cloud utilisé par GitHub Actions  

5. Variables Terraform Cloud  
   - `AWS_ACCESS_KEY_ID` et `AWS_SECRET_ACCESS_KEY` : clés IAM AWS pour EC2, RDS, etc.  
   - `CLOUDFLARE_API_TOKEN` : Token API Cloudflare (DNS principal)  
   - `CLOUDFLARE_API_TOKEN_R2` : Token API Cloudflare R2 (stockage objets)  

## Déploiement

### 1. Exécuter localement (optionnel)

```bash
cd terraform
terraform init
terraform plan
terraform apply -auto-approve
```

### 2. Déploiement via GitHub Actions (recommandé)

Le fichier `.github/workflows/terraform.yaml` déclenche le déploiement à chaque `push` sur `main` :

1. GitHub Actions envoie la configuration vers Terraform Cloud  
2. Terraform Cloud exécute automatiquement :  
   - `terraform plan`  
   - `terraform apply` (auto-apply activé)  

## Outputs

### EC2 (Wiki.js)
- `ec2_public_ip` : Adresse IP publique de l’instance  
- `ec2_public_dns` : Nom DNS public de l’instance  

### RDS (PostgreSQL)
- `db_endpoints` : Endpoints des bases  
  - `wiki-ia-db`  
  - `wiki-devops-db`  
  - `wiki-cyber-db`  

⚠️ Ces valeurs sont marquées `sensitive` dans Terraform Cloud. Pour les afficher en local :  
```bash
terraform output db_endpoints
```

### DNS (Cloudflare)
- `dns_records` : Liste complète des enregistrements DNS créés  

### Cloudflare R2
- `r2_bucket_name`  
- `r2_account_id`  
- `r2_location`  
- `r2_bucket_endpoint`  

### Réseau AWS
- `vpc_id`  
- `public_subnet_id`  
- `rds_subnet_group`  

### Groupes de sécurité
- `ec2_security_group_id`  
- `rds_security_group_id`  

## Nettoyage

Pour supprimer toutes les ressources créées :

```bash
terraform destroy -auto-approve
```
