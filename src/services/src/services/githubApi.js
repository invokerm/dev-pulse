const BASE_URL = 'https://api.github.com';

export async function fetchGitHubUser(username) {
  const response = await fetch(`${BASE_URL}/users/${username}`);
  if (!response.ok) {
    throw new Error('User not found or rate limit exceeded.');
  }
  return response.json();
}

export async function fetchGitHubRepos(username) {
  const response = await fetch(`${BASE_URL}/users/${username}/repos?sort=updated&per_page=100`);
  if (!response.ok) {
    throw new Error('Failed to fetch repositories.');
  }
  return response.json();
}
