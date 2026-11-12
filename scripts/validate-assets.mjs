import fs from 'node:fs';
import path from 'node:path';

const contentRoot = path.resolve('src/content');
const publicRoot = path.resolve('public');
const errors = [];
let entries = 0;

function visit(directory) {
  for (const name of fs.readdirSync(directory)) {
    const absolute = path.join(directory, name);
    const stat = fs.statSync(absolute);
    if (stat.isDirectory()) { visit(absolute); continue; }
    if (!name.endsWith('.json')) continue;
    entries += 1;
    let data;
    try { data = JSON.parse(fs.readFileSync(absolute, 'utf8')); }
    catch (error) { errors.push(`${absolute}: JSON tidak valid (${error.message})`); continue; }

    if (data.consent !== true) errors.push(`${absolute}: consent harus true sebelum konten dapat dibangun.`);
    if (typeof data.hidden !== 'boolean') errors.push(`${absolute}: field hidden harus boolean.`);

    for (const field of ['photo', 'poster']) {
      if (typeof data[field] !== 'string') continue;
      const target = path.resolve(path.dirname(absolute), data[field]);
      if (!fs.existsSync(target)) errors.push(`${absolute}: aset ${field} tidak ditemukan (${data[field]}).`);
    }

    if (data.sourceReady === true) {
      for (const field of ['mp4', 'webm']) {
        const source = data[field];
        if (!source) continue;
        if (/^https?:\/\//i.test(source)) continue;
        const target = path.resolve(publicRoot, `.${source.startsWith('/') ? source : `/${source}`}`);
        if (!fs.existsSync(target)) errors.push(`${absolute}: sourceReady=true tetapi ${field} tidak ditemukan (${target}).`);
      }
    }
  }
}

if (!fs.existsSync(contentRoot)) {
  console.error('Folder src/content tidak ditemukan.');
  process.exit(1);
}
visit(contentRoot);
if (errors.length) {
  console.error(`Validasi aset gagal (${errors.length} masalah):`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}
console.log(`Validasi konten berhasil: ${entries} entri JSON, consent/hidden dan referensi aset lokal valid.`);
