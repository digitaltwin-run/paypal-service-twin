# PayPal Service Twin (`paypal-service-twin`)

`paypal-service-twin` to autonomne środowisko typu Digital Twin symulujące interfejsy API PayPal REST v2 na porcie `8793`. Umożliwia bezpieczne, lokalne testowanie płatności, subskrypcji i weryfikacji webhooków bez wywołań zewnętrznych.

---

## 🚀 Porty i Punkty Końcowe

- **Host Port**: `8793`
- **`GET /healthz`**: Status zdrowia usługi
- **`POST /v1/oauth2/token`**: Generowanie dostępowego tokenu OAuth
- **`POST /v2/checkout/orders`**: Tworzenie zamówienia PayPal
- **`GET /v2/checkout/orders/:id`**: Pobieranie stanu zamówienia (`APPROVED`)
- **`POST /v1/notifications/verify-webhook-signature`**: Weryfikacja sygnatury Webhook (`SUCCESS`)
- **`GET /v1/billing/subscriptions/:id`**: Stan subskrypcji (`ACTIVE`)

---

## 🛠 Szybkie Uruchomienie

- `make test`: Uruchomienie testów integracyjnych Node.js
- `make dev`: Uruchomienie usługi w kontenerze Docker (Port 8793)
- `make health`: Kontrola stanu zdrowia usługi
