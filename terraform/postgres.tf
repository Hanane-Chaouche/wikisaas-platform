####################################
# Subnets prives (pour RDS)
####################################

# Subnet prive n°1 (dans la zone us-east-1a)
# Contiendra une partie de ton RDS (utile pour la haute disponibilite)
resource "aws_subnet" "private1" {
  vpc_id            = aws_vpc.main.id # On rattache le subnet au VPC principal
  cidr_block        = "10.0.2.0/24"   # Plage d adresses IP du subnet
  availability_zone = "us-east-1a"    # Zone de disponibilite (AZ)
}

# Subnet prive n°2 (dans la zone us-east-1b)
# → Permet la redondance de RDS dans une autre zone
resource "aws_subnet" "private2" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.3.0/24"
  availability_zone = "us-east-1b"
}

####################################
# DB Subnet Group (obligatoire pour RDS)
####################################

# Groupe de subnets qui dit e AWS :
# "Mes bases RDS doivent etre placees dans ces subnets prives"
resource "aws_db_subnet_group" "rds" {
  name       = "rds-subnet-group"                               # Nom du subnet group
  subnet_ids = [aws_subnet.private1.id, aws_subnet.private2.id] # Liste des subnets prives

  tags = {
    Name = "rds-subnet-group"
  }
}

####################################
# Security Group pour RDS
####################################

# Pare-feu pour RDS : controle qui peut acceder au port PostgreSQL (5432)
resource "aws_security_group" "rds_sg" {
  name        = "rds-sg"
  description = "Autoriser EC2 a acceder a PostgreSQL"
  vpc_id      = aws_vpc.main.id

  # Regle d’entree (ingress)
  ingress {
    from_port       = 5432 # Port PostgreSQL
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ec2_sg.id]
    # Seul le Security Group de l’EC2 (Wiki.js) est autorise a acceder
  }

  # Regle de sortie (egress)
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"          # Tous protocoles
    cidr_blocks = ["0.0.0.0/0"] # Sortie vers Internet autorisee
  }
}

####################################
# Instances RDS PostgreSQL
####################################

# Base de données PostgreSQL pour le Wiki IA
resource "aws_db_instance" "wiki_ia" {
  identifier          = "wiki-ia-db"    # Nom unique de l instance RDS
  engine              = "postgres"      # Type de base (PostgreSQL)
  instance_class      = "db.t3.micro"   # Type de machine (petite, free tier possible)
  allocated_storage   = 20              # Disque 20 Go
  username            = var.db_username # Nom d utilisateur admin (variable)
  password            = var.db_password # Mot de passe admin (variable sensible)
  db_name             = "wiki_ia"       # Nom de la base
  skip_final_snapshot = true            # Pas de snapshot a la suppression

  vpc_security_group_ids = [aws_security_group.rds_sg.id] #  Protege par le SG RDS
  db_subnet_group_name   = aws_db_subnet_group.rds.name   #  Place dans les subnets prives
  publicly_accessible    = false                          #  Pas d IP publique
}

# Base de donnees PostgreSQL pour le Wiki DevOps
resource "aws_db_instance" "wiki_devops" {
  identifier          = "wiki-devops-db"
  engine              = "postgres"
  instance_class      = "db.t3.micro"
  allocated_storage   = 20
  username            = var.db_username
  password            = var.db_password
  db_name             = "wiki_devops"
  skip_final_snapshot = true

  vpc_security_group_ids = [aws_security_group.rds_sg.id]
  db_subnet_group_name   = aws_db_subnet_group.rds.name
  publicly_accessible    = false
}

# Base de donnees PostgreSQL pour le Wiki Cyber
resource "aws_db_instance" "wiki_cyber" {
  identifier          = "wiki-cyber-db"
  engine              = "postgres"
  instance_class      = "db.t3.micro"
  allocated_storage   = 20
  username            = var.db_username
  password            = var.db_password
  db_name             = "wiki_cyber"
  skip_final_snapshot = true

  vpc_security_group_ids = [aws_security_group.rds_sg.id]
  db_subnet_group_name   = aws_db_subnet_group.rds.name
  publicly_accessible    = false
}
