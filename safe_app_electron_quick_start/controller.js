const safenetwork = require('./safenetwork.js');
const electron = require('electron');
const ipc = electron.ipcRenderer;

ipc.on('system-uri-response', async (event, resAuthUri) => {
  await safenetwork.uponAuthResponse(resAuthUri);
  const items = await safenetwork.getItems();
  let scope = angular.element(document.getElementById("planner")).scope();
  scope.$apply(() => {
    scope.ctrl.trips = items;
  })
});

angular.module('tripsPlanner', [])
  .controller('tripsPlannerController', function($scope) {
    var tripsList = this;
    tripsList.trips = [];

    safenetwork.sendAuthRequest();

    tripsList.refreshList = async () => {
      const items = await safenetwork.getItems();
      $scope.$apply(() => {
        $scope.ctrl.trips = items;
      })
    };

    tripsList.addTrip = async () => {
      const randomKey = Math.floor((Math.random() * 10000) + 1);
      await safenetwork.insertItem(randomKey, {text: tripsList.tripText, made: false});
      tripsList.tripText = '';
      await tripsList.refreshList();
    };

    tripsList.remaining = () => {
      var count = 0;
      tripsList.trips.forEach((trip) => {
        count += trip.value.made ? 0 : 1;
      });
      return count;
    };

    tripsList.remove = async () => {
      let tripsToRemove = []
      await tripsList.trips.forEach(async (trip) => {
        if (trip.value.made) tripsToRemove.push({ key: trip.key, version: trip.version });
      });

      if (tripsToRemove.length > 0) {
        await safenetwork.deleteItems(tripsToRemove);
        await tripsList.refreshList();
      }
    };
  });
