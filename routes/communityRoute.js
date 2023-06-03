const express = require('express');
const router = express.Router();
const CommunityController = require('../controllers/communityController');
const auth = require('../auth');

router.get('/getCommunity', auth.verify, CommunityController.getCommunity);
router.get('/getCommunityGuest', CommunityController.getCommunityGuest);
router.post('/getCommunityPreviewById', auth.verify, CommunityController.getCommunityPreviewById);
router.post('/forkCommunityMap', auth.verify, CommunityController.forkCommunityMap);
router.post('/reportCommunityMap', auth.verify, CommunityController.reportCommunityMap);
router.post('/likeCommunityMap', auth.verify, CommunityController.likeCommunityMap);
router.post('/dislikeCommunityMap', auth.verify, CommunityController.dislikeCommunityMap);
router.post('/followCommunityMap', auth.verify, CommunityController.followCommunityMap);
router.post('/blockCommunityMap', auth.verify, CommunityController.blockCommunityMap);
router.post('/addComment', auth.verify, CommunityController.addComment);
router.post('/searchMap', auth.verify, CommunityController.searchMap);
router.post('/sortMap', auth.verify, CommunityController.sortMap);

module.exports = router