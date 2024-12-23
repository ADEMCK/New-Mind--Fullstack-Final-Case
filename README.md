# E-Ticaret Uygulaması

Bu proje, bir e-ticaret uygulaması için geliştirilmiş bir monolitik çekirdek servisidir. Uygulama, kullanıcı yönetimi, ürün yönetimi, fatura servisi ve ödeme servisi gibi temel işlevleri içermektedir.

## Proje Yapısı

Proje aşağıdaki dizin yapısına sahiptir:

```plaintext
New-Mind-Fullstack-Final-Case/
├── monolithic-core/
│   ├── src/
│   │   ├── app.js
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   └── redis.js
│   │   ├── controllers/
│   │   │   └── userController.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   └── errorHandler.js
│   │   ├── models/
│   │   │   └── User.js
│   │   └── routes/
│   │       └── userRoutes.js
│   ├── Dockerfile
│   ├── package.json
│   └── ...
├── invoice-service/
│   ├── src/
│   │   └── app.js
│   ├── Dockerfile
│   ├── package.json
│   └── ...
├── payment-service/
│   ├── Dockerfile
│   ├── package.json
│   └── ...
└── .env