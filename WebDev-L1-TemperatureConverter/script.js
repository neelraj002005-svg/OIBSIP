const form = document.getElementById('form');
const input = document.getElementById('value');
const error = document.getElementById('error');
const results = document.getElementById('results');
const uTag = document.getElementById('uTag');
const mercury = document.getElementById('mercury');
const bigVal = document.getElementById('bigVal');
const bigUnit = document.getElementById('bigUnit');
const mood = document.getElementById('mood');
const out = { C: document.getElementById('rC'), F: document.getElementById('rF'), K: document.getElementById('rK') };
const boxes = { C: document.getElementById('boxC'), F: document.getElementById('boxF'), K: document.getElementById('boxK') };

const toC = { C: v => v, F: v => (v - 32) * 5 / 9, K: v => v - 273.15 };
const fromC = { C: c => c, F: c => c * 9 / 5 + 32, K: c => c + 273.15 };
const sym = { C: '\u00B0C', F: '\u00B0F', K: ' K' };
const limit = { C: '-273.15\u00B0C', F: '-459.67\u00B0F', K: '0 K' };

const unit = () => document.querySelector('input[name="unit"]:checked').value;
const round = n => {
  const r = Math.round(n * 100) / 100;
  return (Object.is(r, -0) ? 0 : r).toString();
};

function moodOf(c) {
  if (c <= -100) return 'Deep freeze';
  if (c <= 0) return 'Freezing';
  if (c < 15) return 'Chilly';
  if (c < 30) return 'Comfortable';
  if (c < 45) return 'Hot';
  if (c < 100) return 'Scorching';
  return 'Boiling and beyond';
}

// colour + thermometer follow the temperature (in Celsius)
function hueOf(c) {
  const pts = [[-273, 250], [-50, 230], [0, 195], [25, 120], [40, 40], [100, 4], [200, 0]];
  if (c <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) {
    if (c <= pts[i][0]) {
      const [c0, h0] = pts[i - 1], [c1, h1] = pts[i];
      return h0 + (h1 - h0) * (c - c0) / (c1 - c0);
    }
  }
  return 0;
}

function paint(c) {
  const t = Math.max(0, Math.min(1, (c + 50) / 200)); // thermometer range -50..150 C
  document.documentElement.style.setProperty('--h', Math.round(hueOf(c)));
  mercury.style.height = (6 + t * 94) + '%';
  mood.textContent = moodOf(c);
}

function clearError() {
  error.textContent = '';
  input.classList.remove('invalid');
  input.removeAttribute('aria-invalid');
}

function showError(msg) {
  error.textContent = msg;
  input.classList.remove('invalid');
  void input.offsetWidth;
  input.classList.add('invalid');
  input.setAttribute('aria-invalid', 'true');
  results.hidden = true;
}

function convert() {
  const raw = input.value.trim().replace(',', '.');
  clearError();

  if (raw === '') return showError('Please enter a temperature value.');
  if (!/^[-+]?(\d+\.?\d*|\.\d+)$/.test(raw)) return showError('Only numbers are allowed (example: 25 or -4.5).');

  const u = unit();
  const value = parseFloat(raw);
  const c = toC[u](value);

  if (c < -273.15 - 1e-9) {
    return showError('That is below absolute zero (' + limit[u] + '). Please enter a higher value.');
  }

  for (const k of ['C', 'F', 'K']) {
    out[k].textContent = round(fromC[k](c)) + sym[k];
    boxes[k].classList.toggle('src', k === u);
  }
  // restart the flip animation
  results.hidden = true;
  void results.offsetWidth;
  results.hidden = false;

  bigVal.textContent = round(value);
  bigUnit.textContent = sym[u].trim();
  paint(c);
}

form.addEventListener('submit', e => {
  e.preventDefault();
  convert();
});

document.querySelectorAll('input[name="unit"]').forEach(r => r.addEventListener('change', () => {
  uTag.textContent = sym[unit()].trim();
}));

input.addEventListener('input', clearError);

document.querySelectorAll('.presets button').forEach(b => b.addEventListener('click', () => {
  const targetRadio = document.getElementById('u' + b.dataset.u);
  if (targetRadio) {
    targetRadio.checked = true;
    targetRadio.dispatchEvent(new Event('change'));
  }
  input.value = b.dataset.v;
  convert();
}));

paint(25);