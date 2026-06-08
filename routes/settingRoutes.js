import express from 'express';
import { submitContactForm, getFAQs, getTransactionHistory } from '../controllers/settingController.js';

const router = express.Router();

router.post('/contact', submitContactForm);
router.get('/faqs', getFAQs);
router.get('/payments', getTransactionHistory);

export default router;