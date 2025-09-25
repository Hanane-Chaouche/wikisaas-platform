####################################
# Outputs pour la VM (EC2)
####################################
output "ec2_public_ip" {
  description = "Adresse IP publique de l'instance Wiki.js"
  value       = aws_instance.wikijs.public_ip
}

output "ec2_public_dns" {
  description = "Nom DNS public de l'instance Wiki.js"
  value       = aws_instance.wikijs.public_dns
}

####################################
# Outputs RDS (un par valeur)
####################################
output "db_host_ia" {
  value = aws_db_instance.wiki_ia.address
}

output "db_host_devops" {
  value = aws_db_instance.wiki_devops.address
}

output "db_host_cyber" {
  value = aws_db_instance.wiki_cyber.address
}

####################################
# Outputs pour DNS (Cloudflare)
####################################
########################
# Outputs DNS
########################
output "dns_records" {
  description = "Tous les enregistrements DNS Cloudflare créés"
  value = {
    for name, record in cloudflare_dns_record.wikijs :
    name => {
      fqdn    = record.name
      content = record.content
    }
  }
}


####################################
# Outputs pour R2 (Cloudflare Storage)
####################################

# Nom du bucket
output "r2_bucket_name" {
  description = "Nom du bucket R2 créé"
  value       = cloudflare_r2_bucket.r2_bucket.name
}

# ID du compte Cloudflare
output "r2_account_id" {
  description = "ID du compte Cloudflare"
  value       = cloudflare_r2_bucket.r2_bucket.account_id
 
}

# Localisation du bucket (ex: WNAM)
output "r2_location" {
  description = "Localisation du bucket R2"
  value       = cloudflare_r2_bucket.r2_bucket.location
}

# Nom d’hôte de l’endpoint R2 (S3-compatible)

output "r2_bucket_endpoint" {
  description = "Endpoint S3-compatible du bucket R2"
  value       = "https://${cloudflare_r2_bucket.r2_bucket.account_id}.r2.cloudflarestorage.com"
}

####################################
# Outputs pour VPC (réseau AWS)
####################################
output "vpc_id" {
  description = "ID du VPC principal"
  value       = aws_vpc.main.id
}

output "public_subnet_id" {
  description = "ID du subnet public (EC2)"
  value       = aws_subnet.public.id
}

output "rds_subnet_group" {
  description = "Nom du subnet group utilisé pour RDS"
  value       = aws_db_subnet_group.rds.name
}

####################################
# Outputs pour les Security Groups
####################################
output "ec2_security_group_id" {
  description = "ID du security group de l'instance EC2"
  value       = aws_security_group.ec2_sg.id
}

output "rds_security_group_id" {
  description = "ID du security group pour RDS"
  value       = aws_security_group.rds_sg.id
}
