# Configuration Blockchain Afrik-ExChange (TRON TRC20)

Cette plateforme utilise le réseau **TRON** pour les transactions USDT (TRC20) en raison de ses frais de transaction réduits et de sa rapidité.

## 1. Réseaux supportés
- **Mainnet** : `https://api.trongrid.io` (Production)
- **Nile Testnet** : `https://api.nileex.io` (Développement/Test)

## 2. Variables d'Environnement Requises
Dans votre fichier `.env`, configurez les clés suivantes :

```env
# Clé API TronGrid (Optionnel mais recommandé pour éviter le rate limiting)
TRON_GRID_API_KEY=votre_cle_api

# Clé Privée du Wallet Admin (Celui qui envoie les USDT aux clients)
ADMIN_TRON_PRIVATE_KEY=votre_cle_privee_secrete

# Adresse publique du Wallet Admin
ADMIN_TRON_ADDRESS=votre_adresse_publique

# Adresse du contrat USDT (TRC20)
# Mainnet: TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t
USDT_CONTRACT_ADDRESS=TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t
```

## 3. Obtenir des fonds de test (Nile Testnet)
Pour tester l'application sans dépenser de l'argent réel :
1. Créez un wallet Tron (ex: via TronLink).
2. Allez sur le [Nile Faucet](https://nileex.io/join/getJoinPage).
3. Entrez votre adresse pour recevoir des **TRX** de test.
4. Pour obtenir des **USDT** de test sur Nile, vous pouvez utiliser un swap sur Nile ou demander sur le Telegram officiel de Tron.

## 4. Sécurité du Wallet Admin
- **Liquidité** : Ne gardez jamais l'intégralité de vos fonds sur le wallet connecté à l'API (Hot Wallet).
- **Frais (Energy/Bandwidth)** : Assurez-vous que le wallet admin possède suffisamment de **TRX** pour payer les frais de gaz des transferts USDT, ou "Stakez" des TRX pour obtenir de l'Énergie.
- **Monitoring** : Le backend inclut une fonction `getUsdtBalance` pour surveiller le solde du wallet admin et alerter en cas de solde faible.

## 5. Validation des Transactions
Le système vérifie les transactions via `checkTransactionStatus(txHash)`. En production, il est conseillé d'attendre au moins **19 confirmations** (environ 1 minute) avant de considérer une transaction comme définitive.
