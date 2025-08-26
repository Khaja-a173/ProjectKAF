cat > getToken.mjs <<'JS'
import fetch from "node-fetch";
import fs from "fs";

const url = "https://ckfxakctdeasbwhhbjnk.supabase.co/auth/v1/token?grant_type=password";
const apikey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNrZnhha2N0ZGVhc2J3aGhiam5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2OTMyOTgsImV4cCI6MjA3MTI2OTI5OH0.NShDvpr_0Dc3emiUADrAW8aGngQQGtcsFIL8_5L78uQ";

async function main() {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        apikey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "demo@example.com",
        password: "demopass",
      }),
    });

    const data = await res.json();
    console.log("Response:", data);

    if (data.access_token) {
      fs.writeFileSync("/tmp/token.json", JSON.stringify(data, null, 2));
      console.log("✅ Token saved to /tmp/token.json");
    } else {
      console.error("❌ Failed to fetch token");
    }
  } catch (e) {
    console.error("Error fetching token:", e.message);
  }
}

main();
JS