const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// CRUD Restaurante
app.post('/restaurantes', async (req, res) => {
  const { nombre, ciudad, direccion, fecha_apertura } = req.body;
  const result = await pool.query(
    'INSERT INTO Restaurante(nombre, ciudad, direccion, fecha_apertura) VALUES($1, $2, $3, $4) RETURNING *',
    [nombre, ciudad, direccion, fecha_apertura]
  );
  res.json(result.rows[0]);
});

app.get('/restaurantes', async (req, res) => {
  const result = await pool.query('SELECT * FROM Restaurante');
  res.json(result.rows);
});

app.put('/restaurantes/:id', async (req, res) => {
  const { nombre, ciudad, direccion, fecha_apertura } = req.body;
  await pool.query(
    'UPDATE Restaurante SET nombre=$1, ciudad=$2, direccion=$3, fecha_apertura=$4 WHERE id_rest=$5',
    [nombre, ciudad, direccion, fecha_apertura, req.params.id]
  );
  res.json({ mensaje: 'Restaurante actualizado' });
});

app.delete('/restaurantes/:id', async (req, res) => {
  await pool.query('DELETE FROM Restaurante WHERE id_rest=$1', [req.params.id]);
  res.json({ mensaje: 'Restaurante eliminado' });
});

// CRUD Empleado
app.post('/empleados', async (req, res) => {
  const { nombre, rol, id_rest } = req.body;
  const result = await pool.query(
    'INSERT INTO Empleado(nombre, rol, id_rest) VALUES($1, $2, $3) RETURNING *',
    [nombre, rol, id_rest]
  );
  res.json(result.rows[0]);
});

app.get('/empleados', async (req, res) => {
  const result = await pool.query('SELECT * FROM Empleado');
  res.json(result.rows);
});

app.put('/empleados/:id', async (req, res) => {
  const { nombre, rol, id_rest } = req.body;
  await pool.query(
    'UPDATE Empleado SET nombre=$1, rol=$2, id_rest=$3 WHERE id_empleado=$4',
    [nombre, rol, id_rest, req.params.id]
  );
  res.json({ mensaje: 'Empleado actualizado' });
});

app.delete('/empleados/:id', async (req, res) => {
  await pool.query('DELETE FROM Empleado WHERE id_empleado=$1', [req.params.id]);
  res.json({ mensaje: 'Empleado eliminado' });
});

// CRUD Producto
app.post('/productos', async (req, res) => {
  const { nombre, precio } = req.body;
  const result = await pool.query(
    'INSERT INTO Producto(nombre, precio) VALUES($1, $2) RETURNING *',
    [nombre, precio]
  );
  res.json(result.rows[0]);
});

app.get('/productos', async (req, res) => {
  const result = await pool.query('SELECT * FROM Producto');
  res.json(result.rows);
});

app.put('/productos/:id', async (req, res) => {
  const { nombre, precio } = req.body;
  await pool.query(
    'UPDATE Producto SET nombre=$1, precio=$2 WHERE id_prod=$3',
    [nombre, precio, req.params.id]
  );
  res.json({ mensaje: 'Producto actualizado' });
});

app.delete('/productos/:id', async (req, res) => {
  await pool.query('DELETE FROM Producto WHERE id_prod=$1', [req.params.id]);
  res.json({ mensaje: 'Producto eliminado' });
});

// CRUD Pedido
app.post('/pedidos', async (req, res) => {
  const { fecha, id_rest, total } = req.body;
  const result = await pool.query(
    'INSERT INTO Pedido(fecha, id_rest, total) VALUES($1, $2, $3) RETURNING *',
    [fecha, id_rest, total]
  );
  res.json(result.rows[0]);
});

app.get('/pedidos', async (req, res) => {
  const result = await pool.query('SELECT * FROM Pedido');
  res.json(result.rows);
});

app.put('/pedidos/:id', async (req, res) => {
  const { fecha, id_rest, total } = req.body;
  await pool.query(
    'UPDATE Pedido SET fecha=$1, id_rest=$2, total=$3 WHERE id_pedido=$4',
    [fecha, id_rest, total, req.params.id]
  );
  res.json({ mensaje: 'Pedido actualizado' });
});

app.delete('/pedidos/:id', async (req, res) => {
  await pool.query('DELETE FROM Pedido WHERE id_pedido=$1', [req.params.id]);
  res.json({ mensaje: 'Pedido eliminado' });
});

// CRUD DetallePedido
app.post('/detalles', async (req, res) => {
  const { id_pedido, id_prod, cantidad, subtotal } = req.body;
  const result = await pool.query(
    'INSERT INTO DetallePedido(id_pedido, id_prod, cantidad, subtotal) VALUES($1, $2, $3, $4) RETURNING *',
    [id_pedido, id_prod, cantidad, subtotal]
  );
  res.json(result.rows[0]);
});

app.get('/detalles', async (req, res) => {
  const result = await pool.query('SELECT * FROM DetallePedido');
  res.json(result.rows);
});

app.put('/detalles/:id', async (req, res) => {
  const { id_pedido, id_prod, cantidad, subtotal } = req.body;
  await pool.query(
    'UPDATE DetallePedido SET id_pedido=$1, id_prod=$2, cantidad=$3, subtotal=$4 WHERE id_detalle=$5',
    [id_pedido, id_prod, cantidad, subtotal, req.params.id]
  );
  res.json({ mensaje: 'Detalle actualizado' });
});

app.delete('/detalles/:id', async (req, res) => {
  await pool.query('DELETE FROM DetallePedido WHERE id_detalle=$1', [req.params.id]);
  res.json({ mensaje: 'Detalle eliminado' });
});

// Consultas nativas

// Productos de un pedido específico
app.get('/pedidos/:id/productos', async (req, res) => {
  const result = await pool.query(
    `SELECT p.nombre, p.precio, d.cantidad, d.subtotal
     FROM DetallePedido d
     JOIN Producto p ON d.id_prod = p.id_prod
     WHERE d.id_pedido = $1`,
    [req.params.id]
  );
  res.json(result.rows);
});

// Productos más vendidos (> X unidades)
app.get('/productos/mas-vendidos/:cantidad', async (req, res) => {
  const result = await pool.query(
    `SELECT p.nombre, SUM(d.cantidad) AS total_vendido
     FROM DetallePedido d
     JOIN Producto p ON d.id_prod = p.id_prod
     GROUP BY p.nombre
     HAVING SUM(d.cantidad) > $1
     ORDER BY total_vendido DESC`,
    [req.params.cantidad]
  );
  res.json(result.rows);
});

// Total de ventas por restaurante
app.get('/ventas/restaurantes', async (req, res) => {
  const result = await pool.query(
    `SELECT r.nombre, SUM(p.total) AS total_ventas
     FROM Pedido p
     JOIN Restaurante r ON p.id_rest = r.id_rest
     GROUP BY r.nombre
     ORDER BY total_ventas DESC`
  );
  res.json(result.rows);
});

// Pedidos por fecha
app.get('/pedidos/fecha/:fecha', async (req, res) => {
  const result = await pool.query(
    'SELECT * FROM Pedido WHERE fecha = $1',
    [req.params.fecha]
  );
  res.json(result.rows);
});

// Empleados por rol en restaurante
app.get('/empleados/rol/:rol/restaurante/:id', async (req, res) => {
  const { rol, id } = req.params;
  const result = await pool.query(
    'SELECT * FROM Empleado WHERE rol = $1 AND id_rest = $2',
    [rol, id]
  );
  res.json(result.rows);
});

// Servidor
app.listen(3000, () => {
});
