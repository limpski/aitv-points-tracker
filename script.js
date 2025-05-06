console.log("✅ script.js loaded");

const supabaseUrl = "https://gkzclqflgrwexvxpsyig.supabase.co";
const supabaseKey = "your-supabase-anon-key-here"; // Replace with actual anon key if you're still doing local dev
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
  inviteFriends: 2,
};

// 🔐 Access Gate
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

// ➕ Add Points
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
    const { error: updateError } = await supabaseClient
      .from("users")
      .update({ points: existingUser.points + points })
      .eq("username", username);

    if (updateError) {
      console.error("❌ Update error:", updateError);
    }
  } else {
    console.log("🆕 New user, inserting...");
    const { error: insertError } = await supabaseClient
      .from("users")
      .insert([{ username, points }]);

    if (insertError) {
      console.error("❌ Insert error:", insertError);
    }
  }

  form.reset();
  loadLeaderboard();
});

// 📊 Load Leaderboard
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
      <td><button class="delete-btn" data-user="${username}">🗑️</button></td>
    `;
    leaderboardBody.appendChild(row);
  });
  console.log("✅ Leaderboard updated");
}

// 🗑️ Delete User Button
document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("delete-btn")) {
    const username = e.target.dataset.user;
    const confirmDelete = confirm(`Delete user "${username}"?`);
    if (!confirmDelete) return;

    const { error } = await supabaseClient
      .from("users")
      .delete()
      .eq("username", username);

    if (error) {
      console.error("❌ Delete error:", error);
      alert("Could not delete user.");
    } else {
      console.log(`🗑️ Deleted user: ${username}`);
      loadLeaderboard();
    }
  }
});

