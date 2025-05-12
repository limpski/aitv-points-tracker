const supabase = window.supabase.createClient(
  "https://gkzclqflgrwexvxpsyig.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdremNscWZsZ3J3ZXh2eHBzeWlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0NzEwMDEsImV4cCI6MjA2MjA0NzAwMX0.swjEIqe8EvCd1_3l_fXyoGmyxWiErkH0b5t-q8cNkgg"
);

const activityPoints = {
  xEngagement: 1,
  watchStream: 2,
  discordInvite: 2,
  socialPost: 2,
  watchPartyPrompt: 2
};

document.getElementById("submitCode").addEventListener("click", () => {
  const code = document.getElementById("accessCode").value;
  if (code === "aitv2025") {
    document.getElementById("access-gate").style.display = "none";
    document.getElementById("main-content").style.display = "block";
    loadLeaderboard();
  } else {
    alert("Invalid access code");
  }
});

document.getElementById("points-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const activity = document.getElementById("activity").value;

  if (!username || !activity || !activityPoints[activity]) {
    alert("Please enter a username and select an activity");
    return;
  }

  const points = activityPoints[activity];

  const { data: existingUser } = await supabase
    .from("users")
    .select("*")
    .eq("username", username)
    .single();

  if (existingUser) {
    const { error } = await supabase
      .from("users")
      .update({ points: existingUser.points + points })
      .eq("username", username);

    if (error) {
      alert("Error updating points");
      console.error(error);
    }
  } else {
    const { error } = await supabase
      .from("users")
      .insert({ username, points });

    if (error) {
      alert("Error adding new user");
      console.error(error);
    }
  }

  loadLeaderboard();
  document.getElementById("points-form").reset();
});

async function loadLeaderboard() {
  const { data, error } = await supabase
    .from("users")
    .select("username, points")
    .order("points", { ascending: false });

  if (error) {
    console.error("Error loading leaderboard:", error);
    return;
  }

  const tbody = document.querySelector("#leaderboard tbody");
  tbody.innerHTML = "";

  data.forEach((user) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${user.username}</td>
      <td>${user.points}</td>
      <td><button onclick="deleteUser('${user.username}')">❌</button></td>
    `;
    tbody.appendChild(tr);
  });
}

async function deleteUser(username) {
  if (!confirm(`Delete user "${username}"?`)) return;

  const { error } = await supabase
    .from("users")
    .delete()
    .eq("username", username);

  if (error) {
    alert("Error deleting user");
    console.error(error);
  } else {
    loadLeaderboard();
  }
}


