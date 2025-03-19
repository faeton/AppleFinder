# Apple SKU Availability Finder

## Overview
This script checks the availability of Apple products in specified locations and notifies via Telegram when stock status changes. It runs periodically and ensures that notifications are only sent when availability updates.

## Features
- Fetches stock status for Apple SKUs from the UK Apple Store.
- Supports multiple products and locations.
- Sends Telegram notifications when availability changes.
- Prevents duplicate notifications within six hours.
- Logs availability stats and errors for debugging.

## Installation & Setup

### Prerequisites
- Node.js installed
- A valid Telegram bot token
- A Telegram chat ID to receive notifications

### Configuration
1. **Edit the SKU List:** Modify the `items` array to include the Apple SKUs you want to track.
2. **Set Locations:** Update the `locations` array with Apple Store location codes.
3. **Telegram Setup:**
   - Create an `.env` file and add the following environment variables:
     ```sh
     TELEGRAM_BOT_TOKEN=your_telegram_bot_token
     TELEGRAM_CHAT_ID=your_chat_id
     ```
   - Modify the script to load these values:
     ```javascript
     import dotenv from 'dotenv';
     dotenv.config();
     
     const TELEGRAM_BOT_URL = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
     const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
     ```

## Usage
### Running the Script
You can execute the script manually or schedule it as a Cloudflare Worker.

#### Manual Execution
Run the script:
```sh
node script.js
```

#### Cloudflare Worker Deployment
1. Upload the script to Cloudflare Workers.
2. Schedule it to run periodically (e.g., every hour).

## How It Works
1. The script fetches Apple product availability from the Apple UK store.
2. It checks if any items are available at the specified locations.
3. If a change in availability is detected, it sends a Telegram notification.
4. The script prevents duplicate alerts by tracking notifications within a six-hour window.
5. Logs are generated with availability details and errors.

## Example Notification
```
📱🤖 max256-natural MU793ZD/A @ HA02FY
```

## Logging
The script logs key metrics:
- Checked locations
- Available products
- Unavailable products
- Unavailable for pickup products
- Errors encountered

Logs appear in the console and can be redirected to a log file for analysis.

## Troubleshooting
- **No notifications received?** Ensure the Telegram bot token and chat ID are correct.
- **Script errors?** Check logs for API response issues or network errors.
- **Duplicate notifications?** The six-hour timer might have reset due to a restart.

## Future Enhancements
- Support for additional store regions.
- Webhook integration for real-time updates.
- Improved error handling with retries.

## License
This script is open-source and available under the MIT License.

