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
      // Render the error view
      res.status(500).render('error.ejs', {
        errorTitle: 'Internal server error (500)',
        errorMessage:
          "An error occured in the server. Please try again (refresh) or contact administration if the error persits. Error details can be found on the server's console.",
      });
    }

    // Update the list of equipment
    equipmentList = [...equipmentList, ...apiCall.data];

    // Record the latest __rowid__ value
    latestLastRowId = await equipmentList[equipmentList.length - 1].__rowid__;
  } while (latestLastRowId !== currentLastRowId);

  // Extract and calculate the important data
  let operationalCount = 0;
  let nonOperationalCount = 0;
  let equipmentTypes = {};

  equipmentList.map((equipment) => {
    // Count operational and non-operational equipment
    if (equipment.OperationalStatus === 'Operational') {
      operationalCount += 1;
    } else if (equipment.OperationalStatus === 'Non-Operational') {
      nonOperationalCount += 1;
    }

    // Count equipment grouped by type
    if (equipment.AssetCategoryID in equipmentTypes) {
      // If asset category ID exists, increment count
      equipmentTypes[equipment.AssetCategoryID] += 1;
    } else {
      // If asset category ID does not exist, assign 1
      equipmentTypes[equipment.AssetCategoryID] = 1;
    }
  });

  // Format data for the barchart in dashboard
  let dataPoints = [];
  for (const type in equipmentTypes) {
    dataPoints.push({ y: equipmentTypes[type], label: type });
  }

  // Render the dashboard view
  const viewData = {
    dataPoints,
    operationalCount,
    nonOperationalCount,
  };
  res.status(200).render('dashboard.ejs', viewData);
});

appRouter.get('*', (req, res) => {
  res.status(404).render('error.ejs', {
    errorTitle: 'Page not found (404)',
    errorMessage:
      'The requested page could not be found. Please check the URL and try again.',
  });
});

module.exports = appRouter;
