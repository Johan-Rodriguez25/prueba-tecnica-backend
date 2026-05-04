# Prueba Tecnica - Backend Developer

Bienvenido/a a la prueba tecnica para la posicion de **Backend Developer**. Esta prueba evalua tus habilidades en Node.js, TypeScript, NestJS, Express.js, PostgreSQL, Docker y arquitectura de microservicios.

## Como empezar

1. Haz un **fork** de este repositorio a tu cuenta de GitHub.
2. Clona tu fork localmente.
3. Lee [docs/01-requisitos-perfil.md](docs/01-requisitos-perfil.md) para entender el perfil esperado.
4. Lee [docs/02-prueba-practica.md](docs/02-prueba-practica.md) para las instrucciones completas de la prueba.
5. Lee [docs/03-instrucciones-entrega.md](docs/03-instrucciones-entrega.md) para saber como entregar tu solucion.

## Tiempo Limite

**8 horas** desde el momento en que se comparte este repositorio con el candidato.

Exitos.

---

## Levantar el proyecto (1 comando)

Levanta PostgreSQL + `payment-service` (NestJS) + `notification-service` (NestJS) + `api-gateway` (Express):

```bash
docker compose up --build
```

Servicios (por defecto):

- API Gateway: http://localhost:3000
- Payment Service: http://localhost:3001
- Notification Service: http://localhost:3002
- PostgreSQL: localhost:5432

Swagger:

- API Gateway Swagger UI: http://localhost:3000/api/docs
- Payment Service Swagger UI: http://localhost:3001/api/docs
- Notification Service Swagger UI: http://localhost:3002/api/docs

Health:

- API Gateway (agregador): http://localhost:3000/api/v1/health
- Payment Service: http://localhost:3001/health
- Notification Service: http://localhost:3002/health

## Variables de entorno

El `docker-compose.yml` carga variables desde:

- `./.env` (PostgreSQL y puertos publicados)
- `payments-service/.env.docker`
- `notification-service/.env.docker`
- `api-gateway/.env.docker`

Tambien puedes sobrescribir valores con variables de entorno del host o con `POSTGRES_*`, `API_GATEWAY_PORT`, `PAYMENT_SERVICE_PORT`.

### PostgreSQL (docker-compose)

- `POSTGRES_PORT` (default: `5432`)
- `POSTGRES_DB` (default: `payments`)
- `POSTGRES_USER` (default: `postgres`)
- `POSTGRES_PASSWORD` (default: `postgres`)

### payment-service (NestJS)

Archivo: `payments-service/.env.docker`

- `PORT` (default: `3001`)
- `NODE_ENV` (default: `production`)
- `DATABASE_URL` (default: `postgresql://postgres:postgres@postgres:5432/payments`)
- `DATABASE_POOL_MAX` (default: `20`)
- `DATABASE_POOL_IDLE_TIMEOUT_MS` (default: `30000`)
- `DATABASE_POOL_CONNECTION_TIMEOUT_MS` (default: `10000`)
- `PRISMA_TX_MAX_WAIT_MS` (default: `20000`)

Nota: al iniciar el contenedor de `payment-service` se ejecuta `prisma migrate deploy` para crear/actualizar tablas en el Postgres del compose.

### notification-service (NestJS)

Archivo: `notification-service/.env.docker`

- `PORT` (default: `3002`)
- `DATABASE_URL` (default: `postgresql://postgres:postgres@postgres:5432/payments`)
- `NOTIFICATION_EVENTS_PORT` (default: `4000`) (puerto TCP del microservicio para consumir eventos)
- `DATABASE_POOL_MAX` (default: `20`)
- `DATABASE_POOL_IDLE_TIMEOUT_MS` (default: `30000`)
- `DATABASE_POOL_CONNECTION_TIMEOUT_MS` (default: `10000`)
- `PRISMA_TX_MAX_WAIT_MS` (default: `20000`)

Nota: al iniciar el contenedor de `notification-service` se ejecuta `prisma migrate deploy` para crear/actualizar tablas en el Postgres del compose.

### api-gateway (Express)

Archivo: `api-gateway/.env.docker`

- `PORT` (default: `3000`)
- `ENV` (default: `local`)
- `NODE_ENV` (default: `production`)
- `PAYMENT_SERVICE_URL` (default: `http://payment-service:3001`)
- `PAYMENT_SERVICE_TIMEOUT_MS` (default: `8000`)
- `PAYMENT_SERVICE_TIMEOUT` (default: `8000`) (compatibilidad)
- `PAYMENT_SERVICE_SETTLEMENT_TIMEOUT_MS` (default: `120000`)
- `PAYMENT_SERVICE_SETTLEMENT_TIMEOUT` (default: `120000`) (compatibilidad)
- `NOTIFICATION_SERVICE_URL` (default: `http://notification-service:3002`)
- `NOTIFICATION_SERVICE_TIMEOUT_MS` (default: `8000`)
- `HEALTHCHECK_TIMEOUT_MS` (default: `2000`)
- `GATEWAY_BASE_URL` (opcional, para que Swagger del gateway muestre el server correcto)

## Autenticacion

Los endpoints se prueban a traves del **API Gateway** (`/api/v1/...`) y aceptan:

- `x-api-key: <API_KEY>` (API Key del merchant)
- `Authorization: Bearer <JWT>` (JWT; el gateway intentara extraer `api_key` del payload para forwardearlo como `x-api-key` al payment-service)

