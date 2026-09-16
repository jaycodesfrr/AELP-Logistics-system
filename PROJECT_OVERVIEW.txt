================================================================================
          ANTARCTICA EXPEDITION & LOGISTICS PLATFORM (AELP)
               COMPLETE FEATURE MANUAL & USAGE GUIDE
================================================================================

1. SYSTEM OVERVIEW
--------------------------------------------------------------------------------
The Antarctica Expedition & Logistics Platform (AELP) is an enterprise-grade,
offline-first embedded station management platform built for isolated research 
bases operating in extreme polar environments (e.g., McMurdo Station, Amundsen-
Scott South Pole Station, and Dry Valleys Field Camps).

Designed for zero-downtime performance during severe satellite blackouts, AELP 
utilizes a native Java Spring Boot 3 / JDK 21 backend connected to an embedded 
SQLite database (`aelp_station.db`). All local operations log offline delta 
transactions into a sync queue, enabling seamless satellite synchronization 
whenever an orbital uplink becomes available.


2. SYSTEM ARCHITECTURE & TECH STACK
--------------------------------------------------------------------------------
- Java Spring Boot 3 Backend Server:
  * Runtime: Java OpenJDK 21
  * Framework: Spring Boot 3.2.3, Spring Data JPA, Spring Web MVC (Port 3000)
  * Database Engine: Embedded SQLite (`jdbc:sqlite:aelp_station.db`)
  * Data Models: 11 JPA Entities with `@JsonProperty` Jackson Mappings & DB Indexes
  * Sync Engine: `SyncService` queueing delta mutations into `sync_queue` table

- Station Web Tactical Hub (Desktop & Browser UI):
  * HTML5 Single-Page Application (`public/index.html`)
  * Modular JavaScript Engines (`public/js/app.js`, `map.js`, `cargo.js`, `inventory.js`, `personnel.js`, `emergency.js`, `sync.js`)
  * Custom Tactical Dark-Mode Design System (`public/css/tactical.css`)
  * Web Static Resource Mapping: Direct disk serving from `file:public/`

- Mobile Field Client:
  * React Native / Expo Handheld Field Application (`mobile/App.js`)

- Desktop & Script Launchers:
  * Desktop Launcher Script (`launch-desktop.js`) executing Spring Boot JAR (`target/antarctica-logistics-platform-1.0.0.jar`)
  * One-Click Batch Launchers (`AELP-Station-App.bat` and `Launch-Expo-Mobile.bat`)


3. DETAILED FEATURE BREAKDOWN & HOW TO USE
--------------------------------------------------------------------------------

[A] DASHBOARD & TACTICAL STATION HUB
------------------------------------
- Features:
  * Real-Time Station KPIs: Displays live metrics for Active Field Personnel, Approved/Active Expeditions, Low Stock Alerts, Open Incidents, and Offline Delta Queue Count.
  * Satellite Link Monitor: Visual indicator (`ONLINE` / `OFFLINE`) with uplink throughput status.
  * Active Expedition Roster: Live table listing active traverses, team leads, calculated fuel allocations (L), and polar ration requirements (kcal).
- How to Use:
  * Open the application in any browser at `http://localhost:3000`.
  * View top-level operational health indicators at a single glance.
  * Click the red "MAYDAY ALERT" floating button at any time to jump directly to Emergency Response.

[B] EXPEDITIONS & POLAR VECTOR MAP
----------------------------------
- Features:
  * Interactive Polar Vector Map: HTML5 Canvas map rendering Antarctic sectors, waypoints, and traverse routes (McMurdo Base, Minna Bluff Depot, Leverett Ramp, South Pole Station, Lake Hoare).
  * Expedition Route Planner & Resource Calculator:
    - Calculates fuel requirement: `Distance (km) * 1.6 L/km per vehicle + 25% Safety Margin`.
    - Calculates polar food rations: `Team Size * Duration (days) * 4,000 kcal/person/day`.
    - Generates automatic risk assessment (weather windows, crevasse hazard levels, radio check-in intervals).
  * Expedition Gantt Timeline: Visual schedule chart displaying duration bars for active and scheduled field traverses.
- How to Use:
  * Navigate to the "EXPEDITIONS & MAP" tab.
  * Fill out the "Plan New Field Expedition" form (Name, Route, Team Lead, Vehicle Count, Duration).
  * Click "Submit Expedition for Approval". The system automatically computes fuel and rations, generates a risk assessment, plots the mission on the vector map, and adds a Gantt timeline bar.

[C] CARGO MANIFEST & QR BARCODE TRACKING
----------------------------------------
- Features:
  * Interactive QR Code Generator: Renders scannable high-resolution QR codes on HTML canvas for cargo items (e.g., `CRG-MED-9901`).
  * Checkpoint Barcode Scanner Simulation: Simulates barcode/QR code scans at station checkpoints (Hangar 1, Fuel Depot, Warehouse Bay B).
  * Cargo Lifecycle & Chain of Custody Audit: Logs every scan event with timestamp, location, and handler personnel ID.
  * Automatic Inventory Cross-Referencing: Staged medical or food cargo items automatically populate the station stock ledger.
- How to Use:
  * Navigate to the "CARGO & QR TRACKING" tab.
  * Click any cargo item in the table to display its live generated QR code.
  * Use the "Scan Checkpoint Barcode" form to enter or scan a barcode (e.g. `CRG-FUEL-1002`) and location to update its chain of custody.

