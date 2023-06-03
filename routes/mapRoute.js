const express = require('express');
const router = express.Router();
const MapController = require('../controllers/mapController');
const auth = require('../auth');

router.post('/createMap', auth.verify, MapController.createMap);
router.post('/getMapById', auth.verify, MapController.getMapById);
router.post('/deleteMapById', auth.verify, MapController.deleteMapById);
router.post('/duplicateMapById', auth.verify, MapController.duplicateMapById);
router.post('/changeMapNameById', auth.verify, MapController.changeMapNameById);
router.post('/publishMapById', auth.verify, MapController.publishMapById);
router.post('/mapClassificationById', auth.verify, MapController.mapClassificationById);
router.post('/importMapFileById', auth.verify, MapController.importMapFileById);
router.post('/saveMapById', auth.verify, MapController.saveMapById);
router.post('/getMapImageById', auth.verify, MapController.getMapImageById);
router.post('/setMapImageById', auth.verify, MapController.setMapImagebyId);
router.post('/searchMap', auth.verify, MapController.searchMap);
router.post('/sortMap', auth.verify, MapController.sortMap);

module.exports = router