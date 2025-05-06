console.log("✅ script.js loaded");

// Supabase config
const supabaseUrl = "https://gkzclqflgrwexvxpsyig.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdremNscWZsZ3J3ZXh2eHBzeWlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0NzEwMDEsImV4cCI6MjA2MjA0NzAwMX0.swjEIqe8EvCd1_3l_fXyoGmyxWiErkH0b5t-q8cNkgg";
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
console.log("✅ Supabase initialized");

const accessGate = document.getElementById("access-gate");
const mainContent = document.getElementById("main-content");
const form = document.getElementById("points-form");
const leaderboardBody = document.querySelector("#leaderboard tbody");

const taskPoints = {
  watch: 1,
  engage: 1,
  watchPartyMsg: 1,
  inAppMsg: 1,
  postContent: 2,
  inviteFriends: 2
};

// Access code logic
document.getElementById("submitCode").addEventListener("click", () => {
  const enteredCode = document.getElementById("accessCode").value.trim();
  console.log("🔐 Access code entered:", enteredCode);

  if (enteredCode === "aitv2025") {
    console.log("✅ Access granted");
    accessGate.style.display = "none";
    mainContent.style.display = "block";
    loadLeaderboard();
  } else {
    console.log("❌ Incorrect code");
    alert("Incorrect access code.");
  }
});

// Add points
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value.trim().toLowerCase();
  const activity = document.getElementById("activity").value;
  const points = taskPoints[activity] || 0;

  if (!username || !activity) {
    console.log("⚠️ Missing username or activity");
    return;
  }

  console.log(`📝 Adding ${points} points to ${username} for activity: ${activity}`);

  const { data: existingUser, error: selectError } = await supabaseClient
    .from("users")
    .select("*")
    .eq("username", username)
    .single();

  if (selectError && selectError.code !== "PGRST116") {
    console.error("❌ Error fetching user:", selectError);
    return;
  }

  if (existingUser) {
    console.log("🔁 User exists, updating points...");
    await supabaseClient
      .from("users")
      .update({ points: existingUser.points + points })
      .eq("username", username);
  } else {
    console.log("🆕 New user, inserting...");
    await supabaseClient
      .from("users")
      .insert([{ username, points }]);
  }

  form.reset();
  loadLeaderboard();
});

// Load leaderboard
async function loadLeaderboard() {
  console.log("📊 Loading leaderboard...");
  const { data: users, error } = await supabaseClient
    .from("users")
    .select("username, points")
    .order("points", { ascending: false });

  if (error) {
    console.error("❌ Error loading leaderboard:", error);
    return;
  }

  leaderboardBody.innerHTML = "";
  users.forEach(({ username, points }) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${username}</td>
      <td>${points}</td>
      <td><button onclick="deleteUser('${username}')">Delete</button></td>
    `;
    leaderboardBody.appendChild(row);
  });
  console.log("✅ Leaderboard updated");
}

// Delete user
async function deleteUser(username) {
  const confirmDelete = confirm(`Are you sure you want to delete "${username}"?`);
  if (!confirmDelete) return;

  const { error } = await supabaseClient
    .from("users")
    .delete()
    .eq("username", username);

  if (error) {
    console.error("❌ Failed to delete user:", error);
    alert("Error deleting user.");
  } else {
    console.log(`🗑️ Deleted user: ${username}`);
    loadLeaderboard();
  }
}


