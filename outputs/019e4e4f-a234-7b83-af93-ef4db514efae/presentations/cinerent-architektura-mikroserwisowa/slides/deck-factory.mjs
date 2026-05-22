const ROOT = "C:/Users/jkolodziej/Desktop/ZTP-projekt";

const C = {
  paper: "#F8F7F2",
  paper2: "#EFEDE5",
  ink: "#17202A",
  muted: "#5E6470",
  line: "#D8D3C7",
  teal: "#0E7C7B",
  coral: "#E85D4A",
  amber: "#F2B134",
  violet: "#6554C0",
  green: "#2E9D6F",
  blue: "#2F6FDB",
  dark: "#111827",
  white: "#FFFFFF",
};

const poster = (name) => `${ROOT}/backend/app/static/posters/${name}`;

function add(slide, ctx, kind, opts) {
  if (kind === "text") return ctx.addText(slide, opts);
  return ctx.addShape(slide, opts);
}

function background(slide, ctx, color = C.paper) {
  ctx.addShape(slide, { x: 0, y: 0, w: ctx.W, h: ctx.H, fill: color, line: ctx.line(color, 0) });
}

function footer(slide, ctx, n, label = "CineRent | architektura mikroserwisowa") {
  ctx.addShape(slide, { x: 64, y: 666, w: 1152, h: 1.5, fill: C.line, line: ctx.line(C.line, 0) });
  ctx.addText(slide, {
    text: label,
    x: 64,
    y: 681,
    w: 760,
    h: 24,
    fontSize: 15,
    color: C.muted,
  });
  ctx.addText(slide, {
    text: String(n).padStart(2, "0"),
    x: 1145,
    y: 681,
    w: 70,
    h: 24,
    fontSize: 15,
    color: C.muted,
    align: "right",
  });
}

function title(slide, ctx, kicker, heading, subheading, n) {
  ctx.addText(slide, {
    text: kicker.toUpperCase(),
    x: 64,
    y: 46,
    w: 900,
    h: 24,
    fontSize: 13,
    bold: true,
    color: C.teal,
  });
  ctx.addText(slide, {
    text: heading,
    x: 64,
    y: 82,
    w: 930,
    h: 88,
    fontSize: 34,
    bold: true,
    color: C.ink,
    typeface: ctx.fonts.title,
  });
  if (subheading) {
    ctx.addText(slide, {
      text: subheading,
      x: 66,
      y: 172,
      w: 820,
      h: 44,
      fontSize: 19,
      color: C.muted,
    });
  }
  footer(slide, ctx, n);
}

function pill(slide, ctx, text, x, y, w, color, bg = C.white) {
  ctx.addShape(slide, { x, y, w, h: 34, fill: bg, line: ctx.line(color, 1.5) });
  ctx.addText(slide, {
    text,
    x: x + 12,
    y: y + 8,
    w: w - 24,
    h: 18,
    fontSize: 13,
    bold: true,
    color,
    align: "center",
  });
}

function node(slide, ctx, label, detail, x, y, w, h, color, fill = C.white) {
  ctx.addShape(slide, { x, y, w, h, fill, line: ctx.line(color, 2) });
  ctx.addShape(slide, { x, y, w: 8, h, fill: color, line: ctx.line(color, 0) });
  ctx.addText(slide, { text: label, x: x + 22, y: y + 14, w: w - 34, h: 25, fontSize: 18, bold: true, color: C.ink });
  if (detail) ctx.addText(slide, { text: detail, x: x + 22, y: y + 42, w: w - 34, h: h - 50, fontSize: 14, color: C.muted });
}

function connector(slide, ctx, x1, y1, x2, y2, color = C.line) {
  if (Math.abs(y2 - y1) < 3) {
    const x = Math.min(x1, x2);
    ctx.addShape(slide, { x, y: y1 - 1, w: Math.abs(x2 - x1), h: 2, fill: color, line: ctx.line(color, 0) });
  } else if (Math.abs(x2 - x1) < 3) {
    const y = Math.min(y1, y2);
    ctx.addShape(slide, { x: x1 - 1, y, w: 2, h: Math.abs(y2 - y1), fill: color, line: ctx.line(color, 0) });
  } else {
    connector(slide, ctx, x1, y1, x2, y1, color);
    connector(slide, ctx, x2, y1, x2, y2, color);
  }
}

