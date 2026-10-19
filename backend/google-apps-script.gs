/**
 * Backend gratis untuk RSVP & Ucapan memakai Google Sheets + Apps Script.
 *
 * Cara pakai (ringkas, lengkapnya di README.md):
 * 1. Buat Google Sheets baru → Ekstensi → Apps Script.
 * 2. Hapus isi Code.gs, tempel seluruh file ini, simpan.
 * 3. Deploy → Deployment baru → Jenis: Aplikasi web
 *    - Jalankan sebagai: Saya
 *    - Yang memiliki akses: Siapa saja
 * 4. Salin URL yang berakhiran /exec, lalu isi ke `endpoint: '...'` di data undangan.
 *
 * Satu spreadsheet bisa menampung banyak undangan; dibedakan lewat kolom "Undangan" (slug).
 */

var HEAD_RSVP = ['Waktu', 'Undangan', 'Nama', 'Kehadiran', 'Jumlah'];
var HEAD_WISH = ['Waktu', 'Undangan', 'Nama', 'Ucapan', 'Kehadiran'];

function getSheet_(name, headers) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(headers);
    sh.setFrozenRows(1);
  }
  return sh;
}

// Potong panjang & cegah rumus spreadsheet dari input tamu
function clean_(v, max) {
  v = String(v == null ? '' : v).slice(0, max);
  if (/^[=+\-@]/.test(v)) v = "'" + v;
  return v;
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var d = JSON.parse(e.postData.contents || '{}');
    var slug = clean_(d.slug, 80);
    if (d.type === 'rsvp') {
      getSheet_('RSVP', HEAD_RSVP).appendRow([new Date(), slug, clean_(d.name, 60), clean_(d.attend, 40), clean_(d.count, 3)]);
    } else if (d.type === 'wish') {
      getSheet_('Ucapan', HEAD_WISH).appendRow([new Date(), slug, clean_(d.name, 60), clean_(d.message, 500), clean_(d.attend, 40)]);
    }
    return ContentService.createTextOutput('ok');
  } catch (err) {
    return ContentService.createTextOutput('error');
  } finally {
    lock.releaseLock();
  }
}

// Mengembalikan daftar ucapan untuk satu undangan: ?slug=nama-undangan
function doGet(e) {
  var slug = (e && e.parameter && e.parameter.slug) || '';
  var sh = getSheet_('Ucapan', HEAD_WISH);
  var rows = sh.getDataRange().getValues().slice(1)
    .filter(function (r) { return String(r[1]) === slug; })
    .map(function (r) { return { time: r[0], name: r[2], message: r[3], attend: r[4] }; })
    .reverse()
    .slice(0, 300);
  return ContentService.createTextOutput(JSON.stringify(rows)).setMimeType(ContentService.MimeType.JSON);
}
