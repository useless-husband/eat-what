const DEFAULT_ITEMS = [
  "滷肉飯", "牛肉麵", "水餃", "便當", "拉麵",
  "鹹酥雞", "火鍋", "壽司", "義大利麵", "早午餐",
];
const STORAGE_KEY = "eat-what-items";
const COLORS = ["#ffc2d1", "#ff8fab", "#ffe5ec", "#fb6f92", "#ffb3c6", "#f9a8d4", "#fcd5ce", "#f48fb1"];

const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");
const spinBtn = document.getElementById("spin");
const resultEl = document.getElementById("result");
const listEl = document.getElementById("list");
const inputEl = document.getElementById("newItem");

let items = loadItems();
let angle = 0;        // 目前轉盤角度（弧度）
let spinning = false;

function loadItems() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(saved) && saved.length >= 2) return saved;
  } catch (_) {}
  return [...DEFAULT_ITEMS];
}

function saveItems() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch (_) {}
}

function drawWheel() {
  const n = items.length;
  const cx = canvas.width / 2, cy = canvas.height / 2, r = cx - 8;
  const slice = (Math.PI * 2) / n;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < n; i++) {
    const start = angle + i * slice;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, start, start + slice);
    ctx.closePath();
    ctx.fillStyle = COLORS[i % COLORS.length];
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(start + slice / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = "#222";
    ctx.font = `bold ${n > 10 ? 14 : 18}px -apple-system, "PingFang TC", sans-serif`;
    ctx.fillText(items[i], r - 16, 6);
    ctx.restore();
  }

  ctx.beginPath();
  ctx.arc(cx, cy, 22, 0, Math.PI * 2);
  ctx.fillStyle = "#fff";
  ctx.fill();
  ctx.strokeStyle = "#ddd";
  ctx.stroke();
}

function spin() {
  if (spinning || items.length < 2) return;
  spinning = true;
  spinBtn.disabled = true;
  resultEl.textContent = "";

  const extraTurns = 5 + Math.random() * 3;
  const target = angle + extraTurns * Math.PI * 2 + Math.random() * Math.PI * 2;
  const duration = 4000;
  const startAngle = angle;
  const startTime = performance.now();

  function frame(now) {
    const t = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3); // ease-out
    angle = startAngle + (target - startAngle) * eased;
    drawWheel();
    if (t < 1) {
      requestAnimationFrame(frame);
    } else {
      finish();
    }
  }
  requestAnimationFrame(frame);
}

function finish() {
  const n = items.length;
  const slice = (Math.PI * 2) / n;
  // 指針在正上方（-90°），算出指到哪一塊
  const pointerAngle = (-Math.PI / 2 - angle) % (Math.PI * 2);
  const normalized = (pointerAngle + Math.PI * 2) % (Math.PI * 2);
  const index = Math.floor(normalized / slice);
  resultEl.textContent = `🎉 今天吃：${items[index]}`;
  spinning = false;
  spinBtn.disabled = false;
}

function renderList() {
  listEl.innerHTML = "";
  items.forEach((item, i) => {
    const li = document.createElement("li");
    li.textContent = item;
    const del = document.createElement("button");
    del.textContent = "✕";
    del.title = "刪除";
    del.addEventListener("click", () => {
      if (items.length <= 2) {
        alert("至少要保留 2 個選項喔！");
        return;
      }
      items.splice(i, 1);
      saveItems();
      renderList();
      drawWheel();
    });
    li.appendChild(del);
    listEl.appendChild(li);
  });
}

function addItem() {
  const text = inputEl.value.trim();
  if (!text) return;
  if (items.includes(text)) {
    alert("這個選項已經有了！");
    return;
  }
  if (items.length >= 16) {
    alert("最多 16 個選項，轉盤會太擠啦！");
    return;
  }
  items.push(text);
  inputEl.value = "";
  saveItems();
  renderList();
  drawWheel();
}

spinBtn.addEventListener("click", spin);
document.getElementById("add").addEventListener("click", addItem);
inputEl.addEventListener("keydown", (e) => { if (e.key === "Enter") addItem(); });
document.getElementById("reset").addEventListener("click", () => {
  items = [...DEFAULT_ITEMS];
  saveItems();
  renderList();
  drawWheel();
});

renderList();
drawWheel();
