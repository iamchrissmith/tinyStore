pragma solidity ^0.4.6;

contract User {
  struct UserStruct {
    /*uint userIndex;
    uint ownerIndex;*/
    uint adminIndex;
  }

  mapping(address => UserStruct) internal userStructs;
  /*address[] internal userIndex;
  address[] internal ownerIndex;*/
  address[] internal adminsIndex;

  function User() {

  }

  function isAdmin( address adminAddress)
    public
    returns(bool isAdmin)
  {
    if(adminsIndex.length == 0) return false;

    return (adminsIndex[userStructs[adminAddress].adminIndex] == adminAddress);
  }

}
