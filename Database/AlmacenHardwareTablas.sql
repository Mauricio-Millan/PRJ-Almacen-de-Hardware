use master
go
DROP DATABASE IF EXISTS DBRESTALMACEN
go

CREATE DATABASE DBRESTALMACEN
GO
use DBRESTALMACEN
GO

-- drop table Usuario,TipoAccion,Almacen,Marca,Proveedor,Cliente,Producto,Lote,Contenido_Almacen,Movimiento,MovimientoLinea,Compra,Venta

--- Aprobado en 99% por docente
--- 14/10/2025
--- configurar procedimientos almacenados
--- Ceacion de tabla role

CREATE TABLE [Roles] (
  [id] int PRIMARY KEY IDENTITY(1, 1),
  [nombre] varchar(100) NOT NULL unique,
  [estado] bit default 1
)
GO

CREATE TABLE [Usuario] (
  [id] int PRIMARY KEY IDENTITY(1, 1),
  [nombre] varchar(255) NOT NULL unique ,
  [clave] varchar(200),
  [dni] char (8) Not null unique,
  [fecha_nacimiento] date,
  [id_rol] int NOT NULL,
  [estado] bit default 1,
  FOREIGN KEY (id_rol) REFERENCES Roles(id)
)
GO

CREATE TABLE [TipoAccion] (
  [id] int PRIMARY KEY IDENTITY(1, 1),
  [nombre] varchar(120) NOT NULL
)
GO
CREATE TABLE [Almacen] (
  [id] int PRIMARY KEY IDENTITY(1, 1),
  [nombre] varchar(255) NOT NULL,
  [direccion] varchar(255),
  [telefono] varchar (13),
[estado] bit default 1)
GO

CREATE TABLE [Marca] (
  [id] int PRIMARY KEY IDENTITY(1, 1),
  [nombre] varchar(255),
  [estado] bit default 1
)
GO

CREATE TABLE [Proveedor] (
  [id] int PRIMARY KEY IDENTITY(1, 1),
  [nombre] varchar(255),
  [ruc] char(11) Not null unique,
  [telefono] varchar(13),
    [estado] bit default 1
)
GO

CREATE TABLE [Cliente] (
  [id] int PRIMARY KEY IDENTITY(1, 1),
  [nombre] varchar(255),
  [ruc] char(11) Not null unique,
  [telefono] varchar(13),
  [estado] bit default 1
)
GO

CREATE TABLE [Producto] (
  [id] int PRIMARY KEY IDENTITY(1, 1),
  [nombre] varchar(255) NOT NULL,
  [id_marca] int,
  [estado] bit default 1
)
GO

CREATE TABLE [Lote] (
  [id] int PRIMARY KEY IDENTITY(1, 1),
  [id_producto] int NOT NULL,
  [id_compra] int NOT NULL,
  [cantidad] int NOT NULL,
  [precio_unit] decimal,
  [fecha_expiracion] date,
  [estado] bit default 1
)
GO

CREATE TABLE [ContenidoAlmacen] (
  [id] int PRIMARY KEY IDENTITY(1, 1),
  [id_almacen] int NOT NULL,
  [id_lote] int NOT NULL,
  [stock] int NOT NULL DEFAULT (0)
)
GO

CREATE TABLE [Movimiento] (
  [id] int PRIMARY KEY IDENTITY(1, 1),
  [fecha] datetime NOT NULL,
  [id_usuario] int NOT NULL,
  [id_tipo_accion] int NOT NULL,
  [referencia] varchar(255),
  [comentario] varchar(255),
  [created_at] datetime NOT NULL DEFAULT GETDATE(),
  [estado] bit default 1
)
GO

CREATE TABLE [MovimientoLinea] (
  [id] int PRIMARY KEY IDENTITY(1, 1),
  [id_movimiento] int NOT NULL,
  [id_almacen_origen] int,
  [id_almacen_destino] int,
  [id_lote] int NOT NULL,
  [cantidad_delta] int NOT NULL,
  [Precio_Venta]  decimal NULL
)
GO


CREATE TABLE [Compra] (
  [id] int PRIMARY KEY IDENTITY(1, 1),
  [id_usuario] int,
  [id_movimiento] int,
  [id_proveedor] int,
  [fecha] DATETIMEOFFSET,
  [estado] bit default 1
)
GO

