var express = require('express');
var router = express.Router();

var userController = require('../controllers/userController.js');

router.post('/register', userController.register);
router.post('/login', userController.login);
router.delete('/logout', userController.logout);
router.post('/forgotUsername', userController.forgotUsername);
router.post('/sendPasswordRecoveryCode', userController.sendPasswordRecoveryCode);
router.put('/changePassword', userController.changePassword);
router.post('/changeUsername', userController.changeUsername)
router.get('/loggedIn', userController.getLoggedIn);
router.post('/deleteUser', userController.deleteUser);

module.exports = router;
