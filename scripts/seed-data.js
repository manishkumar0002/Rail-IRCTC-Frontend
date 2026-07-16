import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BACKEND_URL = "http://localhost:8080";
const ADMIN_EMAIL = "admin@irctc.com";
const ADMIN_PASSWORD = "Admin@123";

async function run() {
  console.log("🚀 Starting database seeding script...");
  const dataPath = path.join(__dirname, 'trains_data.json');
  
  if (!fs.existsSync(dataPath)) {
    console.error(`❌ Data file not found at ${dataPath}. Please create it first.`);
    process.exit(1);
  }
  
  const rawData = fs.readFileSync(dataPath, 'utf8');
  const data = JSON.parse(rawData);
  
  console.log(`Loaded ${data.stations?.length || 0} stations and ${data.trains?.length || 0} trains from JSON.`);

  // 1. Admin Login to get JWT Token
  console.log(`🔑 Logging in as ${ADMIN_EMAIL}...`);
  let token;
  try {
    const loginRes = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
    });
    
    if (!loginRes.ok) {
      const errText = await loginRes.text();
      throw new Error(`Login failed with status ${loginRes.status}: ${errText}`);
    }
    
    const loginData = await loginRes.json();
    token = loginData.token;
    if (!token) {
      throw new Error("Token not found in login response");
    }
    console.log("✅ Logged in successfully. Token acquired!");
  } catch (error) {
    console.error("❌ Failed to login to backend:", error.message);
    console.log("👉 Make sure your Spring Boot backend is running on http://localhost:8080");
    process.exit(1);
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // Helper helper to sleep to avoid hitting server too fast
  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // 2. Fetch existing stations to avoid duplicates
  console.log("🔍 Fetching existing stations from backend...");
  let existingStations = [];
  try {
    const res = await fetch(`${BACKEND_URL}/api/admin/stations`, { headers });
    if (res.ok) {
      existingStations = await res.json();
      console.log(`Found ${existingStations.length} existing stations.`);
    }
  } catch (err) {
    console.warn("⚠️ Could not fetch existing stations, will attempt adding all.");
  }

  const stationMap = new Map(existingStations.map(s => [s.code.toUpperCase(), s]));

  // 3. Add Stations
  console.log("🚉 Seeding stations...");
  for (const station of (data.stations || [])) {
    const codeUpper = station.code.toUpperCase();
    if (stationMap.has(codeUpper)) {
      console.log(`   - Station ${station.code} (${station.name}) already exists. Skipping.`);
      continue;
    }
    
    try {
      console.log(`   + Adding Station: ${station.code} - ${station.name}`);
      const res = await fetch(`${BACKEND_URL}/api/admin/stations`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ code: station.code, name: station.name })
      });
      
      if (res.ok) {
        const newStation = await res.json();
        stationMap.set(codeUpper, newStation);
      } else {
        const errText = await res.text();
        console.error(`   ❌ Failed to add station ${station.code}: ${errText}`);
      }
      await sleep(100);
    } catch (err) {
      console.error(`   ❌ Error adding station ${station.code}:`, err.message);
    }
  }

  // 4. Fetch existing trains to get IDs
  console.log("🔍 Fetching existing trains from backend...");
  let existingTrains = [];
  try {
    const res = await fetch(`${BACKEND_URL}/api/admin/trains`, { headers });
    if (res.ok) {
      existingTrains = await res.json();
      console.log(`Found ${existingTrains.length} existing trains.`);
    }
  } catch (err) {
    console.warn("⚠️ Could not fetch existing trains.");
  }

  const trainMap = new Map(existingTrains.map(t => [t.trainNumber, t]));

  // 5. Add Trains and their Stops
  console.log("🚆 Seeding trains and routes...");
  for (const train of (data.trains || [])) {
    let trainId;
    let dbTrain = trainMap.get(train.trainNumber);
    
    if (dbTrain) {
      trainId = dbTrain.id;
      console.log(`   - Train ${train.trainNumber} (${train.trainName}) already exists (ID: ${trainId}). Skipping creation.`);
    } else {
      try {
        console.log(`   + Adding Train: ${train.trainNumber} - ${train.trainName}`);
        const res = await fetch(`${BACKEND_URL}/api/admin/trains`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            trainNumber: train.trainNumber,
            trainName: train.trainName,
            totalSeats: train.totalSeats
          })
        });
        
        if (res.ok) {
          dbTrain = await res.json();
          trainId = dbTrain.id;
          trainMap.set(train.trainNumber, dbTrain);
          console.log(`     ✅ Added train successfully (ID: ${trainId})`);
        } else {
          const errText = await res.text();
          console.error(`     ❌ Failed to add train ${train.trainNumber}: ${errText}`);
          continue;
        }
        await sleep(100);
      } catch (err) {
        console.error(`     ❌ Error adding train ${train.trainNumber}:`, err.message);
        continue;
      }
    }

    // Now check if route is already defined
    console.log(`     🔍 Checking route for train ID ${trainId}...`);
    let existingStops = [];
    try {
      const stopsRes = await fetch(`${BACKEND_URL}/api/admin/routes/${trainId}`, { headers });
      if (stopsRes.ok) {
        existingStops = await stopsRes.json();
      }
    } catch (err) {
      console.warn("     ⚠️ Could not fetch route for train");
    }

    if (existingStops.length > 0) {
      console.log(`     - Route already exists with ${existingStops.length} stops. Skipping route stops seeding for this train.`);
      continue;
    }

    // Add stops one by one
    let stopOrder = 1;
    for (const stop of (train.stops || [])) {
      try {
        console.log(`     + Adding stop ${stopOrder}: Station ${stop.stationCode} (Halt: ${stop.halt})`);
        // Endpoint: POST /api/admin/routes/{trainId}/stops?stationCode=...&halt=...
        const addStopUrl = `${BACKEND_URL}/api/admin/routes/${trainId}/stops?stationCode=${encodeURIComponent(stop.stationCode)}&halt=${stop.halt}`;
        const addStopRes = await fetch(addStopUrl, {
          method: 'POST',
          headers
        });

        if (addStopRes.ok) {
          const newStop = await addStopRes.json();
          const stopId = newStop.id;
          console.log(`       ✅ Stop added (Stop ID: ${stopId})`);

          // Update stop schedule details
          // Endpoint: PUT /api/admin/v1/schedules/stops/{stopId}?arrivalTime=...&departureTime=...&platform=...&distanceFromOrigin=...&runningDays=...&expectedDelayMinutes=...
          const updateUrl = new URL(`${BACKEND_URL}/api/admin/v1/schedules/stops/${stopId}`);
          if (stop.arrivalTime) updateUrl.searchParams.append('arrivalTime', stop.arrivalTime);
          if (stop.departureTime) updateUrl.searchParams.append('departureTime', stop.departureTime);
          if (stop.platform !== undefined) updateUrl.searchParams.append('platform', stop.platform);
          if (stop.distanceFromOrigin !== undefined) updateUrl.searchParams.append('distanceFromOrigin', stop.distanceFromOrigin);
          if (stop.runningDays) updateUrl.searchParams.append('runningDays', stop.runningDays);
          if (stop.expectedDelayMinutes !== undefined) updateUrl.searchParams.append('expectedDelayMinutes', stop.expectedDelayMinutes);

          console.log(`       ⏱️ Updating schedule details...`);
          const updateRes = await fetch(updateUrl.toString(), {
            method: 'PUT',
            headers
          });

          if (updateRes.ok) {
            console.log(`       ✅ Schedule updated!`);
          } else {
            const errText = await updateRes.text();
            console.error(`       ❌ Failed to update schedule details: ${errText}`);
          }
        } else {
          const errText = await addStopRes.text();
          console.error(`       ❌ Failed to add stop: ${errText}`);
        }
        await sleep(150);
        stopOrder++;
      } catch (err) {
        console.error(`       ❌ Error adding stop:`, err.message);
      }
    }
  }

  console.log("\n🎉 Seeding complete! All stations, trains, and timetables uploaded.");
}

run().catch(err => {
  console.error("❌ Seeding script failed with unexpected error:", err);
});
