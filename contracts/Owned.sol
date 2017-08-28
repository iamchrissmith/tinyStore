pragma solidity ^0.4.6;

contract Owned {
  address public owner;

  function Owned() {
    owner = msg.sender;
  }
}
