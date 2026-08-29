const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/config/db');

// Mock the pg pool
jest.mock('../src/config/db', () => {
  return {
    query: jest.fn(),
  };
});

describe('User API CRUD tests with PostgreSQL', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /users', () => {
    it('should return all users', async () => {
      const mockUsers = [{ id: 1, name: 'John Doe', email: 'john@example.com' }];
      pool.query.mockResolvedValue({ rows: mockUsers });

      const response = await request(app).get('/users');
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUsers);
      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM users');
    });

    it('should return 500 on db error', async () => {
      pool.query.mockRejectedValue(new Error('Database Error'));

      const response = await request(app).get('/users');
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Database Error' });
    });
  });

  describe('GET /users/:id', () => {
    it('should return user by id', async () => {
      const mockUser = { id: 1, name: 'John Doe', email: 'john@example.com' };
      pool.query.mockResolvedValue({ rows: [mockUser] });

      const response = await request(app).get('/users/1');
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUser);
      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM users WHERE id = $1', ['1']);
    });

    it('should return 404 if user not found', async () => {
      pool.query.mockResolvedValue({ rows: [] });

      const response = await request(app).get('/users/999');
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'User not found' });
    });
  });

  describe('POST /users', () => {
    it('should create a new user', async () => {
      const mockUser = { id: 1, name: 'Jane Doe', email: 'jane@example.com' };
      pool.query.mockResolvedValue({ rows: [mockUser] });

      const response = await request(app)
        .post('/users')
        .send({ name: 'Jane Doe', email: 'jane@example.com' });
      
      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockUser);
      expect(pool.query).toHaveBeenCalledWith('INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id, name, email', ['Jane Doe', 'jane@example.com']);
    });

    it('should return 400 if validation fails', async () => {
      const response = await request(app).post('/users').send({ name: 'Only Name' });
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: 'Name and email are required' });
    });
  });

  describe('PUT /users/:id', () => {
    it('should update an existing user', async () => {
      const mockUser = { id: 1, name: 'John Updated', email: 'john@updated.com' };
      pool.query.mockResolvedValue({ rowCount: 1, rows: [mockUser] });

      const response = await request(app)
        .put('/users/1')
        .send({ name: 'John Updated', email: 'john@updated.com' });
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUser);
      expect(pool.query).toHaveBeenCalledWith('UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING id, name, email', ['John Updated', 'john@updated.com', '1']);
    });

    it('should return 404 if user to update is not found', async () => {
      pool.query.mockResolvedValue({ rowCount: 0, rows: [] });

      const response = await request(app)
        .put('/users/999')
        .send({ name: 'John Updated', email: 'john@updated.com' });
      
      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /users/:id', () => {
    it('should delete a user', async () => {
      pool.query.mockResolvedValue({ rowCount: 1 });

      const response = await request(app).delete('/users/1');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'User deleted successfully' });
      expect(pool.query).toHaveBeenCalledWith('DELETE FROM users WHERE id = $1', ['1']);
    });

    it('should return 404 if user to delete is not found', async () => {
      pool.query.mockResolvedValue({ rowCount: 0 });

      const response = await request(app).delete('/users/999');
      expect(response.status).toBe(404);
    });
  });
});
