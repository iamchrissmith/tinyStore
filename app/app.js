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
        newProductWatcher = watchForProducts();
        return $scope.contract.owner.call({from:$scope.account});
      })
      .then( _owner => {
        $scope.contract.owner = _owner;
      });

    $scope.products = [];
    $scope.productIndex = {};
    $scope.productOwners = {};
    $scope.productOwnedIndex = {};
    $scope.newProduct = {};

    const updateBalance = () => {
      web3.eth.getBalancePromise($scope.account)
        .then ( _balance => {
          $scope.balance = _balance.toString(10);
          $scope.balanceInEth = web3.fromWei($scope.balance, "ether");
          $scope.$apply();
        });
    };
    
    const watchForProducts = () => {
      $scope.productWatcher = $scope.contract.LogNewProduct( {}, {fromBlock: 0})
        .watch( (err, newProduct) => {
          if (err) {
            console.error("Error watching: ", err);
          } else {
            console.log("New product log: ", newProduct);
            upsertProduct(newProduct.args.product);
          }
        });
    };

    $scope.buyProduct = (address) => {
      const price = $scope.products[$scope.productIndex[address]].productPrice;
      if($scope.balance < $scope.products[$scope.productIndex[address]].productPrice) return;
      const product = Product.at(address);
      product.buyProduct({from:$scope.account, value: price})
      .then( tx => {
        console.log(tx);
        upsertProduct(address);
        updateBalance();
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
      return product.LogUpdatedProduct( {}, {fromBlock:0})
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
      let myBalance;

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
        return product.balances.call($scope.account, {from:$scope.account});
      })
      .then( _myBalance => {
        myBalance = _myBalance;
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
        p.myBalance = parseInt(myBalance.toString(10));

        if(typeof($scope.productIndex[p.product]) == 'undefined') 
          {
            $scope.productIndex[p.product] = $scope.products.length;
            let ownedIndex = 0;
            if (typeof($scope.productOwners[p.titleHolder]) == 'undefined') {
              $scope.productOwners[p.titleHolder] = [];
            } else {
              ownedIndex = $scope.productOwners[p.titleHolder].length;
            }
            $scope.productOwnedIndex[p.product] = ownedIndex;
            $scope.products.push(p);
            $scope.productOwners[p.titleHolder].push(p);
            const productWatcher = watchProduct(address);
            $scope.$apply();
          } else {
            const index = $scope.productIndex[p.product];
            const ownedIndex = $scope.productOwnedIndex[p.product];
            $scope.products[index] = p;
            $scope.productOwners[p.titleHolder][ownedIndex] = p;
            $scope.$apply();
          }
      });
    };

    $scope.changeAccounts = (address) => {
      console.log("new address: ", address);
      $scope.account = address;
      updateCurrentAccount();
    }

    const updateProductBalances = () => {
      if ($scope.products.length > 0){
        $scope.products.forEach( p => {
          const product = Product.at(p.product);
          product.balances.call($scope.account, {from:$scope.account})
          .then( _myBalance => {
            const index = $scope.productIndex[p.product];
            const ownedIndex = $scope.productOwnedIndex[p.product];
            $scope.products[index].myBalance = _myBalance;
            $scope.productOwners[p.titleHolder][ownedIndex].myBalance = _myBalance;
            $scope.$apply();
          });
        });
      }
    };

    const updateCurrentAccount = () => {
      $scope.contract.isAdmin($scope.account, {from:$scope.account})
      .then(_isAdmin => {
        $scope.isAdmin = _isAdmin;
        console.log("ACCOUNT:", $scope.account);
        $scope.selectedAccount = $scope.account;
        updateBalance();
        updateProductBalances();
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
          $scope.accounts.forEach( account => {
            $scope.productOwners[account] = [];
          })
          console.log("Other Accounts: ", $scope.accounts);
          $scope.account = $scope.accounts[0];
          updateCurrentAccount();
      }); 
}]);
