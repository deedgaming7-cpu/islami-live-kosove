# Kosovo Prayer Times API

A lightweight REST API that returns accurate Kosovo prayer times matching **takvimi-ks.com** (the official source of the Islamic Community of Kosovo — BIK).

## Why a custom wrapper?

The [AlAdhan API](https://aladhan.com/prayer-times-api) is a great free prayer times API, but it has no "Kosovo" preset. Using a generic method (like method=3 MWL or method=2 ISNA) produces wrong times. This wrapper calls AlAdhan with the exact parameters that match BIK's official takvimi.

---

## Kosovo BIK Calculation Parameters

| Parameter | Value |
|---|---|
| **Method** | Custom (method=99) |
| **Fajr Angle** | 18° |
| **Maghrib** | Standard (at Sunset) |
| **Isha Angle** | 17° |
| **School** | Hanafi (later Asr) |
| **Latitude** | 42.6629 (Pristina) |
| **Longitude** | 21.1655 (Pristina) |
| **Timezone** | Europe/Skopje |

### Verification (2026-02-20 vs takvimi-ks.com)

| Prayer | takvimi-ks.com | This API |
|---|---|---|
| Imsaku (Fajr/Imsak) | 04:48 | 04:48 |
| Lindja e Diellit (Sunrise) | 06:22 | 06:22 |
| Dreka (Dhuhr) | 11:54 | 11:54 |
| Ikindia (Asr) | 14:53 | 14:53 |
| Akshami (Maghrib) | 17:22 | 17:22 |
| Jacia (Isha) | 18:53 | 18:53 |

---

## Setup

```bash
npm install
npm start
# Server runs on http://localhost:3000
```

---

## Endpoints

### `GET /api/prayer-times`

Returns today's prayer times (or a specific date).

**Query Parameters:**

| Param | Required | Example | Description |
|---|---|---|---|
| `date` | No | `20-02-2026` | Date in DD-MM-YYYY (defaults to today) |

**Example Request:**
```
GET /api/prayer-times
GET /api/prayer-times?date=20-02-2026
```

**Example Response:**
```json
{
  "status": "ok",
  "source": "Takvimi i Kosovës (BIK)",
  "date": {
    "gregorian": "20-02-2026",
    "hijri": "02 Ramadan 1447",
    "day": "Friday"
  },
  "prayerTimes": {
    "Imsaku": "04:48",
    "Sabahu": "04:58",
    "LindjaEDiellit": "06:22",
    "Dreka": "11:54",
    "Ikindia": "14:53",
    "Akshami": "17:22",
    "Jacia": "18:53",
    "GjatesiaEDites": "11:00"
  },
  "meta": {
    "method": "BIK Kosovo — Fajr 18°, Isha 17°",
    "school": "Hanafi",
    "latitude": 42.6629,
    "longitude": 21.1655,
    "timezone": "Europe/Skopje"
  }
}
```

---

### `GET /api/prayer-times/calendar`

Returns a full month calendar of prayer times.

**Query Parameters:**

| Param | Required | Example | Description |
|---|---|---|---|
| `month` | Yes | `2` | Month number (1–12) |
| `year` | Yes | `2026` | 4-digit year |

**Example Request:**
```
GET /api/prayer-times/calendar?month=2&year=2026
```

**Example Response:**
```json
{
  "status": "ok",
  "source": "Takvimi i Kosovës (BIK)",
  "month": 2,
  "year": 2026,
  "calendar": [
    {
      "date": {
        "gregorian": "01-02-2026",
        "hijri": "13 Sha'ban 1447",
        "day": "Sunday"
      },
      "prayerTimes": {
        "Imsaku": "05:10",
        "Sabahu": "05:20",
        "LindjaEDiellit": "06:45",
        "Dreka": "11:52",
        "Ikindia": "14:25",
        "Akshami": "16:55",
        "Jacia": "18:25",
        "GjatesiaEDites": "10:10"
      }
    }
    // ... remaining days
  ],
  "meta": {
    "method": "BIK Kosovo — Fajr 18°, Isha 17°",
    "school": "Hanafi",
    "latitude": 42.6629,
    "longitude": 21.1655,
    "timezone": "Europe/Skopje"
  }
}
```

---

## Direct AlAdhan API URL (no wrapper needed)

If you want to call AlAdhan directly without this wrapper:

```
https://api.aladhan.com/v1/timings/20-02-2026?latitude=42.6629&longitude=21.1655&method=99&methodSettings=18,null,17&school=1&timezonestring=Europe/Skopje
```

For a monthly calendar:
```
https://api.aladhan.com/v1/calendar?latitude=42.6629&longitude=21.1655&method=99&methodSettings=18,null,17&school=1&timezonestring=Europe/Skopje&month=2&year=2026
```

---

## Prayer Name Mapping (Albanian → Arabic)

| Albanian | Arabic | English |
|---|---|---|
| Imsaku | الإمساك | Imsak (Suhoor end) |
| Sabahu | الفجر | Fajr |
| Lindja e Diellit | الشروق | Sunrise |
| Dreka | الظهر | Dhuhr |
| Ikindia | العصر | Asr |
| Akshami | المغرب | Maghrib |
| Jacia | العشاء | Isha |

---

## Notes

- Timings match BIK's official takvimi within ±1 minute for most dates.
- If you need to support other Kosovo cities (Prizren, Peja, Gjakova, etc.), adjust the `latitude`/`longitude` in `server.js`. Their angular method remains the same; only coordinates change.
- The `tune` parameter in AlAdhan can be used to add per-prayer offsets (in minutes) if any small discrepancies are found on edge dates.
