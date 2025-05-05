# Gestor d'Incidències

Aplicació de gestió d'incidències per a l'Ajuntament de Les Borges Blanques.

## Requisits

- Node.js v18 o superior
- NPM v9 o superior
- PostgreSQL (Base de dades Supabase)

## Configuració per a migració a un nou servidor

### 1. Preparació de l'entorn

Primer, assegura't que tens Node.js i NPM instal·lats al teu servidor:

```bash
node -v
npm -v
```

### 2. Descarregar i configurar l'aplicació

1. Descomprimeix l'aplicació al directori desitjat.

2. El sistema utilitza la connexió a Supabase, que ja està configurada. No cal instal·lar PostgreSQL localment.

### 3. Instal·lació i configuració automàtica

Utilitza l'script de configuració proporcionat per automatitzar la instal·lació. L'script té dos modes: desenvolupament i producció.

```bash
# Fer l'script executable
chmod +x setup.sh

# Executar en mode desenvolupament (per defecte)
./setup.sh

# O en mode producció
./setup.sh --production
```

#### Mode desenvolupament

Aquest mode està pensat per a entorns locals on es realitzaran modificacions al codi:

- Crea l'arxiu `.env.local` amb la configuració bàsica
- Instal·la les dependències amb npm
- Configura la base de dades i crea les taules si no existeixen
- Genera dades i usuaris inicials

#### Mode producció

El mode producció realitza passos addicionals per a un entorn de producció:

- Genera un `SESSION_SECRET` aleatori per millorar la seguretat
- Compila l'aplicació per a producció
- Proporciona instruccions per configurar l'aplicació com a servei amb PM2 o systemd

### 4. Executar l'aplicació

#### En desenvolupament

```bash
npm run dev
```

L'aplicació estarà disponible a http://localhost:5000

#### En producció

```bash
# Opció 1: Directament
npm start

# Opció 2: Amb PM2 (recomanat)
pm2 start npm --name "gestor-incidencies" -- start

# Per veure logs
pm2 logs gestor-incidencies
```

### 5. Configuració com a servei (recomanat per a producció)

#### Utilitzant PM2

```bash
# Instal·lar PM2 globalment
npm install -g pm2

# Iniciar l'aplicació
pm2 start npm --name "gestor-incidencies" -- start

# Configurar arrencada automàtica
pm2 startup
pm2 save
```

#### Utilitzant systemd

Crea un fitxer `/etc/systemd/system/gestor-incidencies.service`:

```ini
[Unit]
Description=Gestor d'Incidències Les Borges Blanques
After=network.target

[Service]
Type=simple
User=<usuari_del_sistema>
WorkingDirectory=/path/to/app
ExecStart=/usr/bin/npm start
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Activar el servei:

```bash
sudo systemctl enable gestor-incidencies
sudo systemctl start gestor-incidencies
```

## Accés a l'aplicació

### Credencials d'administrador

- Usuari: `admin`
- Contrasenya: `admin123`

### Altres usuaris disponibles

- Usuari brigada: `brigada` / `BrigadaBorges2025!`
- Usuari policia: `policia` / `PoliciaBorges2025!`
- Categories específiques: `jardineria`, `paleteria`, `civisme` (mateixa contrasenya: `user123`)

## Estructura de la base de dades

L'aplicació utilitza les següents taules:

1. **users** - Usuaris del sistema amb els seus rols i categories assignades
2. **categories** - Categories d'incidències (Brigada, Jardineria, Paleteria, Policia, Civisme, Altres)
3. **incidencies_consolidades** - Incidències registrades amb tota la informació associada

La connexió a Supabase es gestiona automàticament a través de les variables d'entorn. No cal fer cap canvi en la configuració de la base de dades per a la migració.

## Backup i manteniment

La base de dades està allotjada a Supabase, que proporciona backups automàtics. No cal realitzar còpies de seguretat addicionals de la base de dades.

Per mantenir l'aplicació:

```bash
# Actualitzar dependències
npm update

# Reiniciar l'aplicació (si utilitzes PM2)
pm2 restart gestor-incidencies
```

### Verificació de l'estat del sistema

L'aplicació inclou un script de comprovació d'estat que verifica tant la connexió a la base de dades com el servidor web:

```bash
# Fer executable el script
chmod +x health-check.js

# Executar la comprovació d'estat
node health-check.js
```

També hi ha disponible un endpoint d'API que retorna l'estat del sistema:

```
GET /api/health
```

L'endpoint retorna un JSON amb la següent estructura:

```json
{
  "status": "ok",
  "server": "running",
  "database": "connected",
  "timestamp": "2025-05-05T10:24:45.078Z"
}
```

Aquest endpoint pot ser útil per a la monitorització externa del servei.

## Suport

Per a qualsevol consulta o suport tècnic, contacta amb:
- Email: support@eternik.com

## Copyright

Copyright 2025 - Un producte propietat d'Eternik i Audivio Studios
