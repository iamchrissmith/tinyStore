const app = angular.module('tinyShop', []);
const Web3 = require("web3");
const Promise = require("bluebird");
const truffleContract = require("truffle-contract");
const $ = require("jquery");
const tinyShopJson = require("../build/contracts/TinyShop.json");
const productJson = require('../build/contracts/Product.json');

// Supports Mist, and other wallets that provide 'web3'.
// if (typeof web3 !== 'undefined') {
    // Use the Mist/wallet/Metamask provider.
    // window.web3 = new Web3(web3.currentProvider);
// } else {
    // Your preferred fallback.
    window.web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545')); 
// }

const TinyShop = truffleContract(tinyShopJson);
TinyShop.setProvider(web3.currentProvider);

const Product = truffleContract(productJson);
Product.setProvider(web3.currentProvider);

Promise.promisifyAll(web3.eth, { suffix: "Promise" });
Promise.promisifyAll(web3.version, { suffix: "Promise" });

app.config( function($locationProvider) {
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });
});

app.controller('tinyShop', 
  [ '$scope', '$location', '$http', '$q', '$window', '$timeout',
  function($scope, $location, $http, $q, $window, $timeout) {

    TinyShop.deployed()
      .then( _instance => {
        $scope.contract = _instance;
        console.log($scope.contract);
        newProductWatcher = watchForProducts();
      });

    $scope.products = [];
    $scope.productIndex = {};
    // $scope.newProduct = {};
    
    const watchForProducts = () => {
      $scope.productWatcher = $scope.contract.LogNewProduct( {}, {fromBlock: 0})
        .watch( (err, newProduct) => {
          if (err) {
            console.error("Error watching: ", err);
          } else {
            console.log("New product: ", newProduct);
            newProduct.args.productPrice = newProduct.args.productPrice.toString(10);
            newProduct.args.productPriceInEth = web3.fromWei(newProduct.args.productPrice, "ether");
            newProduct.args.currentStock = newProduct.args.currentStock.toString(10);
            $scope.productIndex[newProduct.args.product] = $scope.products.length;
            $scope.products.push(newProduct.args);
            $scope.$apply();
            // upsertProduct(newProduct.args.product);
          }
        });
    };

    $scope.buyProduct = (address, price) => {
      if($scope.balance < $scope.products[$scope.productIndex[address]]) return;
      const product = Product.at(address);
      console.log(product);
      product.buyProduct({from:$scope.account, value: price})
      .then( tx => {
        console.log(tx);
      });
    };

    $scope.createProduct = () => {
      if($scope.newProduct.titlee == '') return;
      if($scope.newProduct.name == '') return;
      if(parseInt($scope.newProduct.quantity) < 0) return;
      if(parseInt($scope.newProduct.price) <= 0) return;

      newProduct = $scope.newProduct;
      console.log(newProduct, $scope.contract);
      $scope.newProduct = '';

      $scope.contract.newProduct(
                        newProduct.titlee,
                        newProduct.name,
                        newProduct.price, 
                        newProduct.quantity, 
                        {from:$scope.account, gas: 4000000})
        .then( tx => {
          console.log("receipt:", tx);
        });

      console.log(newProduct);
    };

    const watchProduct = (address) => {
      const product = Product.at(address);
      const watcher = product.LogUpdatedProduct( {}, {fromBlock:0})
      .watch( (err, updated) => {
        if (err)
          {
            console.error('Updated Product watching error: ', err);
          } else {
            console.log("Product Updated: ", updated);
            upsertProduct(address);
          }
      });
    };

    const upsertProduct = (address) => {
      const product = Product.at(address);
      let productName;
      let productTitleHolder;
      let productPrice;
      let productStock;

      return product.name.call({from:$scope.account})
      .then( _name => {
        productName = _name;
        return product.titleHolder.call({from:$scope.account});
      })
      .then( _titleHolder => {
        productTitleHolder = _titleHolder;
        return product.price.call({from:$scope.account});
      })
      .then( _price => {
        productPrice = _price;
        return product.stock.call({from:$scope.account});
      })
      .then( _stock => {
        productStock = _stock;
        
        let p = {};
        p.productName = productName;
        p.productPrice = parseInt(productPrice.toString(10));
        p.productPriceInEth = web3.fromWei(p.productPrice, "ether");
        p.titleHolder = productTitleHolder;
        p.currentStock = parseInt(productStock.toString(10));
        p.product = address;

        if(typeof($scope.productIndex[p.product]) == 'undefined') 
          {
            $scope.productIndex[p.product] = $scope.products.length;
            $scope.products.push(p);
            const productWatcher = watchProduct(address);
            $scope.$apply();
          } else {
            const index = $scope.productIndex[p.product];
            $scope.products[index] = p;
            $scope.$apply();
          }
      });
    };

    // Work with the first account    
    web3.eth.getAccountsPromise()
      .then(accounts => {
          if (accounts.length == 0) {
              $("#balance").html("N/A");
              throw new Error("No account with which to transact");
          }
          $scope.accounts = accounts;
          $scope.account = $scope.accounts[0];
          console.log("ACCOUNT:", $scope.account);
          console.log("Other Accounts: ", $scope.accounts);
          return web3.eth.getBalancePromise($scope.account);
      })
      .then ( _balance => {
          $scope.balance = _balance.toString(10);
          $scope.balanceInEth = web3.fromWei($scope.balance, "ether");
          $scope.$apply();
      });
}]);
