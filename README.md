# Stamps Developer Mini Test

This repository contains two command-line programs written in JavaScript:

1. **Task 1 - FooBar:** prints numbers from 100 to 1, skips prime numbers, and replaces numbers divisible by 3 and/or 5.
2. **Task 2 - Jakarta Weather Forecast:** displays one temperature per day for the next five days using OpenWeather.

## Requirements

- Node.js 20.6 or newer
- An OpenWeather API key for Task 2

No package installation is required because both programs use built-in Node.js features.

## Environment Setup

Copy the example environment file:

```bash
cp .env.example .env
```

Add your OpenWeather API key to `.env`:

```env
OPENWEATHER_API_KEY=your_api_key_here
```

The real API key is not included in this repository for security reasons.

## Run Task 1

```bash
node task1.js
```

Task 1 creates numbers from 1 to 100, reads them in reverse order, removes prime numbers, and applies the FooBar replacements. The result is printed horizontally.

## Run Task 2

```bash
node --env-file=.env task2.js
```

Task 2 looks up Jakarta with the OpenWeather Geocoding API and requests the 5 Day / 3 Hour Forecast. It converts every forecast timestamp with the location timezone, ignores the current local date, and selects the forecast closest to 12:00 for each of the next five dates.

## Bun Alternative

Both programs can also be run with Bun:

```bash
bun task1.js
bun task2.js
```

Bun loads `.env` automatically.

## Screenshots

Run each command in the terminal and save screenshots of the complete output as:

```text
screenshots/task1-result.png
screenshots/task2-result.png
```

Make sure the API key and `.env` contents are not visible in either screenshot.
