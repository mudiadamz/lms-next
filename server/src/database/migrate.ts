import { createTables } from './schema.js';

console.log('Running database migrations...');
createTables();
console.log('Migrations completed!');
