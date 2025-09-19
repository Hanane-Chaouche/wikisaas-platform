# providers.tf
variable "aws_region" {
  description = "Region AWS"
  default     = "us-east-1"
}
# dns.tf
variable "cloudflare_zone_id" {
  description = "Zone Cloudflare ID (copie depuis le dashboard Cloudflare)"
  default     = "3ac7befff085f12da622d2a783b187e1"
}
# dns.tf
variable "subdomains" {
  description = "Liste des sous-domaines à créer"
  type        = list(string)
  default     = ["sso", "ia", "devops", "cyber"]
}
# providers.tf
variable "cloudflare_api_token" {
  description = "Token API Cloudflare"
  sensitive   = true
}
variable "cloudflare_api_token_r2" {
  description = "API Token Cloudflare pour R2 (Workers R2 Storage: Read+Edit)"
  sensitive   = true
}

variable "domain" {
  description = "Nom de domaine principal"
  default     = "wikiplatform.app"
}
# postgres.tf
variable "db_username" {
  description = "Nom d'utilisateur PostgreSQL"
  default     = "wikijs"
}
# postgres.tf
variable "db_password" {
  description = "Mot de passe PostgreSQL"
  sensitive   = true
}
# vm.tf
variable "ec2_instance_type" {
  description = "Type de machine EC2"
  default     = "m7i-flex.large" # Free Tier
}

# vm.tf
variable "ec2_key_name" {
  description = "Nom de la clé SSH AWS pour se connecter à l'EC2"
}
# vm.tf
variable "ec2_ami" {
  description = "AMI Ubuntu à utiliser pour EC2"
  default     = "ami-0360c520857e3138f" # Ubuntu 22.04 us-east-1
}
# r2.tf
# Identifiants R2 (créés dans Cloudflare → API Tokens)
variable "r2_account_id" {
  description = "Account ID Cloudflare R2"
  # Exemple : visible dans ton endpoint https://<account_id>.r2.cloudflarestorage.com
}
# r2.tf: c est pas utilise pour linstant mais ca peut servir
variable "r2_access_key" {
  description = "Access key pour Cloudflare R2"
  sensitive   = true
}
# r2.tf : c est pas utilise pour linstant mais ca peut servir
variable "r2_secret_key" {
  description = "Secret key pour Cloudflare R2"
  sensitive   = true
}
# r2.tf
variable "r2_bucket_name" {
  description = "Nom du bucket R2"
  default     = "wikijs-uploads"
}
