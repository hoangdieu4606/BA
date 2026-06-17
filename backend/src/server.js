const express = require('express');
const cors = require('cors');
const { pool } = require('./config/db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-memory fallback database state
let dbFallback = {
  customers: [
    { ma_kh: "KH001", ten_kh: "Guangzhou Fruit Import & Export Co., Ltd.", quoc_gia: "Trung Quốc" },
    { ma_kh: "KH002", ten_kh: "Fresh Trade Co.", quoc_gia: "Trung Quốc" },
    { ma_kh: "KH003", ten_kh: "Shanghai Xinlian Import Co.", quoc_gia: "Trung Quốc" }
  ],
  personnel: [
    { ma_nv: "NV001", ten_nv: "Nguyễn Văn An", tuoi: 34, suc_khoe: "Tốt", dang_tap_huan: "Có" },
    { ma_nv: "NV002", ten_nv: "Trần Thị Bình", tuoi: 28, suc_khoe: "Tốt", dang_tap_huan: "Không" }
  ],
  traceability: [
    {
      "id": "BG-001",
      "ma_puc": "BG-PUC-0001",
      "dia_chi_vuon": "Xã Tân Hương, H. Yên Phong, Bắc Giang",
      "ten_vuon": "Vườn Anh Minh",
      "ngay_thu_hoach": "2026-06-05",
      "lan_phun_thuoc_gan_nhat": "2026-05-28",
      "cach_ly": "Không",
      "loai": "Nguyên trái đông lạnh",
      "khoi_luong_lo_hang": 15,
      "khoi_luong_dong_goi": 14.5,
      "noi_xuat_khau": "Trung Quốc",
      "ten_co_so_dong_goi": "Cơ sở Trường Thịnh",
      "ma_phc": "PHC-123",
      "ket_qua_kiem_dich": "Đạt"
    }
  ]
};

// Flag to track database health
let useFallbackDb = false;

// Helper function to query the DB with safety fallback
async function safeQuery(queryText, params) {
  if (useFallbackDb) {
    throw new Error('Database is in fallback mode');
  }
  try {
    return await pool.query(queryText, params);
  } catch (err) {
    console.warn('⚠️ Database connection issue. Switching temporarily to in-memory fallback database.', err.message);
    useFallbackDb = true;
    throw err;
  }
}

// Get all traceability logs
app.get('/api/traceability', async (req, res) => {
  try {
    const result = await safeQuery('SELECT * FROM truy_xuat_nguon_goc ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    res.json(dbFallback.traceability);
  }
});

// Create a new traceability record
app.post('/api/traceability', async (req, res) => {
  const data = req.body;
  if (!data.id || !data.ma_puc) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    await safeQuery(`
      INSERT INTO truy_xuat_nguon_goc (
        id, ma_puc, dia_chi_vuon, ten_vuon, ngay_thu_hoach, lan_phun_thuoc_gan_nhat,
        cach_ly, loai, khoi_luong_lo_hang, khoi_luong_dong_goi, noi_xuat_khau,
        ten_co_so_dong_goi, ma_phc, ket_qua_kiem_dich
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    `, [
      data.id, data.ma_puc, data.dia_chi_vuon, data.ten_vuon, data.ngay_thu_hoach, data.lan_phun_thuoc_gan_nhat,
      data.cach_ly, data.loai, data.khoi_luong_lo_hang, data.khoi_luong_dong_goi, data.noi_xuat_khau,
      data.ten_co_so_dong_goi, data.ma_phc, data.ket_qua_kiem_dich
    ]);
    res.status(201).json(data);
  } catch (err) {
    // Add to in-memory fallback
    const exists = dbFallback.traceability.find(x => x.id === data.id);
    if (!exists) {
      dbFallback.traceability.unshift(data);
    }
    res.status(201).json(data);
  }
});

// Update a traceability record
app.put('/api/traceability/:id', async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  try {
    await safeQuery(`
      UPDATE truy_xuat_nguon_goc SET
        ma_puc = $1, dia_chi_vuon = $2, ten_vuon = $3, ngay_thu_hoach = $4,
        lan_phun_thuoc_gan_nhat = $5, cach_ly = $6, loai = $7, khoi_luong_lo_hang = $8,
        khoi_luong_dong_goi = $9, noi_xuat_khau = $10, ten_co_so_dong_goi = $11,
        ma_phc = $12, ket_qua_kiem_dich = $13
      WHERE id = $14
    `, [
      data.ma_puc, data.dia_chi_vuon, data.ten_vuon, data.ngay_thu_hoach,
      data.lan_phun_thuoc_gan_nhat, data.cach_ly, data.loai, data.khoi_luong_lo_hang,
      data.khoi_luong_dong_goi, data.noi_xuat_khau, data.ten_co_so_dong_goi,
      data.ma_phc, data.ket_qua_kiem_dich, id
    ]);
    res.json(data);
  } catch (err) {
    // Update in-memory fallback
    const idx = dbFallback.traceability.findIndex(x => x.id === id);
    if (idx !== -1) {
      dbFallback.traceability[idx] = { ...dbFallback.traceability[idx], ...data };
    }
    res.json(data);
  }
});

// Delete a traceability record
app.delete('/api/traceability/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await safeQuery('DELETE FROM truy_xuat_nguon_goc WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    dbFallback.traceability = dbFallback.traceability.filter(x => x.id !== id);
    res.json({ success: true });
  }
});

// Get all personnel (employees)
app.get('/api/personnel', async (req, res) => {
  try {
    const result = await safeQuery('SELECT * FROM nhan_vien ORDER BY ma_nv ASC');
    res.json(result.rows);
  } catch (err) {
    res.json(dbFallback.personnel);
  }
});

// Create a new employee
app.post('/api/personnel', async (req, res) => {
  const { id, firstName, lastName, tuoi, sucKhoe, dangTapHuan } = req.body;
  if (!id || !firstName) {
    return res.status(400).json({ error: 'Missing required fields: id and firstName' });
  }

  const fullName = lastName ? `${lastName} ${firstName}`.trim() : firstName;

  try {
    const result = await safeQuery(
      'INSERT INTO nhan_vien (ma_nv, ten_nv, tuoi, suc_khoe, dang_tap_huan) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [id, fullName, tuoi ? parseInt(tuoi) : null, sucKhoe || null, dangTapHuan || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    const newEmp = { 
      ma_nv: id, 
      ten_nv: fullName, 
      tuoi: tuoi ? parseInt(tuoi) : null, 
      suc_khoe: sucKhoe || null, 
      dang_tap_huan: dangTapHuan || null 
    };
    dbFallback.personnel.unshift(newEmp);
    res.status(201).json(newEmp);
  }
});

// Get all customers
app.get('/api/customers', async (req, res) => {
  try {
    const result = await safeQuery('SELECT * FROM khach_hang ORDER BY ma_kh ASC');
    res.json(result.rows);
  } catch (err) {
    res.json(dbFallback.customers);
  }
});

// Serve static built frontend assets in production
const path = require('path');
app.use(express.static(path.join(__dirname, '../../frontend/dist')));

// Return frontend index.html for non-API route hits (supporting browser history routers)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