CREATE TABLE [Venta] (
  [id] int PRIMARY KEY IDENTITY(1, 1),
  [id_usuario] int,
  [id_movimiento] int,
  [id_cliente] int,
  [fecha] date,
  [estado] bit default 1
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

ALTER TABLE [ContenidoAlmacen] ADD FOREIGN KEY ([id_almacen]) REFERENCES [Almacen] ([id])
GO

ALTER TABLE [ContenidoAlmacen] ADD FOREIGN KEY ([id_lote]) REFERENCES [Lote] ([id])
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

-- Roles
INSERT INTO Roles (nombre) VALUES ('admin');
INSERT INTO Roles (nombre) VALUES ('user');
GO
select * from Roles
-- TipoAccion
INSERT INTO TipoAccion (nombre) VALUES ('Abastecimiento');
INSERT INTO TipoAccion (nombre) VALUES ('Movimientos');
INSERT INTO TipoAccion (nombre) VALUES ('Ajustes');
INSERT INTO TipoAccion (nombre) VALUES ('Ventas');
GO
select * from TipoAccion

-- Bloquea modificaciones en TipoAccion
GO
CREATE OR ALTER TRIGGER TR_BloquearAlteracionTipoAccion
ON TipoAccion
INSTEAD OF INSERT, UPDATE, DELETE
AS
BEGIN
    RAISERROR('No se permite modificar la tabla TipoAccion.', 16, 1);
    ROLLBACK TRANSACTION;
END
GO

-- Impide modificar o eliminar datos en Roles
CREATE OR ALTER TRIGGER TR_BloquearModifElimRoles
ON Roles
INSTEAD OF UPDATE, DELETE
AS
BEGIN
    RAISERROR('No se permite modificar ni eliminar datos de la tabla Roles.', 16, 1);
    ROLLBACK TRANSACTION;
END
GO

---Creacion de Triggers para bloquear modificaciones directas y controlar stock
CREATE OR ALTER TRIGGER TR_BloquearModificacionDirectaContenidoAlmacen
ON ContenidoAlmacen
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    -- Permitir si la variable de contexto está establecida (operación autorizada)
    IF CONTEXT_INFO() IS NULL
    BEGIN
        RAISERROR('No se permite modificar Contenido_Almacen directamente. Use los procedimientos de movimiento.', 16, 1);
        ROLLBACK TRANSACTION;
    END
END
GO



--Trigger para controlar el movimiento y actualizacion de stock en los almacenes
CREATE OR ALTER TRIGGER TR_ValidarYActualizarStock
ON MovimientoLinea
INSTEAD OF INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    -- Validar stock suficiente para movimientos, ajustes negativos y ventas
    IF EXISTS (
        SELECT 1
        FROM inserted i
        INNER JOIN Movimiento m ON i.id_movimiento = m.id
        WHERE i.id_almacen_origen IS NOT NULL
          AND m.id_tipo_accion IN (2, 3, 4)
          AND i.cantidad_delta > ISNULL((
                SELECT ca.stock
                FROM ContenidoAlmacen ca
                WHERE ca.id_almacen = i.id_almacen_origen
                  AND ca.id_lote = i.id_lote
            ), 0)
    )
    BEGIN
        RAISERROR('La cantidad a mover supera el stock disponible en el almacén origen.', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END

    -- Validar que los ajustes positivos no superen la cantidad del lote
    IF EXISTS (
        SELECT 1
        FROM inserted i
        INNER JOIN Movimiento m ON i.id_movimiento = m.id
        INNER JOIN Lote l ON i.id_lote = l.id
        INNER JOIN ContenidoAlmacen ca ON ca.id_lote = i.id_lote AND ca.id_almacen = i.id_almacen_destino
        WHERE m.id_tipo_accion = 3
          AND i.id_almacen_destino IS NOT NULL
          AND i.cantidad_delta > 0
          AND (ca.stock + i.cantidad_delta) > l.cantidad
    )
    BEGIN
        RAISERROR('El ajuste positivo no puede superar la cantidad total establecida en el lote.', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END

    -- Establecer CONTEXT_INFO para autorizar la modificación
    DECLARE @context VARBINARY(128) = 0xA1A2A3A4;
    SET CONTEXT_INFO @context;

    -- Insertar la línea de movimiento
    INSERT INTO MovimientoLinea (id_movimiento, id_almacen_origen, id_almacen_destino, id_lote, cantidad_delta, Precio_Venta)
    SELECT id_movimiento, id_almacen_origen, id_almacen_destino, id_lote, cantidad_delta, Precio_Venta
    FROM inserted;

    -- Abastecimiento: crear o actualizar stock en el almacén destino
    -- Si el lote ya existe en el almacén, se acumula el stock
    MERGE INTO ContenidoAlmacen AS target
    USING (
        SELECT i.id_almacen_destino, i.id_lote, i.cantidad_delta
        FROM inserted i
        INNER JOIN Movimiento m ON i.id_movimiento = m.id
        WHERE m.id_tipo_accion = 1
          AND i.id_almacen_destino IS NOT NULL
    ) AS source
    ON (target.id_almacen = source.id_almacen_destino AND target.id_lote = source.id_lote)
    WHEN MATCHED THEN
        UPDATE SET target.stock = target.stock + source.cantidad_delta
    WHEN NOT MATCHED THEN
        INSERT (id_almacen, id_lote, stock)
        VALUES (source.id_almacen_destino, source.id_lote, source.cantidad_delta);

    -- Actualizar stock en almacén de origen para movimientos, ajustes y ventas
    UPDATE ca
    SET ca.stock = ca.stock - i.cantidad_delta
    FROM ContenidoAlmacen ca
    INNER JOIN inserted i ON ca.id_almacen = i.id_almacen_origen AND ca.id_lote = i.id_lote
    INNER JOIN Movimiento m ON i.id_movimiento = m.id
    WHERE i.id_almacen_origen IS NOT NULL
      AND m.id_tipo_accion IN (2, 3, 4);

    -- Movimientos: gestionar destino
    MERGE INTO ContenidoAlmacen AS target
    USING (
        SELECT i.id_almacen_destino, i.id_lote, i.cantidad_delta
        FROM inserted i
        INNER JOIN Movimiento m ON i.id_movimiento = m.id
        WHERE m.id_tipo_accion = 2
          AND i.id_almacen_destino IS NOT NULL
    ) AS source
    ON (target.id_almacen = source.id_almacen_destino AND target.id_lote = source.id_lote)
    WHEN MATCHED THEN
        UPDATE SET target.stock = target.stock + source.cantidad_delta
    WHEN NOT MATCHED THEN
        INSERT (id_almacen, id_lote, stock)
        VALUES (source.id_almacen_destino, source.id_lote, source.cantidad_delta);

    -- Ajustes positivos: actualizar destino
    MERGE INTO ContenidoAlmacen AS target
    USING (
        SELECT i.id_almacen_destino, i.id_lote, i.cantidad_delta
        FROM inserted i
        INNER JOIN Movimiento m ON i.id_movimiento = m.id
        WHERE m.id_tipo_accion = 3
          AND i.id_almacen_destino IS NOT NULL
          AND i.cantidad_delta > 0
    ) AS source
    ON (target.id_almacen = source.id_almacen_destino AND target.id_lote = source.id_lote)
    WHEN MATCHED THEN
        UPDATE SET target.stock = target.stock + source.cantidad_delta
    WHEN NOT MATCHED THEN
        INSERT (id_almacen, id_lote, stock)
        VALUES (source.id_almacen_destino, source.id_lote, source.cantidad_delta);

    -- Limpiar CONTEXT_INFO
    SET CONTEXT_INFO 0x0;
END
GO


SELECT *
FROM sys.triggers;
GO
SELECT * FROM Roles
-- Usuario
INSERT INTO Usuario (nombre, clave, dni, fecha_nacimiento, id_rol) VALUES ('mauricio', 'clave123', '12345678', '1990-01-01',1);
INSERT INTO Usuario (nombre, clave, dni, fecha_nacimiento, id_rol) VALUES ('leandro', 'clave456', '87654321', '1992-05-10',2);
INSERT INTO Usuario (nombre, clave, dni, fecha_nacimiento, id_rol) VALUES ('michael', 'clave789', '11223344', '1988-12-20',2);
select * from Usuario
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

select * from Movimiento
select * from MovimientoLinea
select * from ContenidoAlmacen

-- SELECT COLUMN_NAME
-- FROM INFORMATION_SCHEMA.COLUMNS
-- WHERE TABLE_NAME = 'MovimientoLinea'

--- Primera prueba con Stock suficiente
INSERT INTO Movimiento (fecha, id_usuario, id_tipo_accion, referencia, comentario, created_at)
VALUES (GETDATE(), 1, 2, 'TRF001', 'Traslado válido', GETDATE());
INSERT INTO MovimientoLinea (id_movimiento, id_almacen_origen, id_almacen_destino, id_lote, cantidad_delta)
VALUES (2, 1, 2, 1, 5);
--- Revision de stock de almacen origen y destino
SELECT * FROM ContenidoAlmacen WHERE id_almacen IN (1, 2) AND id_lote = 1;
--- Segunda Prueba con Stock insuficiente
INSERT INTO Movimiento (fecha, id_usuario, id_tipo_accion, referencia, comentario, created_at)
VALUES (GETDATE(), 1, 2, 'TRF002', 'Traslado inválido', GETDATE());

INSERT INTO MovimientoLinea (id_movimiento, id_almacen_origen, id_almacen_destino, id_lote, cantidad_delta)
VALUES (3, 1, 2, 1, 20);
--- Revision de stock de almacen origen y destino
SELECT * FROM ContenidoAlmacen WHERE id_almacen IN (1, 2) AND id_lote = 1;
--- Tercera Prueba de Venta con Stock suficiente
INSERT INTO Movimiento (fecha, id_usuario, id_tipo_accion, referencia, comentario, created_at)
VALUES (GETDATE(), 1, 4, 'VENTA001', 'Venta exacta', GETDATE());

INSERT INTO MovimientoLinea (id_movimiento, id_almacen_origen, id_almacen_destino, id_lote, cantidad_delta, Precio_Venta)
VALUES (4, 1, NULL, 3, 8, 1500.00);
--- Revision de stock de almacen origen y destino
SELECT * FROM ContenidoAlmacen WHERE id_almacen IN (1) AND id_lote = 10;

