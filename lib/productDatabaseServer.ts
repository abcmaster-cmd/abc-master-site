import fs from 'fs';
import path from 'path';
import { Product, INITIAL_UNIFIED_PRODUCTS } from './productDatabase';

export function getProductsServerSide(): Product[] {
  try {
    const dirPath = path.join(process.cwd(), 'scratch');
    const filePath = path.join(dirPath, 'products_persist.json');

    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(INITIAL_UNIFIED_PRODUCTS, null, 2), 'utf-8');
      return INITIAL_UNIFIED_PRODUCTS;
    }

    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('⚠️ Falha ao ler products_persist.json no servidor:', err);
    return INITIAL_UNIFIED_PRODUCTS;
  }
}

export function saveProductsServerSide(products: Product[]): void {
  try {
    const dirPath = path.join(process.cwd(), 'scratch');
    const filePath = path.join(dirPath, 'products_persist.json');

    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    fs.writeFileSync(filePath, JSON.stringify(products, null, 2), 'utf-8');
  } catch (err) {
    console.error('⚠️ Falha ao salvar products_persist.json no servidor:', err);
  }
}
