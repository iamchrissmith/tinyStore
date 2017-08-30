pragma solidity ^0.4.6;

contract Product {
  struct ProductStruct {
    bytes32 name;
    uint price;
    uint stock;
    uint index;
  }

  mapping(bytes32 => ProductStruct) internal productStructs;
  bytes32[] internal productIndex;

  event LogUpdateProduct(
          bytes32 name,
          uint price,
          uint stock,
          uint index
        );

  function insertProduct(bytes32 name)
    internal
    returns(uint newIndex)
  {
    productStructs[name].index = productIndex.push(newAddress) - 1;

    return (productIndex.length - 1);
  }
}
