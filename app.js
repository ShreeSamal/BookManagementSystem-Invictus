const express = require('express');
const multer = require('multer');
const path = require('path');
const mysql = require('mysql');
require('dotenv').config();

// Initialising Express Server
const app = express();
const PORT = process.env.PORT || 3000;
const pool = mysql.createConnection({
   host: process.env.DATABASE_HOST,
   user: process.env.DATABASE_USER,
   password: process.env.DATABASE_PSWD,
   database: process.env.DATABASE_NAME
});

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

let regex = new RegExp('[a-z0-9]+@ves.ac.in');

app.get('/', (req, res) => {
   res.render('login');
});

app.get('/contact', (req, res) => {
   res.render('contact');
});

app.get('/login', (req, res) => {
   res.render('login');
});

app.post('/login', (req, res) => {
   if (req.body.no == undefined) {
      pool.query('SELECT * FROM login WHERE email = ?',
      [req.body.mail],
      (err, result, field) => {
         const verify = JSON.parse(JSON.stringify(result));
         console.log(verify[0].acc_password);
         if (err) {
            throw err;
         } else {
            if (verify[0] == null) {
               console.log('user not registered');
               res.redirect('/login?error=' + encodeURIComponent('UNR'));
            } else if (req.body.pass == verify[0].acc_password) {
               console.log('successfull');
               user = verify[0].customer_id;
               res.redirect('/home'); //seller->home
            } else {
               console.log('incorrect password');
               res.redirect('/login?error=' + encodeURIComponent('IP'));
            }
         }
      });
   } else {
      pool.query(
         'SELECT * FROM login WHERE email = ?',
         [req.body.mail],
         (err, result, field) => {
            const check = JSON.parse(JSON.stringify(result));
            console.log(result);
            if (err) {
               throw err;
            }
            
            if (check[0] == null) {
               pool.query('INSERT INTO `login` (`user_name`, `email`, `acc_password`, `mobile_no`) VALUES (?, ?, ?, ?);',
               [req.body.name, req.body.mail, req.body.pass, req.body.no],
               (err, result, fields) => {
                  if (err) {
                     throw err;
                  }
                  console.log(result);
                  res.redirect('/home');
               })
            } else {
               res.redirect('/login?error=' + encodeURIComponent('AE'));
            }
         }
      );
   }
})

app.get('/book', (req, res) => {
   console.log(user);
   pool.query(
      'SELECT * FROM products WHERE category = ?',
      ['book'],
      (err, result, f) => {
         if (err) {
            throw err;
         }
         const books = JSON.parse(JSON.stringify(result));
         res.render('book', { books });
      }
   );
})

//
// const storage = multer.diskStorage({
//     destination: (req,file,cb)=>{
//         cb(null,'Images')
//     },
//     filename: (req,file,cb)=>{
//         pool.query('select product_id from user where mail=?',['smail@mail.com'], async (err,res,field)=>{
//             if(err){
//                 return console.log(err);
//             }
//             const check = JSON.parse(JSON.stringify(res));;
//             console.log(check);
//             cb(null,check[0].name+path.extname(file.originalname));
//         })
//         console.log(file);
//         //cb(null,'shree12'+path.extname(file.originalname));
//     }
// })
// const upload = multer({storage: storage});

app.get('/cart', (req, res) => {
   //seller->home
   res.render('cart');
});

app.get('/book_des', (req, res) => {
   //seller->home
   res.render('book_des');
});

app.get('/home', (req, res) => {
   //seller->home
   res.render('home');
});

app.get('/seller', (req, res) => {
   //seller->home
   res.render('seller');
});

app.post('/seller', (req, res) => {
   const data = req.body;
   console.log(data);
   pool.query(
      'INSERT INTO `products` (`customer_id`, `category`, `name`, `price`, `mrp`, `prod_condition`, `available`, `description`, `Subject`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [user, data.category, data.name, data.price, data.mrp, data.condition, 1, data.description, data.subject],
      (err, result, field) => {
         if (err) {
            throw err;
         }
         console.log('insertion successful');
         res.redirect('/seller');
      }
   );
})

//upload image
// const storage = multer.diskStorage({
//     destination: (req,file,cb)=>{
//         cb(null,'Images')
//     },
//     filename: (req,file,cb)=>{
//         pool.query('select product_id from products where customer_id=?',[user], async (err,res,field)=>{
//             if(err){
//                 return console.log(err);
//             }
//             const check = JSON.parse(JSON.stringify(res));;
//             console.log(check);
//             cb(null,check[0].product_id+path.extname(file.originalname));
//         })
//         console.log(file);
//         //cb(null,'shree12'+path.extname(file.originalname));
//     }
// })
// const upload = multer({storage: storage});
// app.get('/upload',(req,res)=>{
//     res.render('upload');
// })
// app.post('/upload',upload.single('image'),(req,res)=>{
//     res.send('Image Uploaded');
// })

//insert value in db
// app.post('/contact',(req,res)=>{
//     //const blog = new Blog(req.body);
//     const data = req.body;
//     pool.query('insert into data values(?,?,?,?)',[data.name,data.no,data.mail,data.message],(err,res,fields)=>{
//         if(err){
//             return console.log(err);
//         }
//         return console.log(res);
//     })
//     res.redirect('/contact');
//     //console.log(req.body);
// })

// Start Express Server on Port :3000
app.listen(PORT, () => {
   pool.connect((error) => console.log(error ? error : '[ MYSQL ]  ✓ connected to the DB server'));
   console.log(`[ SERVER ] ✓ started at http://localhost:${PORT}/`);
});

// Process Event Handler(s)
process.on('exit', () => pool.end());