[D] INVENTORY LEDGER & REORDER ALERTS
-------------------------------------
- Features:
  * 9-Column Station Stock Ledger: Clean table displaying Barcode, Item Name, Category (Fuel, Food, Medical, Safety, Scientific, Spare Parts), On Hand Qty, Reserved, Available Qty, Expiry Date, Threshold, and Storage Location.
  * Automatic Available Quantity Math: `Available Qty = On-Hand Quantity - Reserved Quantity`.
  * Stock Reservation Engine: Allows logistics commanders to reserve supplies specifically allocated to upcoming field traverses.
- How to Use:
  * Navigate to the "INVENTORY LEDGER" tab.
  * View stock levels across all polar categories.
  * Click "Reserve Stock for Expedition", enter the Item ID (e.g., `inv-101`) and quantity to reserve. Available quantity will update immediately.

[E] PERSONNEL & FIELD EXCURSION TRACKER
---------------------------------------
- Features:
  * 5-Column Clean Field Roster: Displays Name (and ID), Role, Status (`AT_STATION` / `IN_FIELD`), Current Location, and Last Check-In timestamp.
  * Security Password Authentication: Every personnel member is assigned a unique personal security password (`pass101` through `pass105`) required for movement check-in and check-out operations.
  * Real-Time Status & Audit Logging: Submitting a movement updates the 3rd column `Status` badge, current location, and check-in timestamp in real time.
- How to Use:
  * Navigate to the "PERSONNEL & FIELD" tab.
  * Under "Field Check-Out / Check-In", select the personnel member.
  * Choose Action (`CHECK OUT TO FIELD` or `CHECK IN TO STATION`).
  * Enter Location / Sector (e.g. `Minna Bluff Depot`).
  * Enter the personnel member's unique Personal Security Password (e.g., `pass101` for Capt. James Miller).
  * Click "Log Movement". If authenticated, the personnel's status badge, location, and check-in timestamp will update instantly in the table.

[F] EMERGENCY RESPONSE & MAYDAY ENGINE
--------------------------------------
- Features:
  * One-Click Emergency Incident Creator: Broadcasts critical polar emergency incidents (Crevasse Fall, Medical Emergency, Lost Personnel, Snowcat Failure, Station Fire).
  * Automated Skill-Matching Algorithm: Server automatically searches personnel records for relevant certifications (Medical Doctor, Crevasse Rescue, Snowcat Ops) and auto-assigns qualified response team members.
  * Qualified Team Member Rendering: Renders auto-matched response unit personnel with full names and roles (e.g. `Capt. James Miller (Field Expedition Leader) • Dr. Elena Rostova (Chief Medical Officer)`).
  * Mayday Incident Resolution: Tracks open vs. resolved emergency incidents with timestamped resolution logging (`Resolved at: 2026-09-16 13:55:48`).
- How to Use:
  * Navigate to the "EMERGENCY RESPONSE" tab or click the floating "MAYDAY ALERT" button.
  * Fill out the incident type, severity level, location coordinates, and description.
  * Click "Broadcast Emergency & Auto-Match Team".
  * Review the active emergency card showing auto-matched qualified personnel.
  * Click "Resolve Incident & Clear Mayday" once the emergency unit returns safely.

[G] SATELLITE SYNC & OFFLINE-FIRST RESILIENCE
----------------------------------------------
- Features:
  * Offline-First Architecture: Platform operates 100% locally without external internet.
  * Delta Queue Inspector: Table displaying queued database operations (`INSERT`, `UPDATE`, `DELETE`) stored in SQLite `sync_queue`.
  * Satellite Link Simulator: Toggle satellite uplink online/offline and push pending deltas to Central HQ.
  * Instant Local Rolling Snapshot: Triggers non-blocking backups of `aelp_station.db` with timestamped filenames in the `backups/` folder.
- How to Use:
  * Navigate to the "SYNC & BACKUP" tab.
  * Inspect queued deltas waiting for satellite uplink.
  * Click "Push Sync Deltas Now" to simulate data synchronization with Central HQ.
  * Click "Trigger Instant Local Snapshot" to create a local database backup snapshot.


4. DEFAULT PERSONNEL SECURITY CREDENTIALS
--------------------------------------------------------------------------------
Personnel Name         | Role                         | Security Password
-----------------------|------------------------------|------------------
Capt. James Miller     | Field Expedition Leader      | pass101
Dr. Elena Rostova      | Chief Medical Officer        | pass102
Markus Bauer           | Senior Glaciologist          | pass103
Taro Tanaka            | Mechanic & Snowcat Driver    | pass104
Sven Nygård            | Radio & Satellite Specialist | pass105


5. LAUNCHING THE APPLICATION
--------------------------------------------------------------------------------
To launch the complete Antarctica Expedition & Logistics Platform:

1. Double-click `AELP-Station-App.bat` in the project root directory.
   This starts the Java Spring Boot backend server on `http://localhost:3000` and automatically opens the Station Hub in your browser.

2. To launch the mobile field client:
   Double-click `Launch-Expo-Mobile.bat`.

================================================================================
               ANTARCTICA EXPEDITION & LOGISTICS PLATFORM (AELP)
================================================================================
