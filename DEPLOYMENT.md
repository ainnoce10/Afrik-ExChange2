# Afrik-ExChange - Guide de déploiement et Sécurité

## 1. Prérequis
- Un VPS sous Ubuntu 22.04+
- Docker et Docker Compose installés
- Un nom de domaine avec SSL (Cloudflare ou Certbot)

## 2. Déploiement via Docker
1. Clonez le dépôt sur votre serveur.
2. Créez un fichier `.env` basé sur `.env.example`.
3. Lancez l'application :
   ```bash
   docker build -t ivoire-exchange .
   docker run -d -p 3000:3000 --env-file .env ivoire-exchange
   ```

## 3. Configuration Nginx (Reverse Proxy)
```nginx
server {
    listen 80;
    server_name exchange.votredomaine.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 4. Sécurité Production
- **HTTPS obligatoire** : Utilisez Let's Encrypt pour sécuriser les échanges.
- **Secrets** : Ne partagez jamais votre `JWT_SECRET` ou vos clés privées Tron.
- **Rate Limiting** : Déjà configuré au niveau de l'API Express (100 requêtes / 15 min).
- **Helmet** : En-têtes de sécurité HTTP activés.
- **Blockchain** : Utilisez un wallet "Hot Wallet" avec seulement la liquidité nécessaire pour les transactions automatiques. Gardez le reste sur un "Cold Wallet".
- **KYC** : Validez manuellement les documents CNI avant d'autoriser de gros volumes.

## 5. Maintenance
- Les logs sont accessibles via `docker logs`.
- La base de données est hébergée sur **Neon (PostgreSQL)**. Pensez à faire des backups réguliers via le dashboard Neon.
