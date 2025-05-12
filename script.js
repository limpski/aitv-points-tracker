// Initialize Supabase client
const supabase = supabase.createClient(
  https://gkzclqflgrwexvxpsyig.supabase.co, 
  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdremNscWZsZ3J3ZXh2eHBzeWlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0NzEwMDEsImV4cCI6MjA2MjA0NzAwMX0.swjEIqe8EvCd1_3l_fXyoGmyxWiErkH0b5t-q8cNkgg
);

// Access code gate
document.getElementById('submitCode').addEventListener('click', () => {
  const code = document.getElementById('accessCode').value;
  if (code === 'aitv2025') {
    document.getElementById('access-gate').style.display = 'none';
    document.getElementById('main-content').style.display = 'block';
    loadLeaderboard();
  } else {
    alert('Incorrect access code');
  }
});

// Define point values for each activity
const activityPoints = {
  xEngagement: 1,
  watchStream: 2,
  discordInvite: 2,
  socialPost: 2,
  watchPartyPrompt: 2
};

// Form submit handler
document.getElementById('points-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('username').value.trim().toLowerCase();
  const activity = document.getElementById('activity').value;
  const points = activityPoints[activity];

  if (!username || !points) {
    alert('Please enter a username and select an activity.');
    return;
  }

  const { data: existing, error: fetchError } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error('Fetch error:', fetchError);
    return alert('Error checking user.');
  }

  if (existing) {
    const { error: updateError } = await supabase
      .from('users')
      .update({ points: existing.points + points })
      .eq('username', username);

    if (updateError) {
      console.error(updateError);
      return alert('Error updating points.');
    }
  } else {
    const { error: insertError } = await supabase
      .from('users')
      .insert({ username, points });

    if (insertError) {
      console.error(insertError);
      return alert('Error inserting user.');
    }
  }

  document.getElementById('points-form').reset();
  loadLeaderboard();
});

// Load leaderboard
async function loadLeaderboard() {
  const { data, error } = await supabase
    .from('users')
    .select('username, points')
    .order('points', { ascending: false });

  if (error) {
    console.error(error);
    return alert('Error loading leaderboard.');
  }

  const tbody = document.querySelector('#leaderboard tbody');
  tbody.innerHTML = '';
  data.forEach(user => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${user.username}</td>
      <td>${user.points}</td>
      <td><button onclick="deleteUser('${user.username}')">Delete</button></td>
    `;
    tbody.appendChild(row);
  });
}

// Delete user
async function deleteUser(username) {
  if (!confirm(`Delete user "${username}"?`)) return;
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('username', username);
  if (error) {
    console.error(error);
    return alert('Error deleting user.');
  }
  loadLeaderboard();
}


