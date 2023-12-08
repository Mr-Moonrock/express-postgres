const express = require('express');
const slugify = require('slugify');
const db = require('../db');
const ExpressError = require('../expressError');

let router = new express.Router();


// get a list of all companies 
// get a list of all companies 
router.get('/', async (req, res, next) => {
  try{
    const results = await db.query(`SELECT code, name FROM companies`);
    const companies = results.rows.map(company => ({
      code: company.code,
      name: company.name
    }));
    return res.json({ companies })
  } catch (err) {
    return next(err);
  }
})

// get a single company from db with code
router.get('/:code', async (req, res, next) => {
  try {
  const { code } = req.params;
  const companyQuery = await db.query('SELECT * FROM companies WHERE code = $1', [code]);

  if (companyQuery.rows.length === 0) {
    throw new ExpressError(`Can't find company with code ${code}`, 404);
  }
  const { name, description } = companyQuery.rows[0];

  const invoicesQuery = await db.query('SELECT id FROM invoices WHERE comp_code = $1', [code]);
  const invoices = invoicesQuery.rows.map(invoice => invoice.id);

 
  return res.json({ company: {code, name, description, invoices }})
  } catch (err) {
    return next(err)
  }
})

router.get('/:code/industries', async (req, res, next) => {
  try {
    const { code } = req.params;
    const industriesQuery = await db.query(`
      SELECT industries.code, industries.industry
      FROM industries
      JOIN company_industries 
      ON industries.code = company_industries.industry_code
      WHERE company_industries.company_code = $1`, [code]);

    const industries = industriesQuery.rows
    return res.json({ industries })
  } catch (err) {
    return next(err)
  }
})

// add company to db
router.post('/', async (req, res, next) => {
  try {
    let { name, description } = req.body;
    let code = sligify(name, {lower: true});

    const results = await db.query('INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description', [code, name, description]);
    return res.status(201).json({company: results.rows[0] })
  } catch(err) {
    return next(err)
  }
})

router.put('/:code', async (req, res, next) => {
  try {
    const { code } = req.params;
    const { name, description } = req.body;
    const results = await db.query('UPDATE companies SET name=$2, description=$3 WHERE code=$1 RETURNING code, name, description', [code, name, description]);
    if (results.rows.length === 0) {
      throw new ExpressError(`Can't find company with code ${code}`, 404)
    }
    return res.json({company: results.rows[0]})
  } catch(err) {
    return next(err)
  }
})

router.delete('/:code', async (req, res, next) => {
  try {
    const results = await db.query('DELETE FROM companies WHERE code=$1', [req.params.code])
    if(results.rows.length === 0) {
      throw new ExpressError(`Can't find company with code ${req.params.code}`, 404)
    }
    return res.status({ status: 'DELETED!'})
  } catch(err) {
    return next(err)
  }
})

module.exports = router;