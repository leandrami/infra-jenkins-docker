const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/config/db');

// Mock the pg pool
jest.mock('../src/config/db', () => {
  return {
    query: jest.fn(),
  };
});

describe('Product API CRUD tests with PostgreSQL', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /products', () => {
    it('should return all products', async () => {
      const mockProducts = [{ id: 1, name: 'Laptop', price: 999.99, description: 'Gaming Laptop' }];
      pool.query.mockResolvedValue({ rows: mockProducts });

      const response = await request(app).get('/products');
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockProducts);
      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM products');
    });

    it('should return 500 on db error', async () => {
      pool.query.mockRejectedValue(new Error('Database Error'));

      const response = await request(app).get('/products');
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Database Error' });
    });
  });

  describe('GET /products/:id', () => {
    it('should return product by id', async () => {
      const mockProduct = { id: 1, name: 'Laptop', price: 999.99, description: 'Gaming Laptop' };
      pool.query.mockResolvedValue({ rows: [mockProduct] });

      const response = await request(app).get('/products/1');
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockProduct);
      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM products WHERE id = $1', ['1']);
    });

    it('should return 404 if product not found', async () => {
      pool.query.mockResolvedValue({ rows: [] });

      const response = await request(app).get('/products/999');
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'Product not found' });
    });
  });

  describe('POST /products', () => {
    it('should create a new product', async () => {
      const mockProduct = { id: 1, name: 'Mouse', price: 29.99, description: 'Wireless Mouse' };
      pool.query.mockResolvedValue({ rows: [mockProduct] });

      const response = await request(app)
        .post('/products')
        .send({ name: 'Mouse', price: 29.99, description: 'Wireless Mouse' });
      
      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockProduct);
      expect(pool.query).toHaveBeenCalledWith('INSERT INTO products (name, price, description) VALUES ($1, $2, $3) RETURNING id, name, price, description', ['Mouse', 29.99, 'Wireless Mouse']);
    });

    it('should return 400 if validation fails', async () => {
      const response = await request(app).post('/products').send({ name: 'Only Name' });
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: 'Name and price are required' });
    });
  });

  describe('PUT /products/:id', () => {
    it('should update an existing product', async () => {
      const mockProduct = { id: 1, name: 'Mouse', price: 19.99, description: 'On Sale' };
      pool.query.mockResolvedValue({ rowCount: 1, rows: [mockProduct] });

      const response = await request(app)
        .put('/products/1')
        .send({ name: 'Mouse', price: 19.99, description: 'On Sale' });
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockProduct);
      expect(pool.query).toHaveBeenCalledWith('UPDATE products SET name = $1, price = $2, description = $3 WHERE id = $4 RETURNING id, name, price, description', ['Mouse', 19.99, 'On Sale', '1']);
    });

    it('should return 404 if product to update is not found', async () => {
      pool.query.mockResolvedValue({ rowCount: 0, rows: [] });

      const response = await request(app)
        .put('/products/999')
        .send({ name: 'Mouse', price: 19.99, description: 'On Sale' });
      
      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /products/:id', () => {
    it('should delete a product', async () => {
      pool.query.mockResolvedValue({ rowCount: 1 });

      const response = await request(app).delete('/products/1');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Product deleted successfully' });
      expect(pool.query).toHaveBeenCalledWith('DELETE FROM products WHERE id = $1', ['1']);
    });

    it('should return 404 if product to delete is not found', async () => {
      pool.query.mockResolvedValue({ rowCount: 0 });

      const response = await request(app).delete('/products/999');
      expect(response.status).toBe(404);
    });
  });
});
