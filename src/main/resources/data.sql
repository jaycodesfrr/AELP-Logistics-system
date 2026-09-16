-- Antarctica Expedition & Logistics Platform (AELP) Seed Data

-- Users
INSERT OR REPLACE INTO users (id, name, role, password_hash, active) VALUES
('usr-01', 'Commander Sarah Vance', 'STATION_COMMAND', 'sc_hash_9823', 1),
('usr-02', 'Lars Lindqvist', 'LOGISTICS_OFFICER', 'lo_hash_1102', 1),
('usr-03', 'Dr. Elena Rostova', 'MEDICAL_OFFICER', 'mo_hash_7741', 1),
('usr-04', 'Capt. James Miller', 'FIELD_LEAD', 'fl_hash_4492', 1);

-- Routes
INSERT OR REPLACE INTO routes (id, name, waypoints_json, distance_km, hazard_notes) VALUES
('rt-01', 'South Pole Traverse Highway', '[{"name":"McMurdo Station","lat":-77.85,"lng":166.66},{"name":"Minna Bluff Depot","lat":-78.52,"lng":166.85},{"name":"Leverett Glacier Ramp","lat":-85.35,"lng":-148.25},{"name":"Amundsen-Scott Station","lat":-90.00,"lng":0.00}]', 1600.0, 'Crevasse field at Leverett Ramp km 1400. Deep sastrugi between Minna and Leverett.'),
('rt-02', 'Dry Valleys Science Survey', '[{"name":"McMurdo Station","lat":-77.85,"lng":166.66},{"name":"Marble Point Fuel Depot","lat":-77.41,"lng":163.83},{"name":"Lake Hoare Camp","lat":-77.62,"lng":162.90},{"name":"Taylor Glacier Tongue","lat":-77.73,"lng":162.27}]', 185.0, 'High wind shear in Taylor Valley. Helicopter landing zone icy.');

-- Personnel
INSERT OR REPLACE INTO personnel (id, name, role, certifications_json, current_status, current_location, emergency_contact, blood_type, last_checkin, password) VALUES
('p-101', 'Capt. James Miller', 'Field Expedition Leader', '["Crevasse Rescue","Snowcat Ops","Advanced Wilderness First Aid","Radio Comms"]', 'IN_FIELD', 'Minna Bluff Depot (Km 350)', '+1-555-0192 (Wife: Karen)', 'O+', '2026-09-07 19:30:00', 'pass101'),
('p-102', 'Dr. Elena Rostova', 'Chief Medical Officer', '["Medical Doctor","Hypothermia Specialist","Crevasse Rescue"]', 'AT_STATION', 'McMurdo Station Medical Bay', '+44-20-7946-0912 (Brother: Igor)', 'A+', '2026-09-07 21:00:00', 'pass102'),
('p-103', 'Markus Bauer', 'Senior Glaciologist', '["Ice Core Drilling","Wilderness First Aid","Radio Comms"]', 'IN_FIELD', 'Lake Hoare Field Camp', '+49-30-123456 (Wife: Hannah)', 'B-', '2026-09-07 18:45:00', 'pass103'),
('p-104', 'Taro Tanaka', 'Mechanic & Snowcat Driver', '["Heavy Machinery","Snowcat Ops","Crevasse Rescue","Diesel Generator Repair"]', 'IN_FIELD', 'Minna Bluff Depot (Km 350)', '+81-3-5555-0143 (Father: Kenji)', 'AB+', '2026-09-07 19:30:00', 'pass104'),
('p-105', 'Sven Nygård', 'Radio & Satellite Specialist', '["Radio Comms","Satellite Uplink Repair","Wilderness First Aid"]', 'AT_STATION', 'McMurdo Comms Center', '+47-22-112233 (Mother: Astrid)', 'O-', '2026-09-07 21:15:00', 'pass105');

-- Cargo Shipments
INSERT OR REPLACE INTO cargo_shipments (id, manifest_ref, origin, destination, status, transport_mode, eta, priority) VALUES
('shp-2026-01', 'MANIFEST-RV-NATHANIEL-09', 'Lyttelton Port (NZ)', 'McMurdo Station', 'IN_TRANSIT', 'RESUPPLY_VESSEL', '2026-10-15', 'HIGH'),
('shp-2026-02', 'MANIFEST-LC130-FLIGHT-04', 'Christchurch (NZ)', 'McMurdo Airfield', 'ARRIVED', 'FLIGHT', '2026-09-05', 'MEDICAL'),
('shp-2026-03', 'MANIFEST-TRAVERSE-02', 'McMurdo Station', 'Amundsen-Scott Pole Station', 'STAGED', 'TRAVERSE_CONVOY', '2026-09-20', 'NORMAL');

-- Cargo Items
INSERT OR REPLACE INTO cargo_items (id, shipment_id, description, category, weight_kg, volume_m3, barcode, status, handling_instructions, chain_of_custody_json) VALUES
('item-c01', 'shp-2026-02', 'Emergency Trauma Kits & Plasma Freezers', 'MEDICAL', 120.0, 0.8, 'CRG-MED-9901', 'STAGED_AT_STATION', 'Keep between -20C and 4C. Priority handle.', '[{"event":"Unloaded LC-130 Flight 04","actor":"Lars Lindqvist","timestamp":"2026-09-05 14:10:00"}]'),
('item-c02', 'shp-2026-01', 'AN8 Aviation Fuel Drums (x50)', 'FUEL', 10500.0, 11.0, 'CRG-FUEL-4412', 'IN_TRANSIT', 'Hazardous Flammable Class 3. No smoking or open spark.', '[{"event":"Loaded RV Nathaniel B. Palmer","actor":"Lyttelton Port Authority","timestamp":"2026-08-28 09:00:00"}]'),
('item-c03', 'shp-2026-03', 'Deep Ice Core Drill Spare Bits & Motors', 'SCIENTIFIC', 340.0, 1.2, 'CRG-SCI-7721', 'STAGED_AT_STATION', 'Fragile electronic sensors inside.', '[{"event":"Staged at Hangar 3","actor":"Taro Tanaka","timestamp":"2026-09-06 11:30:00"}]');

