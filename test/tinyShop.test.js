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

    describe('.newProduct', () => {
      it('an admin can create a new product', () => {
        return contract.newProduct(owner, "New Product", 2, 1, {from: admin})
          .then( tx => {
            const product = tx.logs[0].args.product;
            const productName = tx.logs[0].args.productName;
            const productPrice = tx.logs[0].args.productPrice;
            const productStock = tx.logs[0].args.currentStock;
            const titleHolder = tx.logs[0].args.titleHolder;
            assert.equal(productName, "New Product", "Product name is wrong");
            assert.equal(productPrice.toString(10), "2", "Product price is wrong");
            assert.equal(productStock.toString(10), "1", "Product stock is wrong");
            assert.equal(titleHolder, owner, "Product Title Holder is wrong");
            return contract.productExists(product,{from:owner});
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
          return contract.newProduct("New Product", "New Product", 2, 1, {from: user});
        }, 3000000);
      });
    });

    describe('.isProduct', () => {
      it('it should report false if product does not exist', () => {
        return contract.productExists('0x0000', {from: owner})
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
  });
});