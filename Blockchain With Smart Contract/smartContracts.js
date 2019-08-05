
class DrivingRecordSmartContract {

  apply(transaction, blocks) {

    // go through all blocks
    blocks.forEach(function(block){

      block.transactions.forEach(function(trans){

        if(transaction.driverLicenseNumber == trans.driverLicenseNumber) {

            console.log("here")
            transaction.noOfVoilations += 1

          if(transaction.noOfVoilations > 5) {
            transaction.isDriverLicenseSuspended = true
          }

        }

      })

    })

  }

}

module.exports = DrivingRecordSmartContract
