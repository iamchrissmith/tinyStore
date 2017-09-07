const Product = artifacts.require('./Product.sol');

contract('Product', (accounts) => {
  const owner = accounts[0];
  const admin = accounts[1];
  const user = accounts[2];

  let product;

  beforeEach( () => {
    return Product.new({from:owner})
      .then( (instance) => {
        product = instance;
      });
  });

  it('should be owned by "owner"', () => {
    return product.owner({from:owner})
      .then( (_owner) => {
        assert.strictEqual(_owner, owner, "Contract is not owned by 'owner'");
      });
  });

  describe('Purchasing', () => {
    describe('.buyProduct', () => {
      it('a user should be able to purchase a product', () => {
        let productSku;
        return contract.addProduct("New Product", "New Product", 2, 1, {from: owner})
        .then( tx => {
          productSku = tx.logs[0].args.sku;
          return contract.buyProduct(productSku,{from:user, value:2});
        })
        .then( tx => {
          const eventLog = tx.logs[0].args;
          assert.equal(eventLog.purchaser, user, "User was not the purchaser");
          assert.equal(eventLog.owner, owner, "Owner was not reported correctly");
          assert.equal(eventLog.newStock.toString(10), "0", "Product stock did not change");
          assert.equal(eventLog.sku, productSku, "Product sku incorrect");
        });
      });

      it('the owner should not be able to purchase their own product', () => {
        let productSku;
        return contract.addProduct("New Product", "New Product", 2, 1, {from: owner})
          .then( tx => {
            productSku = tx.logs[0].args.sku;
            return expectedExceptionPromise( () => {
              return contract.buyProduct(productSku,{from:owner, value:2});
            });
          });
      });

      it('a user should not be able to purchase a product when stock == 0', () => {
        let productSku;
        return contract.addProduct("New Product", "New Product", 2, 1, {from: owner})
          .then( tx => {
            productSku = tx.logs[0].args.sku;
            return contract.buyProduct(productSku,{from:user, value:2});
          })
          .then( tx => {
            assert.equal(tx.logs[0].args.newStock.toString(10), "0", "Product stock did not change");
            return expectedExceptionPromise( () => {
              return contract.buyProduct(productSku,{from:user, value:2});
            });
          });
      });

      it('a user must send the exact price - too low', () => {
        let productSku;
        return contract.addProduct("New Product", "New Product", 2, 1, {from: owner})
          .then( tx => {
            productSku = tx.logs[0].args.sku;
            return expectedExceptionPromise( () => {
              return contract.buyProduct(productSku,{from:user, value:1});
            });
          });
      });

      it('a user must send the exact price - too high', () => {
        let productSku;
        return contract.addProduct("New Product", "New Product", 2, 1, {from: owner})
          .then( tx => {
            productSku = tx.logs[0].args.sku;
            return expectedExceptionPromise( () => {
              return contract.buyProduct(productSku,{from:user, value:3});
            });
          });
      });
    });
    describe('.withdrawFunds', () => {
      it('after a purchase the owner should be able to withdraw their funds', () => {
        const gasPrice = 1;
        const amount = 20000;
        let transactionCost;
        let ownerBalance;
        let productSku;
        return contract.addProduct("New Product", "New Product", amount, 1, {from: owner, gasPrice: gasPrice})
        .then( tx => {
          productSku = tx.logs[0].args.sku;
          return web3.eth.getBalance(owner)
        })
        .then( balance => {
          ownerBalance = balance;
          return contract.buyProduct(productSku,{from:user, value:amount});
        })
        .then( tx => {
          return contract.balances(owner, {from:owner})
        })
        .then( contractBalance => {
          assert.equal(contractBalance.toString(10), amount.toString(10), "Owner balance incorrect");
          return contract.withdrawFunds({from:owner, gasPrice: gasPrice});
        })
        .then( tx => {
          transactionCost = tx.receipt.gasUsed * gasPrice;
          return web3.eth.getBalance(owner)
        })
        .then( (newBalance) => {
          assert.equal(ownerBalance.plus(amount).minus(transactionCost).toString(10), newBalance.toString(10), `Owner balance did not increase by ${amount}`);
        });
      })
    });
  });


  //   describe('.removeProduct', () => {
  //     it('the product owner can delete the product', () => {
  //       let productSku;
  //       return contract.addAdmin(admin, {from: owner})
  //         .then( (tx) => {
  //           return contract.addProduct("New Product", "New Product", 2, 1, {from: admin})
  //         })
  //         .then( (tx) => {
  //           productSku = tx.logs[0].args.sku;
  //           return contract.isProduct(productSku, {from: admin});
  //         })
  //         .then( (isProduct) => {
  //           assert.isTrue(isProduct, "The product was not created");
  //           return contract.removeProduct(productSku, {from: admin});
  //         })
  //         .then( (tx) => {
  //           return contract.isProduct(productSku, {from:admin});
  //         })
  //         .then( (isProduct) => {
  //           assert.isFalse(isProduct, "Product was not deleted");
  //         });
  //     });

  //     it('cannot delete product if not owner of product', () => {
  //       let productSku;
  //       return contract.addAdmin(admin, {from: owner})
  //         .then( (tx) => {
  //           return contract.addProduct("New Product", "New Product", 2, 1, {from: admin})
  //         })
  //         .then( (tx) => {
  //           productSku = tx.logs[0].args.sku;
  //           const productOwner = tx.logs[0].args.owner;
  //           assert.equal(productOwner, admin, "Product owner is wrong");
  //           return contract.isProduct(productSku, {from: owner});
  //         })
  //         .then( (isProduct) => {
  //           assert.isTrue(isProduct, "The product was not created");
  //           return expectedExceptionPromise( () => {
  //             return contract.removeProduct(productSku, {from: owner});
  //           }, 3000000);
  //         });
  //     });
  //   })

});