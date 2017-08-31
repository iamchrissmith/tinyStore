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

  event LogNewProduct(bytes32 sku, string name, uint price, uint stock, uint index);

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

  function addProduct(bytes32 sku, string name, uint price, uint stock)
    public
    returns(bool success)
  {
    require(isAdmin(msg.sender));
    require(!isProduct(sku));

    uint newIndex = insertProduct(sku, name, price, stock);
    LogNewProduct(sku, name, price, stock, newIndex);

    return true;
  }
}
