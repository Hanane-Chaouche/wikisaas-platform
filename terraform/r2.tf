
resource "cloudflare_r2_bucket" "r2_bucket" {
  provider = cloudflare.r2
  account_id = var.r2_account_id
  name       = var.r2_bucket_name
  location   = "WNAM" # Amérique du Nord (Canada/USA)
}

########################
# Lifecycle Policy
########################
# Attention : 
# Le dashboard Cloudflare R2 peut afficher "0 days" même si Terraform définit 
# max_age = 10 ou 90. C’est un bug d’affichage connu dans le provider Terraform.
# → La règle est bien appliquée en arrière-plan (l’état Terraform est correct).
# → Vérifier dans Terraform state ou tester avec un fichier factice si besoin.
resource "cloudflare_r2_bucket_lifecycle" "backup_lifecycle" {
  provider    = cloudflare.r2
  account_id  = var.r2_account_id
  bucket_name = cloudflare_r2_bucket.r2_bucket.name

  rules = [{
    id       = "Transition backups to InfrequentAccess then delete"
    
    conditions = {
      prefix = "" # Vide = tous les objets du bucket
    }

    enabled = true
    # Supprime automatiquement les uploads multipart inachevés après 1 jour.
    # Utile pour éviter de payer du stockage inutile si un gros fichier a été
    # envoyé partiellement puis abandonné.

    abort_multipart_uploads_transition = {
      condition = {
        max_age = 1 # Après 1 jour → abort multipart upload
        type = "Age"
      }
    }

    storage_class_transitions = [{
      condition = {
        max_age = 10 # Après 10 jours → InfrequentAccess
        type    = "Age"
      }
      storage_class = "InfrequentAccess"
    }]

    delete_objects_transition = {
      condition = {
        max_age = 90 # Après 90 jours → suppression
        type    = "Age"
      }
    }
  }]
}
