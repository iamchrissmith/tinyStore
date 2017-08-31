pragma solidity ^0.4.6;

contract Product {
  struct ProductStruct {
    string name;
    uint price;
    uint stock;
    uint index;
  }

  mapping(bytes32 => ProductStruct) internal productStructs;
  bytes32[] internal productIndex;

  event LogUpdateProduct(
          string name,
          uint price,
          uint stock,
          uint index
        );

  function getProductCount()
    public
    constant
    returns(uint count)
  {
    return productIndex.length;
  }


  function insertProduct(bytes32 sku, string name, uint price, uint stock)
    internal
    returns(uint newIndex)
  {
    productStructs[sku].index = productIndex.push(sku) - 1;
    productStructs[sku].name = name;
    productStructs[sku].price = price;
    productStructs[sku].stock = stock;

    return (productIndex.length - 1);
  }

  function isProduct(bytes32 sku)
    public
    constant
    returns(bool isIndeed)
  {
    if(productIndex.length == 0) return false;

    return (productIndex[productStructs[sku].index] ==  sku);
  }

  function getProductAtIndex(uint index)
    public
    constant
    returns(bytes32 sku)
  {
    return productIndex[index];
  }
}
