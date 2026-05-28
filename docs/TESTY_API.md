# Testy API i uruchomienie kontrolne

## Start srodowiska

```powershell
docker compose build
docker compose up -d
docker compose ps
```

Po starcie warto sprawdzic, czy baza ma status `healthy`, a kontenery backendu,
frontendu, gatewaya i workerow sa uruchomione.

## Podstawowe sprawdzenie API

```powershell
Invoke-RestMethod http://localhost:8080/api/genres/
```

Oczekiwany rezultat: odpowiedz JSON z lista gatunkow.

## Rejestracja

```powershell
$body = @{
  username = "testuser123"
  email = "testuser123@example.com"
  password = "test123"
} | ConvertTo-Json

Invoke-RestMethod `
  -Method Post `
  -Uri http://localhost:8080/api/auth/register `
  -ContentType "application/json" `
  -Body $body
```

Oczekiwany rezultat: komunikat o utworzeniu konta.

## Logowanie

```powershell
$loginBody = @{
  username = "testuser123"
  password = "test123"
} | ConvertTo-Json

Invoke-RestMethod `
  -Method Post `
  -Uri http://localhost:8080/api/auth/login `
  -ContentType "application/json" `
  -Body $loginBody
```

Oczekiwany rezultat: `access_token`.

## Gateway

```powershell
(Invoke-WebRequest http://localhost:8080/api/genres/ -UseBasicParsing).Headers
```

W naglowkach powinno byc widoczne:

```text
X-Gateway: cinerent-api-gateway
```

## RabbitMQ i outbox

Po wykonaniu operacji logowania lub wypozyczenia mozna sprawdzic tabele:

```powershell
docker compose exec db psql -U postgres -d ztp_projekt -c "select event_type, status, created_at, published_at from outbox_events order by created_at desc limit 10;"
docker compose exec db psql -U postgres -d ztp_projekt -c "select event_type, received_at from audit_events order by received_at desc limit 10;"
```

Oczekiwany rezultat: nowe zdarzenia maja status `published`, a `audit_events`
zawiera wpisy typu `auth.logged_in`, `rental.created` lub podobne.
