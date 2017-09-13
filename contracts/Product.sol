pragma solidity ^0.4.6;

import './Stoppable.sol';

contract Product is Stoppable {
    
    address public titleHolder;
    string public name;
    uint public price;
    uint public stock;
    mapping(address => uint) public balances;
    
    modifier onlyHolder {
        require(msg.sender == titleHolder); 
        _;
    }
    
    event LogSale(address buyer, address seller, uint amount, uint remainingStock, uint titleHolderNewBalance);
    event LogWithdrawal(address recipient, uint amount);
    event LogUpdatedProduct(address sender, string productName, uint productPrice, uint currentStock, address titleHolder, bool running);
    event LogNewTitleHolder(address sender, address prevHolder, address newHolder);
    event LogStartSelling(address sender, string productName);
    event LogStopSelling(address sender, string productName);
    
    function Product(address _titleHolder, string _name, uint _price, uint _stock) {
        titleHolder = _titleHolder;
        name = _name;
        price = _price;
        stock = _stock;
    }
    
    function buyProduct()
        public
        onlyIfRunning
        payable
        returns(bool success)
    {
        require(titleHolder != msg.sender);
        require(stock > 0);
        require(price == msg.value); //may eventually allow purchasing more than one product with amount % price == 0
        
        stock = stock - 1;
        balances[titleHolder] += msg.value;
        
        LogSale(msg.sender, titleHolder, msg.value, stock, balances[titleHolder]);
        LogUpdatedProduct(msg.sender, name, price, stock, titleHolder, running);

        return true;
    }
    
    function updateProduct(string newName, uint newPrice, uint newStock)
        public
        onlyHolder
        onlyIfRunning
        returns(bool success)
    {
        require(bytes(newName).length != 0);
        
        name = newName;
        price = newPrice;
        stock = newStock;
        
        LogUpdatedProduct(msg.sender, name, price, stock, titleHolder, running);
        
        return true;
        
    }

    function withdrawFunds()
        public
        onlyIfRunning
        returns(bool success)
    {
        require(balances[msg.sender] > 0);
        uint balanceToSend = balances[msg.sender];
        balances[msg.sender] = 0;
        
        msg.sender.transfer(balanceToSend);
        LogWithdrawal(msg.sender, balanceToSend);
        
        return true;
    }
    
    function changeTitleHolder(address newHolder) 
        public
        onlyHolder
        onlyIfRunning
        returns(bool success)
    {
        require(newHolder != 0);
        
        LogNewTitleHolder(msg.sender, titleHolder, newHolder);
        LogUpdatedProduct(msg.sender, name, price, stock, titleHolder, running);
        titleHolder = newHolder;
        return true;
    }
    
    function startSelling()
        public
        onlyHolder
        returns(bool success)
    {
        LogStartSelling(msg.sender, name);
        LogUpdatedProduct(msg.sender, name, price, stock, titleHolder, running);
        running = true;
        return true;
    }
    
    function stopSelling()
        public
        onlyHolder
        returns(bool success)
    {
        LogStopSelling(msg.sender, name);
        LogUpdatedProduct(msg.sender, name, price, stock, titleHolder, running);
        running = false;
        return true;
    }
}
