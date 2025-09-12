terraform {
  cloud {
    organization = "wikisaas-org"

    workspaces {
      name = "wikisaas-platform"
    }
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

# Provider dédié à R2 (utilise un token différent si besoin)
provider "cloudflare" {
  alias     = "r2"
  
  api_token = var.cloudflare_api_token_r2
}