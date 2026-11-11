# ⚖️ TRIBUNAL DEL ABSURDO
> *Juego Multijugador Party Burocrático impulsado por MiniMax M3.1 Flash*

---

## 🏛️ Descripción General

**El Tribunal del Absurdo** es un juego multijugador para navegador (de **1 a 4 jugadores**), diseñado con una estética física de **Expediente Burocrático Kafkiano** (papel gastado, carpetas manila, máquina de escribir, sellos de goma entintados y efectos sonoros analógicos sintetizados con Web Audio API; **cero neones**).

El juego utiliza el modelo **MiniMax M3.1 Flash** como:
1. **Magistrado Supremo:** Generador de casos insólitos, querellantes ridículos y pruebas obligatorias.
2. **Juez Sarcástico:** Evalúa la creatividad, el descaro y el cumplimiento léxico de cada alegato, estampando sellos oficiales (*"ABSUELTO POR GENIO"*, *"CULPABLE CON AGRAVANTE DE DESCARO"*, etc.) y roasteando a los jugadores.
3. **Abogado de Oficio Autómata (Dr. Barnabás K.):** En modo solitario (1 jugador), la IA genera alegatos rivales para competir 1v1 contra ti.

---

## ⏱️ Tolerancia a Latencia Extrema (400ms+ Ping)

El juego fue diseñado para que jugadores con alta latencia jueguen en igualdad de condiciones:
- **Cero dependencia en reflejos:** Todas las rondas se juegan por temporizador simultáneo.
- **Sincronización de reloj con el servidor:** El cliente estima el desfase temporal con el servidor (`getEstimatedServerTime()`), por lo que los contadores son exactos al milisegundo sin saltos.
- **Resiliencia ante desconexiones:** El texto que redactas se guarda en `LocalStorage` en tiempo real; si se corta la red o recargas la pestaña, tu alegato no se pierde.

---

## 🚀 Puesta en Marcha Rápida

### 1. Requisitos Previos
* Node.js v18+ (probado en v22).
* npm v9+.

### 2. Configurar la API Key de MiniMax
Abre el archivo `.env` en la raíz del proyecto (o en `server/.env`) y coloca tu clave:

```env
MINIMAX_API_KEY=tu_clave_aqui
MINIMAX_BASE_URL=https://api.minimax.io/v1
MINIMAX_MODEL=MiniMax-M3.1-Flash
```

> **Nota:** Si dejas `MINIMAX_API_KEY` vacía, el juego arranca automáticamente en **Modo Simulador de Alta Fidelidad**, con expedientes precargados, alegatos de autómata y deliberaciones completas para que puedas probarlo sin gastar saldo de inmediato.

### 3. Ejecutar en Modo Desarrollo
Desde la raíz del proyecto:

```bash
# Iniciar frontend y backend juntos
npm run dev
```

* **Frontend:** [http://localhost:5173](http://localhost:5173)
* **Backend:** [http://localhost:3001](http://localhost:3001)

### 4. Compilar y Ejecutar en Producción
```bash
npm run build
npm start
```
El servidor servirá la aplicación completa en [http://localhost:3001](http://localhost:3001).

---

## 🎮 Modos de Juego

* **Modo 1 Jugador (Tú vs. La IA):**
  Crea una sala y presiona *"Dar Comienzo a la Audiencia"*. El tribunal asignará automáticamente al **Dr. Barnabás K.** como tu rival. Ambos presentarán alegatos y la IA juzgará quién es más convincente.
* **Modo 2 a 4 Jugadores:**
  Copia el enlace de la sala (`http://localhost:5173?room=XXXX`) o comparte el código de 4 letras. Tus amigos se unen desde el navegador del móvil o PC sin registrarse.

---

## 📁 Estructura del Código

```
tribunal-del-absurdo/
├── server/
│   ├── src/
│   │   ├── ai/
│   │   │   ├── minimax.ts       # Integración con MiniMax M3.1 Flash (OpenAI format)
│   │   │   └── mockCases.ts     # Expedientes de contingencia y modo simulador
│   │   ├── game/
│   │   │   ├── GameRoom.ts      # Máquina de estados judicial y temporizadores
│   │   │   └── RoomManager.ts   # Gestión de salas en memoria y códigos de 4 letras
│   │   ├── config.ts            # Variables de entorno y configuración
│   │   ├── types.ts             # Tipos compartidos
│   │   └── index.ts             # Servidor Express + Socket.io
├── client/
│   ├── src/
│   │   ├── audio/
│   │   │   └── sfx.ts           # Web Audio API (teclas de máquina, campana, martillo, sellos)
│   │   ├── components/
│   │   │   ├── BureauHeader.tsx     # Membrete ministerial, volumen y código
│   │   │   ├── LobbyView.tsx        # Ficha de sospechosos y apertura de sala
│   │   │   ├── BriefingView.tsx     # Auto judicial y 3 palabras obligatorias
│   │   │   ├── WritingView.tsx      # Mesa de escribir y chequeo de palabras
│   │   │   ├── DeliberationView.tsx # Animación de acuerdo del tribunal
│   │   │   ├── VerdictView.tsx      # Sellos estampados y roast del Juez
│   │   │   └── PodiumView.tsx       # Cuadro de honor y sentencias finales
│   │   ├── index.css            # Texturas de papel, cinta, sellos y neo-brutalismo
│   │   ├── socket.ts            # Sincronización de latencia
│   │   └── App.tsx              # Coordinador de vistas
├── .env.example
├── .env
└── package.json
```
