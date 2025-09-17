########################
# DNS Records en boucle
########################
resource "cloudflare_dns_record" "wikijs" {
  for_each = toset(var.subdomains)

  zone_id = var.cloudflare_zone_id
  name    = each.key
  type    = "A"
  content = aws_instance.wikijs.public_ip
  proxied = true
  ttl     = 1   # Auto
}

########################
# Wildcard
########################
resource "cloudflare_dns_record" "wildcard" {
  zone_id = var.cloudflare_zone_id
  name    = "*"
  type    = "A"
  content = aws_instance.wikijs.public_ip
  proxied = true
  ttl     = 1
}
########################
# Domaine racine (wikiplatform.app)
########################
resource "cloudflare_dns_record" "root" {
  zone_id = var.cloudflare_zone_id
  name    = "@"
  type    = "A"
  content = aws_instance.wikijs.public_ip
  proxied = false   #  important pour SSH (pas de proxy Cloudflare sur port 22)
  ttl     = 1
}
