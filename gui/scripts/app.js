angular.module("hahmsterenApp", [])
.controller('MainController', ['$scope', '$filter', '$http', function($scope, $filter, $http) {
  $scope.currentPage = 'introduction';
  $scope.adultNumber = 1;
  $scope.childNumber = 0;
  $scope.showErrorNoPeople = false;
  $scope.currentTransaction = null;
  $scope.setupComplete = false;
  $scope.userSpecs = [];
//  transaction in userData.transactions | filter: { date : '2014-09-03T00:00:00.000Z' } | limitTo: 1
  
  $scope.buddies = [
    {
      name: 'Peter van der Hoorn',
      points: '+13',
      id: 1
    },
    {
      name: 'Julia Schut',
      points: '-4',
      id: 2
    }
  ];
  $scope.extraBuddies = [
    {
      name: 'Peter Schut',
      points: '-4',
      id: 3
    },
    {
      name: 'Anne Zeerbergh',
      points: '-4',
      id: 4
    },
    {
      name: 'Piet Kan',
      points: '-4',
      id: 5
    },
    {
      name: 'Rik Helmond',
      points: '-4',
      id: 6
    },
    {
      name: 'Sjors Klaassen',
      points: '-4',
      id: 7
    },
    {
      name: 'Sander Polders',
      points: '-4',
      id: 8
    },
    {
      name: 'Floor Schut',
      points: '-4',
      id: 9
    }
  ];
  
  $scope.addBuddy = function(newBuddy) {
    $scope.buddies.push(angular.copy(newBuddy));
//    $scope.addedBuddies.push(angular.copy(newBuddy));
    
    var keepGoing = true;
    angular.forEach($scope.extraBuddies, function(buddy, index) {
      if (keepGoing && newBuddy.id === buddy.id) {
        keepGoing = false;
        $scope.extraBuddies.splice(index, 1);
      }
    });
  }
  
  $scope.increaseAdult = function(amount) {
    if ((amount < 0 && $scope.adultNumber > 0) || amount > 0) {
      $scope.adultNumber += amount;
    }
  };
  $scope.increaseChild = function(amount) {
    if ((amount < 0 && $scope.childNumber > 0) || amount > 0) {
      $scope.childNumber += amount;
    }
  };
  
  
  $scope.continueToApp = function() {
    if ($scope.childNumber + $scope.adultNumber > 0) {
      $scope.showPage('home');
    } else {
      $scope.showErrorNoPeople = true;
      //dlg = $dialogs.error('This is my error message');
    }
  };
  
  // Page specifics (switching between pages)
  $scope.pageIsVisible = function(pageName) {
    return $scope.currentPage === pageName;
  };
  
  // Set the current page
  $scope.showPage = function(pageName) {
    $scope.showMenu = false;
    $scope.currentPage = pageName;
    console.log('hihihihi');
    if (pageName === 'home') {
      
        addUserData(1, 'Me', function(specs) {
          $scope.$apply(function() {
            $scope.userSpecs = specs;
          });
        });
      
      $scope.setupComplete = true;
    }
  };
  
  // Menu specifics
  $scope.showMenu = false;
  $scope.toggleMenu = function() {
    $scope.showMenu = !$scope.showMenu;
  };
  
  
  $scope.selectTransactionByDate = function(date) {
    //$scope.currentTransaction = $filter('filter')($scope.userData.transactions, 
  };
  
  
  $http({method: 'GET', url: 'http://do.u0d.de:8888/transaction/1'}).
  success(function(data, status, headers, config) {
    $scope.userData = data;
  });
  
  
  $scope.showGraph = function(id, name) {
  };
  
  $scope.showTransaction = function(date) {
    var continueLooping = true;
    var bFound = false;
    angular.forEach($scope.userData.transactions, function(transaction, index) {
      console.log(date);
      if (continueLooping && transaction.date.substring(0, 10) == date.substring(0, 10)) {
        continueLooping = false;
        console.log(transaction.id);
        $scope.currentTransaction = transaction;
        $scope.currentPage = 'receipt';
        bFound = true;
      }
    });
    if (!bFound) {
      alert('Oeps, dit bonnetje kon niet gevonden worden! :(');
    }
  };
  $scope.visibleBuddies = [];
  $scope.toggleUser = function(buddy) {
    console.log('toggleUser');
    var nCont = true;
    var bFound = false;
    angular.forEach($scope.visibleBuddies, function(nBuddy, index) {
      if (nCont && buddy.id === nBuddy.id) {
        nCont = false;
        bFound = true;
        removeUserData(buddy.name.split(' ')[0]);
        $scope.visibleBuddies.splice(index, 1);
      }
    });
    if (!bFound) {
      addUserData(buddy.id, buddy.name.split(' ')[0]);
      $scope.visibleBuddies.push(buddy);
    }
  };
  
  $http({method: 'GET', url: 'http://do.u0d.de:8888/stressbol/'}).
  success(function(data, status, headers, config) {
    $scope.bolData = data;
  });
 

  
  
}]);
