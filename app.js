const express = require('express');
const config = require('config');
const sql = require('mssql');

const app = express();
app.use(express.json({ extended: true}));
app.use('/api/auth', require('./routes/auth.routes'));

const PORT = config.get('port') || 5000;

async function start(){
    try{
        //let pool = await sql.connect(config.get('mssql'));           
        let pool = await sql.connect('Server=localhost,1433;Database=mern-course;User Id=sa;Password=`12345;Encrypt=false');
        const result = await sql.query`select id, email from users`;
        console.dir(result);
        app.listen(PORT, () =>  console.log(`App has been started on port ${PORT}...`));        
    } catch(e){
        console.log('Server error', e.message);
        process.exit(1);
    }
}

start()