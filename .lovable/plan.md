

# Dashboard Redesign Plan

## Pregled

Trenutni dashboard je funkcionalan, ali može biti vizuelno atraktivniji i bolje organizovan. Predlazem moderan, profesionalan redizajn koji poboljsava korisnicko iskustvo.

## Predlozene Promene

### 1. Novo Header Iskustvo
- Ukloniti duplirani prikaz korisnickog imena (trenutno se prikazuje i u headeru i u pozdravnoj sekciji)
- Dodati avatar sa inicijalima korisnika
- Kompaktniji, elegantniji header

### 2. Poboljsana Welcome Sekcija
- Dodati greeting koji se menja u zavisnosti od doba dana ("Guten Morgen", "Guten Tag", "Guten Abend")
- Dodati progres bar koji pokazuje koliko dana pristupa je ostalo
- Vizuelno privlacniji dizajn sa gradijentom

### 3. Reorganizovane Stats Kartice
- Novi dizajn sa vecim ikonama i boljim razmacima
- Dodata statistika "Odgledani videi" - koliko je korisnik pogledao
- Progress indikator za "Tage verbleibend"

### 4. Redizajnirani Profile Widget
- Dodati korisnikov avatar sa inicijalima (veliki, centriran)
- Lepsi layout sa jasnim sekcijama
- Dugme za promenu lozinke (link ka reset password)

### 5. Poboljsani Orders Widget
- Status badge za placanja (uspesno/na cekanju)
- Bolji vizuelni prikaz transakcija
- Prazan state sa ilustracijom

### 6. Nova Video Watch Progress Sekcija
- Widget koji pokazuje napredak gledanja videa
- Lista poslednjih odgledanih videa sa linkovima
- Motivacione poruke

### 7. Responzivni Layout
- Na mobilnom: vertikalni stack svih widgeta
- Na desktopu: 3-kolonski grid za stats, 2-kolonski za widgete
- Dodati Tabs komponentu za mobilni prikaz (Profil/Placanja/Napredak)

## Vizuelni Prikaz Novog Layouta

```text
+--------------------------------------------------+
|  HEADER: Logo    [Avatar] Branko [Logout]        |
+--------------------------------------------------+
|                                                  |
|  Guten Tag, Branko!                              |
|  Dein Zugang lauft in 245 Tagen ab               |
|  [==================------] 67% verbleibend      |
|                                                  |
+--------------------------------------------------+
|                                                  |
|  [Stats Row - 4 Karten]                          |
|  +----------+ +----------+ +----------+ +------+ |
|  |Kategorien| |  Videos  | |Angesehen | | Tage | |
|  |    8     | |   30+    | |  12/30   | | 245  | |
|  +----------+ +----------+ +----------+ +------+ |
|                                                  |
+--------------------------------------------------+
|                                                  |
|  +---------------------+  +--------------------+ |
|  |     Lernvideos      |  |  Zuletzt gesehen   | |
|  |  [Play Button Big]  |  |  - Video 1 (2min)  | |
|  |  Jetzt starten!     |  |  - Video 2 (5min)  | |
|  +---------------------+  +--------------------+ |
|                                                  |
+--------------------------------------------------+
|                                                  |
|  +----------+  +-----------+  +---------------+  |
|  |  PROFIL  |  | ZAHLUNGEN |  | FORTSCHRITT   |  |
|  |  [B]     |  |  CHF 79   |  |   [Chart]     |  |
|  |  Branko  |  |  Invoice  |  |   12/30 done  |  |
|  |  email   |  |  Download |  |               |  |
|  +----------+  +-----------+  +---------------+  |
|                                                  |
+--------------------------------------------------+
```

## Tehnicke Promene

### Nove Komponente
1. **`src/components/dashboard/AccessProgressBar.tsx`** - Progress bar za preostale dane
2. **`src/components/dashboard/WatchProgressWidget.tsx`** - Widget sa statistikom gledanja
3. **`src/components/dashboard/RecentVideosWidget.tsx`** - Lista poslednjih videa
4. **`src/components/dashboard/UserAvatar.tsx`** - Avatar komponenta sa inicijalima

### Izmene Postojecih Fajlova
1. **`src/pages/Dashboard.tsx`**
   - Novi layout sa reorganizovanim sekcijama
   - Dodati greeting u zavisnosti od doba dana
   - Integrisati nove widgete
   - Fetch `video_progress` podataka za statistiku

2. **`src/components/dashboard/ProfileWidget.tsx`**
   - Dodati veliki avatar sa inicijalima
   - Poboljsati vizuelni dizajn
   - Dodati link za promenu lozinke

3. **`src/components/dashboard/OrdersWidget.tsx`**
   - Dodati status badge
   - Bolji empty state

### Upit za Bazu
Koristicemo postojecu `video_progress` tabelu za dobijanje statistike gledanja:
```sql
SELECT COUNT(*) FROM video_progress 
WHERE user_id = [current_user] AND watch_count > 0
```

## Rezime
- Profesionalniji i moderniji izgled
- Bolja organizacija informacija
- Motivacioni elementi (progress, statistika)
- Poboljsano korisnicko iskustvo na svim uredjajima

