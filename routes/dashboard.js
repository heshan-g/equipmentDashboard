const express = require('express');

const axios = require('axios');

const appRouter = express.Router();

appRouter.get('/', async (req, res) => {
  // Function to retrieve equipment data
  const getEquipment = async (max, last) => {
    let response;
    try {
      response = await axios.get(
        'http://ivivaanywhere.ivivacloud.com/api/Asset/Asset/All',
        {
          params: {
            apikey: 'SC:demo:64a9aa122143a5db',
            max,
            last,
          },
        }
      );
    } catch (err) {
      console.log(err);
      return { success: false, data: err };
    }

    return { success: true, data: response.data };
  };

  // Retrieve all equipment data
  const maxEquipmentCount = 100;
  let equipmentList = [];
  let currentLastRowId, latestLastRowId;

  do {
    if (equipmentList[equipmentList.length - 1]) {
      // Consecutive API calls
      currentLastRowId = equipmentList[equipmentList.length - 1].__rowid__;
    } else {
      // First API call
      currentLastRowId = 0;
    }

    // Retrieve a batch of equipment data
    const apiCall = await getEquipment(maxEquipmentCount, currentLastRowId);

    // Check if API call was successful
    if (!apiCall.success) {
      res.send('API call failed, please try again :(');
    }

    // Update the list of equipment
    equipmentList = [...equipmentList, ...apiCall.data];

    // Record the latest __rowid__ value
    latestLastRowId = await equipmentList[equipmentList.length - 1].__rowid__;
  } while (latestLastRowId !== currentLastRowId);

  // Filter out the unimportant fields of each equipment
  equipmentList = equipmentList.map((equipment) => {
    return {
      AssetID: equipment.AssetID,
      AssetCategoryID: equipment.AssetCategoryID,
      OperationalStatus: equipment.OperationalStatus,
      __rowid__: equipment.__rowid__,
    };
  });

  let operationalCount, nonOperationalCount;

  console.log(equipmentList.length);

  const viewData = {
    dashboard: [
      { y: 7, label: 'AHU' },
      { y: 8, label: 'Boiler' },
      { y: 6, label: 'Fire alarm panel' },
    ],
  };

  res.render('dashboard.ejs', viewData);
});

appRouter.get('*', (req, res) => {
  res.send('Page not found (error 404)');
});

module.exports = appRouter;
