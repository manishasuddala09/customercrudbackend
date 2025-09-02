
const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middleware/errorHandler');


router.get('/', asyncHandler(async (req, res) => {
  const db = req.db;
  const {
    page = 1,
    limit = 10,
    search = '',
    city = '',
    state = '',
    pin_code = '',
    sort_by = 'id',
    sort_order = 'ASC'
  } = req.query;

  const offset = (page - 1) * limit;

  // Allowed sort fields
  const allowedSort = ['id', 'first_name', 'last_name', 'phone_number', 'created_at'];
  const sortField = allowedSort.includes(sort_by) ? sort_by : 'id';
  const sortOrder = sort_order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

  let query = `
    SELECT c.*, 
           COUNT(a.id) as address_count,
           GROUP_CONCAT(DISTINCT a.city) as cities
    FROM customers c
    LEFT JOIN addresses a ON c.id = a.customer_id
  `;

  const whereClauses = [];
  const params = [];

  if (search) {
    whereClauses.push(`(c.first_name LIKE ? OR c.last_name LIKE ? OR c.phone_number LIKE ? OR c.email LIKE ?)`);
    params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
  }

  if (city) {
    whereClauses.push(`a.city LIKE ?`);
    params.push(`%${city}%`);
  }

  if (state) {
    whereClauses.push(`a.state LIKE ?`);
    params.push(`%${state}%`);
  }

  if (pin_code) {
    whereClauses.push(`a.pin_code LIKE ?`);
    params.push(`%${pin_code}%`);
  }

  if (whereClauses.length > 0) {
    query += ` WHERE ${whereClauses.join(' AND ')}`;
  }

  query += ` GROUP BY c.id ORDER BY c.${sortField} ${sortOrder} LIMIT ? OFFSET ?`;
  params.push(parseInt(limit), parseInt(offset));

  db.all(query, params, (err, rows) => {
    if (err) throw err;

    // Get total count
    let countQuery = `SELECT COUNT(DISTINCT c.id) as total FROM customers c LEFT JOIN addresses a ON c.id = a.customer_id`;
    if (whereClauses.length > 0) countQuery += ` WHERE ${whereClauses.join(' AND ')}`;

    db.get(countQuery, params.slice(0, -2), (err, countResult) => {
      if (err) throw err;

      const total = countResult.total;
      const totalPages = Math.ceil(total / limit);

      res.json({
        success: true,
        data: rows,
        pagination: {
          current_page: parseInt(page),
          per_page: parseInt(limit),
          total,
          total_pages: totalPages,
          has_next_page: parseInt(page) < totalPages,
          has_prev_page: parseInt(page) > 1
        },
        filters: { search, city, state, pin_code, sort_by: sortField, sort_order: sortOrder }
      });
    });
  });
}));

// GET single customer by ID
// GET single customer by ID with addresses
router.get('/:id', asyncHandler(async (req, res) => {
    const db = req.db;
    const { id } = req.params;

    // Get customer
    db.get('SELECT * FROM customers WHERE id = ?', [id], (err, customer) => {
        if (err) throw err;

        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }

        // Get addresses
        db.all('SELECT * FROM addresses WHERE customer_id = ?', [id], (err, addresses) => {
            if (err) throw err;

            const customerData = {
                ...customer,
                addresses: addresses || [],
                address_count: addresses.length || 0
            };

            res.json({ success: true, data: customerData });
        });
    });
}));


// POST create customer
router.post('/', asyncHandler(async (req, res) => {
    const db = req.db;
    const { first_name, last_name, phone_number, email } = req.body;

    if (!first_name || !last_name || !phone_number) {
        return res.status(400).json({
            success: false,
            message: 'First name, last name, and phone number are required'
        });
    }

    const sql = 'INSERT INTO customers (first_name, last_name, phone_number, email) VALUES (?, ?, ?, ?)';
    db.run(sql, [first_name, last_name, phone_number, email || null], function(err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed: customers.phone_number')) {
                return res.status(409).json({ success: false, message: 'Phone number already exists' });
            }
            if (err.message.includes('UNIQUE constraint failed: customers.email')) {
                return res.status(409).json({ success: false, message: 'Email already exists' });
            }
            return res.status(500).json({ success: false, message: 'Database error', error: err.message });
        }

        res.status(201).json({
            success: true,
            message: 'Customer created successfully',
            data: { id: this.lastID, first_name, last_name, phone_number, email: email || null }
        });
    });
}));

// PUT update customer
router.put('/:id', asyncHandler(async (req, res) => {
    const db = req.db;
    const { id } = req.params;
    const { first_name, last_name, phone_number, email } = req.body;

    const sql = 'UPDATE customers SET first_name = ?, last_name = ?, phone_number = ?, email = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    db.run(sql, [first_name, last_name, phone_number, email || null, id], function(err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed: customers.phone_number')) {
                return res.status(409).json({ success: false, message: 'Phone number already exists' });
            }
            if (err.message.includes('UNIQUE constraint failed: customers.email')) {
                return res.status(409).json({ success: false, message: 'Email already exists' });
            }
            return res.status(500).json({ success: false, message: 'Database error', error: err.message });
        }

        if (this.changes === 0) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }

        res.json({ success: true, message: 'Customer updated successfully' });
    });
}));

// DELETE customer
router.delete('/:id', asyncHandler(async (req, res) => {
    const db = req.db;
    const { id } = req.params;

    db.run('DELETE FROM customers WHERE id = ?', [id], function(err) {
        if (err) throw err;

        if (this.changes === 0) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }

        res.json({ success: true, message: 'Customer deleted successfully' });
    });
}));
// GET addresses for a specific customer
router.get('/:id/addresses', asyncHandler(async (req, res) => {
    const db = req.db;
    const { id } = req.params;

    db.all('SELECT * FROM addresses WHERE customer_id = ?', [id], (err, addresses) => {
        if (err) throw err;

        res.json({
            success: true,
            data: addresses || []
        });
    });
}));


module.exports = router;

