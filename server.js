//server
const express = require('express');
const port = 3000;
const app = express();

app.use(express.static('public'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false }))

//database
const Datastore = require('nedb');
const db = {};

db.products = new Datastore('db/products.db');
db.products.loadDatabase();
db.orders = new Datastore('db/orders.db');
db.orders.loadDatabase();
db.carts = new Datastore('db/carts.db');
db.carts.loadDatabase();


//routes
app.get('/', (req, res) => {
    res.json({
        message: "ok"
    });
});

app.get('/id', (req, res) => {
    
});

app.post('/products', (req, res) => {
    if(req.body != undefined){
        db.products.insert(req.body);
    }
})

app.get('/products', (req, res) => {
    db.products.find({}, (err, docs) => {
        if (err) {
            console.log(err);
            return res.json({
                success: false,
                message: 'db error'
            });
        }
        else if (docs.length === 0) {
            console.log('no products found');
            return res.json({
                success: false,
                message: 'no products found'
            });
        }
        else{
            res.json(docs);
        }
    });
});

app.post('/cart', (req, res) => {

})

app.post('/order', (req, res) => {
    if(req.body != undefined){
        db.orders.insert(req.body);
    }
});

app.get('/order', (req,res) => {
    db.orders.find({}, (err,docs) => {
        if (err) {
            console.log(err);
            return res.json({
                success: false,
                message: 'db error'
            });
        }
        else if (docs.length === 0) {
            console.log('no orders found');
            return res.json({
                success: false,
                message: 'no orders found'
            });
        }
        else{
            res.json(docs);
        }
    });
});






app.listen(port, () => console.log('listening at port ' + port));