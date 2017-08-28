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

  /*event LogNewProduct   ();
  event LogUpdateProduct();*/
}
