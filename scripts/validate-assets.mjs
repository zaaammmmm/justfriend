import fs from 'node:fs';
import path from 'node:path';

const contentRoot = path.resolve('src/content');
const publicRoot = path.resolve('public');
const errors = [];
const warnings = [];
const seenSlugs = new Map();
let entries = 0;

function inside(parent, target) {
  const relative = path.relative(parent, target);
  return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative));
}

function checkLocalAsset(owner, field, raw, base) {
  if (typeof raw !== 'string' || !raw.trim()) {
    errors.push(`${owner}: field ${field} harus berupa path non-empty.`);
    return;
  }
  if (/^https?:\/\//i.test(raw)) {
    errors.push(`${owner}: ${field} harus aset lokal, bukan URL eksternal (${raw}).`);
    return;
  }
  const target = path.resolve(base, raw);
  if (!inside(base, target)) {
    errors.push(`${owner}: path ${field} keluar dari direktori aset yang diizinkan (${raw}).`);
    return;
  }
  if (!fs.existsSync(target) || !fs.statSync(target).isFile()) {
    errors.push(`${owner}: aset ${field} tidak ditemukan (${raw}).`);
  }
}

function visit(directory) {
  for (const name of fs.readdirSync(directory)) {
    const absolute = path.join(directory, name);
    const stat = fs.statSync(absolute);
    if (stat.isDirectory()) { visit(absolute); continue; }
    if (!name.endsWith('.json')) continue;
    entries += 1;
    let data;
    try { data = JSON.parse(fs.readFileSync(absolute, 'utf8')); }
    catch (error) { errors.push(`${absolute}: JSON tidak valid (${error.message}).`); continue; }

    if (data.consent !== true) errors.push(`${absolute}: consent harus true sebelum konten dapat dibangun.`);
    if (typeof data.hidden !== 'boolean') errors.push(`${absolute}: field hidden harus boolean.`);
    if (data.placeholder !== true && data.placeholder !== false) {
      warnings.push(`${absolute}: tandai placeholder secara eksplisit (true untuk seed, false untuk materi nyata).`);
    }

    const collection = path.basename(path.dirname(absolute));
    if (typeof data.slug === 'string') {
      const key = `${collection}:${data.slug}`;
      if (seenSlugs.has(key)) errors.push(`${absolute}: slug duplikat "${data.slug}" (juga di ${seenSlugs.get(key)}).`);
      else seenSlugs.set(key, absolute);
    }
    if (Number.isInteger(data.order) && data.order < 1) errors.push(`${absolute}: order harus integer positif.`);

    for (const field of ['photo', 'poster']) {
      if (data[field] !== undefined) checkLocalAsset(absolute, field, data[field], path.dirname(absolute));
    }

    if (data.sourceReady === true) {
      let readySources = 0;
      for (const field of ['mp4', 'webm']) {
        const source = data[field];
        if (!source) continue;
        if (/^https:\/\//i.test(source)) { readySources += 1; continue; }
        if (/^http:\/\//i.test(source)) {
          errors.push(`${absolute}: ${field} remote wajib HTTPS.`);
          continue;
        }
        const target = path.resolve(publicRoot, source.startsWith('/') ? `.${source}` : source);
        if (!inside(publicRoot, target)) {
          errors.push(`${absolute}: path ${field} keluar dari public/ (${source}).`);
          continue;
        }
        if (fs.existsSync(target) && fs.statSync(target).isFile()) readySources += 1;
        else errors.push(`${absolute}: sourceReady=true tetapi ${field} tidak ditemukan (${target}).`);
      }
      if (!readySources) errors.push(`${absolute}: sourceReady=true tetapi tidak ada sumber video yang valid.`);
    }
  }
}

if (!fs.existsSync(contentRoot)) {
  console.error('Folder src/content tidak ditemukan.');
  process.exit(1);
}
visit(contentRoot);
warnings.forEach((warning) => console.warn(`WARN: ${warning}`));
if (errors.length) {
  console.error(`Validasi konten gagal (${errors.length} masalah):`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}
console.log(`Validasi konten berhasil: ${entries} entri JSON; consent, hidden, slug, dan aset diperiksa.`);
