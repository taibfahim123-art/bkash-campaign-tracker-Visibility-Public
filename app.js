import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

const $ = id => document.getElementById(id);
const fmt = n => Number(n ?? 0).toLocaleString('en-US', { maximumFractionDigits: 2 });
let sb = null, all = [], offset = 0, loading = false, hasMore = true;
const PAGE_SIZE = 500;

const show = (message, error = false) => {
  const el = $('message');
  el.style.display = 'block';
  el.textContent = message;
  el.className = error ? 'bad' : 'good';
};
function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}
function filtered() {
  const category = $('category').value;
  return all.filter(r => category === 'ALL' || r.campaign_category === category);
}
function paint() {
  const rows = filtered();
  $('results').innerHTML = rows.map(r => `
    <tr><td>${r.category_rank == null ? '—' : fmt(r.category_rank)}</td>
    <td>${esc(r.agent_name || 'Agent')}</td>
    <td><span class="badge">${esc(r.campaign_category || '—')}</span></td>
    <td class="num">${fmt(r.achievement)}</td>
    <td class="num">${fmt(r.fixed_target)}</td>
    <td class="num">${fmt(r.achievement_percentage)}%</td></tr>`).join('') ||
    '<tr><td colspan="6">No matching agents.</td></tr>';
  $('rowSummary').textContent = `Showing ${fmt(rows.length)} of ${fmt(all.length)} loaded records.`;
  $('loadMore').hidden = !hasMore;
  $('loadMore').disabled = loading || !hasMore;
  $('loadMore').textContent = loading ? 'Loading…' : hasMore ? 'Load more agents' : 'All available records loaded';
  $('campaignCount').textContent = fmt(all.length);
  $('categoryCount').textContent = fmt(new Set(all.map(r => r.campaign_category).filter(Boolean)).size);
  $('topAchievement').textContent = fmt(all.reduce((m, r) => Math.max(m, Number(r.achievement_percentage || 0)), 0)) + '%';
}
async function loadNextPage(reset = false) {
  if (loading) return;
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || SUPABASE_URL.includes('YOUR_') || SUPABASE_ANON_KEY.includes('YOUR_')) {
    show('Setup needed: add your Supabase Project URL and publishable/anon key to config.js. Never use a service_role or secret key in frontend code.', true);
    $('results').innerHTML = '<tr><td colspan="6">Supabase is not configured yet.</td></tr>';
    $('loadMore').hidden = true;
    return;
  }
  if (reset) { all = []; offset = 0; hasMore = true; }
  if (!hasMore) return;
  loading = true;
  $('loadMore').disabled = true;
  $('loadMore').textContent = 'Loading…';
  try {
    if (!sb) sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data, error } = await sb.rpc('get_public_campaign_leaderboard', { p_limit: PAGE_SIZE, p_offset: offset });
    if (error) throw error;
    const page = data || [];
    all = all.concat(page);
    offset += page.length;
    hasMore = page.length === PAGE_SIZE;
    $('reportDate').textContent = 'Latest campaign view';
    paint();
    show(page.length ? 'Campaign results loaded.' : (all.length ? 'All available results loaded.' : 'No campaign results were returned.'));
  } catch (err) {
    console.error(err);
    show('Data load failed. Check Supabase URL/key, function permissions, and GitHub Pages deployment.', true);
    if (!all.length) $('results').innerHTML = '<tr><td colspan="6">Could not load campaign data.</td></tr>';
  } finally {
    loading = false;
    paint();
  }
}
$('refresh').addEventListener('click', () => loadNextPage(true));
$('loadMore').addEventListener('click', () => loadNextPage(false));
$('category').addEventListener('change', paint);
loadNextPage(true);
