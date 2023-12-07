const express = require('express');
const router = express.Router();
const db = require('../db');
const ExpressError = require('../expressError');

// get a list of all invoices 
router.get('/', async (req, res, next) => {
  try{
    const results = await db.query(`SELECT id, comp_code FROM invoices`);
    const invoices = results.rows.map(invoice => ({
      id: invoice.id,
      comp_code: invoice.comp_code
    }));
    return res.json({ invoices })
  } catch (err) {
    return next(err);
  }
});

// get a single invoice from db with id
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const results = await db.query('SELECT * FROM invoices WHERE id = $1', [id]);
    if (results.rows.length === 0) {
      throw new ExpressError(`Can't find invoice with id of ${id}`, 404);
    }
    const { id: invoiceId, amt, paid, add_date, paid_date, comp_code } = results.rows[0];

    // fetch company details related to invoice id
    const companyResults = await db.query('SELECT code, name, description FROM companies WHERE code=$1', [comp_code])
    const {code, name, description} = companyResults.rows[0];

    return res.json({ 
      invoice: {
        id: invoiceId, 
        amt, paid, 
        add_date, 
        paid_date, 
        company: {code, name, description} 
      }
    });
  } catch (err) {
    return next(err)
  }
})

// adds an invoice 
router.post('/', async (req, res, next) => {
  try {
    const { comp_code, amt } = req.body;
    const results = await db.query('INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING id, amt, paid, add_date, paid_date', [comp_code, amt])
    return res.status(201).json({invoice: results.rows[0] })
  } catch(err) {
    next(err)
  }
})

router.put('/:id', async (req, res, next) => {
  try{
    const { id } = req.params;
    const { amt } = req.body;

    const results = await db.query('UPDATE invoices SET amt=$1 WHERE id=$2 RETURNING id, comp_code, amt, paid, add_date, paid_date', [amt, id]);

    if (results.rows.length === 0) {
      throw new ExpressError(`Can't find invoice with id of ${id}`, 404)
    }
    return res.json({invoice: results.rows[0]})
  } catch(err) {
    next(err)
  }
})

router.delete('/:id', async (req, res, next) => {
  try {
    const results = await db.query('DELETE FROM invoices WHERE id=$1', [req.params.id])
    if(results.rowCount === 0) {
      throw new ExpressError(`Can't find invoice with id of ${req.params.id}`, 404)
    }
    return res.json({ status: 'DELETED!'})
  } catch(err) {
    return next(err)
  }
})

module.exports = router;