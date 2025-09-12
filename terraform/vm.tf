####################################
# VPC principal (réseau global privé)
####################################
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16" # Plage d’adresses IP disponibles (65 536 adresses)
  enable_dns_support   = true          # Active la résolution DNS interne (ex: google.com → IP)
  enable_dns_hostnames = true          # Donne un nom DNS public aux instances EC2

  tags = {
    Name = "main-vpc" # Nom du VPC (visible dans la console AWS)
  }
}

####################################
# Subnet public (zone accessible d’Internet)
####################################
resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.main.id # Attache le subnet au VPC principal
  cidr_block              = "10.0.1.0/24"   # Plage IP du subnet (256 adresses)
  availability_zone       = "us-east-1a"    # Zone de dispo (dans la région choisie)
  map_public_ip_on_launch = true            # Donne automatiquement une IP publique à chaque EC2 lancé ici

  tags = {
    Name = "public-subnet"
  }
}

####################################
# Internet Gateway (porte vers Internet)
####################################
resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.main.id # Connectée au VPC

  tags = {
    Name = "main-igw"
  }
}

####################################
# Table de routage publique (trafic sortant)
####################################
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"                 # Toute destination Internet
    gateway_id = aws_internet_gateway.igw.id # Passe par l’Internet Gateway
  }
}

# Associe la route au subnet public (sinon ça ne marche pas)
resource "aws_route_table_association" "public_assoc" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public.id
}

####################################
# Security Group (firewall) pour EC2
####################################
resource "aws_security_group" "ec2_sg" {
  name        = "ec2-sg"
  description = "Autoriser HTTP, HTTPS et SSH"
  vpc_id      = aws_vpc.main.id

  # Autoriser SSH (connexion admin à la machine)
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] #  Tout le monde → mieux vaut restreindre à ton IP
  }

  # Autoriser HTTP (site en clair)
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # Tout le monde peut accéder au site
  }

  # Autoriser HTTPS (site sécurisé)
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Autoriser toutes les connexions sortantes (updates, téléchargement, etc.)
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"          # Tous protocoles
    cidr_blocks = ["0.0.0.0/0"] # Vers n’importe quelle destination
  }
}

####################################
# EC2 Instance (machine virtuelle)
####################################
resource "aws_instance" "wikijs" {
  ami                    = var.ec2_ami                    # Image Ubuntu 22.04 LTS officielle (us-east-1)
  instance_type          = var.ec2_instance_type          # Petite machine (Free Tier)
  subnet_id              = aws_subnet.public.id           # Placée dans le subnet public → IP publique
  vpc_security_group_ids = [aws_security_group.ec2_sg.id] # Attachée au firewall défini plus haut
  key_name               = var.ec2_key_name               #  Nom de ta clé SSH dans AWS (pour se connecter)

  tags = {
    Name = "wikijs-server" # Nom de la VM dans la console AWS
  }
}
