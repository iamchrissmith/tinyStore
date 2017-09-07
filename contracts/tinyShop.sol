pragma solidity ^0.4.6;

import "./Adminable.sol";
import "./Product.sol";

contract TinyShop is Adminable, Stoppable {
    
    address[] public products;
    
    mapping(address => bool) public productExists;
    
    modifier onlyIfProduct(address product) {
        require(productExists[product]);
        _;
    }

    event LogNewProduct(
        address sender,
        address titleHolder,
        address product, 
        string productName, 
        uint productPrice, 
        uint currentStock);

          
    function TinyShop() {
        addAdmin(msg.sender);
    }
    
    function getProductCount()
        public
        constant
        returns(uint productCount)
    {
        return products.length;
    }
    
    function newProduct(address _titleHolder, string _name, uint _price, uint _stock)
        public
        returns(address productContract)
    {
        Product trustedProduct = new Product(_titleHolder, _name, _price, _stock);
        products.push(trustedProduct);
        productExists[trustedProduct] = true;
        LogNewProduct(msg.sender, _titleHolder, trustedProduct, _name, _price, _stock);
        return trustedProduct;
    }

}
