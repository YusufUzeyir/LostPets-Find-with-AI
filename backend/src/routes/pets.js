const express = require('express');
const router = express.Router();
const petsController = require('../controllers/petsController');

// Kayıp ve bulunan hayvanlar
router.get('/lost', petsController.getLostPets);
router.get('/found', petsController.getFoundPets);
router.post('/lost', petsController.addLostPet);
router.post('/found', petsController.addFoundPet);
router.delete('/lost/:id', petsController.deleteLostPet);
router.delete('/found/:id', petsController.deleteFoundPet);
router.put('/lost/:id', petsController.updateLostPet);
router.put('/found/:id', petsController.updateFoundPet);

// Detay sayfaları
router.get('/lost/:id', petsController.getLostPetDetail);
router.get('/found/:id', petsController.getFoundPetDetail);

// Türler ve cinsler
router.get('/types', petsController.getAllTypes);
router.get('/breeds/:turId', petsController.getBreedsByType);

// Şehirler ve ilçeler
router.get('/cities', petsController.getAllCities);
router.get('/districts/:cityId', petsController.getDistrictsByCity);

// İlan durumu güncelleme
router.put('/lost/:id/toggle-active', petsController.toggleLostPetActive);
router.put('/found/:id/toggle-active', petsController.toggleFoundPetActive);

// Kullanıcı ilanları
router.get('/user/lost/:email', petsController.getUserLostPets);
router.get('/user/found/:email', petsController.getUserFoundPets);

module.exports = router; 