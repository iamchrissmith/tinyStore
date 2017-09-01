const tinyShop = artifacts.require('./tinyShop.sol');
const expectedExceptionPromise = require('./expected_exception_testRPC_and_geth');

contract('tinyShop', (accounts) => {
  const owner = accounts[0];
  const admin = accounts[1];
  const user = accounts[2];

  let contract;

  beforeEach( () => {
    return tinyShop.new({from:owner})
      .then( (instance) => {
        contract = instance;
      });
  });

  it('should be owned by "owner"', () => {
    return contract.owner({from:owner})
      .then( (_owner) => {
        assert.strictEqual(_owner, owner, "Contract is not owned by 'owner'");
      });
  });

  describe('User functionality', () => {

    it('be able to get the Admin count', () => {
      return contract.getAdminCount({from:owner})
        .then( (count) => {
          assert.equal(count, 1, "Contract does not have the owner as admin");
        });
    });

    it('be able to return an Admin at specific index', () => {
      return contract.getAdminAtIndex(0,{from:owner})
        .then( (_address) => {
          assert.equal(_address, owner, "Contract does not have the owner in adminsIndex");
        });
    });

    it('the owner should be an administrator', () => {
      return contract.isAdmin(owner, {from: owner})
        .then( (isAdmin) => {
          assert.isTrue(isAdmin, "The owner is not an admin by default");
        });
    });

    it('the owner should able to tell a non-admin address', () => {
      return contract.isAdmin(accounts[1], {from: owner})
        .then( (isAdmin) => {
          assert.isFalse(isAdmin, "The non-admin address is marked as admin");
        });
    });

    it('the owner should be able to add other administrators', () => {
      return contract.addAdmin(admin, {from: owner})
        .then( (tx) => {
          const eventAddress = tx.logs[0].args.adminAddress;
          const addedAt = tx.logs[0].args.adminIndex;
          assert.equal(eventAddress, admin, "The second admin's address was not correct");
          assert.equal(addedAt, 1, "The second admin index is not correct");
          return contract.isAdmin(admin, {from: owner});
        })
        .then( (isAdmin) => {
          assert.isTrue(isAdmin, "The admin was not created");
          return contract.getAdminCount({from:owner});
        })
        .then( (count) => {
          assert.equal(count, 2, "The Contract does not have enough admins");
        });
    });

    it('the owner should be able to remove other administrators', () => {
      return contract.addAdmin(admin, {from: owner})
        .then( (tx) => {
          return contract.isAdmin(admin, {from: owner});
        })
        .then( (isAdmin) => {
          assert.isTrue(isAdmin, "The admin was not created");
          return contract.getAdminCount({from:owner});
        })
        .then( (count) => {
          assert.equal(count, 2, "The Contract does not have enough admins");
          return contract.removeAdmin(admin, {from: owner});
        })
        .then( (tx) => {
          return contract.getAdminCount({from:owner});
        })
        .then( (count) => {
          assert.equal(count, 1, "The Contract does not have the right amount of admins");
        });
    });

    it('the owner should not be able to remove self as an administrator', () => {
      return expectedExceptionPromise( () => {
        return contract.removeAdmin(owner, {from: owner}, 3000000);
      })
    });
  });

  describe('Product functionality', () => {

    describe('.addProduct', () => {
      it('an admin can create a new product', () => {
        return contract.addProduct("New Product", "New Product", 2, 1, {from: owner})
          .then( tx => {
            const productSku = tx.logs[0].args.sku;
            const productName = tx.logs[0].args.name;
            const productPrice = tx.logs[0].args.price;
            const productStock = tx.logs[0].args.stock;
            const productIndex = tx.logs[0].args.index;
            const productOwner = tx.logs[0].args.owner;
            assert.equal(productName, "New Product", "Product name is wrong");
            assert.equal(productPrice, 2, "Product price is wrong");
            assert.equal(productStock, 1, "Product stock is wrong");
            assert.equal(productIndex, 0, "Product index is wrong");
            assert.equal(productOwner, owner, "Product owner is wrong");
            return contract.isProduct(productSku,{from:owner});
          })
          .then( isProduct => {
            assert.isTrue(isProduct);
            return contract.getProductCount({from:owner});
          })
          .then( count => {
            assert.equal(count, 1, "Contract did increase number of products");
          })
      });

      it('a non-admin cannot create a product', () => {
        return expectedExceptionPromise( () => {
          return contract.addProduct("New Product", "New Product", 2, 1, {from: user});
        }, 3000000);
      });
    });

    describe('.isProduct', () => {
      it('it should report false if product does not exist', () => {
        return contract.isProduct('not a product', {from: owner})
          .then( (isProduct) => {
            assert.isFalse(isProduct, "The product should not be true");
          });
      });
    });

    describe('.getProductCount', () => {
      it('starts with 0 products', () => {
        return contract.getProductCount({from:owner})
        .then( count => {
          assert.equal(count, 0, "Contract did not start with 0 products")
        });
      });
    });

    describe('.getProductAtIndex', () => {
      it('can return a product when given an index', () => {
        let productSku;
        return contract.addProduct("New Product", "New Product", 2, 1, {from: owner})
          .then( tx => {
            productSku = tx.logs[0].args.sku;
            return contract.getProductAtIndex(0,{from:owner});
          })
          .then( sku => {
            assert.equal(sku, productSku, "Returned SKU does not match");
          })
      });
    });

    describe('.removeProduct', () => {
      it('the product owner can delete the product', () => {
        let productSku;
        return contract.addAdmin(admin, {from: owner})
          .then( (tx) => {
            return contract.addProduct("New Product", "New Product", 2, 1, {from: admin})
          })
          .then( (tx) => {
            productSku = tx.logs[0].args.sku;
            return contract.isProduct(productSku, {from: admin});
          })
          .then( (isProduct) => {
            assert.isTrue(isProduct, "The product was not created");
            return contract.removeProduct(productSku, {from: admin});
          })
          .then( (tx) => {
            return contract.isProduct(productSku, {from:admin});
          })
          .then( (isProduct) => {
            assert.isFalse(isProduct, "Product was not deleted");
          });
      });

      it('cannot delete product if not owner of product', () => {
        let productSku;
        return contract.addAdmin(admin, {from: owner})
          .then( (tx) => {
            return contract.addProduct("New Product", "New Product", 2, 1, {from: admin})
          })
          .then( (tx) => {
            productSku = tx.logs[0].args.sku;
            const productOwner = tx.logs[0].args.owner;
            assert.equal(productOwner, admin, "Product owner is wrong");
            return contract.isProduct(productSku, {from: owner});
          })
          .then( (isProduct) => {
            assert.isTrue(isProduct, "The product was not created");
            return expectedExceptionPromise( () => {
              return contract.removeProduct(productSku, {from: owner});
            }, 3000000);
          });
      });
    })

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
});