function stat(slide, ctx, value, label, x, y, w, color) {
  ctx.addShape(slide, { x, y, w, h: 100, fill: C.white, line: ctx.line(color, 2) });
  ctx.addText(slide, { text: value, x: x + 18, y: y + 17, w: w - 36, h: 34, fontSize: 28, bold: true, color });
  ctx.addText(slide, { text: label, x: x + 18, y: y + 55, w: w - 36, h: 35, fontSize: 14, color: C.muted });
}

async function safeIcon(slide, ctx, name, x, y, color = C.ink, size = 34) {
  try {
    await ctx.addLucideIcon(slide, { icon: name, x, y, w: size, h: size, color, strokeWidth: 2.2 });
  } catch {
    ctx.addText(slide, { text: "*", x, y, w: size, h: size, fontSize: 20, bold: true, color, align: "center" });
  }
}

function proofBox(slide, ctx, label, value, x, y, w, h, color = C.green) {
  const lineCount = String(value).split("\n").length;
  const bodySize = lineCount >= 4 ? 14 : lineCount >= 2 ? 15 : 17;
  ctx.addShape(slide, { x, y, w, h, fill: C.dark, line: ctx.line(color, 2) });
  ctx.addText(slide, { text: label, x: x + 18, y: y + 14, w: w - 36, h: 20, fontSize: 13, bold: true, color });
  ctx.addText(slide, { text: value, x: x + 18, y: y + 40, w: w - 36, h: h - 46, fontSize: bodySize, color: C.white, typeface: ctx.fonts.mono });
}

