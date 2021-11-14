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

app.post('/products', (req, res) => { //adminbereiche in 2tes programm umlagern oder mit pw schützen
    if (req.body !== undefined) {
        db.products.insert(req.body);
        console.log(req.body);
        res.status(200).send("Produkt wurde erstellt");
    } else {
        res.status(400);
    }
});

app.put('/products', (req, res) => {
    try {
        if (req.body !== undefined) {
            console.log(req.body);
            db.products.update({ _id: req.body._id }, req.body, {}, (err, numReplaced) => {
                if (err) {
                    res.status(400);
                } else {
                    res.status(200).send("Produkt wurde gespeichert");
                }
            });
        } else {
            res.status(400);
        }
    } catch (error) {
        res.status(200);
    }
});

app.delete('/products', (req, res) => {
    if (req.body._id === undefined) {
        return res.status(400).send("Error beim Löschen des Produktes");
    }
    db.products.remove({ _id: req.body._id }, {}, (err, numRemoved) => {
        if (err) {
            res.status(400).send("Error beim Löschen des Produktes");
        } else if (numRemoved === 0) {
            return res.status(400).send("Produkt wurde nicht gefunden");
        }
        else {
            return res.status(200).send("Produkt erfolgreich gelöscht");
        }
    })
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
            docs.forEach(element => {
                element.currency = "€";
            });
            const products = {
                Products: docs
            }
            res.json(products);
        }
    });
});

app.post('/orders', (req, res) => {
    if (req.body != undefined) {
        db.orders.insert(req.body);
    }
});

app.get('/orders', (req, res) => {
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
            docs.forEach(element => {
                element.currency = "€";
                element.quantity = 0;
                element.value = 0;
                element.products.forEach(product => {
                    element.quantity += product.quantity;
                    element.value += product.price * product.quantity;
                });
            });
            const orders = {
                Orders: docs
            };
            return res.json(orders);
        }
    });
});

app.post('/cart', (req, res) => {
    if (req.body != undefined) {
        db.carts.insert(req.body);
    }
})

app.get('/cart', async (req, res) => {
    if (req.body.userid === undefined) {
        /// neue id generieren und zurücksenden
    };
    const docs = await getCartForUserId(req.body.userid, res);
    const products = await getProductsForProductIds(docs, res);
    res.json(products);
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

app.listen(port, () => console.log('Server ready at http://localhost:' + port));