En el `payment-service` se valida:

- API key inexistente -> `401 Unauthorized`
- Merchant inactivo -> `403 Forbidden`

## Catalogo de endpoints (v1)

Base URL (Gateway): `http://localhost:3000/api/v1`

### Transactions

#### POST /transactions

Headers:

- `x-api-key: <API_KEY>`

Request:

```json
{
  "merchantId": "uuid",
  "amount": "10.50",
  "currency": "USD",
  "type": "payin",
  "metadata": { "source": "example" }
}
```

Response 201:

```json
{
  "id": "uuid",
  "merchantId": "uuid",
  "amount": "10.50",
  "currency": "USD",
  "type": "payin",
  "status": "pending",
  "reference": "TXN-20260327-A3F8K2",
  "metadata": { "source": "example" },
  "createdAt": "2026-05-04T00:00:00.000Z",
  "updatedAt": "2026-05-04T00:00:00.000Z"
}
```

#### GET /transactions

Headers:

- `x-api-key: <API_KEY>`

Query params:

- `page` (default `1`)
- `limit` (default `20`, max `100`)
- `status` (opcional)
- `type` (opcional)
- `date_from` (ISO 8601, opcional)
- `date_to` (ISO 8601, opcional)

Response 200:

```json
{
  "data": [],
  "meta": {
    "total": 0,
    "page": 1,
    "limit": 20,
    "total_pages": 0
  }
}
```

#### GET /transactions/:id

Headers:

- `x-api-key: <API_KEY>`

Response 200: mismo shape de `POST /transactions` (una sola transaccion).

#### PATCH /transactions/:id/status

Headers:

- `x-api-key: <API_KEY>`

Request:

```json
{ "status": "approved" }
```

Transiciones validas:

- `pending -> approved | rejected | failed`
- `approved -> completed | failed`

Error 422 (ejemplo):

```json
{
  "statusCode": 422,
  "message": "Transicion de estado invalida: no se puede cambiar de 'rejected' a 'approved'",
  "error": "Unprocessable Entity"
}
```

### Settlements

#### POST /settlements/generate

Headers:

- `x-api-key: <API_KEY>`

Request:

```json
{
  "merchant_id": "uuid",
  "period_start": "2026-03-01T00:00:00Z",
  "period_end": "2026-03-27T23:59:59Z"
}
```

Response 201:

```json
{
  "id": "uuid",
  "merchant_id": "uuid",
  "total_amount": "1000.50",
  "transaction_count": 3,
  "status": "pending",
  "period_start": "2026-03-01T00:00:00.000Z",
  "period_end": "2026-03-27T23:59:59.000Z",
  "transaction_ids": ["uuid"]
}
```

Si no hay transacciones elegibles (`approved` y no liquidadas) en el rango: `404 Not Found` con mensaje descriptivo.

#### GET /settlements/:id

Headers:

- `x-api-key: <API_KEY>`

Response 200:

```json
{
  "id": "uuid",
  "merchant_id": "uuid",
  "total_amount": "1000.50",
  "transaction_count": 3,
  "status": "pending",
  "period_start": "2026-03-01T00:00:00.000Z",
  "period_end": "2026-03-27T23:59:59.000Z",
  "transactions": []
}
```

### Notifications

#### GET /notifications

Headers:

- `x-api-key: <API_KEY>`

Query params:

- `merchantId` (requerido)
- `page` (default `1`)
- `limit` (default `20`, max `100`)

Response 200:

```json
{
  "data": [],
  "meta": {
    "total": 0,
    "page": 1,
    "limit": 20,
    "total_pages": 0
  }
}
```

#### GET /notifications/:id

Headers:

- `x-api-key: <API_KEY>`

Response 200:

```json
{
  "id": "uuid",
  "transactionId": "uuid",
  "merchantId": "uuid",
  "eventType": "transaction.approved",
  "payload": {},
  "status": "pending",
  "attempts": 0,
  "createdAt": "2026-05-04T00:00:00.000Z"
}
```

### Health

El health de los servicios se expone fuera del prefijo `/api` (sin versionado):

- Payment Service: `GET http://localhost:3001/health`
- Notification Service: `GET http://localhost:3002/health`

Y el agregador del gateway:

- API Gateway: `GET http://localhost:3000/api/v1/health`

## Decisiones de diseno

### Vertical Slice Architecture

Se adopto un enfoque de Vertical Slice Architecture (por feature), donde cada funcionalidad se organiza en su propio slice (DTO, controller, use-case):

- Facilita iterar rapido en etapas tempranas del proyecto (agregar endpoints sin un overhead alto).
- Reduce acoplamiento accidental entre features y hace mas clara la responsabilidad de cada carpeta.
- Permite evolucionar hacia arquitecturas mas estrictas (Clean/Hexagonal) cuando el dominio y las reglas crecen, sin forzarlas prematuramente.

### Gateway como punto unico de entrada

Se expone un `api-gateway` (Express) como entrypoint:

- Centraliza autenticacion/forwarding y documentacion.
- Encapsula el `payment-service` y permite evolucionar el backend sin romper clientes.

### Comunicacion asincrona (eventos)

Cuando una transaccion cambia de status (`PATCH /transactions/:id/status`), el `payment-service` emite un evento (NestJS Microservices TCP) con el pattern:

- `transaction.status_changed`

El `notification-service` consume el evento y persiste una notificacion en base de datos.
