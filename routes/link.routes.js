const {Router} = require('express');
const config = require('config');
const shortid = require('shortid');
const auth = require('../middleware/auth.middleware');
const router = Router();
const sql = require('mssql');
const { v4: uuidv4 } = require('uuid');

router.post('/generate', auth, async (req, res) => {
  try {
    const baseUrl = config.get('baseUrl');
    const {from} = req.body;

    let pool = await sql.connect(config.get('mssql'));
    let existing = await pool.request()
        .input('from', sql.NVarChar, from)
        .query('SELECT * FROM dbo.Links where From_ = @from');

    if (existing['recordset'][0]) {
      return res.json({ link: existing['recordset'][0] });
    }
    
    const code = shortid.generate();
    const to = baseUrl + '/t/' + code;
    const uuid = uuidv4();

    const transaction = new sql.Transaction(pool);
    transaction.begin(err => {
        // ... error checks
        const request = new sql.Request(transaction)
            .input('input_code', sql.NVarChar, code)
            .input('input_to', sql.NVarChar, to)
            .input('input_from', sql.NVarChar, from)
            .input('input_owner_id', sql.Int, req.user.userId)
            .input('input_uuid', sql.NVarChar, uuid);

        request.query('insert into Links (From_, To_, Code, OwnerId, UUID) values (@input_from, @input_to, @input_code, @input_owner_id, @input_uuid)', (err, result) => {
            // ... error checks
            transaction.commit(err => {
                // ... error checks
                res.status(201).json({ 
                  link: {
                    ID: 0,
                    From_: from,
                    To_ : to,
                    Code : code,
                    Click: 0,
                    OwnerId: req.user.userId,
                    UUID: uuid
                  }
                });
                console.log("Transaction committed.");
            });
        });
    });
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
