/* ============================================================
   NEET Progress Tracker — script.js
   Handles: chart management, insights, filter pills, form UX
   ============================================================ */

/* ── Subject config ─────────────────────────────────────────── */
const SUBJECTS = {
  total:     { label: 'Total',     color: '#5b8e7d', max: 720  },
  physics:   { label: 'Physics',   color: '#6ba3be', max: 180  },
  chemistry: { label: 'Chemistry', color: '#7dab8a', max: 180  },
  botany:    { label: 'Botany',    color: '#c4956a', max: 180  },
  zoology:   { label: 'Zoology',   color: '#b07db8', max: 180  },
  rank:      { label: 'Rank',      color: '#d97b7b', max: null },
};


/* ── Insight generation ─────────────────────────────────────── */
function generateInsight(data) {
  if (!data || data.length < 2) {
    return {
      icon: '📋',
      sentence: 'Add more tests to see insights.',
      deltas: []
    };
  }

  const last = data[data.length - 1];
  const prev = data[data.length - 2];

  const totalDelta = last.total - prev.total;
  const rankDelta  = last.rank  - prev.rank;   // negative = improved

  // Determine sentence + icon
  let sentence, icon;

  if (totalDelta < 0 && rankDelta > 0) {
    // Scored less AND rank dropped — likely harder test
    sentence = 'This test was probably harder than usual.';
    icon = '🧩';
  } else if (totalDelta > 0 && rankDelta > 0) {
    // Scored more but rank dropped — competition was stronger
    sentence = 'You scored better, but the competition was stronger.';
    icon = '⚡';
  } else if (totalDelta > 0 && rankDelta < 0) {
    // Scored more AND rank improved — genuine improvement
    sentence = 'Great improvement! Keep this momentum going.';
    icon = '🚀';
  } else if (totalDelta < 0 && rankDelta < 0) {
    // Scored less but rank improved — easier test / others did worse
    sentence = 'Rank improved despite a lower score — easier test?';
    icon = '🤔';
  } else {
    sentence = 'Performance is stable — consistency is key.';
    icon = '📊';
  }

  // Build delta chips
  const deltas = [];

  const totalSign = totalDelta > 0 ? '+' : '';
  deltas.push({
    label: `${totalSign}${totalDelta.toFixed(1)} marks`,
    type: totalDelta > 0 ? 'up' : totalDelta < 0 ? 'down' : 'same'
  });

  const rankSign = rankDelta > 0 ? '+' : '';
  deltas.push({
    label: `Rank ${rankSign}${rankDelta}`,
    type: rankDelta < 0 ? 'rank-up' : rankDelta > 0 ? 'rank-down' : 'same'
  });

  // Per-subject deltas
  ['physics', 'chemistry', 'botany', 'zoology'].forEach(subj => {
    const d = last[subj] - prev[subj];
    if (d !== 0) {
      const sign = d > 0 ? '+' : '';
      deltas.push({
        label: `${SUBJECTS[subj].label} ${sign}${d.toFixed(1)}`,
        type: d > 0 ? 'up' : 'down'
      });
    }
  });

  return { icon, sentence, deltas };
}


/* ── Render insight card ────────────────────────────────────── */
function renderInsight(data) {
  const container = document.getElementById('insight-card');
  if (!container) return;

  const { icon, sentence, deltas } = generateInsight(data);

  const chipsHTML = deltas.map(d =>
    `<span class="delta-chip ${d.type}">${d.label}</span>`
  ).join('');

  container.innerHTML = `
    <div class="insight-icon">${icon}</div>
    <div class="insight-body">
      <div class="insight-sentence">${sentence}</div>
      ${deltas.length ? `<div class="insight-deltas">${chipsHTML}</div>` : ''}
    </div>
  `;
}


/* ── Stat cards ─────────────────────────────────────────────── */
function renderStats(data) {
  if (!data || data.length === 0) return;

  const latest  = data[data.length - 1];
  const bestRank = Math.min(...data.map(d => d.rank));
  const avgPct   = (data.reduce((s, d) => s + d.percentage, 0) / data.length).toFixed(1);

  const el = id => document.getElementById(id);

  if (el('stat-rank'))  el('stat-rank').textContent  = `#${latest.rank}`;
  if (el('stat-score')) el('stat-score').textContent = `${latest.total}`;
  if (el('stat-avg'))   el('stat-avg').textContent   = `${avgPct}%`;

  if (el('stat-rank-sub'))  el('stat-rank-sub').textContent  = `Best: #${bestRank}`;
  if (el('stat-score-sub')) el('stat-score-sub').textContent = `${latest.percentage}% · ${latest.testName}`;
  if (el('stat-avg-sub'))   el('stat-avg-sub').textContent   = `Across ${data.length} test${data.length > 1 ? 's' : ''}`;
}


