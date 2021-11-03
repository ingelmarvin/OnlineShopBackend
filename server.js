//server
const express = require('express');
const port = 3000;
const app = express();

//für sapui5
var cors = require('cors')
app.use(cors())

app.use(express.static('public'));
app.use(express.json({
    limit: '10mb'
}));
app.use(express.urlencoded({
    extended: false
}))

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

app.get('/userid', (req, res) => {

});

app.post('/products', (req, res) => {   //adminbereiche in 2tes programm umlagern
    if (req.body != undefined) {
        db.products.insert(req.body);
    }
});


app.get('/products', (req, res) => {
    db.products.find({}).sort({
        imgpath: 1
    }).exec((err, docs) => {
        if (err) {
            console.log(err);
            return res.json({
                success: false,
                message: 'db error'
            });
        } else if (docs.length === 0) {
            console.log('no products found');
            return res.json({
                success: false,
                message: 'no products found'
            });
        } else {
            res.json(docs);
        }
    });
});

app.post('/order', (req, res) => {
    if (req.body != undefined) {
        db.orders.insert(req.body);
    }
});

app.get('/order', (req, res) => {
    db.orders.find({}, (err, docs) => {
        if (err) {
            console.log(err);
            return res.json({
                success: false,
                message: 'db error'
            });
        } else if (docs.length === 0) {
            console.log('no orders found');
            return res.json({
                success: false,
                message: 'no orders found'
            });
        } else {
            res.json(docs);
        }
    });
});

app.post('/cart', (req, res) => {
    if (req.body != undefined) {
        db.carts.insert(req.body);
    }
})

app.get('/cart', async (req, res) => {
    //getCartForUserId(req.body.userid, res).then(docs => getProductsForProductIds(docs, res).then(products => res.json(products)));
    const docs = await getCartForUserId(req.body.userid, res)
    const products = await getProductsForProductIds(docs, res);
    res.json(products);
});

app.get('/invoices', async (req, res) => {
    res.json({
        "Invoices": [
          {
            "ProductName": "Pineapples",
            "Quantity": 21,
            "ExtendedPrice": 87.2000,
            "ShipperName": "Fun Inc.",
            "ShippedDate": "2015-04-01T00:00:00",
            "Status": "A"
          },
          {
            "ProductName": "Milk",
            "Quantity": 4,
            "ExtendedPrice": 9.99999,
            "ShipperName": "ACME",
            "ShippedDate": "2015-02-18T00:00:00",
            "Status": "B"
          },
          {
            "ProductName": "Canned Beans",
            "Quantity": 3,
            "ExtendedPrice": 6.85000,
            "ShipperName": "ACME",
            "ShippedDate": "2015-03-02T00:00:00",
            "Status": "B"
          },
          {
            "ProductName": "Salad",
            "Quantity": 2,
            "ExtendedPrice": 8.8000,
            "ShipperName": "ACME",
            "ShippedDate": "2015-04-12T00:00:00",
            "Status": "C"
          },
          {
            "ProductName": "Bread",
            "Quantity": 1,
            "ExtendedPrice": 2.71212,
            "ShipperName": "Fun Inc.",
            "ShippedDate": "2015-01-27T00:00:00",
            "Status": "A"
          }
        ]
      });
});

app.get('/orders', async (req, res) => {
    console.log("orders");
    res.json({
        OrdersPosSet : [
            {
                OrderID : "135",
                Value : 50,
                Currency : "€",
                ProductQuantity : 12,
                Payed : true
            },
            {
                OrderID : "711",
                Value : 18.70,
                Currency : "€",
                ProductQuantity : 4,
                Payed : true
            },
            {
                OrderID : "246",
                Value : 420.69,
                Currency : "€",
                ProductQuantity : 3,
                Payed : true
            }
        ]
      });
});


async function getProductsForProductIds(docs, res) {
    return Promise.all(docs.map(element => {
        return new Promise((resolve) => {
            db.products.find({
                _id: element.productid
            }, (err, docs) => {
                if (err) {
                    console.log(err); 
                    reject(res.json({
                        success: false,
                        message: 'db error'
                    }));
                } else if (docs.length === 0) {
                    console.log('invalid products found in cart');
                    reject(res.json({
                        success: false,
                        message: 'invalid products found in cart'
                    }));
                } else {
                    element.title = docs[0].title;
                    element.imgpath = docs[0].imgpath;
                    element.price = docs[0].price;
                    console.log(element.title);
                    resolve(element);
                }
            });
        });
    }));
}

async function getCartForUserId(userid, res) {
    return new Promise((resolve, reject) => {
        db.carts.find({
            userid: userid
        }).exec((err, docs) => {
            if (err) {
                console.log(err);
                reject(res.json({
                    success: false,
                    message: 'db error'
                }));
            } else if (docs.length === 0) {
                console.log('no products found in cart');
                reject(res.json({
                    success: false,
                    message: 'no products found in cart'
                }));
            } else {
                console.log("returning cart");
                resolve(docs);
            }
        });
    })
}

app.listen(port, () => console.log('listening at port ' + port));