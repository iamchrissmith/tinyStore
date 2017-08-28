pragma solidity ^0.4.6;

import "./Owned.sol";
import "./User.sol";
/*import "./Product.sol";*/

contract tinyShop is Owned, User{

  function tinyShop() {
    insertAdmin(msg.sender);
  }

  event LogNewAdmin(address adminAddress, uint adminIndex);

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
}
