pragma solidity ^0.4.6;

import './Owned.sol';

contract Adminable is Owned {

    struct UserStruct {
        uint adminIndex;
    }
    
    address[] public adminsIndex;
    mapping(address => UserStruct) public userStructs;
    
    event LogNewAdmin(address indexed adminAddress, uint adminIndex);
    event LogRemovedAdmin(address indexed adminAddress);
    event LogUpdatedAdmin(address indexed adminAddress, uint adminIndex);
    
    function addAdmin(address newAddress)
        public
        onlyOwner
        returns(bool success)
    {
        require(!isAdmin(newAddress));
        
        userStructs[newAddress].adminIndex = adminsIndex.push(newAddress) - 1;
        
        uint newIndex = adminsIndex.length - 1;
        LogNewAdmin(newAddress, newIndex);
        
        return true;
    }

    function removeAdmin(address removable)
        public
        onlyOwner
        returns(bool success)
    {
        require(removable != owner);
        require(isAdmin(removable));
        
        uint rowToDelete = userStructs[removable].adminIndex;
        address keyToMove = adminsIndex[adminsIndex.length - 1];
        
        adminsIndex[rowToDelete] = keyToMove;
        userStructs[keyToMove].adminIndex = rowToDelete;
        adminsIndex.length--;
        
        LogUpdatedAdmin(keyToMove, rowToDelete);
        LogRemovedAdmin(removable);
        
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