/* ── Chart ──────────────────────────────────────────────────── */
let myChart = null;
let currentSubject = 'total';

function buildChart(rawData) {
  const labels = rawData.map(item => item.testName);
  const subj   = SUBJECTS[currentSubject];
  const values = rawData.map(item =>
    currentSubject === 'rank' ? item.rank : item[currentSubject]
  );

  const isRank = currentSubject === 'rank';
  const ctx    = document.getElementById('myChart');
  if (!ctx) return;

  const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 260);
  gradient.addColorStop(0, subj.color + '30');
  gradient.addColorStop(1, subj.color + '00');

  const config = {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: subj.label,
        data: values,
        borderColor: subj.color,
        backgroundColor: gradient,
        borderWidth: 2.5,
        pointBackgroundColor: subj.color,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        tension: 0.35,
        fill: true,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1e2420',
          titleColor: '#fff',
          bodyColor: '#9aa5a0',
          cornerRadius: 10,
          padding: 12,
          displayColors: false,
          callbacks: {
            title: items => items[0].label,
            label: item => {
              const val = item.parsed.y;
              if (currentSubject === 'rank') return `  Rank #${val}`;
              const max = subj.max;
              return max
                ? `  ${val} / ${max}  (${((val / max) * 100).toFixed(1)}%)`
                : `  ${val}`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          border: { display: false },
          ticks: {
            font: { family: 'DM Sans', size: 11 },
            color: '#9aa5a0',
            maxRotation: 30,
          }
        },
        y: {
          reverse: isRank,
          grid: { color: '#e4e8e5', lineWidth: 1 },
          border: { display: false, dash: [4, 4] },
          ticks: {
            font: { family: 'DM Sans', size: 11 },
            color: '#9aa5a0',
            maxTicksLimit: 6,
          },
          min: isRank ? undefined : 0,
          suggestedMax: subj.max ? subj.max : undefined,
        }
      }
    }
  };

  if (myChart) {
    myChart.destroy();
  }
  myChart = new Chart(ctx, config);
}


function updateChart(subject, rawData) {
  currentSubject = subject;
  buildChart(rawData);

  // Update chart header subtitle
  const sub = document.getElementById('chart-subtitle');
  if (sub) {
    const subj = SUBJECTS[subject];
    sub.textContent = subj.max
      ? `Max ${subj.max} marks`
      : 'Lower is better';
  }
}


/* ── Filter pill interaction ────────────────────────────────── */
function setActive(button) {
  document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
  button.classList.add('active');
}

function handleFilter(subject, btn, rawData) {
  setActive(btn);
  updateChart(subject, rawData);
}


/* ── Toast helper ───────────────────────────────────────────── */
function showToast(msg) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2400);
}


/* ── Add-form UX (runs only on /add page) ───────────────────── */
function initFormPage() {
  const form = document.querySelector('form');
  if (!form) return;

  const fields   = ['physics', 'chemistry', 'botany', 'zoology'];
  const totalEl  = document.getElementById('preview-total');
  const pctEl    = document.getElementById('preview-pct');

  function recalcPreview() {
    let sum = 0;
    fields.forEach(f => {
      const v = parseFloat(document.querySelector(`[name="${f}"]`)?.value) || 0;
      sum += v;
    });
    if (totalEl) totalEl.textContent = sum.toFixed(sum % 1 === 0 ? 0 : 1);
    if (pctEl)   pctEl.textContent   = ((sum / 720) * 100).toFixed(1) + '%';
  }

  fields.forEach(f => {
    const input = document.querySelector(`[name="${f}"]`);
    if (input) input.addEventListener('input', recalcPreview);
  });

  // Clamp score inputs to valid NEET range
  fields.forEach(f => {
    const input = document.querySelector(`[name="${f}"]`);
    if (!input) return;
    input.addEventListener('blur', () => {
      let val = parseFloat(input.value);
      if (!isNaN(val)) {
        val = Math.min(180, Math.max(-45, val));  // NEET: -45 to 180
        input.value = val;
        recalcPreview();
      }
    });
  });

  // Submit loading state
  const submitBtn = form.querySelector('.submit-btn');
  if (submitBtn) {
    form.addEventListener('submit', () => {
      submitBtn.classList.add('loading');
      submitBtn.textContent = 'Saving…';
    });
  }
}


/* ── Dashboard init (runs only on / page) ───────────────────── */
function initDashboard(rawData) {
  // Render stats cards and insight
  renderStats(rawData);
  renderInsight(rawData);

  // Build initial chart
  buildChart(rawData);

  // Wire up filter buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    const subject = btn.dataset.subject;
    btn.addEventListener('click', () => handleFilter(subject, btn, rawData));
  });

  // Activate the "Total" pill by default
  const defaultBtn = document.querySelector('.filter-btn[data-subject="total"]');
  if (defaultBtn) defaultBtn.classList.add('active');
}