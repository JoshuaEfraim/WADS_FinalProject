import express from 'express';
import { getUserTickets } from '../controllers/userController.js';


const router = express.Router();

router.get("/dashboard", getUserTickets)



export default router;