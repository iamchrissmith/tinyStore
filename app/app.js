const app = angular.module('tinyShop', []);
const Web3 = require("web3");
const Promise = require("bluebird");
const truffleContract = require("truffle-contract");
const $ = require("jquery");
// Not to forget our built contract
const tinyShopJson = require("../build/contracts/tinyShop.json");

// Supports Mist, and other wallets that provide 'web3'.
// if (typeof web3 !== 'undefined') {
//     // Use the Mist/wallet/Metamask provider.
//     window.web3 = new Web3(web3.currentProvider);
// } else {
    // Your preferred fallback.
    window.web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545')); 
// }

Promise.promisifyAll(web3.eth, { suffix: "Promise" });
Promise.promisifyAll(web3.version, { suffix: "Promise" });

const TinyShop = truffleContract(tinyShopJson);
TinyShop.setProvider(web3.currentProvider);

app.config( function($locationProvider) {
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });
});

app.controller('tinyShop', 
    [ '$scope', '$location', '$http', '$q', '$window', '$timeout',
    function($scope, $location, $http, $q, $window, $timeout) {
        return web3.eth.getAccountsPromise()
        .then(accounts => {
            if (accounts.length == 0) {
                $("#balance").html("N/A");
                throw new Error("No account with which to transact");
            }
            console.log(accounts);
            window.account = accounts[0];
            console.log("ACCOUNT:", window.account);
            return web3.version.getNetworkPromise();
        })
        .then(function(network) {
            return TinyShop.deployed();
        })
        .then(deployed => {
            console.log(deployed);
            return deployed.getProductCount.call()
        })
        .then(productCount => $("#balance").html(productCount.toString(10)))
        .catch(console.error);
}]);
