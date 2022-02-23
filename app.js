//including express
const exp = require('express');

//express app
const app = exp();


const multer = require('multer');

//register view engine
app.set('view engine','ejs');

//to include external files from public folder(to make files public to access)
app.use(exp.static('public'));

//to encode passed data
app.use(exp.urlencoded({extended: true}));

const path = require('path');
//const { path } = require('express/lib/application');

//db connection
const { createPool } = require('mysql');
//const { JSON } = require('mysql/lib/protocol/constants/types');
const pool = createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "book_management_system"
})


let regex = new RegExp('[a-z0-9]+@ves.ac.in');



//contactUs
app.get('/contact',(req,res)=>{
    res.render('contact');
})

//default
app.get('/',(req,res)=>{
    //to send index page
    res.render('login');//message can be dynamically accessed in index.ejs
})

var user=12;
//login
app.get('/login',(req,res)=>{
    res.render('login');
})
app.post('/login',(req,res)=>{
    const auth = req.body;
    var r = res;
    if(auth.no==undefined){
        pool.query("select * from login where email=?",[auth.mail],(err,res,field)=>{
            const verify =  JSON.parse(JSON.stringify(res));
            console.log(verify[0].acc_password);
                if(err){
                    console.log(err);
                }
                else{
                    if(verify[0]==null)
                    {
                        console.log('user not registered');
                        r.redirect('/login?error=' + encodeURIComponent('UNR'));
                    }
                    else if(auth.pass==verify[0].acc_password)
                    {
                        console.log('successfull');
                        user = verify[0].customer_id;
                        r.redirect('/home');//seller->home
                    }
                    else{
                        console.log('incorrect password');
                        r.redirect('/login?error=' + encodeURIComponent('IP'));
                    }
                }
            });
    }
    else{
        pool.query("select * from login where email=?",[auth.mail],(err,res,field)=>{
            const check = JSON.parse(JSON.stringify(res));
            console.log(check);
            if(err){
                return console.log(err);
            }
            if(check[0]==null){
                pool.query("INSERT INTO `login` (`user_name`, `email`, `acc_password`, `mobile_no`) VALUES (?,?,?,?);",[auth.name,auth.mail,auth.pass,auth.no],(err,res,fields)=>{
                    if(err){
                        return console.log(err);
                    }
                    console.log('insert successful');
                    r.redirect('/home');
                    return console.log(res);
                })
            }
            else{
            r.redirect('/login?error=' + encodeURIComponent('AE'));
            }
        })
    }
})
// const pl = pool.query("select * from login where customer_id=?",user,(err,res,field)=>{
//     const bs = JSON.parse(JSON.stringify(res));
//     console.log(bs.user_name);
// })


//book
app.get('/book',(req,r)=>{
    console.log(user);
    pool.query('select * from products where category=?',["book"],(err,res,f)=>{
        if(err){
            throw err;
        }
        const books = JSON.parse(JSON.stringify(res));
        r.render('book',{books});
    })
})

//
// const storage = multer.diskStorage({
//     destination: (req,file,cb)=>{
//         cb(null,'Images')
//     },
//     filename: (req,file,cb)=>{
//         pool.query("select product_id from user where mail=?",["smail@mail.com"], async (err,res,field)=>{
//             if(err){
//                 return console.log(err);
//             }
//             const check = JSON.parse(JSON.stringify(res));;
//             console.log(check);
//             cb(null,check[0].name+path.extname(file.originalname));
//         })
//         console.log(file);
//         //cb(null,"shree12"+path.extname(file.originalname));
//     }
// })
// const upload = multer({storage: storage});
app.get('/cart',(req,res)=>{ //seller->home
    res.render('cart'); //seller->home
})
app.get('/book_des',(req,res)=>{ //seller->home
    res.render('book_des'); //seller->home
})
app.get('/home',(req,res)=>{ //seller->home
    res.render('home'); //seller->home
})
app.get('/seller',(req,res)=>{ //seller->home
    res.render('seller'); //seller->home
})
app.post('/seller',(req,r)=>{
    const data = req.body;
    console.log(data);
    pool.query("INSERT INTO `products` (`customer_id`, `category`, `name`, `price`, `mrp`, `prod_condition`, `available`, `description`, `Subject`) VALUES (?,?,?,?,?,?,?,?,?)",[user,data.category,data.name,data.price,data.mrp,data.condition,1,data.description,data.subject],(err,res,field)=>{
        if(err){
            return console.log(err);
        }
        console.log("insertion successful");
        r.redirect('/seller');
    })
})

//listen request
app.listen(3000,()=>{
    console.log("server started...");
});


//upload image
// const storage = multer.diskStorage({
//     destination: (req,file,cb)=>{
//         cb(null,'Images')
//     },
//     filename: (req,file,cb)=>{
//         pool.query("select product_id from products where customer_id=?",[user], async (err,res,field)=>{
//             if(err){
//                 return console.log(err);
//             }
//             const check = JSON.parse(JSON.stringify(res));;
//             console.log(check);
//             cb(null,check[0].product_id+path.extname(file.originalname));
//         })
//         console.log(file);
//         //cb(null,"shree12"+path.extname(file.originalname));
//     }
// })
// const upload = multer({storage: storage});
// app.get('/upload',(req,res)=>{
//     res.render('upload');
// })
// app.post('/upload',upload.single("image"),(req,res)=>{
//     res.send("Image Uploaded");
// })


//insert value in db
// app.post('/contact',(req,res)=>{
//     //const blog = new Blog(req.body);
//     const data = req.body;
//     pool.query("insert into data values(?,?,?,?)",[data.name,data.no,data.mail,data.message],(err,res,fields)=>{
//         if(err){
//             return console.log(err);
//         }
//         return console.log(res);
//     })
//     res.redirect('/contact');
//     //console.log(req.body);
// })
