pragma solidity ^0.4.6;

contract User {
  struct UserStruct {
    uint adminIndex;
  }

  mapping(address => UserStruct) public userStructs;
  address[] public adminsIndex;

  event LogUpdatedUser(address indexed userAddress, uint adminIndex);

  function insertAdmin(address newAddress)
    public
    returns(uint newIndex)
  {
    userStructs[newAddress].adminIndex = adminsIndex.push(newAddress) - 1;

    return (adminsIndex.length - 1);
  }

  function deleteAdmin(address oldAddress)
    public
    returns(bool success)
  {
    uint rowToDelete = userStructs[oldAddress].adminIndex;
    address keyToMove = adminsIndex[adminsIndex.length - 1];

    adminsIndex[rowToDelete] = keyToMove;
    userStructs[keyToMove].adminIndex = rowToDelete;
    adminsIndex.length--;

    LogUpdatedUser(keyToMove, rowToDelete);
    return true;
  }

  function isAdmin( address adminAddress)
    public
    constant
    returns(bool isIndeed)
  {
    if(adminsIndex.length == 0) return false;

    return (adminsIndex[userStructs[adminAddress].adminIndex] == adminAddress);
  }

  function getAdminCount()
    public
    constant
    returns(uint count)
  {
    return adminsIndex.length;
  }

  function getAdminAtIndex(uint index)
    public
    constant
    returns(address adminAddress)
  {
    return adminsIndex[index];
  }

}
