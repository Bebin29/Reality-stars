# Reality Stars Frontend

Eine moderne React-Anwendung zur Verwaltung und Entdeckung von Reality-TV-Persönlichkeiten.

## 🚀 Features

### Dual Dashboard System
Die Anwendung verfügt über zwei verschiedene Dashboard-Typen:

#### **User Dashboard** (Standard)
- **Zielgruppe**: Normale Benutzer, die Reality Stars entdecken möchten
- **Features**:
  - Hero-Sektion mit Willkommensnachricht
  - Beliebte Stars Showcase
  - Neueste Hinzufügungen
  - Benutzerfreundliche Suchfunktion
  - Call-to-Action Bereiche
  - Fokus auf Entdeckung und Browsing

#### **Admin Dashboard** 
- **Zielgruppe**: Administratoren zur Verwaltung der Datenbank
- **Features**:
  - Detaillierte Statistiken und Metriken
  - Verwaltungsaktionen (Hinzufügen, Bearbeiten, Löschen)
  - Erweiterte Suchfunktionen
  - Benutzerverwaltung
  - Systemüberwachung
  - Admin-spezifische Navigation

### Automatische Dashboard-Auswahl
Das System erkennt automatisch die Benutzerrolle und zeigt das entsprechende Dashboard:
- **Admin-Benutzer**: Sehen das Admin Dashboard
- **Standard-Benutzer**: Sehen das User Dashboard

### Admin-Berechtigung
Admin-Status wird bestimmt durch:
1. **E-Mail-Adresse**: Bestimmte E-Mail-Adressen in der Admin-Liste
2. **Benutzer-Metadaten**: `role: 'admin'` oder `role: 'administrator'`
3. **App-Metadaten**: Rolle in Supabase App-Metadaten

## 🛠️ Setup

### 1. Environment Variables
Erstelle eine `.env` Datei im Frontend-Ordner:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Backend API Configuration
VITE_BACKEND_URL=http://localhost:3001/api

# App Configuration
VITE_APP_NAME=Reality Stars
VITE_APP_VERSION=1.0.0
```

### 2. Installation
```bash
npm install
```

### 3. Development Server
```bash
npm run dev
```

## 📁 Projektstruktur

```
frontend/
├── src/
│   ├── components/ui/          # Wiederverwendbare UI-Komponenten
│   │   ├── api.ts             # API-Service für Backend-Kommunikation
│   │   ├── auth.ts            # Authentifizierungs-Utilities
│   │   └── utils.ts           # Allgemeine Utilities
│   ├── pages/
│   │   ├── Dashboard.tsx      # Smart Dashboard (Auto-Routing)
│   │   ├── UserDashboard.tsx  # Benutzer-Dashboard
│   │   ├── Profile.tsx        # Benutzer-Profil
│   │   ├── Personalities.tsx  # Persönlichkeiten-Übersicht
│   │   └── Login.tsx          # Login-Seite
│   └── App.tsx                # Haupt-App mit Routing
```

## 🔐 Authentifizierung

### Sichere Token-Verwaltung
- **Access Tokens**: Gespeichert in localStorage für API-Aufrufe
- **Refresh Tokens**: Gespeichert in sicheren HTTP-only Cookies
- **Automatische Token-Erneuerung**: Nahtlose Session-Verwaltung

### Admin-Konfiguration
Um einen Benutzer als Admin zu markieren:

1. **Via E-Mail** (einfachste Methode):
   ```typescript
   // In src/lib/auth.ts
   const adminEmails = [
     'admin@realitystars.com',
     'deine-email@domain.com'  // Füge deine E-Mail hinzu
   ];
   ```

2. **Via Supabase Dashboard**:
   - Gehe zu Authentication > Users
   - Wähle den Benutzer aus
   - Füge in "User Metadata" hinzu: `{"role": "admin"}`

## 🎨 Design System

### Farbschema
- **Primary**: Chinese Violet (#8B5CF6)
- **Secondary**: French Mauve (#C084FC)
- **Neutral**: Gunmetal (#2D3748)
- **Gradients**: Verwendet für moderne Glasmorphism-Effekte

### UI-Komponenten
- **Shadcn/ui**: Moderne, zugängliche Komponenten
- **Tailwind CSS**: Utility-first CSS Framework
- **Lucide Icons**: Konsistente Icon-Bibliothek

## 🔄 API-Integration

### Backend-Kommunikation
```typescript
// Beispiel API-Aufruf
const personalities = await apiService.getPersonalities({
  page: 1,
  limit: 12,
  sort_by: 'created_at',
  sort_order: 'desc'
});
```

### Authentifizierte Requests
```typescript
// Mit Authentication Hook
const { callWithAuth } = useApiWithAuth();

const result = await callWithAuth(async (token) => 
  apiService.createPersonality(data, token)
);
```

## 📱 Responsive Design

Die Anwendung ist vollständig responsive und optimiert für:
- **Desktop**: Vollständige Feature-Set
- **Tablet**: Angepasste Layouts
- **Mobile**: Touch-optimierte Navigation

## 🚀 Deployment

### Build für Produktion
```bash
npm run build
```

### Environment für Produktion
Stelle sicher, dass die Produktions-URLs in der `.env` gesetzt sind:
```env
VITE_BACKEND_URL=https://your-api-domain.com/api
VITE_SUPABASE_URL=https://your-project.supabase.co
```

## 🔧 Entwicklung

### Neue Features hinzufügen
1. Erstelle Komponenten in `src/components/`
2. Füge Seiten in `src/pages/` hinzu
3. Erweitere API-Service in `src/lib/api.ts`
4. Aktualisiere Routing in `App.tsx`

### Admin-Features erweitern
Admin-spezifische Features sollten:
- Rolle-basierte Zugriffskontrolle verwenden
- Im Admin Dashboard integriert werden
- Entsprechende Backend-Endpunkte nutzen
