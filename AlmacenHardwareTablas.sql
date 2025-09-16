use master
DROP DATABASE IF EXISTS DBRESTALMACEN

CREATE DATABASE DBRESTALMACEN
use DBRESTALMACEN

GO

-- drop table Usuario,TipoAccion,Almacen,Marca,Proveedor,Cliente,Producto,Lote,Contenido_Almacen,Movimiento,MovimientoLinea,Compra,Venta

--- Aprobado en 90% por docente
--- configurar procedimientos almacenados
CREATE TABLE [Usuario] (
  [id] int PRIMARY KEY IDENTITY(1, 1),
  [nombre] nvarchar(255) NOT NULL,
  [clave] varchar(200),
  [dni] nvarchar(255),
  [fecha_nacimiento] date
)
GO

CREATE TABLE [TipoAccion] (
  [id] int PRIMARY KEY IDENTITY(1, 1),
  [nombre] nvarchar(255) NOT NULL
)
GO

CREATE TABLE [Almacen] (
  [id] int PRIMARY KEY IDENTITY(1, 1),
  [nombre] nvarchar(255) NOT NULL,
  [direccion] nvarchar(255),
  [telefono] nvarchar(255)
)
GO

CREATE TABLE [Marca] (
  [id] int PRIMARY KEY IDENTITY(1, 1),
  [nombre] nvarchar(255),
  [estado] bit
)
GO

CREATE TABLE [Proveedor] (
  [id] int PRIMARY KEY IDENTITY(1, 1),
  [nombre] nvarchar(255),
  [ruc] nvarchar(255),
  [telefono] nvarchar(255)
)
GO

CREATE TABLE [Cliente] (
  [id] int PRIMARY KEY IDENTITY(1, 1),
  [nombre] nvarchar(255),
  [ruc] nvarchar(255),
  [telefono] nvarchar(255)
)
GO

CREATE TABLE [Producto] (
  [id] int PRIMARY KEY IDENTITY(1, 1),
  [nombre] nvarchar(255) NOT NULL,
  [id_marca] int
)
GO

CREATE TABLE [Lote] (
  [id] int PRIMARY KEY IDENTITY(1, 1),
  [id_producto] int NOT NULL,
  [id_compra] int NOT NULL,
  [cantidad] varchar(255),
  [precio_unit] decimal,
  [fecha_expiracion] date
)
GO

CREATE TABLE [Contenido_Almacen] (
  [id] int PRIMARY KEY IDENTITY(1, 1),
  [id_almacen] int NOT NULL,
  [id_lote] int NOT NULL,
  [stock] decimal NOT NULL DEFAULT (0)
)
GO

CREATE TABLE [Movimiento] (
  [id] int PRIMARY KEY IDENTITY(1, 1),
  [fecha] datetime NOT NULL,
  [id_usuario] int NOT NULL,
  [id_tipo_accion] int NOT NULL,
  [referencia] nvarchar(255),
  [comentario] nvarchar(255),
  [created_at] datetime NOT NULL
)
GO

CREATE TABLE [MovimientoLinea] (
  [id] int PRIMARY KEY IDENTITY(1, 1),
  [id_movimiento] int NOT NULL,
  [id_almacen_origen] int,
  [id_almacen_destino] int,
  [id_lote] int NOT NULL,
  [cantidad_delta] decimal NOT NULL,
    [Precio_Venta]  decimal NULL
)
GO

CREATE TABLE [Compra] (
  [id] int PRIMARY KEY IDENTITY(1, 1),
  [id_usuario] int,
  [id_movimiento] int,
  [id_proveedor] int,
  [fecha] date
)
GO

CREATE TABLE [Venta] (
  [id] int PRIMARY KEY IDENTITY(1, 1),
  [id_usuario] int,
  [id_movimiento] int,
  [id_cliente] int,
  [fecha] date
)
GO

ALTER TABLE [Lote] ADD FOREIGN KEY ([id_compra]) REFERENCES [Compra] ([id])
GO

ALTER TABLE [Compra] ADD FOREIGN KEY ([id_usuario]) REFERENCES [Usuario] ([id])
GO

ALTER TABLE [Venta] ADD FOREIGN KEY ([id_usuario]) REFERENCES [Usuario] ([id])
GO

ALTER TABLE [Producto] ADD FOREIGN KEY ([id_marca]) REFERENCES [Marca] ([id])
GO

ALTER TABLE [Lote] ADD FOREIGN KEY ([id_producto]) REFERENCES [Producto] ([id])
GO

ALTER TABLE [Contenido_Almacen] ADD FOREIGN KEY ([id_almacen]) REFERENCES [Almacen] ([id])
GO

ALTER TABLE [Contenido_Almacen] ADD FOREIGN KEY ([id_lote]) REFERENCES [Lote] ([id])
GO

ALTER TABLE [Movimiento] ADD FOREIGN KEY ([id_usuario]) REFERENCES [Usuario] ([id])
GO

ALTER TABLE [Movimiento] ADD FOREIGN KEY ([id_tipo_accion]) REFERENCES [TipoAccion] ([id])
GO

ALTER TABLE [MovimientoLinea] ADD FOREIGN KEY ([id_movimiento]) REFERENCES [Movimiento] ([id])
GO

ALTER TABLE [MovimientoLinea] ADD FOREIGN KEY ([id_almacen_origen]) REFERENCES [Almacen] ([id])
GO

ALTER TABLE [MovimientoLinea] ADD FOREIGN KEY ([id_almacen_destino]) REFERENCES [Almacen] ([id])
GO

ALTER TABLE [MovimientoLinea] ADD FOREIGN KEY ([id_lote]) REFERENCES [Lote] ([id])
GO

