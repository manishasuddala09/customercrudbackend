
const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middleware/errorHandler');

// ==========================
// GET All Addresses for a Customer
// ==========================
router.get('/customer/:customerId', asyncHandler(async (req, res) => {
    const db = req.db;
    const { customerId } = req.params;

    db.all('SELECT * FROM addresses WHERE customer_id = ? ORDER BY is_primary DESC, created_at ASC', [customerId], (err, rows) => {
        if (err) throw err;
        res.json({ success: true, data: rows, total: rows.length, customer_id: parseInt(customerId) });
    });
}));

// ==========================
// POST Create Address for a Customer
// ==========================
router.post('/', asyncHandler(async (req, res) => {
    const db = req.db;
    const { customer_id, address_details, city, state, pin_code, country = 'India', is_primary = 0 } = req.body;

    if (!customer_id || !address_details || !city || !state || !pin_code) {
        return res.status(400).json({ success: false, message: 'All address fields are required' });
    }

    db.run(
        `INSERT INTO addresses (customer_id, address_details, city, state, pin_code, country, is_primary) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [customer_id, address_details, city, state, pin_code, country, is_primary],
        function(err) {
            if (err) throw err;
            res.status(201).json({ success: true, message: 'Address added successfully', data: { id: this.lastID } });
        }
    );
}));

// ==========================
// PUT Update Address
// ==========================
router.put('/:id', asyncHandler(async (req, res) => {
    const db = req.db;
    const { id } = req.params;
    const { address_details, city, state, pin_code, country = 'India', is_primary = 0 } = req.body;

    const sql = `UPDATE addresses SET address_details = ?, city = ?, state = ?, pin_code = ?, country = ?, is_primary = ? WHERE id = ?`;
    db.run(sql, [address_details, city, state, pin_code, country, is_primary, id], function(err) {
        if (err) throw err;
        if (this.changes === 0) return res.status(404).json({ success: false, message: 'Address not found' });
        res.json({ success: true, message: 'Address updated successfully' });
    });
}));

// ==========================
// DELETE Address
// ==========================
router.delete('/:id', asyncHandler(async (req, res) => {
    const db = req.db;
    const { id } = req.params;

    db.run('DELETE FROM addresses WHERE id = ?', [id], function(err) {
        if (err) throw err;
        if (this.changes === 0) return res.status(404).json({ success: false, message: 'Address not found' });
        res.json({ success: true, message: 'Address deleted successfully' });
    });
}));

module.exports = router;
