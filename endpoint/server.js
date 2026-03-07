/**
 * Kosovo Prayer Times API
 * 
 * Wraps the AlAdhan API with the correct parameters to match
 * takvimi-ks.com (Official Kosovo Islamic Community - BIK) prayer times.
 *
 * Kosovo BIK uses:
 *   - Calculation Method: Custom (method=99)
 *   - Fajr Angle: 18°
 *   - Isha Angle: 17°
 *   - School: Hanafi (school=1) — affects Asr timing
 *   - Latitude: 42.6629 (Pristina)
 *   - Longitude: 21.1655
 *   - Timezone: Europe/Skopje (UTC+1 / UTC+2 DST)
 *
 * Verified against takvimi-ks.com on 2026-02-20:
 *   Imsaku 04:48 | Sunrise 06:22 | Dreka 11:54
 *   Ikindia 14:53 | Akshami 17:22 | Jacia 18:53
 *
 * Usage:
 *   npm install express node-fetch
 *   node server.js
 *
 * Endpoints:
 *   GET /api/prayer-times              → today's times
 *   GET /api/prayer-times?date=DD-MM-YYYY → specific date
 *   GET /api/prayer-times/calendar?month=M&year=YYYY → monthly calendar
 */

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Kosovo / Pristina coordinates
const KOSOVO = {
  latitude: 42.6629,
  longitude: 21.1655,
  timezone: 'Europe/Skopje',
};

/**
 * Build the AlAdhan API URL for Kosovo prayer times.
 *
 * Method 99 = custom angles  →  methodSettings=FajrAngle,MaghribType,IshaAngle
 *   18  = Fajr angle (BIK standard)
 *   null = Maghrib (0 mins after sunset — standard)
 *   17  = Isha angle (BIK standard)
 * school=1 = Hanafi (Asr later, matching takvimi-ks)
 */
function buildAlAdhanUrl(date, forCalendar = false, month = null, year = null) {
  const base = 'https://api.aladhan.com/v1';
  const params = new URLSearchParams({
    latitude: KOSOVO.latitude,
    longitude: KOSOVO.longitude,
    method: 99,
    methodSettings: '18,null,17', // Fajr 18°, Isha 17°
    school: 1,                    // Hanafi — later Asr
    timezonestring: KOSOVO.timezone,
    // tune: '0,0,0,0,0,0,0,0,0' // add per-prayer offsets here if needed
  });

  if (forCalendar) {
    params.set('month', month);
    params.set('year', year);
    return `${base}/calendar?${params}`;
  }

  return `${base}/timings/${date}?${params}`;
}

/**
 * Map AlAdhan response timings to Kosovo Albanian prayer names.
 */
function mapTimings(timings) {
  return {
    Imsaku:            timings.Imsak,     // سحور / Suhoor start
    Sabahu:            timings.Fajr,      // فجر  / Fajr
    LindjaEDiellit:    timings.Sunrise,   // شروق / Sunrise
    Dreka:             timings.Dhuhr,     // ظهر  / Dhuhr
    Ikindia:           timings.Asr,       // عصر  / Asr
    Akshami:           timings.Maghrib,   // مغرب / Maghrib
    Jacia:             timings.Isha,      // عشاء / Isha
    GjatesiaEDites:    computeDaylightHours(timings.Sunrise, timings.Sunset),
  };
}

/**
 * Compute daylight duration from sunrise/sunset strings ("HH:MM").
 */
function computeDaylightHours(sunrise, sunset) {
  const [sh, sm] = sunrise.replace(/ \(.*\)/, '').split(':').map(Number);
  const [eh, em] = sunset.replace(/ \(.*\)/, '').split(':').map(Number);
  const totalMins = (eh * 60 + em) - (sh * 60 + sm);
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  return `${h}:${String(m).padStart(2, '0')}`;
}

/**
 * Format today's date as DD-MM-YYYY for AlAdhan.
 */
function todayFormatted() {
  const now = new Date();
  const d = String(now.getDate()).padStart(2, '0');
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const y = now.getFullYear();
  return `${d}-${m}-${y}`;
}

// ──────────────────────────────────────────────────────────────────
// ROUTES
// ──────────────────────────────────────────────────────────────────

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

/**
 * GET /api/prayer-times
 * Query params:
 *   date  (optional) — DD-MM-YYYY  default: today
 *
 * Returns Kosovo prayer times for the given date.
 */
app.get('/api/prayer-times', async (req, res) => {
  const date = req.query.date || todayFormatted();

  // Validate date format
  if (!/^\d{2}-\d{2}-\d{4}$/.test(date)) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid date format. Use DD-MM-YYYY.',
    });
  }

  try {
    const url = buildAlAdhanUrl(date);
    const response = await fetch(url);
    const json = await response.json();

    if (json.code !== 200) {
      return res.status(502).json({ status: 'error', message: json.status });
    }

    const { timings, date: dateInfo, meta } = json.data;

    return res.json({
      status: 'ok',
      source: 'Takvimi i Kosovës (BIK)',
      date: {
        gregorian: dateInfo.gregorian.date,          // DD-MM-YYYY
        hijri:     `${dateInfo.hijri.date} ${dateInfo.hijri.month.en} ${dateInfo.hijri.year}`,
        day:       dateInfo.gregorian.weekday.en,
      },
      prayerTimes: mapTimings(timings),
      meta: {
        method:     'BIK Kosovo — Fajr 18°, Isha 17°',
        school:     'Hanafi',
        latitude:   KOSOVO.latitude,
        longitude:  KOSOVO.longitude,
        timezone:   KOSOVO.timezone,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});

/**
 * GET /api/prayer-times/calendar
 * Query params:
 *   month (required) — 1-12
 *   year  (required) — e.g. 2026
 *
 * Returns Kosovo prayer times for a full month.
 */
app.get('/api/prayer-times/calendar', async (req, res) => {
  const month = parseInt(req.query.month);
  const year  = parseInt(req.query.year);

  if (!month || !year || month < 1 || month > 12) {
    return res.status(400).json({
      status: 'error',
      message: 'Provide valid month (1-12) and year query parameters.',
    });
  }

  try {
    const url = buildAlAdhanUrl(null, true, month, year);
    const response = await fetch(url);
    const json = await response.json();

    if (json.code !== 200) {
      return res.status(502).json({ status: 'error', message: json.status });
    }

    const calendar = json.data.map((day) => ({
      date: {
        gregorian: day.date.gregorian.date,
        hijri:     `${day.date.hijri.date} ${day.date.hijri.month.en} ${day.date.hijri.year}`,
        day:       day.date.gregorian.weekday.en,
      },
      prayerTimes: mapTimings(day.timings),
    }));

    return res.json({
      status: 'ok',
      source: 'Takvimi i Kosovës (BIK)',
      month,
      year,
      calendar,
      meta: {
        method:    'BIK Kosovo — Fajr 18°, Isha 17°',
        school:    'Hanafi',
        latitude:  KOSOVO.latitude,
        longitude: KOSOVO.longitude,
        timezone:  KOSOVO.timezone,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});

// 404 fallback
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Endpoint not found. Try GET /api/prayer-times or /api/prayer-times/calendar',
  });
});

app.listen(PORT, () => {
  console.log(`Kosovo Prayer Times API running on http://localhost:${PORT}`);
});
