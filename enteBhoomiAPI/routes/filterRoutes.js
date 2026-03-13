import {filterProducts, searchByCategory} from '../controller/filterController.js';
import express from 'express';
const app = express.Router();

app.route('/').get(filterProducts);
app.route('/:category').get(searchByCategory);

export default app;