ALTER TABLE [Compra] ADD FOREIGN KEY ([id_movimiento]) REFERENCES [Movimiento] ([id])
GO

ALTER TABLE [Compra] ADD FOREIGN KEY ([id_proveedor]) REFERENCES [Proveedor] ([id])
GO

ALTER TABLE [Venta] ADD FOREIGN KEY ([id_movimiento]) REFERENCES [Movimiento] ([id])
GO

ALTER TABLE [Venta] ADD FOREIGN KEY ([id_cliente]) REFERENCES [Cliente] ([id])
GO
-- Usuario
INSERT INTO Usuario (nombre, clave, dni, fecha_nacimiento) VALUES ('mauricio', 'clave123', '12345678', '1990-01-01');
INSERT INTO Usuario (nombre, clave, dni, fecha_nacimiento) VALUES ('leandro', 'clave456', '87654321', '1992-05-10');
INSERT INTO Usuario (nombre, clave, dni, fecha_nacimiento) VALUES ('michael', 'clave789', '11223344', '1988-12-20');
select * from Usuario
-- TipoAccion
INSERT INTO TipoAccion (nombre) VALUES ('Abastecimiento');
INSERT INTO TipoAccion (nombre) VALUES ('Movimientos');
INSERT INTO TipoAccion (nombre) VALUES ('Ajustes');
select * from TipoAccion
-- Almacen
INSERT INTO Almacen (nombre, direccion, telefono) VALUES ('Almacen Central', 'Av. Principal 123', '999888777');
INSERT INTO Almacen (nombre, direccion, telefono) VALUES ('Almacen Secundario', 'Calle Secundaria 456', '888777666');
INSERT INTO Almacen (nombre, direccion, telefono) VALUES ('Almacen Norte', 'Av. Norte 789', '777666555');
select * from Almacen
-- Marca
INSERT INTO Marca (nombre, estado) VALUES ('AMD', 1);
INSERT INTO Marca (nombre, estado) VALUES ('NVIDIA', 1);
INSERT INTO Marca (nombre, estado) VALUES ('Intel', 1);
select * from Marca
-- Proveedor
INSERT INTO Proveedor (nombre, ruc, telefono) VALUES ('Proveedor Uno', '20123456789', '999111222');
INSERT INTO Proveedor (nombre, ruc, telefono) VALUES ('Proveedor Dos', '20234567890', '888222333');
INSERT INTO Proveedor (nombre, ruc, telefono) VALUES ('Proveedor Tres', '20345678901', '777333444');
select * from Proveedor
-- Cliente
INSERT INTO Cliente (nombre, ruc, telefono) VALUES ('Cliente Uno', '10456789012', '999444555');
INSERT INTO Cliente (nombre, ruc, telefono) VALUES ('Cliente Dos', '10567890123', '888555666');
INSERT INTO Cliente (nombre, ruc, telefono) VALUES ('Cliente Tres', '10678901234', '777666777');
select * from Cliente
-- Producto (relacionados a tecnologías)
INSERT INTO Producto (nombre, id_marca) VALUES ('Procesador Ryzen 7', 1);   -- AMD
INSERT INTO Producto (nombre, id_marca) VALUES ('GPU RTX 3080', 2);         -- NVIDIA
INSERT INTO Producto (nombre, id_marca) VALUES ('Procesador Core i7', 3);   -- Intel
select * from Producto
-- Revisando los IDs generados
SELECT IDENT_CURRENT('Lote') AS UltimoIDLote;
SELECT IDENT_CURRENT('Movimiento') AS UltimoIDmovimiento;
SELECT IDENT_CURRENT('MovimientoLinea') AS UltimoIDmovimientoLinea;

-- Movimiento (Abastecimiento)
INSERT INTO Movimiento (fecha, id_usuario, id_tipo_accion, referencia, comentario, created_at)
VALUES ('2024-06-01', 1, 1, 'REF001', 'Compra inicial', GETDATE());
select * from Movimiento

-- Compra
INSERT INTO Compra (id_usuario, id_movimiento, id_proveedor, fecha)
VALUES (1, 1, 1, '2024-06-01');
select * from Compra

-- Lote
INSERT INTO Lote (id_producto, id_compra, cantidad, precio_unit, fecha_expiracion) VALUES (1, 1, '10', 1200.00, '2026-12-31');
INSERT INTO Lote (id_producto, id_compra, cantidad, precio_unit, fecha_expiracion) VALUES (2, 1, '15', 2500.00, '2027-06-30');
INSERT INTO Lote (id_producto, id_compra, cantidad, precio_unit, fecha_expiracion) VALUES (3, 1, '8', 1100.00, '2026-09-15');
select * from Lote

-- MovimientoLinea (solo destino, origen NULL)
INSERT INTO MovimientoLinea (id_movimiento, id_almacen_origen, id_almacen_destino, id_lote, cantidad_delta)
VALUES (1, NULL, 1, 1, 10);
INSERT INTO MovimientoLinea (id_movimiento, id_almacen_origen, id_almacen_destino, id_lote, cantidad_delta)
VALUES (1, NULL, 1, 2, 15);
INSERT INTO MovimientoLinea (id_movimiento, id_almacen_origen, id_almacen_destino, id_lote, cantidad_delta)
VALUES (1, NULL, 1, 3, 8);

insert into Contenido_Almacen (id_almacen, id_lote, stock) VALUES (1, 1, 10);
insert into Contenido_Almacen (id_almacen, id_lote, stock) VALUES (1, 2, 15);
insert into Contenido_Almacen (id_almacen, id_lote, stock) VALUES (1, 3, 8);
select * from MovimientoLinea



