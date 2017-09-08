const Product = artifacts.require('./Product.sol');
const expectedExceptionPromise = require('./expected_exception_testRPC_and_geth');

contract('Product', (accounts) => {
  const owner = accounts[0];
  const admin = accounts[1];
  const user = accounts[2];
  const price = 10000;

  let product;

  beforeEach( () => {
    return Product.new(owner, "Product", price, 1, {from:admin})
      .then( (instance) => {
        product = instance;
      });
  });

  it('should be owned by "admin"', () => {
    return product.owner({from:admin})
      .then( (_owner) => {
        assert.strictEqual(_owner, admin, "product is not owned by 'admin'");
      });
  });

  it('should be titled to owner', () => {
    return product.titleHolder({from:owner})
      .then( (_titlee) => {
        assert.strictEqual(_titlee, owner, "product is not titled to 'owner'");
      });
  });

  describe('Purchasing', () => {
    describe('.buyProduct', () => {
      it('a user should be able to purchase a product', () => {
        return product.buyProduct({from:user, value:price})
        .then( tx => {
          const eventLog = tx.logs[0].args;
          assert.equal(eventLog.buyer, user, "User was not the purchaser");
          assert.equal(eventLog.seller, owner, "Owner was not reported correctly");
          assert.equal(eventLog.remainingStock.toString(10), "0", "Product stock did not change");
          assert.equal(eventLog.amount.toString(10), price.toString(10), "Product price incorrect");
          assert.equal(eventLog.titleHolderNewBalance.toString(10), price.toString(10), "Seller's balance did not increase");
        });
      });

      it('the owner should not be able to purchase their own product', () => {
        return expectedExceptionPromise( () => {
          return product.buyProduct({from:owner, value:price});
        });
      });

      it('a user should not be able to purchase a product when stock == 0', () => {
        return product.buyProduct({from:user, value:price})
        .then( tx => {
          return expectedExceptionPromise( () => {
            return product.buyProduct({from:user, value:price})
          });
        }); 
      });

      it('a user must send the exact price - too low', () => {
        return expectedExceptionPromise( () => {
          return product.buyProduct({from:user, value:price - 1});
        });
      });

      it('a user must send the exact price - too high', () => {
        return expectedExceptionPromise( () => {
          return product.buyProduct({from:user, value:price + 11});
        });
      });
    });

    describe('.withdrawFunds', () => {
      it('after a purchase the owner should be able to withdraw their funds', () => {
        const gasPrice = 1;
        let transactionCost;
        let ownerBalance;

        return product.buyProduct({from:user, value:price})
        .then( tx => {
          return web3.eth.getBalance(owner);
        })
        .then( balance => {
          ownerBalance = balance;
          return product.balances(owner, {from:owner})
        })
        .then( heldBalance => {
          assert.equal(heldBalance.toString(10), price.toString(10), "Owner balance incorrect");
          return product.withdrawFunds({from:owner, gasPrice: gasPrice});
        })
        .then( tx => {
          transactionCost = tx.receipt.gasUsed * gasPrice;
          return web3.eth.getBalance(owner)
        })
        .then( (newBalance) => {
          assert.equal(ownerBalance.plus(price).minus(transactionCost).toString(10), newBalance.toString(10), `Owner balance did not increase by ${price}`);
        });
      });
    });
  });


  //   describe('.removeProduct', () => {
  //     it('the product owner can delete the product', () => {
  //       let productSku;
  //       return product.addAdmin(admin, {from: owner})
  //         .then( (tx) => {
  //           return product.addProduct("New Product", "New Product", 2, 1, {from: admin})
  //         })
  //         .then( (tx) => {
  //           productSku = tx.logs[0].args.sku;
  //           return product.isProduct(productSku, {from: admin});
  //         })
  //         .then( (isProduct) => {
  //           assert.isTrue(isProduct, "The product was not created");
  //           return product.removeProduct(productSku, {from: admin});
  //         })
  //         .then( (tx) => {
  //           return product.isProduct(productSku, {from:admin});
  //         })
  //         .then( (isProduct) => {
  //           assert.isFalse(isProduct, "Product was not deleted");
  //         });
  //     });

  //     it('cannot delete product if not owner of product', () => {
  //       let productSku;
  //       return product.addAdmin(admin, {from: owner})
  //         .then( (tx) => {
  //           return product.addProduct("New Product", "New Product", 2, 1, {from: admin})
  //         })
  //         .then( (tx) => {
  //           productSku = tx.logs[0].args.sku;
  //           const productOwner = tx.logs[0].args.owner;
  //           assert.equal(productOwner, admin, "Product owner is wrong");
  //           return product.isProduct(productSku, {from: owner});
  //         })
  //         .then( (isProduct) => {
  //           assert.isTrue(isProduct, "The product was not created");
  //           return expectedExceptionPromise( () => {
  //             return product.removeProduct(productSku, {from: owner});
  //           }, 3000000);
  //         });
  //     });
  //   })

});