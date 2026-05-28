# Architektura projektu

Projekt CineRent jest aplikacja VOD do przegladania katalogu filmow,
logowania uzytkownikow oraz obslugi wypozyczen. Rdzeniem systemu pozostaje
backend Flask, frontend React oraz relacyjna baza PostgreSQL.

## Warstwy aplikacji

Backend jest podzielony na warstwy:

- `routes` przyjmuje zadania HTTP i zwraca odpowiedzi JSON,
- `services` zawiera logike biznesowa,
- `repositories` odpowiada za dostep do danych,
- `models` opisuje tabele i relacje SQLAlchemy.

Frontend korzysta z komponentow React oraz osobnych serwisow HTTP opartych o
Axios. Publicznym punktem wejscia dla uzytkownika jest kontener frontendowy
dostepny na porcie `8080`.

## Kontenery

Srodowisko uruchamiane jest przez Docker Compose. Glowny zestaw uslug obejmuje:

- `frontend` - statyczny build React serwowany przez Nginx,
- `api-gateway` - Nginx jako brama dla ruchu `/api`,
- `backend` - Flask uruchomiony przez Gunicorn,
- `db` - PostgreSQL,
- `rabbitmq` - broker zdarzen,
- `outbox-worker` - publikacja zdarzen zapisanych w bazie,
- `notification-service` - obsluga zdarzen wypozyczen,
- `audit-service` - zapis zdarzen audytowych,
- `grafana`, `loki`, `promtail`, `jaeger`, `consul` - narzedzia operacyjne.

## Przeplyw HTTP

Uzytkownik korzysta z aplikacji przez `http://localhost:8080`.
Frontend przekazuje zadania API pod sciezka `/api` do `api-gateway`.
Gateway przekazuje ruch do backendu na `backend:5000` i dodaje naglowek
`X-Gateway: cinerent-api-gateway`.

## Przeplyw zdarzen

Backend zapisuje zdarzenia domenowe w tabeli `outbox_events`.
`outbox-worker` odczytuje wpisy ze statusem `pending`, publikuje je do RabbitMQ
i oznacza jako `published`.

Konsumenci zdarzen:

- `notification-service` odbiera `rental.*`,
- `audit-service` odbiera wszystkie zdarzenia i zapisuje je do `audit_events`.

Takie podejscie zostawia PostgreSQL jako zrodlo prawdy, a jednoczesnie pozwala
dopinac kolejne uslugi bez bezposredniego laczenia ich z backendem.
