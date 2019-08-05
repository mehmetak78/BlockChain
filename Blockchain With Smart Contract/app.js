
let Block = require('./block')
let Blockchain = require('./blockchain')
let BlockchainNode = require('./BlockchainNode')
let Transaction = require('./transaction')
let sha256 = require('js-sha256')
let DrivingRecordSmartContract = require('./smartContracts')

let fetch = require('node-fetch')

const express = require('express')
const app = express()
const bodyParser = require('body-parser')

let port = 3000

// access the arguments
process.argv.forEach(function(val,index,array){
  port = array[2]
})

if(port === undefined) {
  port = 3000
}

let transactions = []
let nodes = []
let genesisBlock = new Block()
let blockchain = new Blockchain(genesisBlock)

app.use(bodyParser.json())

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

          res.send(blockchain)

      })

  })

})

app.post('/nodes/register',function(req,res){

  let nodesLists = req.body.urls
  nodesLists.forEach(function(nodeDictionary){
    let node = new BlockchainNode(nodeDictionary["url"])
    nodes.push(node)
  })

  res.json(nodes)

})

app.get('/nodes',function(req,res){
  res.json(nodes)
})

app.get('/',function(req,res){
  res.send("hello world")
})

app.post('/mine',function(req,res){

    let block = blockchain.getNextBlock(transactions)
    blockchain.addBlock(block)
    transactions = []
    console.log(transactions)
    res.json(block)
})

// driving-records/TX1234
// driving-records/CA1234
app.get("/driving-records/:drivingLicenseNumber",function(req,res){

  let drivingLicenseNumber = sha256(req.params.drivingLicenseNumber)
  let transactions = blockchain.transactionsByDrivingLicenseNumber(drivingLicenseNumber)
  res.json(transactions)

})

app.post('/transaction',function(req,res){

  console.log(transactions)

  let drivingRecordSmartContract = new DrivingRecordSmartContract()

  let driverLicenseNumber = sha256(req.body.driverLicenseNumber)
  let voilationDate = req.body.voilationDate
  let voilationType = req.body.voilationType

  let transaction = new Transaction(driverLicenseNumber,voilationDate,voilationType)

  drivingRecordSmartContract.apply(transaction,blockchain.blocks)

  transactions.push(transaction)

  res.json(transactions)

})

app.get('/blockchain',function(req,res){

  res.json(blockchain)

})

app.listen(port,function(){
  console.log("server has started")
})