export async function buildSlide(presentation, ctx, n) {
  const slide = presentation.slides.add();

  if (n === 1) {
    background(slide, ctx, C.dark);
    const imgs = ["Interstellar.jpg", "Diuna.jpg", "oppenheimer.jpg", "Barbie.jpg", "Joker.jpg", "inside_out_2.jpg"];
    for (let i = 0; i < imgs.length; i += 1) {
      await ctx.addImage(slide, { path: poster(imgs[i]), x: 820 + (i % 2) * 156, y: 34 + Math.floor(i / 2) * 210, w: 132, h: 190, fit: "cover" });
    }
    ctx.addShape(slide, { x: 780, y: 0, w: 500, h: 720, fill: "#111827CC", line: ctx.line("#11182700", 0) });
    ctx.addText(slide, { text: "CineRent", x: 72, y: 76, w: 560, h: 74, fontSize: 52, bold: true, color: C.white, typeface: ctx.fonts.title });
    ctx.addText(slide, { text: "Architektura mikroserwisowa wypożyczalni VOD", x: 74, y: 160, w: 680, h: 70, fontSize: 26, color: "#E7ECEF" });
    ctx.addText(slide, { text: "React + Flask + PostgreSQL rozszerzone o API Gateway, RabbitMQ, outbox, audit, notification-service i obserwowalność.", x: 76, y: 274, w: 650, h: 96, fontSize: 21, color: "#CBD5E1" });
    pill(slide, ctx, "Docker Compose", 76, 428, 172, C.amber, "#111827");
    pill(slide, ctx, "RabbitMQ", 270, 428, 128, C.green, "#111827");
    pill(slide, ctx, "API Gateway", 420, 428, 156, C.coral, "#111827");
    proofBox(slide, ctx, "Potwierdzone działanie", "HTTP 200/201 przez gateway\noutbox_events: published\naudit_events: auth.logged_in, rental.created", 76, 506, 650, 116, C.green);
    ctx.addText(slide, { text: "01", x: 1160, y: 666, w: 60, h: 24, fontSize: 15, color: "#94A3B8", align: "right" });
    return slide;
  }

  if (n === 2) {
    background(slide, ctx);
    title(slide, ctx, "punkt wyjścia", "Działająca aplikacja VOD była bazą, której nie trzeba było przepisywać", "Warstwowy backend i Reactowy frontend zostały zachowane, a mikroserwisy dopięte obok.", n);
    stat(slide, ctx, "React", "interfejs katalogu, logowania, profilu i wypożyczeń", 72, 270, 240, C.blue);
    stat(slide, ctx, "Flask", "API z JWT, route -> service -> repository -> model", 340, 270, 270, C.teal);
    stat(slide, ctx, "PostgreSQL", "główna relacyjna baza danych i źródło prawdy", 638, 270, 270, C.green);
    stat(slide, ctx, "Docker", "jeden sposób startu całego środowiska", 936, 270, 240, C.coral);
    node(slide, ctx, "Zakres produktu", "logowanie, katalog filmów, wypożyczenie na 14 dni, zwrot, historia, plakaty i dane powiązane", 72, 430, 520, 130, C.amber);
    await ctx.addImage(slide, { path: poster("Interstellar.jpg"), x: 648, y: 416, w: 110, h: 154, fit: "cover" });
    await ctx.addImage(slide, { path: poster("Diuna.jpg"), x: 780, y: 416, w: 110, h: 154, fit: "cover" });
    await ctx.addImage(slide, { path: poster("oppenheimer.jpg"), x: 912, y: 416, w: 110, h: 154, fit: "cover" });
    await ctx.addImage(slide, { path: poster("Barbie.jpg"), x: 1044, y: 416, w: 110, h: 154, fit: "cover" });
    return slide;
  }

  if (n === 3) {
    background(slide, ctx);
    title(slide, ctx, "docelowy układ", "Docker Compose spina aplikację, komunikację, dane i obserwowalność", "PostgreSQL zostaje główną bazą; nowe elementy są dołożone jako osobne kontenery.", n);
    node(slide, ctx, "Frontend", "React build serwowany przez Nginx\nport hosta: 8080", 68, 264, 210, 104, C.blue);
    node(slide, ctx, "API Gateway", "Nginx: routing, rate limiting,\nnagłówki, /health", 336, 264, 230, 104, C.coral);
    node(slide, ctx, "Backend", "Flask + Gunicorn\nAPI i logika domenowa", 624, 264, 230, 104, C.teal);
    node(slide, ctx, "PostgreSQL", "users, movies, rentals,\noutbox_events, audit_events", 912, 264, 240, 104, C.green);
    connector(slide, ctx, 278, 316, 336, 316, C.coral);
    connector(slide, ctx, 566, 316, 624, 316, C.teal);
    connector(slide, ctx, 854, 316, 912, 316, C.green);
    node(slide, ctx, "Outbox worker", "czyta pending events\npublikuje do RabbitMQ", 302, 442, 230, 96, C.amber);
    node(slide, ctx, "RabbitMQ", "exchange cinerent.events\nrouting: topic", 574, 442, 220, 96, C.violet);
    node(slide, ctx, "Notification", "subskrybuje rental.*\nloguje powiadomienia", 836, 430, 220, 84, C.blue);
    node(slide, ctx, "Audit", "subskrybuje #\nzapisuje audit_events", 836, 528, 220, 84, C.green);
    connector(slide, ctx, 432, 368, 432, 442, C.amber);
    connector(slide, ctx, 532, 490, 574, 490, C.violet);
    connector(slide, ctx, 794, 490, 836, 472, C.blue);
    connector(slide, ctx, 794, 490, 836, 570, C.green);
    ctx.addText(slide, { text: "Obserwowalność i discovery: Grafana + Loki + Promtail, Jaeger, Consul", x: 120, y: 592, w: 610, h: 30, fontSize: 18, bold: true, color: C.ink });
    return slide;
  }

  if (n === 4) {
    background(slide, ctx);
    title(slide, ctx, "edge layer", "Gateway przejmuje odpowiedzialność za wejście do API", "Frontend nadal woła /api, ale ruch przechodzi przez osobny kontener api-gateway.", n);
    node(slide, ctx, "Przeglądarka", "http://localhost:8080", 96, 276, 220, 100, C.blue);
    node(slide, ctx, "Frontend Nginx", "proxy /api -> api-gateway:80", 390, 276, 240, 100, C.amber);
    node(slide, ctx, "API Gateway", "Nginx upstream backend:5000\nX-Gateway, nosniff, /health", 704, 250, 280, 128, C.coral);
    node(slide, ctx, "Backend", "Flask endpoints\n/api/auth, /api/movies, /api/rentals", 1030, 276, 200, 100, C.teal);
    connector(slide, ctx, 316, 326, 390, 326, C.blue);
    connector(slide, ctx, 630, 326, 704, 326, C.amber);
    connector(slide, ctx, 984, 326, 1030, 326, C.teal);
    proofBox(slide, ctx, "Rate limiting w gatewayu", "api_rate: 10r/s, burst 30\nauth_rate: 5r/m, burst 5\nlimit_req_status 429", 118, 462, 442, 118, C.coral);
    proofBox(slide, ctx, "Dowód z odpowiedzi HTTP", "X-Gateway: cinerent-api-gateway\nContent-Type: application/json\nGET /api/genres -> 200", 648, 462, 470, 118, C.green);
    return slide;
  }

  if (n === 5) {
    background(slide, ctx);
    title(slide, ctx, "komunikacja zdarzeniowa", "Zdarzenia odpinają operacje biznesowe od usług pobocznych", "Backend zapisuje fakt domenowy, a publikacja i reakcje dzieją się asynchronicznie.", n);
    const steps = [
      ["1", "POST /api/rentals", "użytkownik wypożycza film", C.blue],
      ["2", "Backend", "walidacja + zapis rental", C.teal],
      ["3", "outbox_events", "event rental.created jako pending", C.green],
      ["4", "Outbox worker", "publikacja do RabbitMQ", C.amber],
      ["5", "RabbitMQ", "topic exchange", C.violet],
      ["6", "Consumers", "notification + audit", C.coral],
    ];
    for (let i = 0; i < steps.length; i += 1) {
      const [num, h, d, color] = steps[i];
      const x = 72 + i * 194;
      ctx.addShape(slide, { x, y: 296, w: 150, h: 150, fill: C.white, line: ctx.line(color, 2) });
      ctx.addShape(slide, { x: x + 16, y: 314, w: 34, h: 34, fill: color, line: ctx.line(color, 0) });
      ctx.addText(slide, { text: num, x: x + 16, y: 321, w: 34, h: 20, fontSize: 16, bold: true, color: C.white, align: "center" });
      ctx.addText(slide, { text: h, x: x + 16, y: 366, w: 118, h: 26, fontSize: 16, bold: true, color: C.ink });
      ctx.addText(slide, { text: d, x: x + 16, y: 397, w: 118, h: 32, fontSize: 12, color: C.muted });
      if (i < steps.length - 1) connector(slide, ctx, x + 150, 371, x + 194, 371, C.line);
    }
    proofBox(slide, ctx, "Routing kluczy zdarzeń", "auth.registered\nauth.logged_in\nrental.created\nrental.returned", 118, 496, 430, 112, C.violet);
    proofBox(slide, ctx, "Consumers", "notification-service: rental.*\naudit-service: #", 650, 496, 430, 112, C.green);
    return slide;
  }

  if (n === 6) {
    background(slide, ctx);
    title(slide, ctx, "niezawodność publikacji", "Outbox pattern chroni zdarzenia przed zgubieniem", "Zdarzenie jest najpierw transakcyjnie odkładane w PostgreSQL, a dopiero potem publikowane przez worker.", n);
    node(slide, ctx, "Tabela outbox_events", "event_id, event_type, payload JSONB,\nsource, status, attempts,\nlast_error, created_at, published_at", 86, 275, 420, 176, C.green);
    node(slide, ctx, "Worker", "pobiera pending\nFOR UPDATE SKIP LOCKED\npublikuje i oznacza published", 608, 292, 280, 140, C.amber);
    node(slide, ctx, "RabbitMQ", "durable topic exchange\nrouting key = event_type", 1000, 292, 190, 140, C.violet);
    connector(slide, ctx, 506, 360, 608, 360, C.amber);
    connector(slide, ctx, 888, 360, 1000, 360, C.violet);
    proofBox(slide, ctx, "Wynik sprawdzenia w bazie", "event_type      status\nrental.created  published\nauth.logged_in  published", 180, 486, 414, 116, C.green);
    proofBox(slide, ctx, "Co to daje", "backend nie musi znać konsumentów\nretry jest możliwy przez attempts\nPostgreSQL zostaje źródłem prawdy", 684, 486, 414, 116, C.teal);
    return slide;
  }

  if (n === 7) {
    background(slide, ctx);
    title(slide, ctx, "notification-service", "Pierwszy dopięty mikroserwis reaguje na wypożyczenia", "Usługa słucha RabbitMQ i obsługuje zdarzenia rental.* bez wołania backendu synchronicznie.", n);
    await safeIcon(slide, ctx, "Bell", 92, 282, C.blue, 42);
    node(slide, ctx, "Kolejka", "queue: notification-service\nrouting_key: rental.*", 158, 264, 330, 120, C.blue);
    node(slide, ctx, "Logika", "odczyt typu zdarzenia\nwyciągnięcie user_id, tytułu i terminu", 548, 264, 330, 120, C.teal);
    node(slide, ctx, "Efekt", "komunikat powiadomienia\nwidoczny w logach kontenera", 938, 264, 240, 120, C.green);
    connector(slide, ctx, 488, 324, 548, 324, C.teal);
    connector(slide, ctx, 878, 324, 938, 324, C.green);
    proofBox(slide, ctx, "Potwierdzenie z logów", "rental.created -> 127 Godzin | termin: 2026-06-05\nrental.created -> 2012 | termin: 2026-06-05", 158, 454, 850, 112, C.green);
    return slide;
  }

  if (n === 8) {
    background(slide, ctx);
    title(slide, ctx, "audit-service", "Każde ważne zdarzenie może trafić do śladu audytowego", "Audit-service subskrybuje wszystkie zdarzenia z exchange i zapisuje je w PostgreSQL.", n);
    node(slide, ctx, "RabbitMQ", "exchange: cinerent.events\nrouting_key: #", 92, 286, 260, 116, C.violet);
    node(slide, ctx, "audit-service", "konsument zdarzeń\nnormalizacja payloadu", 474, 286, 280, 116, C.coral);
    node(slide, ctx, "PostgreSQL", "audit_events\nreceived_at + event_type", 876, 286, 260, 116, C.green);
    connector(slide, ctx, 352, 344, 474, 344, C.coral);
    connector(slide, ctx, 754, 344, 876, 344, C.green);
    proofBox(slide, ctx, "Zapytanie kontrolne", "select event_type, received_at\nfrom audit_events\norder by received_at desc limit 10;", 112, 476, 470, 112, C.violet);
    proofBox(slide, ctx, "Wynik", "rental.created | 2026-05-22 11:47:26\nauth.logged_in | 2026-05-22 11:47:20", 676, 476, 470, 112, C.green);
    return slide;
  }

  if (n === 9) {
    background(slide, ctx);
    title(slide, ctx, "operacyjność", "Do projektu dołożono podstawę pod obserwowalność i discovery", "To nie zmienia domeny aplikacji, ale daje narzędzia do diagnozy środowiska kontenerowego.", n);
    const ops = [
      ["Grafana", "dashboard UI\nport 3000", C.coral, "Activity"],
      ["Loki", "centralizacja logów\nport 3100", C.green, "Search"],
      ["Promtail", "zbiera logi Dockera\nwysyła do Loki", C.amber, "Send"],
      ["Jaeger", "tracing UI\nport 16686", C.violet, "GitBranch"],
      ["Consul", "service discovery UI\nport 8500", C.blue, "Network"],
    ];
    for (let i = 0; i < ops.length; i += 1) {
      const [h, d, color, icon] = ops[i];
      const x = 76 + i * 226;
      ctx.addShape(slide, { x, y: 286, w: 184, h: 154, fill: C.white, line: ctx.line(color, 2) });
      await safeIcon(slide, ctx, icon, x + 18, 306, color, 32);
      ctx.addText(slide, { text: h, x: x + 18, y: 352, w: 148, h: 28, fontSize: 20, bold: true, color: C.ink });
      ctx.addText(slide, { text: d, x: x + 18, y: 390, w: 148, h: 44, fontSize: 14, color: C.muted });
    }
    proofBox(slide, ctx, "Zakres wdrożony", "kontenery + provisioning Grafany\nkonfiguracje Loki/Promtail", 186, 500, 410, 98, C.green);
    proofBox(slide, ctx, "Zakres do domknięcia", "metryki, alerty\ninstrumentacja trace w kodzie aplikacji", 684, 500, 410, 98, C.amber);
    return slide;
  }

  if (n === 10) {
    background(slide, ctx);
    title(slide, ctx, "weryfikacja", "Ścieżka użytkownika i platforma zostały sprawdzone end-to-end", "Najważniejsze testy przechodzą przez publiczny port frontendu, a backend pozostaje wewnątrz sieci Compose.", n);
    const checks = [
      ["GET /api/genres", "200 + application/json", C.green],
      ["POST /api/auth/register", "konto utworzone", C.green],
      ["POST /api/auth/login", "access_token JWT", C.green],
      ["GET /health w gatewayu", "api-gateway OK", C.green],
      ["POST /api/rentals", "201 + event rental.created", C.green],
      ["RabbitMQ consumers", "notification + audit", C.green],
    ];
    for (let i = 0; i < checks.length; i += 1) {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = 110 + col * 540;
      const y = 258 + row * 104;
      ctx.addShape(slide, { x, y, w: 450, h: 78, fill: C.white, line: ctx.line(C.line, 1.5) });
      ctx.addShape(slide, { x: x + 18, y: y + 21, w: 36, h: 36, fill: checks[i][2], line: ctx.line(checks[i][2], 0) });
      ctx.addText(slide, { text: "OK", x: x + 18, y: y + 31, w: 36, h: 16, fontSize: 12, bold: true, color: C.white, align: "center" });
      ctx.addText(slide, { text: checks[i][0], x: x + 72, y: y + 15, w: 330, h: 24, fontSize: 18, bold: true, color: C.ink });
      ctx.addText(slide, { text: checks[i][1], x: x + 72, y: y + 45, w: 330, h: 20, fontSize: 14, color: C.muted });
    }
    proofBox(slide, ctx, "Wniosek", "Frontend -> Gateway -> Backend -> PostgreSQL działa; eventy docierają do usług.", 220, 582, 840, 68, C.green);
    return slide;
  }

  if (n === 11) {
    background(slide, ctx);
    title(slide, ctx, "bilans architektury", "Nowe usługi dają modularność, ale wymagają dyscypliny operacyjnej", "To dobry kierunek dla projektu, o ile kolejne elementy będą dodawane wokół realnych przepływów.", n);
    node(slide, ctx, "Zyski", "skalowanie elementów niezależnie\nbrak bezpośredniego coupling do notyfikacji\naudyt zdarzeń\njeden kontrakt wejściowy przez gateway", 88, 278, 330, 210, C.green);
    node(slide, ctx, "Koszt", "więcej kontenerów i konfiguracji\nkolejki wymagają monitoringu\ntrzeba pilnować schematów eventów\nwięcej miejsc do logowania błędów", 476, 278, 330, 210, C.amber);
    node(slide, ctx, "Ryzyka do kontroli", "sekrety i .env\nrate limit w środowisku prod\nmigracje tabel outbox/audit\nbrak dashboardów SLO/alertów", 864, 278, 330, 210, C.coral);
    proofBox(slide, ctx, "Najważniejsza decyzja projektowa", "Nie zmieniamy PostgreSQL na MongoDB.\nRelacyjna baza zostaje systemem prawdy; RabbitMQ przenosi zdarzenia.", 210, 526, 850, 88, C.teal);
    return slide;
  }

  if (n === 12) {
    background(slide, ctx, C.dark);
    ctx.addText(slide, { text: "Co dalej?", x: 74, y: 72, w: 520, h: 62, fontSize: 44, bold: true, color: C.white, typeface: ctx.fonts.title });
    ctx.addText(slide, { text: "Najlepsze kolejne kroki to nie dokładanie usług dla samej listy, tylko domknięcie bezpieczeństwa, widoczności i automatyzacji.", x: 78, y: 152, w: 760, h: 62, fontSize: 22, color: "#D9E2EC" });
    const next = [
      ["Identity Provider", "np. Keycloak/OAuth2, tokeny i role poza backendem", C.coral],
      ["Tracing w kodzie", "OpenTelemetry -> Jaeger/Tempo, ślad requestu przez gateway i backend", C.violet],
      ["Dashboardy i alerty", "Grafana: błędy 5xx, kolejka RabbitMQ, outbox pending", C.green],
      ["Kontrakty eventów", "wersjonowanie payloadów i testy konsumentów", C.amber],
      ["CI/CD", "build, test, lint, compose smoke test na każdym pushu", C.blue],
    ];
    for (let i = 0; i < next.length; i += 1) {
      const y = 272 + i * 66;
      ctx.addShape(slide, { x: 92, y, w: 32, h: 32, fill: next[i][2], line: ctx.line(next[i][2], 0) });
      ctx.addText(slide, { text: String(i + 1), x: 92, y: y + 8, w: 32, h: 16, fontSize: 13, bold: true, color: C.white, align: "center" });
      ctx.addText(slide, { text: next[i][0], x: 148, y: y - 2, w: 290, h: 24, fontSize: 20, bold: true, color: C.white });
      ctx.addText(slide, { text: next[i][1], x: 456, y: y, w: 650, h: 24, fontSize: 16, color: "#CBD5E1" });
    }
    proofBox(slide, ctx, "Stan na teraz", "docker compose + PostgreSQL + gateway + RabbitMQ + outbox + notification + audit + observability", 106, 592, 930, 68, C.green);
    ctx.addText(slide, { text: "12", x: 1140, y: 666, w: 70, h: 24, fontSize: 15, color: "#94A3B8", align: "right" });
    return slide;
  }

  background(slide, ctx);
  title(slide, ctx, "fallback", "Slide not found", "", n);
  return slide;
}
