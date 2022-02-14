const {Router} = require('express');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const {check, validationResult} = require('express-validator')
const router = Router();
const config = require('config')
const sql = require('mssql')

// /api/auth/register
router.post(
    '/register', 
    [
        check('email', 'Ошибка email').isEmail(),
        check('password', 'Мин. длина пароля 6 символов').isLength({ min: 6})
    ],
    async (req, res) => {

    try{
        const errors = validationResult(req);

        if(!errors.isEmpty()){
            return res.status(400).json({
                errors: errors.array(),
                message: 'Некорректные данные для регистрации'
            });
        }

        const {email, password} = req.body;

        let pool = await sql.connect(config.get('mssql'));
        let result_check = await pool.request()
            .input('input_email', sql.NVarChar, email)
            .query('select id from dbo.Users where email = @input_email');

        if(result_check['recordset'][0]) {
            return res.status(400).json({ message: 'Такой пользователь уже есть' });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const transaction = new sql.Transaction(pool);
        transaction.begin(err => {
            // ... error checks
            const request = new sql.Request(transaction)
                .input('input_email', sql.NVarChar, email)
                .input('input_pass', sql.NVarChar, hashedPassword);

            request.query('insert into Users (Email, Password) values (@input_email, @input_pass)', (err, result) => {
                // ... error checks
                transaction.commit(err => {
                    // ... error checks
                    res.status(201).json({ message: 'Пользователа создан' });
                    console.log("Transaction committed.")
                });
            });
        });

    }catch(e){
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// /api/auth/login
router.post(
    '/login', 
    [
        check('email', 'Ошибка email').isEmail(),
        check('password', 'Введите пароль').exists()
    ],
    async (req, res) => {
    try{
        const errors = validationResult(req);

        if(!errors.isEmpty()){
            return res.status(400).json({
                errors: errors.array(),
                message: 'Некорректные данные для входа'
            });
        }

        const {email, password} = req.body;

        let pool = await sql.connect(config.get('mssql'));
        let result_check = await pool.request()
            .input('input_email', sql.NVarChar, email)
            .query('select * from dbo.Users where email = @input_email');
        
        const user = result_check['recordset'][0];
        if(!user){
             return res.status(400).json({ message: 'Пользователь не найден'});
        }

        const isMatch = await bcrypt.compare(password, user.Password);
        if(!isMatch){
            return res.status(400).json({ message: 'Ошибка логина'});
        }

        const token = jwt.sign(
            { userId: user.ID },
            config.get('jwtSecret'),
            {expiresIn: '1h'}
        );

        res.json({ token, userId: user.ID });

    }catch(e){
        res.status(500).json({message: 'Ошибка сервера'});
    }
});

module.exports = router;