-- Inventory Items
INSERT OR REPLACE INTO inventory_items (id, name, category, quantity, reserved_qty, unit, expiry_date, reorder_threshold, location, barcode) VALUES
('inv-101', 'AN8 Arctic Aviation Fuel (Drums)', 'FUEL', 420.0, 80.0, 'Drums (200L)', '2028-12-31', 100.0, 'Main Fuel Depot Tank Farm', 'INV-FUEL-001'),
('inv-102', 'Freeze-Dried Polar Survival Rations (24h Pack)', 'FOOD', 1850.0, 320.0, 'Packs', '2027-05-15', 300.0, 'Supply Warehouse Bay B', 'INV-FOOD-002'),
('inv-103', 'Hypothermia Heat Blankets & Warmers', 'SAFETY_GEAR', 140.0, 20.0, 'Units', '2029-01-01', 30.0, 'Emergency Locker Alpha', 'INV-SAFE-003'),
('inv-104', 'EpiPen & Emergency Allergy Kits', 'MEDICAL', 18.0, 4.0, 'Kits', '2026-11-30', 10.0, 'Medical Center Pharmacy', 'INV-MED-004'),
('inv-105', 'Iridium Extreme Satellite Phones', 'SCIENTIFIC', 12.0, 3.0, 'Units', '2030-01-01', 4.0, 'Comms Radio Storage', 'INV-COMM-005'),
('inv-106', 'Kässbohrer Snowcat Replacement Tracks', 'SPARE_PARTS', 4.0, 0.0, 'Pairs', '2035-01-01', 2.0, 'Vehicle Repair Shop', 'INV-VEH-006');

-- Expeditions
INSERT OR REPLACE INTO expeditions (id, name, start_date, end_date, status, route_id, team_lead_id, objectives, risk_assessment_json, required_permits, calculated_fuel_liters, calculated_rations_kcal) VALUES
('exp-2026-01', 'Deep Traverse South Pole Resupply & Core Sampling', '2026-09-12', '2026-10-02', 'APPROVED', 'rt-01', 'p-101', 'Resupply Amundsen-Scott station via ground traverse and drill 50m ice core sample at Leverett Ramp.', '{"weatherWindow":"STABLE","crevasseRisk":"HIGH_LEVERETT","fuelMarginPct":25,"radioCheckIntervalMinutes":120}', 'USAP Permit #2026-ANT-09, Antarctic Treaty Environment Pass', 12800.0, 480000.0),
('exp-2026-02', 'Dry Valleys Hydrology & Microbial Recon', '2026-09-20', '2026-09-27', 'REVIEWED', 'rt-02', 'p-103', 'Collect water and sediment samples from Lake Hoare and Blood Falls.', '{"weatherWindow":"MODERATE","crevasseRisk":"LOW","fuelMarginPct":20,"radioCheckIntervalMinutes":180}', 'NSF Environmental Impact Exemption #771', 650.0, 84000.0);

-- Incidents
INSERT OR REPLACE INTO incidents (id, type, severity, location, status, created_at, resolved_at, incident_commander_id, description, assigned_team_json) VALUES
('inc-2026-01', 'CREVASSE_FALL', 'CRITICAL_MAYDAY', 'Leverett Ramp Km 1390 (S 85 deg 20 min, W 148 deg 10 min)', 'OPEN', '2026-09-07 20:15:00', NULL, 'usr-01', 'Snowcat #3 track broke near crevasse edge. Vehicle tilted 15 degrees. Two crew members pinned inside cab safely for now but weather deteriorating.', '["p-101","p-102","p-104"]');

-- Incident Log
INSERT OR REPLACE INTO incident_log (id, incident_id, timestamp, actor_id, action_note) VALUES
('inc-log-01', 'inc-2026-01', '2026-09-07 20:15:00', 'usr-01', 'MAYDAY distress beacon received from Snowcat #3 on HF Radio 8.215 MHz.'),
('inc-log-02', 'inc-2026-01', '2026-09-07 20:25:00', 'usr-03', 'Dr. Elena Rostova assembled emergency trauma response kit and dispatched Rescue Snowcat #1.');

-- Sync Queue Initial Delta
INSERT OR REPLACE INTO sync_queue (id, table_name, record_id, operation, payload_json, synced_boolean, created_at, retry_count) VALUES
('sync-001', 'incidents', 'inc-2026-01', 'INSERT', '{"id":"inc-2026-01","type":"CREVASSE_FALL","severity":"CRITICAL_MAYDAY","status":"OPEN"}', 0, '2026-09-07 20:15:00', 0),
('sync-002', 'personnel_movement_log', 'pml-901', 'INSERT', '{"personnel_id":"p-101","event_type":"CHECK_OUT","location":"Minna Bluff Depot"}', 0, '2026-09-07 19:30:00', 0);
