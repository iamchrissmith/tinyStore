pragma solidity ^0.4.6;

import "./Owned.sol";
import "./User.sol";
import "./Product.sol";

contract tinyShop is Owned, User, Product{

  function tinyShop() {
    insertAdmin(msg.sender);
  }

  event LogNewAdmin(address indexed adminAddress, uint adminIndex);
  event LogRemovedAdmin(address indexed adminAddress);

  event LogNewProduct(
          bytes16 sku,
          string name,
          uint price,
          uint stock,
          address owner,
          uint index);
  event LogRemovedProduct(bytes16 sku);
  event LogProductPurchase(
          bytes16 sku,
          uint newStock,
          address owner,
          address purchaser
    );

  function addAdmin(address newAddress)
    public
    returns(bool success)
  {
    require(!isAdmin(newAddress));
    require(msg.sender == owner);

    uint newIndex = insertAdmin(newAddress);
    LogNewAdmin(newAddress, newIndex);

    return true;
  }

  function removeAdmin(address removable)
    public
    returns(bool success)
  {
    require(msg.sender == owner);
    require(removable != owner);
    require(isAdmin(removable));

    deleteAdmin(removable);
    LogRemovedAdmin(removable);

    return true;

  }

  function addProduct(bytes16 sku, string name, uint price, uint stock)
    public
    returns(bool success)
  {
    require(isAdmin(msg.sender));
    require(!isProduct(sku));

    uint newIndex = insertProduct(sku, name, price, stock);
    LogNewProduct(sku, name, price, stock, msg.sender, newIndex);

    return true;
  }

  function removeProduct(bytes16 sku)
    public
    returns(bool success)
  {
    require(isProduct(sku));
    require(productStructs[sku].owner == msg.sender);
    // eventually we will need to make sure we handle unfinished payments

    deleteProduct(sku);
    LogRemovedProduct(sku);

    return true;
  }

  function buyProduct(bytes16 sku)
    public
    payable
    returns(bool success)
  {
    require(isProduct(sku));
    require(productStructs[sku].owner != msg.sender);
    require(productStructs[sku].stock > 0);
    require(productStructs[sku].price == msg.value);

    productStructs[sku].stock--;

    LogProductPurchase(
      sku,
      productStructs[sku].stock,
      productStructs[sku].owner,
      msg.sender
    );

    return true;


  }

  // User pays money into the product
  // Reject if it is not equal to the price of the product
  // Reject if there are 0 stock of the product
  // Log purchase, reduce stock, allow owner to withdraw
}
