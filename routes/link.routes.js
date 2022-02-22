const {Router} = require('express');
const config = require('config');
const shortid = require('shortid');
const Link = require('../models/Link');
const auth = require('../middleware/auth.middleware');
const router = Router();
const sql = require('mssql');

router.post('/generate', auth, async (req, res) => {
  try {
    const baseUrl = config.get('baseUrl');
    const {from} = req.body;

    const code = shortid.generate();

    //const existing = await Link.findOne({ from });
    let pool = await sql.connect(config.get('mssql'));
    let existing = await pool.request()
        .input('from', sql.NVarChar, from)
        .query('SELECT ID, From_, To_, Code, Click, OwnerId, DateCreated FROM dbo.Links where From_ = @from');

    if (existing['recordset'][0]) {
      return res.json({ link: existing });
    }

    const to = baseUrl + '/t/' + code;

    const link = new Link({
       code, to, from, owner: req.user.userId
    })

    //await link.save();

    const transaction = new sql.Transaction(pool);
    transaction.begin(err => {
        // ... error checks
        const request = new sql.Request(transaction)
            .input('input_code', sql.NVarChar, code)
            .input('input_to', sql.NVarChar, to)
            .input('input_from', sql.NVarChar, from)
            .input('input_owner_id', sql.Int, code);

        request.query('insert into Links (From_, To_, Code, OwnerId) values (@input_from, @input_to, @input_code, @input_owner_id)', (err, result) => {
            // ... error checks
            transaction.commit(err => {
                // ... error checks
                res.status(201).json({ message: 'Link добавлен' });
                console.log("Transaction committed.");
            });
        });
    });

    res.status(201).json({ link });
  } catch (e) {
    res.status(500).json({ message: 'Что-то пошло не так, попробуйте снова' });
  }
});

router.get('/', auth, async (req, res) => {
    try {
      //const links = await Link.find({ owner: req.user.userId });

      let pool = await sql.connect(config.get('mssql'));
      let links = await pool.request()
          .input('userId', sql.Int, req.user.userId)
          .query('SELECT ID, From_, To_, Code, Click, OwnerId, DateCreated FROM dbo.Links where OwnerId = @userId');

      const res = links['recordset'];
      //todo
      res.json(res);
    } catch (e) {
      res.status(500).json({ message: 'Что-то пошло не так, попробуйте снова' });
    }
});

router.get('/:id', auth, async (req, res) => {
  try {
    //const link = await Link.findById(req.params.id);

    let pool = await sql.connect(config.get('mssql'));
    let links = await pool.request()
        .input('id', sql.Int, req.params.id)
        .query('SELECT ID, From_, To_, Code, Click, OwnerId, DateCreated FROM dbo.Links where ID = @id');

    const res = links['recordset'];

    res.json(res);
  } catch (e) {
    res.status(500).json({ message: 'Что-то пошло не так, попробуйте снова' });
  }
});

module.exports = router;
