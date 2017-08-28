const tinyShop = artifacts.require('./tinyShop.sol');

contract('tinyShop', (accounts) => {
  const owner = accounts[0];

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

  it('the owner should be an administrator', () => {
    return contract.isAdmin(owner, {from: owner})
      .then( (isAdmin) => {
        assert.isTrue(isAdmin, "The owner is not an admin by default");
      })
  })

  // as an administrator, you can add products, which consist of an id, a price and a stock.
  // as a regular user you can buy 1 of the products.
  // as the owner you can make payments or withdraw value from the contract.

  // Eventually, you will refactor it to include:
    // ability to remove products.
    // co-purchase by different people.
    // add merchants akin to what Amazon has become.
    // add the ability to pay with a third-party token.
});
