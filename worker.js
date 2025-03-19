const TELEGRAM_BOT_TOKEN = "examploe";
const TELEGRAM_CHAT_ID = "example";

// Fulfillment URL (change based on region)
const FULFILLMENT_URL = "https://www.apple.com/uk/shop/fulfillment-messages";

// ZIP code for shops
const locations = ["HA02FY"]; 

const items = [
  { title: "max256-natural", part: "MU793ZD%2FA" },
  { title: "max256-blue", part: "MU7A3ZD%2FA" },
  { title: "max256-white", part: "MU783ZD%2FA" },
  { title: "max256-black", part: "MU773ZD%2FA" },
];

const EMOJIS = "%F0%9F%93%B1%F0%9F%A4%96";
const TELEGRAM_BOT_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

let lastFoundItems = [];
let lastFoundTimestamp = null;
const SIX_HOURS = 6 * 60 * 60 * 1000;

let stats = { available: 0, unavailable: 0, pickupUnavailable: 0, errors: 0 };
let foundItems = [];

const src_default = {
  async fetch(request, env) {
    return new Response(await getApple(env), {
      headers: { "Content-Type": "text/html" },
    });
  },
  async scheduled(controller, env, ctx) {
    await getApple(env);
  },
};

async function getApple(env) {
  foundItems = [];
  stats = { available: 0, unavailable: 0, pickupUnavailable: 0, errors: 0 };

  for (const item of items) {
    for (const location of locations) {
      await parseStore(item, location);
    }
  }

  const currentTime = Date.now();

  if (lastFoundTimestamp && currentTime - lastFoundTimestamp > SIX_HOURS) {
    lastFoundItems = [];
    lastFoundTimestamp = null;
  }

  if (JSON.stringify(foundItems) !== JSON.stringify(lastFoundItems) || !lastFoundTimestamp) {
    if (foundItems.length > 0) {
      await sendTelegramNotification(foundItems.join(", "), env);
    }
    lastFoundItems = [...foundItems];
    lastFoundTimestamp = currentTime;
  }

  const message = `Checked Locations: ${locations.join(", ")}<br>` +
    `Found Items: ${foundItems.join(", ")}<br>` +
    `Available: ${stats.available}<br>` +
    `Unavailable: ${stats.unavailable}<br>` +
    `Unavailable for Pickup: ${stats.pickupUnavailable}<br>` +
    `Errors: ${stats.errors}`;

  console.log(message.replace(/<br>/g, ", "));
  return message;
}

async function parseStore(item, location) {
  const url = `${FULFILLMENT_URL}?parts.0=${item.part}&location=${location}&searchNearby=true&mt=regular&_=${Date.now()}`;

  try {
    const response = await fetch(url, { headers: { "Content-Type": "text/html;charset=UTF-8" } });
    const results = await gatherResponse(response);

    if (results.includes('"available"')) {
      foundItems.push(`<b>${item.title}</b> <i>${item.part}</i> @ ${location}`);
      stats.available++;
    } else if (results.includes('"unavailable"')) {
      stats.unavailable++;
    } else if (results.includes('"Check availability') || results.includes("Unavailable for Pickup")) {
      stats.pickupUnavailable++;
    } else {
      console.error(`Unexpected response for ${url}`);
      stats.errors++;
    }
  } catch (error) {
    console.error(`Fetch error: ${error.message}`);
    stats.errors++;
  }
}

async function gatherResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  return contentType.includes("application/json") ? JSON.stringify(await response.json()) : await response.text();
}

async function sendTelegramNotification(message, env) {
  const tgUrl = `${TELEGRAM_BOT_URL}?parse_mode=HTML&chat_id=${TELEGRAM_CHAT_ID}&text=${EMOJIS} ${message}`;

  try {
    await fetch(tgUrl);
  } catch (error) {
    console.error(`Failed to send Telegram notification: ${error.message}`);
  }
}

export { src_default as default };
