# System Wypożyczalni Filmów Online (Movie Rental System)

## 1. Temat pracy
Przedmiotem projektu jest aplikacja webowa typu **Video-on-Demand (VOD)**, umożliwiająca użytkownikom przeglądanie katalogu filmów, zarządzanie kontem oraz system wypożyczeń. Głównym celem projektu było stworzenie intuicyjnego interfejsu, który pozwala na monitorowanie aktywnych wypożyczeń, sprawdzanie terminów zwrotu oraz przeglądanie historii wypożyczeń.

## 2. Używane technologie

### Backend:
* **Python 3.x** – główny język programowania.
* **Flask** – mikro-framework webowy do obsługi API.
* **Flask-SQLAlchemy** – ORM do komunikacji z bazą danych.
* **PostgreSQL** – zaawansowana relacyjna baza danych (produkcyjna).
* **psycopg2-binary** – adapter bazy danych PostgreSQL dla Pythona.
* **Flask-JWT-Extended** – obsługa autoryzacji za pomocą tokenów JWT.

### Frontend:
* **React (TypeScript)** – biblioteka UI zapewniająca silne typowanie i komponentową strukturę.
* **Framer Motion** – biblioteka wykorzystana do płynnych animacji interfejsu i przejść między zakładkami.
* **Axios** – klient HTTP do obsługi zapytań asynchronicznych do API.
* **CSS Modules** – system stylizacji zapewniający izolację stylów dla poszczególnych komponentów.

## 3. Sposób realizacji

Aplikacja została zaprojektowana w oparciu o architekturę warstwową, co zapewnia separację logiki biznesowej od prezentacji danych:

### Backend (Pattern: Repository & Service):
1.  **Warstwa Modeli (`models/`)**: Definiuje schematy bazodanowe (Users, Movies, Rentals). Modele zawierają metody `serialize()`, które przygotowują dane do formatu JSON, wzbogacając je o relacje (np. dołączenie tytułu filmu do obiektu wypożyczenia).
2.  **Warstwa Repozytoriów (`repositories/`)**: Odpowiada za bezpośrednią komunikację z bazą danych. Wykorzystano technikę `joinedload` z SQLAlchemy, aby optymalnie pobierać powiązane dane (np. plakat filmu) jednym zapytaniem SQL.
3.  **Warstwa Serwisów (`services/`)**: Realizuje logikę biznesową, taką jak sprawdzanie dostępności filmu, obliczanie terminów zwrotu oraz walidacja uprawnień użytkownika.
4.  **Warstwa Kontrolerów (`routes/`)**: Definiuje punkty końcowe API, obsługuje kody błędów HTTP (np. 401 Unauthorized, 400 Bad Request) i zwraca dane w formacie JSON.

### Frontend:
1.  **Zarządzanie stanem**: Wykorzystano hooki `useState` oraz `useCallback` do zarządzania listami wypożyczeń i historią bez konieczności przeładowywania całej strony.
2.  **Dynamiczny UI**: Strona wypożyczeń automatycznie rozróżnia filmy "W terminie" od "Przeterminowanych", zmieniając ich stylizację i wyświetlając odpowiednie powiadomienia (Toast).
3.  **Typowanie**: Dzięki TypeScript, interfejsy danych (np. `Rental`, `Movie`) są spójne z tym, co przesyła backend, co minimalizuje ryzyko błędów runtime.

## 4. Główne funkcjonalności
* **System logowania**: Zabezpieczony dostęp do prywatnych zasobów użytkownika.
* **Zarządzanie wypożyczeniami**: Możliwość wypożyczania filmów na 14 dni i dokonywania zwrotów jednym kliknięciem.
* **Podgląd historii**: Pełen wgląd w archiwalne wypożyczenia wraz z datami faktycznego zwrotu.
* **Wizualizacja danych**: Każde wypożyczenie wyświetlane jest z plakatem filmu i tytułem dociąganym dynamicznie z bazy danych.

## 5. Uruchomienie projektu

### Backend:
```bash
# Instalacja zależności
pip install -r requirements.txt
# Uruchomienie aplikacji
python run.py
```
### Frontend:
```bash
# Instalacja paczek
npm install
# Start aplikacji
npm start
```
