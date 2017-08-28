const tinyShop = artifacts.require('./tinyShop.sol');

contract('tinyShop', (accounts) => {
  const owner = accounts[0];
  const admin = accounts[1];

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

  // as an administrator, you can add products, which consist of an id, a price and a stock.
  // as a regular user you can buy 1 of the products.
  // as the owner you can make payments or withdraw value from the contract.

  // Eventually, you will refactor it to include:
    // ability to remove products.
    // co-purchase by different people.
    // add merchants akin to what Amazon has become.
    // add the ability to pay with a third-party token.
});
