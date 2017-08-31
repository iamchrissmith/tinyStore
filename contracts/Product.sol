pragma solidity ^0.4.6;

contract Product {
  struct ProductStruct {
    string name;
    uint price;
    uint stock;
    address owner;
    uint index;
  }

  mapping(bytes16 => ProductStruct) internal productStructs;
  bytes16[] internal productIndex;

  event LogUpdatedProduct(
          bytes16 sku,
          string name,
          uint price,
          uint stock,
          address owner,
          uint index
        );

  function getProductCount()
    public
    constant
    returns(uint count)
  {
    return productIndex.length;
  }


  function insertProduct(bytes16 sku, string name, uint price, uint stock)
    internal
    returns(uint newIndex)
  {
    productStructs[sku].index = productIndex.push(sku) - 1;
    productStructs[sku].name = name;
    productStructs[sku].price = price;
    productStructs[sku].stock = stock;
    productStructs[sku].owner = msg.sender;

    return (productIndex.length - 1);
  }

  function isProduct(bytes16 sku)
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
    returns(bytes16 sku)
  {
    return productIndex[index];
  }

  function deleteProduct(bytes16 sku)
    internal
  {
    uint rowToDelete = productStructs[sku].index;
    bytes16 skuToMove = productIndex[productIndex.length - 1];

    productIndex[rowToDelete] = skuToMove;
    productStructs[skuToMove].index = rowToDelete;
    productIndex.length--;

    LogUpdatedProduct(
      skuToMove,
      productStructs[skuToMove].name,
      productStructs[skuToMove].price,
      productStructs[skuToMove].stock,
      productStructs[skuToMove].owner,
      productStructs[skuToMove].index
    );
  }
}
