/* ============================================================
   NEET Progress Tracker — script.js
   Handles: chart management, insights, filter pills, form UX
   ============================================================ */

/* ── Subject config ─────────────────────────────────────────── */
const SUBJECTS = {
  total:     { label: 'Total',     color: '#5b8e7d', max: 720,  solo: true  },
  physics:   { label: 'Physics',   color: '#6ba3be', max: 180,  solo: false },
  chemistry: { label: 'Chemistry', color: '#7dab8a', max: 180,  solo: false },
  botany:    { label: 'Botany',    color: '#c4956a', max: 180,  solo: false },
  zoology:   { label: 'Zoology',   color: '#b07db8', max: 180,  solo: false },
  rank:      { label: 'Rank',      color: '#d97b7b', max: null, solo: true  },
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
let currentSubject = ['total'];

function buildChart(rawData, activeSubjects) {
  const isMulti = activeSubjects.length > 1;
  const isRank  = activeSubjects.length === 1 && activeSubjects[0] === 'rank';
  const labels  = rawData.map(item => item.testName);
  const ctx     = document.getElementById('myChart');
  if (!ctx) return;

  const datasets = activeSubjects.map(subject => {
    const subj  = SUBJECTS[subject];
    const grd   = ctx.getContext('2d').createLinearGradient(0, 0, 0, 260);
    grd.addColorStop(0, subj.color + (isMulti ? '18' : '30'));
    grd.addColorStop(1, subj.color + '00');

    const values = rawData.map(item => {
      const raw = subject === 'rank' ? item.rank : item[subject];
      // In multi-subject mode, plot as percentage of subject max
      if (isMulti && subj.max) return parseFloat(((raw / subj.max) * 100).toFixed(2));
      return raw;
    });

    return {
      label: subj.label,
      data: values,
      borderColor: subj.color,
      backgroundColor: grd,
      borderWidth: 2.5,
      pointBackgroundColor: subj.color,
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 5,
      pointHoverRadius: 7,
      tension: 0.35,
      fill: isMulti ? false : true,  // no fill in multi mode — looks cleaner
    };
  });

  const config = {
    type: 'line', // radar, bar, pie, line, doughnut
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          display: isMulti,
          labels: {
            font: { family: 'DM Sans', size: 12 },
            color: '#5a6360',
            boxWidth: 10,
            boxHeight: 10,
            borderRadius: 5,
            useBorderRadius: true,
            padding: 16,
          }
        },
        tooltip: {
          backgroundColor: '#1e2420',
          titleColor: '#fff',
          bodyColor: '#9aa5a0',
          cornerRadius: 10,
          padding: 12,
          displayColors: isMulti,
          callbacks: {
            title: items => items[0].label,
            label: item => {
              const subject = activeSubjects[item.datasetIndex];
              const subj    = SUBJECTS[subject];
              const val     = item.parsed.y;
              if (isRank)  return `  Rank #${val}`;
              if (isMulti) return `  ${subj.label}: ${val}%`;
              return subj.max
                ? `  ${val} / ${subj.max}  (${((val / subj.max) * 100).toFixed(1)}%)`
                : `  ${val}`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          border: { display: false },
          ticks: { font: { family: 'DM Sans', size: 11 }, color: '#9aa5a0', maxRotation: 30 }
        },
        y: {
          reverse: isRank,
          grid: { color: '#e4e8e5', lineWidth: 1 },
          border: { display: false, dash: [4, 4] },
          ticks: {
            font: { family: 'DM Sans', size: 11 },
            color: '#9aa5a0',
            maxTicksLimit: 6,
            callback: val => isMulti ? val + '%' : val,
          },
          suggestedMin: isMulti ? -30 : undefined,  // room for negative marks
          suggestedMax: isMulti ? 100 : (SUBJECTS[activeSubjects[0]]?.max || undefined),
        }
      }
    }
  };

  if (myChart) myChart.destroy();
  myChart = new Chart(ctx, config);
}


function updateChart(activeSubjects, rawData) {
  currentSubject = activeSubjects;   // now an array
  buildChart(rawData, activeSubjects);

  const sub = document.getElementById('chart-subtitle');
  if (!sub) return;
  if (activeSubjects.length > 1)          sub.textContent = 'Shown as % of max — comparable scale';
  else if (activeSubjects[0] === 'rank')  sub.textContent = 'Lower is better';
  else sub.textContent = `Max ${SUBJECTS[activeSubjects[0]].max} marks`;
}


/* ── Filter pill interaction ────────────────────────────────── */
function setActive(button) {
  document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
  button.classList.add('active');
}


// Track which subjects are active
let activeSubjects = ['total'];

function handleFilter(subject, btn, rawData) {
  const subj     = SUBJECTS[subject];
  const isSolo   = subj.solo;                          // total / rank
  const wasActive = btn.classList.contains('active');

  if (isSolo) {
    // Solo subjects: deselect everything, select only this
    activeSubjects = [subject];
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  } else {
    // Multi subjects: toggle this one
    // But first, if a solo was active, clear it
    const soloActive = activeSubjects.some(s => SUBJECTS[s].solo);
    if (soloActive) {
      activeSubjects = [];
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    }

    if (wasActive && !soloActive) {
      // Deselect — but keep at least one selected
      if (activeSubjects.length > 1) {
        activeSubjects = activeSubjects.filter(s => s !== subject);
        btn.classList.remove('active');
      }
      // If only one left, do nothing (can't deselect the last one)
    } else {
      // Select
      if (!activeSubjects.includes(subject)) activeSubjects.push(subject);
      btn.classList.add('active');
    }
  }

  updateChart(activeSubjects, rawData);
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
  renderStats(rawData);
  renderInsight(rawData);
  buildChart(rawData, ['total']);

  document.querySelectorAll('.filter-btn').forEach(btn => {
    const subject = btn.dataset.subject;
    btn.addEventListener('click', () => handleFilter(subject, btn, rawData));
  });

  const defaultBtn = document.querySelector('.filter-btn[data-subject="total"]');
  if (defaultBtn) defaultBtn.classList.add('active');
}