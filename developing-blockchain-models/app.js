
let Block = require('./block');
let Blockchain = require('./blockchain');
let BlockchainNode = require('./BlockchainNode');
let Transaction = require('./transaction');

let fetch = require('node-fetch');

const express = require('express');
const app = express();
const bodyParser = require('body-parser');

let port = process.argv[2];

if(port === undefined) {
    port = 3000
}

let transactions = [];
let nodes = [];
let genesisBlock = new Block();
let blockchain = new Blockchain(genesisBlock);

app.use(bodyParser.json());

app.get('/resolve',function(req,res){

    nodes.forEach(function(node){

        fetch(node.url + '/blockchain')
            .then(function(response){
                return response.json()
            })
            .then(function(otherNodeBlockchain){

                if(blockchain.blocks.length < otherNodeBlockchain.blocks.length) {
                    blockchain = otherNodeBlockchain
                }



            })

    });

    res.send(blockchain);

});

app.post('/nodes/register',function(req,res){

    let nodesLists = req.body.urls;
    nodesLists.forEach(function(nodeDictionary){
        let node = new BlockchainNode(nodeDictionary["url"]);
        nodes.push(node)
    });

    res.json(nodes)

});

app.get('/nodes',function(req,res){
    res.json(nodes)
});

app.get('/',function(req,res){
    res.send("hello world")
});

app.post('/mine',function(req,res){

    let block = blockchain.getNextBlock(transactions);
    blockchain.addBlock(block);
    transactions = [];
    console.log(transactions);
    res.json(block);
});

app.post('/transaction',function(req,res){

    console.log(transactions);

    let to = req.body.to;
    let from = req.body.from;
    let amount = req.body.amount;

    let transaction = new Transaction(from,to,amount);

    transactions.push(transaction);

    res.json(transactions)

});

app.get('/blockchain',function(req,res){

    res.json(blockchain)

});

app.listen(port,function(){
    console.log("server has started at port : " + port)
});
