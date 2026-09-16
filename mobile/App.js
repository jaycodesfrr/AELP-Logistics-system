import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  SafeAreaView,
  StatusBar
} from 'react-native';

const DEFAULT_SERVER = 'http://localhost:3000';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [serverUrl, setServerUrl] = useState(DEFAULT_SERVER);
  const [satelliteOnline, setSatelliteOnline] = useState(false);
  const [pendingSync, setPendingSync] = useState(2);

  const [stats, setStats] = useState({
    activeFieldPersonnel: 3,
    activeExpeditions: 1,
    lowStockItems: 2,
    openIncidents: 1
  });

  const [expeditions, setExpeditions] = useState([
    {
      id: 'exp-2026-01',
      name: 'Deep Traverse South Pole Resupply & Core Sampling',
      status: 'APPROVED',
      start_date: '2026-09-12',
      end_date: '2026-10-02',
      team_lead_name: 'Capt. James Miller',
      calculated_fuel_liters: 12800,
      calculated_rations_kcal: 480000
    },
    {
      id: 'exp-2026-02',
      name: 'Dry Valleys Hydrology & Microbial Recon',
      status: 'REVIEWED',
      start_date: '2026-09-20',
      end_date: '2026-09-27',
      team_lead_name: 'Markus Bauer',
      calculated_fuel_liters: 650,
      calculated_rations_kcal: 84000
    }
  ]);

  const [cargoItems, setCargoItems] = useState([
    { id: 'item-c01', barcode: 'CRG-MED-9901', description: 'Emergency Trauma Kits & Plasma Freezers', category: 'MEDICAL', weight_kg: 120, status: 'STAGED_AT_STATION' },
    { id: 'item-c02', barcode: 'CRG-FUEL-4412', description: 'AN8 Aviation Fuel Drums (x50)', category: 'FUEL', weight_kg: 10500, status: 'IN_TRANSIT' },
    { id: 'item-c03', barcode: 'CRG-SCI-7721', description: 'Deep Ice Core Drill Spare Bits & Motors', category: 'SCIENTIFIC', weight_kg: 340, status: 'STAGED_AT_STATION' }
  ]);

  const [inventory, setInventory] = useState([
    { id: 'inv-101', barcode: 'INV-FUEL-001', name: 'AN8 Arctic Aviation Fuel (Drums)', category: 'FUEL', quantity: 420, reserved_qty: 80, unit: 'Drums', reorder_threshold: 100 },
    { id: 'inv-102', barcode: 'INV-FOOD-002', name: 'Freeze-Dried Polar Rations (24h)', category: 'FOOD', quantity: 1850, reserved_qty: 320, unit: 'Packs', reorder_threshold: 300 },
    { id: 'inv-103', barcode: 'INV-SAFE-003', name: 'Hypothermia Heat Blankets', category: 'SAFETY_GEAR', quantity: 140, reserved_qty: 20, unit: 'Units', reorder_threshold: 30 },
    { id: 'inv-104', barcode: 'INV-MED-004', name: 'EpiPen & Emergency Allergy Kits', category: 'MEDICAL', quantity: 18, reserved_qty: 4, unit: 'Kits', reorder_threshold: 10 }
  ]);

  const [personnel, setPersonnel] = useState([
    { id: 'p-101', name: 'Capt. James Miller', role: 'Expedition Leader', current_status: 'IN_FIELD', location: 'Minna Bluff Depot (Km 350)', certs: ['Crevasse Rescue', 'Snowcat Ops'] },
    { id: 'p-102', name: 'Dr. Elena Rostova', role: 'Chief Medical Officer', current_status: 'AT_STATION', location: 'McMurdo Medical Bay', certs: ['Medical Doctor', 'Hypothermia'] },
    { id: 'p-103', name: 'Markus Bauer', role: 'Senior Glaciologist', current_status: 'IN_FIELD', location: 'Lake Hoare Camp', certs: ['Ice Core Drilling'] },
    { id: 'p-104', name: 'Taro Tanaka', role: 'Mechanic & Snowcat Driver', current_status: 'IN_FIELD', location: 'Minna Bluff Depot', certs: ['Heavy Machinery', 'Crevasse'] }
  ]);

  const [incidents, setIncidents] = useState([
    {
      id: 'inc-2026-01',
      type: 'CREVASSE_FALL',
      severity: 'CRITICAL_MAYDAY',
      location: 'Leverett Ramp Km 1390',
      status: 'OPEN',
      created_at: '2026-09-07 20:15',
      description: 'Snowcat #3 track broke near crevasse edge. Vehicle tilted 15 degrees. 2 crew members pinned inside cab.',
      assigned_team: ['p-101 (James Miller)', 'p-102 (Elena Rostova)', 'p-104 (Taro Tanaka)']
    }
  ]);

  const [scanInput, setScanInput] = useState('');
  const [incType, setIncType] = useState('CREVASSE_FALL');
  const [incLocation, setIncLocation] = useState('');
  const [incDesc, setIncDesc] = useState('');

  useEffect(() => {
    fetchStats();
  }, [serverUrl]);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${serverUrl}/api/stats`);
      const data = await res.json();
      if (data) {
        setStats(data);
        setSatelliteOnline(data.satelliteOnline);
        setPendingSync(data.pendingSyncCount || 0);
      }
    } catch(e) {}
  };

  const handleQuickCheckin = (personId) => {
    setPersonnel(prev => prev.map(p => {
      if (p.id === personId) {
        const nextStatus = p.current_status === 'IN_FIELD' ? 'AT_STATION' : 'IN_FIELD';
        const nextLoc = nextStatus === 'IN_FIELD' ? 'Minna Bluff Field Sector' : 'McMurdo Station Main Base';
        return { ...p, current_status: nextStatus, location: nextLoc };
      }
      return p;
    }));
    Alert.alert('Personnel Status Updated', 'Movement logged to local queue.');
  };

  const handleCreateIncident = () => {
    if (!incLocation || !incDesc) {
      Alert.alert('Missing Details', 'Please fill in location and description.');
      return;
    }
    const newInc = {
      id: 'inc-' + Date.now(),
      type: incType,
      severity: 'CRITICAL_MAYDAY',
      location: incLocation,
      status: 'OPEN',
      created_at: new Date().toISOString().substring(0, 16).replace('T', ' '),
      description: incDesc,
      assigned_team: ['Dr. Elena Rostova (Medical)', 'Capt. James Miller (Rescue)', 'Taro Tanaka (Mechanic)']
    };
    setIncidents([newInc, ...incidents]);
    setStats(prev => ({ ...prev, openIncidents: prev.openIncidents + 1 }));
    setIncLocation('');
    setIncDesc('');
    Alert.alert('MAYDAY ALERT BROADCASTED', 'Emergency incident logged and response team auto-assembled.');
  };

  const handleResolveIncident = (id) => {
    setIncidents(prev => prev.map(inc => inc.id === id ? { ...inc, status: 'RESOLVED' } : inc));
    setStats(prev => ({ ...prev, openIncidents: Math.max(0, prev.openIncidents - 1) }));
    Alert.alert('Incident Resolved', 'MAYDAY emergency cleared.');
  };

  const handleScanBarcode = () => {
    if (!scanInput) return Alert.alert('Error', 'Enter or scan a barcode.');
    const found = cargoItems.find(c => c.barcode.toUpperCase() === scanInput.toUpperCase());
    if (found) {
      Alert.alert('Cargo Scanned', `Description: ${found.description}\nCategory: ${found.category}\nStatus: STAGED_AT_STATION`);
      setCargoItems(prev => prev.map(c => c.id === found.id ? { ...c, status: 'STAGED_AT_STATION' } : c));
      setScanInput('');
    } else {
      Alert.alert('Not Found', 'Cargo item barcode not recognized.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#080d16" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View>
            <Text style={styles.brandTitle}>AELP TACTICAL MOBILE</Text>
            <Text style={styles.brandSub}>ANTARCTICA EXPEDITION LOGISTICS</Text>
          </View>
        </View>

        <View style={styles.statusRow}>
          <View style={[styles.statusBadge, { borderColor: satelliteOnline ? '#059669' : '#d97706' }]}>
            <View style={[styles.dot, { backgroundColor: satelliteOnline ? '#059669' : '#d97706' }]} />
            <Text style={styles.statusText}>{satelliteOnline ? 'SAT: ONLINE' : 'SAT: OFFLINE'}</Text>
          </View>
          <View style={[styles.statusBadge, { borderColor: '#0284c7' }]}>
            <Text style={[styles.statusText, { color: '#38bdf8' }]}>{pendingSync} DELTAS</Text>
          </View>
        </View>
      </View>

      {/* Navigation Tabs */}
      <View style={styles.navBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { id: 'dashboard', label: 'DASHBOARD' },
            { id: 'expeditions', label: 'EXPEDITIONS' },
            { id: 'cargo', label: 'CARGO & QR' },
            { id: 'inventory', label: 'INVENTORY' },
            { id: 'personnel', label: 'FIELD TEAM' },
            { id: 'emergency', label: 'MAYDAY ALERT' },
            { id: 'sync', label: 'SYNC QUEUE' }
          ].map(tab => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.navBtn,
                activeTab === tab.id && styles.navBtnActive,
                tab.id === 'emergency' && styles.emergencyNavBtn,
                tab.id === 'emergency' && activeTab === 'emergency' && styles.emergencyNavBtnActive
              ]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text style={[
                styles.navBtnText,
                activeTab === tab.id && styles.navBtnTextActive,
                tab.id === 'emergency' && { color: '#dc2626' }
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Tab Content Body */}
      <ScrollView style={styles.body} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <View>
            <View style={styles.gridContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>FIELD PERSONNEL</Text>
                <Text style={styles.statVal}>{stats.activeFieldPersonnel}</Text>
                <Text style={styles.statSub}>In field traverse</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>OPEN INCIDENTS</Text>
                <Text style={[styles.statVal, { color: '#dc2626' }]}>{stats.openIncidents}</Text>
                <Text style={styles.statSub}>Mayday active</Text>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Polar Weather &amp; Environment</Text>
              <Text style={styles.weatherLine}>Location: McMurdo Sound (-77.85° S)</Text>
              <Text style={styles.weatherLine}>Temp: <Text style={{ color: '#38bdf8', fontWeight: 'bold' }}>-32.4° C</Text> (Chill -48° C)</Text>
              <Text style={styles.weatherLine}>Wind: 38 knots (Blowing Snow / Whiteout)</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Active Expeditions Roster</Text>
              {expeditions.map(exp => (
                <View key={exp.id} style={styles.itemRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemTitle}>{exp.name}</Text>
                    <Text style={styles.itemSub}>Lead: {exp.team_lead_name}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.badgeSuccess}>{exp.status}</Text>
                    <Text style={styles.fuelText}>{exp.calculated_fuel_liters} L Fuel</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* EXPEDITIONS TAB */}
        {activeTab === 'expeditions' && (
          <View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Traverse Routes &amp; Waypoints</Text>
              <View style={styles.routeBox}>
                <Text style={styles.routeTitle}>Route 01: South Pole Traverse Highway</Text>
                <Text style={styles.routeSub}>Distance: 1600 km &bull; Hazards: Leverett Glacier Crevasse Field</Text>
                <Text style={styles.routeWaypoints}>McMurdo Base &rarr; Minna Bluff Depot &rarr; Leverett Ramp &rarr; Amundsen-Scott Pole</Text>
              </View>
              <View style={styles.routeBox}>
                <Text style={styles.routeTitle}>Route 02: Dry Valleys Science Recon</Text>
                <Text style={styles.routeSub}>Distance: 185 km &bull; Hazards: High valley wind shear</Text>
                <Text style={styles.routeWaypoints}>McMurdo &rarr; Marble Point &rarr; Lake Hoare Camp &rarr; Blood Falls</Text>
              </View>
            </View>
          </View>
        )}

        {/* CARGO TAB */}
        {activeTab === 'cargo' && (
          <View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Checkpoint Barcode Scanner</Text>
              <TextInput
                style={styles.input}
                placeholder="Scan or enter barcode (e.g. CRG-MED-9901)"
                placeholderTextColor="#64748b"
                value={scanInput}
                onChangeText={setScanInput}
              />
              <TouchableOpacity style={styles.btnPrimary} onPress={handleScanBarcode}>
                <Text style={styles.btnTextPrimary}>Simulate Barcode Scan</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Cargo Manifest Ledger</Text>
              {cargoItems.map(c => (
                <View key={c.id} style={styles.itemRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemTitle}>{c.description}</Text>
                    <Text style={styles.itemSub}>Barcode: {c.barcode} &bull; Weight: {c.weight_kg} kg</Text>
                  </View>
                  <Text style={c.status === 'STAGED_AT_STATION' ? styles.badgeSuccess : styles.badgeWarning}>
                    {c.status}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* INVENTORY TAB */}
        {activeTab === 'inventory' && (
          <View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Station Stock &amp; Reorder Alerts</Text>
              {inventory.map(inv => {
                const avail = inv.quantity - inv.reserved_qty;
                const isLow = inv.quantity <= inv.reorder_threshold;
                return (
                  <View key={inv.id} style={styles.itemRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemTitle}>{inv.name}</Text>
                      <Text style={styles.itemSub}>Qty: {inv.quantity} {inv.unit} (Reserved: {inv.reserved_qty})</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ color: '#059669', fontWeight: 'bold' }}>Avail: {avail}</Text>
                      {isLow && <Text style={styles.badgeWarning}>LOW STOCK</Text>}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* FIELD TEAM TAB */}
        {activeTab === 'personnel' && (
          <View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Personnel Field Excursion Roster</Text>
              {personnel.map(p => (
                <View key={p.id} style={styles.itemRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemTitle}>{p.name}</Text>
                    <Text style={styles.itemSub}>{p.role} &bull; {p.location}</Text>
                  </View>
                  <TouchableOpacity
                    style={p.current_status === 'IN_FIELD' ? styles.btnWarningSm : styles.btnSuccessSm}
                    onPress={() => handleQuickCheckin(p.id)}
                  >
                    <Text style={styles.btnTextSm}>
                      {p.current_status === 'IN_FIELD' ? 'Check In' : 'Check Out'}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* EMERGENCY MAYDAY TAB */}
        {activeTab === 'emergency' && (
          <View>
            <View style={[styles.card, { borderColor: '#dc2626' }]}>
              <Text style={[styles.cardTitle, { color: '#dc2626' }]}>One-Click Mayday Incident Creator</Text>

              <Text style={styles.inputLabel}>Incident Location</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Leverett Ramp Km 1390"
                placeholderTextColor="#64748b"
                value={incLocation}
                onChangeText={setIncLocation}
              />

              <Text style={styles.inputLabel}>Incident Description</Text>
              <TextInput
                style={[styles.input, { height: 70 }]}
                placeholder="Describe emergency details..."
                placeholderTextColor="#64748b"
                multiline
                value={incDesc}
                onChangeText={setIncDesc}
              />

              <TouchableOpacity style={styles.btnDanger} onPress={handleCreateIncident}>
                <Text style={styles.btnTextDanger}>Broadcast Mayday &amp; Auto-Match Team</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Active Incidents &amp; Rescue Teams</Text>
              {incidents.map(inc => (
                <View key={inc.id} style={styles.incBox}>
                  <Text style={styles.incTitle}>{inc.type} ({inc.severity})</Text>
                  <Text style={styles.incLoc}>Location: {inc.location}</Text>
                  <Text style={styles.incDesc}>{inc.description}</Text>

                  <View style={styles.teamBox}>
                    <Text style={styles.teamTitle}>AUTO-MATCHED RESCUE TEAM:</Text>
                    <Text style={styles.teamText}>{inc.assigned_team.join('\n')}</Text>
                  </View>

                  {inc.status === 'OPEN' ? (
                    <TouchableOpacity style={styles.btnSuccess} onPress={() => handleResolveIncident(inc.id)}>
                      <Text style={styles.btnTextSuccess}>Resolve Incident &amp; Clear Mayday</Text>
                    </TouchableOpacity>
                  ) : (
                    <Text style={{ color: '#059669', marginTop: 8 }}>RESOLVED</Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* SYNC TAB */}
        {activeTab === 'sync' && (
          <View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Satellite Sync Queue Inspector</Text>
              <Text style={styles.weatherLine}>Pending Offline Deltas: <Text style={{ color: '#38bdf8', fontWeight: 'bold' }}>{pendingSync} Records</Text></Text>

              <TouchableOpacity
                style={[styles.btnPrimary, { marginTop: 12 }]}
                onPress={() => {
                  setSatelliteOnline(!satelliteOnline);
                  Alert.alert('Satellite Status', !satelliteOnline ? 'Satellite Link ONLINE' : 'Satellite Link OFFLINE');
                }}
              >
                <Text style={styles.btnTextPrimary}>Toggle Satellite Connection</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btnSuccess, { marginTop: 12 }]}
                onPress={() => {
                  if (!satelliteOnline) {
                    Alert.alert('Sync Blocked', 'Satellite is OFFLINE. Cannot push sync deltas.');
                  } else {
                    setPendingSync(0);
                    Alert.alert('SYNC SUCCESSFUL', 'All offline deltas pushed to Central HQ Server!');
                  }
                }}
              >
                <Text style={styles.btnTextSuccess}>Push Sync Deltas Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080d16'
  },
  header: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  brandTitle: {
    color: '#f8fafc',
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: 0.5
  },
  brandSub: {
    color: '#38bdf8',
    fontSize: 9,
    fontFamily: 'monospace'
  },
  statusRow: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 4
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    backgroundColor: '#080d16'
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6
  },
  statusText: {
    color: '#f8fafc',
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: 'bold'
  },
  navBar: {
    backgroundColor: '#0f172a',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b'
  },
  navBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent'
  },
  navBtnActive: {
    borderBottomColor: '#38bdf8'
  },
  emergencyNavBtn: {},
  emergencyNavBtnActive: {
    borderBottomColor: '#dc2626'
  },
  navBtnText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600'
  },
  navBtnTextActive: {
    color: '#38bdf8'
  },
  body: {
    flex: 1,
    padding: 16
  },
  gridContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16
  },
  statCard: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 6,
    padding: 12
  },
  statLabel: {
    color: '#94a3b8',
    fontSize: 9,
    fontWeight: '600'
  },
  statVal: {
    color: '#38bdf8',
    fontSize: 22,
    fontWeight: '800',
    marginVertical: 4
  },
  statSub: {
    color: '#64748b',
    fontSize: 9
  },
  card: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 6,
    padding: 14,
    marginBottom: 16
  },
  cardTitle: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10
  },
  weatherLine: {
    color: '#f8fafc',
    fontSize: 12,
    marginVertical: 2
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b'
  },
  itemTitle: {
    color: '#f8fafc',
    fontSize: 12,
    fontWeight: '600'
  },
  itemSub: {
    color: '#94a3b8',
    fontSize: 10,
    marginTop: 2
  },
  badgeSuccess: {
    backgroundColor: 'rgba(5, 150, 105, 0.15)',
    color: '#059669',
    borderColor: '#059669',
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 9,
    fontWeight: 'bold',
    overflow: 'hidden'
  },
  badgeWarning: {
    backgroundColor: 'rgba(217, 119, 6, 0.15)',
    color: '#d97706',
    borderColor: '#d97706',
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 9,
    fontWeight: 'bold',
    overflow: 'hidden'
  },
  fuelText: {
    color: '#38bdf8',
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 2
  },
  routeBox: {
    backgroundColor: '#080d16',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 4,
    padding: 10,
    marginBottom: 10
  },
  routeTitle: {
    color: '#38bdf8',
    fontWeight: 'bold',
    fontSize: 12
  },
  routeSub: {
    color: '#d97706',
    fontSize: 10,
    marginVertical: 3
  },
  routeWaypoints: {
    color: '#94a3b8',
    fontSize: 10,
    fontFamily: 'monospace'
  },
  input: {
    backgroundColor: '#080d16',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 4,
    color: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    marginBottom: 10
  },
  inputLabel: {
    color: '#94a3b8',
    fontSize: 10,
    marginBottom: 4
  },
  btnPrimary: {
    backgroundColor: '#0284c7',
    paddingVertical: 10,
    borderRadius: 4,
    alignItems: 'center'
  },
  btnTextPrimary: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 12
  },
  btnDanger: {
    backgroundColor: '#dc2626',
    paddingVertical: 10,
    borderRadius: 4,
    alignItems: 'center'
  },
  btnTextDanger: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 12
  },
  btnSuccess: {
    backgroundColor: '#059669',
    paddingVertical: 10,
    borderRadius: 4,
    alignItems: 'center'
  },
  btnTextSuccess: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 11
  },
  btnSuccessSm: {
    backgroundColor: '#059669',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4
  },
  btnWarningSm: {
    backgroundColor: '#d97706',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4
  },
  btnTextSm: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 10
  },
  incBox: {
    backgroundColor: '#080d16',
    borderWidth: 1,
    borderColor: '#dc2626',
    borderRadius: 4,
    padding: 12,
    marginBottom: 12
  },
  incTitle: {
    color: '#dc2626',
    fontWeight: 'bold',
    fontSize: 12
  },
  incLoc: {
    color: '#f8fafc',
    fontSize: 11,
    marginVertical: 2
  },
  incDesc: {
    color: '#94a3b8',
    fontSize: 11,
    marginVertical: 4
  },
  teamBox: {
    backgroundColor: '#0f172a',
    padding: 8,
    borderRadius: 4,
    marginVertical: 6
  },
  teamTitle: {
    color: '#38bdf8',
    fontSize: 9,
    fontWeight: 'bold'
  },
  teamText: {
    color: '#f8fafc',
    fontSize: 10,
    marginTop: 2
  }
});
