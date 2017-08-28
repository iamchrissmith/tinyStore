pragma solidity ^0.4.6;

contract Owned {
  address public owner;

  function Owned() {
    owner = msg.sender;
  }

  /*function destroy() 
    public
    returns(bool success)
  {
    require(msg.sender == owner);
    selfdestruct(owner);
    return true;
  }*/
}
