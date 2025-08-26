DROP DATABASE IF EXISTS DBRESTALMACEN
CREATE DATABASE DBRESTALMACEN
use DBRESTALMACEN
GO
--- Aprobado en 90% por docente
--- configurar procedimientos almacenados

CREATE TABLE [Usuario] (
  [id] int PRIMARY KEY IDENTITY(1, 1),
  [nombre] nvarchar(255) NOT NULL,
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
  [numero] nvarchar(255) NOT NULL,
  [cantidad] nvarchar(255),
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
  [id_almacen_destino] int NOT NULL,
  [id_lote] int NOT NULL,
  [cantidad_delta] decimal NOT NULL
)
GO

CREATE TABLE [Compra] (
  [id] int PRIMARY KEY IDENTITY(1, 1),
  [id_movimiento] int,
  [id_proveedor] int,
  [fecha] date
)
GO

CREATE TABLE [Venta] (
  [id] int PRIMARY KEY IDENTITY(1, 1),
  [id_movimiento] int,
  [id_cliente] int,
  [fecha] date
)
GO

ALTER TABLE [Lote] ADD FOREIGN KEY ([id_compra]) REFERENCES [Compra] ([id])
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
