pragma solidity ^0.4.6;

import "./Owned.sol";
import "./User.sol";
/*import "./Product.sol";*/

contract tinyShop is Owned, User{

  function tinyShop() {
    insertAdmin(msg.sender);
  }

  event LogNewAdmin(address indexed adminAddress, uint adminIndex);
  event LogRemovedAdmin(address indexed adminAddress);

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
}
