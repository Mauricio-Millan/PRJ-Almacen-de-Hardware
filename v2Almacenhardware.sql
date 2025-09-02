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
  [cantidad_delta] decimal NOT NULL
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


-- Acciones realizadas por un usuario
CREATE PROCEDURE ConsultarAccionesPorUsuario
  @id_usuario INT
AS
BEGIN
  SELECT m.id, m.fecha, ta.nombre AS tipo_accion, m.referencia, m.comentario, u.nombre AS usuario_nombre
  FROM Movimiento m
  INNER JOIN TipoAccion ta ON m.id_tipo_accion = ta.id
  INNER JOIN Usuario u ON m.id_usuario = u.id
  WHERE m.id_usuario = @id_usuario
END
GO
exec ConsultarAccionesPorUsuario 1
-- Acciones relacionadas a un lote o producto específico
CREATE PROCEDURE ConsultarAccionesPorLoteOProducto
  @id_lote INT = NULL,
  @id_producto INT = NULL
AS
BEGIN
  SELECT ml.id, m.fecha, ta.nombre AS tipo_accion, ml.id_lote,alm.nombre as Ubicado , p.nombre as Producto, m.referencia, m.comentario, u.nombre AS usuario_nombre
  FROM MovimientoLinea ml
  INNER JOIN Movimiento m ON ml.id_movimiento = m.id
  INNER JOIN TipoAccion ta ON m.id_tipo_accion = ta.id
  INNER JOIN Lote l ON ml.id_lote = l.id
  INNER JOIN Usuario u ON m.id_usuario = u.id
  Inner Join Almacen alm on ml.id_almacen_destino=alm.id
  Inner Join Producto p on l.id_producto=p.id
  WHERE (@id_lote IS NULL OR ml.id_lote = @id_lote)
    AND (@id_producto IS NULL OR l.id_producto = @id_producto)
END
GO
exec ConsultarAccionesPorLoteOProducto 1, null

CREATE OR ALTER PROCEDURE InsertarMovimientoLoteEntreSedes
  @id_usuario INT,
  @id_almacen_origen INT,
  @id_almacen_destino INT,
  @id_lote INT,
  @cantidad_delta DECIMAL,
  @referencia NVARCHAR(255) = NULL,
  @comentario NVARCHAR(255) = NULL
AS
BEGIN
  SET NOCOUNT ON;
  BEGIN TRANSACTION;

  DECLARE @id_movimiento INT;
  DECLARE @stock_origen DECIMAL;
  DECLARE @stock_destino DECIMAL;

  -- Verificar stock en almacén origen
  SELECT @stock_origen = stock
  FROM Contenido_Almacen
  WHERE id_almacen = @id_almacen_origen AND id_lote = @id_lote;

  IF @stock_origen IS NULL OR @stock_origen < @cantidad_delta
  BEGIN
    RAISERROR('Stock insuficiente en almacén de origen.', 16, 1);
    ROLLBACK;
    RETURN;
  END

  -- Verificar si ya existe registro en almacén destino
  SELECT @stock_destino = stock
  FROM Contenido_Almacen
  WHERE id_almacen = @id_almacen_destino AND id_lote = @id_lote;

  -- Generar movimiento de tipo "Movimientos" (id_tipo_accion = 2)
  INSERT INTO Movimiento (fecha, id_usuario, id_tipo_accion, referencia, comentario, created_at)
  VALUES (GETDATE(), @id_usuario, 2, @referencia, @comentario, GETDATE());

  SET @id_movimiento = SCOPE_IDENTITY();

  -- Insertar registro en MovimientoLinea
  INSERT INTO MovimientoLinea (id_movimiento, id_almacen_origen, id_almacen_destino, id_lote, cantidad_delta)
  VALUES (@id_movimiento, @id_almacen_origen, @id_almacen_destino, @id_lote, @cantidad_delta);

  -- Actualizar stock en almacén origen
  UPDATE Contenido_Almacen
  SET stock = stock - @cantidad_delta
  WHERE id_almacen = @id_almacen_origen AND id_lote = @id_lote;

  -- Actualizar o insertar stock en almacén destino
  IF @stock_destino IS NULL
  BEGIN
    -- No existe el registro en el almacén destino, se crea
    INSERT INTO Contenido_Almacen (id_almacen, id_lote, stock)
    VALUES (@id_almacen_destino, @id_lote, @cantidad_delta);
  END
  ELSE
  BEGIN
    -- Ya existe registro en el almacén destino, se actualiza
    UPDATE Contenido_Almacen
    SET stock = stock + @cantidad_delta
    WHERE id_almacen = @id_almacen_destino AND id_lote = @id_lote;
  END

  COMMIT TRANSACTION;
END
GO

EXEC InsertarMovimientoLoteEntreSedes 1,1,2,1,9,'Traslado001',
'Traslado de 9 unidades del lote 1 del Almacen Central al Almacen Secundario';


-- Primer procedimiento: Crear compra y devolver ID
CREATE OR ALTER PROCEDURE GenerarCompra
  @id_usuario INT,
  @id_proveedor INT,
  @fecha DATE,
  @referencia NVARCHAR(255),
  @comentario NVARCHAR(255),
  @id_compra INT OUTPUT
AS
BEGIN
  SET NOCOUNT ON;
  BEGIN TRANSACTION;

  DECLARE @id_movimiento INT;

  -- 1. Insertar movimiento de abastecimiento
  INSERT INTO Movimiento (fecha, id_usuario, id_tipo_accion, referencia, comentario, created_at)
  VALUES (@fecha, @id_usuario, 1, @referencia, @comentario, GETDATE());

  SET @id_movimiento = SCOPE_IDENTITY();

  -- 2. Insertar compra
  INSERT INTO Compra (id_usuario, id_movimiento, id_proveedor, fecha)
  VALUES (@id_usuario, @id_movimiento, @id_proveedor, @fecha);

  SET @id_compra = SCOPE_IDENTITY();

  COMMIT TRANSACTION;
END
GO

-- Segundo procedimiento: Insertar un lote individual
CREATE OR ALTER PROCEDURE InsertarLoteCompra
  @id_compra INT,
  @id_producto INT,
  @cantidad VARCHAR(255),
  @precio_unit DECIMAL,
  @fecha_expiracion DATE,
  @id_almacen_destino INT
AS
BEGIN
  SET NOCOUNT ON;
  BEGIN TRANSACTION;

  DECLARE @id_lote INT;
  DECLARE @id_movimiento INT;
  DECLARE @cantidad_decimal DECIMAL;

  -- Convertir cantidad a decimal para operaciones
  SET @cantidad_decimal = CAST(@cantidad AS DECIMAL);

  -- Obtener el id_movimiento asociado a la compra
  SELECT @id_movimiento = id_movimiento FROM Compra WHERE id = @id_compra;

  -- Insertar el lote
  INSERT INTO Lote (id_producto, id_compra, cantidad, precio_unit, fecha_expiracion)
  VALUES (@id_producto, @id_compra, @cantidad, @precio_unit, @fecha_expiracion);

  SET @id_lote = SCOPE_IDENTITY();

  -- Insertar registro en MovimientoLinea (abastecimiento)
  -- En abastecimiento, el origen es NULL porque viene de proveedor externo
  INSERT INTO MovimientoLinea (id_movimiento, id_almacen_origen, id_almacen_destino, id_lote, cantidad_delta)
  VALUES (@id_movimiento, NULL, @id_almacen_destino, @id_lote, @cantidad_decimal);

  -- Verificar si ya existe registro en Contenido_Almacen
  DECLARE @stock_existente DECIMAL;

  SELECT @stock_existente = stock
  FROM Contenido_Almacen
  WHERE id_almacen = @id_almacen_destino AND id_lote = @id_lote;

  IF @stock_existente IS NULL
  BEGIN
    -- Insertar nuevo registro en Contenido_Almacen
    INSERT INTO Contenido_Almacen (id_almacen, id_lote, stock)
    VALUES (@id_almacen_destino, @id_lote, @cantidad_decimal);
  END
  ELSE
  BEGIN
    -- Actualizar stock existente
    UPDATE Contenido_Almacen
    SET stock = stock + @cantidad_decimal
    WHERE id_almacen = @id_almacen_destino AND id_lote = @id_lote;
  END
  COMMIT TRANSACTION;
END
GO

-- Procedimiento principal: Registrar compra con múltiples lotes
CREATE OR ALTER PROCEDURE RegistrarCompraMultiplesLotes
  @id_usuario INT,
  @id_proveedor INT,
  @fecha DATE,
  @referencia NVARCHAR(255),
  @comentario NVARCHAR(255),
  @id_almacen_destino INT,
  @LotesJSON NVARCHAR(MAX)  -- Usar JSON en lugar de TABLE
AS
BEGIN
  SET NOCOUNT ON;

  DECLARE @id_compra INT;
  DECLARE @ErrorMessage NVARCHAR(4000);

  BEGIN TRY
    -- 1. Ejecutar el primer procedimiento para generar la compra
    EXEC GenerarCompra
      @id_usuario = @id_usuario,
      @id_proveedor = @id_proveedor,
      @fecha = @fecha,
      @referencia = @referencia,
      @comentario = @comentario,
      @id_compra = @id_compra OUTPUT;

    -- 2. Crear una tabla temporal con los datos del JSON
    DECLARE @TempLotes TABLE (
      id INT IDENTITY(1,1),
      id_producto INT,
      cantidad VARCHAR(255),
      precio_unit DECIMAL,
      fecha_expiracion DATE
    );

    -- Insertar los lotes desde el JSON a la tabla temporal
    INSERT INTO @TempLotes (id_producto, cantidad, precio_unit, fecha_expiracion)
    SELECT
      JSON_VALUE(lote.value, '$.id_producto'),
      JSON_VALUE(lote.value, '$.cantidad'),
      JSON_VALUE(lote.value, '$.precio_unit'),
      JSON_VALUE(lote.value, '$.fecha_expiracion')
    FROM OPENJSON(@LotesJSON) AS lote;

    -- 3. Iterar sobre cada lote y ejecutar el segundo procedimiento
    DECLARE @contador INT = 1;
    DECLARE @total_lotes INT = (SELECT COUNT(*) FROM @TempLotes);

    WHILE @contador <= @total_lotes
    BEGIN
      DECLARE @id_producto INT, @cantidad VARCHAR(255), @precio_unit DECIMAL, @fecha_expiracion DATE;

      -- Obtener los datos del lote actual
      SELECT
        @id_producto = id_producto,
        @cantidad = cantidad,
        @precio_unit = precio_unit,
        @fecha_expiracion = fecha_expiracion
      FROM @TempLotes
      WHERE id = @contador;

      -- Ejecutar el procedimiento para insertar el lote
      EXEC InsertarLoteCompra
        @id_compra = @id_compra,
        @id_producto = @id_producto,
        @cantidad = @cantidad,
        @precio_unit = @precio_unit,
        @fecha_expiracion = @fecha_expiracion,
        @id_almacen_destino = @id_almacen_destino;

      SET @contador = @contador + 1;
    END

    -- Retornar el ID de la compra creada para referencia
    SELECT @id_compra AS id_compra_generada;

  END TRY
  BEGIN CATCH
    SET @ErrorMessage = ERROR_MESSAGE();
    RAISERROR('Error al registrar la compra: %s', 16, 1, @ErrorMessage);
  END CATCH
END
GO

DECLARE @LotesJSON NVARCHAR(MAX) = '[
    {"id_producto": 1, "cantidad": "10", "precio_unit": 1200.00, "fecha_expiracion": "2026-12-31"},
    {"id_producto": 2, "cantidad": "15", "precio_unit": 2500.00, "fecha_expiracion": "2027-06-30"},
    {"id_producto": 3, "cantidad": "8", "precio_unit": 1100.00, "fecha_expiracion": "2026-09-15"}
]';
EXEC RegistrarCompraMultiplesLotes
  @id_usuario = 1,
  @id_proveedor = 1,
  @fecha = '2024-06-15',
  @referencia = 'COMPRA-002',
  @comentario = 'Abastecimiento mensual',
  @id_almacen_destino = 1,
  @LotesJSON = @LotesJSON;

-- Procedimiento para obtener el historial de movimientos de un lote específico
CREATE OR ALTER PROCEDURE ObtenerHistorialMovimientosLote
    @id_lote INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Información principal del lote
    SELECT
        l.id AS id_lote,
        p.nombre AS producto,
        p.id AS id_producto,
        m.nombre AS marca,
        l.precio_unit,
        l.fecha_expiracion,
        l.cantidad AS cantidad_original,
        c.id AS id_compra,
        c.fecha AS fecha_compra,
        pr.nombre AS proveedor
    FROM
        Lote l
        INNER JOIN Producto p ON l.id_producto = p.id
        INNER JOIN Compra c ON l.id_compra = c.id
        INNER JOIN Proveedor pr ON c.id_proveedor = pr.id
        LEFT JOIN Marca m ON p.id_marca = m.id
    WHERE
        l.id = @id_lote;

    -- Historial cronológico detallado de todos los movimientos del lote
    SELECT
        ROW_NUMBER() OVER (ORDER BY m.fecha, ml.id) AS secuencia,
        ml.id AS id_movimiento_linea,
        m.id AS id_movimiento,
        m.fecha AS fecha_movimiento,
        ta.nombre AS tipo_accion,
        ta.id AS id_tipo_accion,
        u.nombre AS usuario,
        u.id AS id_usuario,
        ml.cantidad_delta AS cantidad_movida,
        a_origen.nombre AS almacen_origen,
        a_origen.id AS id_almacen_origen,
        a_destino.nombre AS almacen_destino,
        a_destino.id AS id_almacen_destino,
        CASE
            WHEN ta.id = 1 THEN 'Entrada inicial' -- Abastecimiento
            WHEN ta.id = 2 AND a_origen.id IS NOT NULL AND a_destino.id IS NOT NULL THEN 'Traslado entre almacenes'
            WHEN ta.id = 2 AND a_origen.id IS NULL THEN 'Entrada'
            WHEN ta.id = 2 AND a_destino.id IS NULL THEN 'Salida'
            WHEN ta.id = 3 THEN 'Ajuste de inventario'
            ELSE 'Otro'
        END AS tipo_movimiento,
        m.referencia,
        m.comentario,
        m.created_at AS fecha_registro
    FROM
        MovimientoLinea ml
        INNER JOIN Movimiento m ON ml.id_movimiento = m.id
        INNER JOIN Usuario u ON m.id_usuario = u.id
        INNER JOIN TipoAccion ta ON m.id_tipo_accion = ta.id
        LEFT JOIN Almacen a_origen ON ml.id_almacen_origen = a_origen.id
        LEFT JOIN Almacen a_destino ON ml.id_almacen_destino = a_destino.id
    WHERE
        ml.id_lote = @id_lote
    ORDER BY
        m.fecha, ml.id;

    -- Ubicación actual de TODAS las unidades del lote (incluso stock cero)
    SELECT
        a.id AS id_almacen,
        a.nombre AS almacen,
        COALESCE(ca.stock, 0) AS stock_actual,
        COALESCE(ca.stock, 0) * l.precio_unit AS valor_total,
        CASE
            WHEN ca.id IS NULL THEN 'Sin stock'
            WHEN ca.stock = 0 THEN 'Sin stock'
            ELSE 'Con stock'
        END AS estado_stock
    FROM
        Almacen a
        CROSS JOIN Lote l
        LEFT JOIN Contenido_Almacen ca ON a.id = ca.id_almacen AND l.id = ca.id_lote
    WHERE
        l.id = @id_lote
    ORDER BY
        stock_actual DESC, a.nombre;

    -- Balance de movimientos (para verificación) - Mejorado para considerar todos los tipos de movimientos
    WITH Movimientos AS (
        -- Abastecimientos (compras): siempre positivos
        SELECT
            ml.cantidad_delta AS cantidad,
            'Entrada' AS tipo
        FROM
            MovimientoLinea ml
            INNER JOIN Movimiento m ON ml.id_movimiento = m.id
        WHERE
            ml.id_lote = @id_lote
            AND m.id_tipo_accion = 1 -- Abastecimiento

        UNION ALL

        -- Traslados entre almacenes: no afectan el balance total
        SELECT
            0 AS cantidad, -- No afecta el balance total
            'Traslado' AS tipo
        FROM
            MovimientoLinea ml
            INNER JOIN Movimiento m ON ml.id_movimiento = m.id
        WHERE
            ml.id_lote = @id_lote
            AND m.id_tipo_accion = 2 -- Movimientos
            AND ml.id_almacen_origen IS NOT NULL
            AND ml.id_almacen_destino IS NOT NULL

        UNION ALL

        -- Salidas (ventas): siempre negativas
        SELECT
            ml.cantidad_delta AS cantidad, -- Ya es negativo
            'Salida' AS tipo
        FROM
            MovimientoLinea ml
            INNER JOIN Movimiento m ON ml.id_movimiento = m.id
        WHERE
            ml.id_lote = @id_lote
            AND m.id_tipo_accion = 2 -- Movimientos
            AND ml.id_almacen_destino IS NULL

        UNION ALL

        -- Ajustes: pueden ser positivos o negativos
        SELECT
            ml.cantidad_delta AS cantidad,
            'Ajuste' AS tipo
        FROM
            MovimientoLinea ml
            INNER JOIN Movimiento m ON ml.id_movimiento = m.id
        WHERE
            ml.id_lote = @id_lote
            AND m.id_tipo_accion = 3 -- Ajustes
    ),
    Resumen AS (
        SELECT
            SUM(CASE WHEN tipo = 'Entrada' THEN cantidad ELSE 0 END) AS total_entradas,
            SUM(CASE WHEN tipo = 'Salida' THEN ABS(cantidad) ELSE 0 END) AS total_salidas,
            SUM(CASE WHEN tipo = 'Ajuste' THEN cantidad ELSE 0 END) AS total_ajustes
        FROM
            Movimientos
    ),
    StockActual AS (
        SELECT COALESCE(SUM(stock), 0) AS stock_total
        FROM Contenido_Almacen
        WHERE id_lote = @id_lote
    )
    SELECT
        r.total_entradas,
        r.total_salidas,
        r.total_ajustes,
        sa.stock_total AS stock_actual,
        (r.total_entradas - r.total_salidas + r.total_ajustes) AS balance_calculado,
        CASE
            WHEN (r.total_entradas - r.total_salidas + r.total_ajustes) = sa.stock_total
            THEN 'Correcto'
            ELSE 'Discrepancia'
        END AS estado_balance
    FROM
        Resumen r
        CROSS JOIN StockActual sa;
END
GO

EXEC ObtenerHistorialMovimientosLote @id_lote = 1;

-- Procedimiento para realizar ajustes de inventario
CREATE OR ALTER PROCEDURE RealizarAjusteInventario
    @id_usuario INT,
    @id_lote INT,
    @id_almacen INT,
    @cantidad_delta DECIMAL,
    @referencia NVARCHAR(255) = NULL,
    @comentario NVARCHAR(255) = NULL,
    @id_movimiento_generado INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        DECLARE @stock_actual DECIMAL;
        DECLARE @id_movimiento INT;

        -- Verificar que el lote existe
        IF NOT EXISTS (SELECT 1 FROM Lote WHERE id = @id_lote)
        BEGIN
            RAISERROR('El lote especificado no existe.', 16, 1);
            ROLLBACK;
            RETURN;
        END

        -- Verificar que el almacén existe
        IF NOT EXISTS (SELECT 1 FROM Almacen WHERE id = @id_almacen)
        BEGIN
            RAISERROR('El almacén especificado no existe.', 16, 1);
            ROLLBACK;
            RETURN;
        END

        -- Obtener stock actual
        SELECT @stock_actual = ISNULL(stock, 0)
        FROM Contenido_Almacen
        WHERE id_lote = @id_lote AND id_almacen = @id_almacen;

        -- Verificar que el ajuste no resulte en stock negativo
        IF (@stock_actual + @cantidad_delta) < 0
        BEGIN
            RAISERROR('El ajuste no puede resultar en un stock negativo.', 16, 1);
            ROLLBACK;
            RETURN;
        END

        -- 1. Crear el movimiento principal (tipo_accion = 3 para Ajustes)
        INSERT INTO Movimiento (fecha, id_usuario, id_tipo_accion, referencia, comentario, created_at)
        VALUES (GETDATE(), @id_usuario, 3, @referencia, @comentario, GETDATE());

        SET @id_movimiento = SCOPE_IDENTITY();
        SET @id_movimiento_generado = @id_movimiento;

        -- 2. Crear la línea de movimiento
        -- Para ajustes, no se usa origen ni destino, solo se afecta el stock
        INSERT INTO MovimientoLinea (id_movimiento, id_almacen_origen, id_almacen_destino, id_lote, cantidad_delta)
        VALUES (@id_movimiento, @id_almacen, NULL, @id_lote, @cantidad_delta);

        -- 3. Actualizar el stock en Contenido_Almacen
        IF @stock_actual = 0 AND NOT EXISTS (SELECT 1 FROM Contenido_Almacen WHERE id_lote = @id_lote AND id_almacen = @id_almacen)
        BEGIN
            -- Si no existe el registro y el ajuste es positivo, crear nuevo registro
            IF @cantidad_delta > 0
            BEGIN
                INSERT INTO Contenido_Almacen (id_almacen, id_lote, stock)
                VALUES (@id_almacen, @id_lote, @cantidad_delta);
            END
            -- Si el ajuste es 0 o negativo, no tiene sentido crear un registro
        END
        ELSE
        BEGIN
            -- Actualizar el stock existente
            UPDATE Contenido_Almacen
            SET stock = stock + @cantidad_delta
            WHERE id_lote = @id_lote AND id_almacen = @id_almacen;

            -- Si el stock resultante es 0, considerar eliminación del registro
            IF (SELECT stock FROM Contenido_Almacen WHERE id_lote = @id_lote AND id_almacen = @id_almacen) = 0
            BEGIN
                DELETE FROM Contenido_Almacen
                WHERE id_lote = @id_lote AND id_almacen = @id_almacen;
            END
        END

        COMMIT TRANSACTION;

        -- Retornar información del ajuste realizado
        SELECT
            m.id AS id_movimiento,
            ml.id AS id_movimiento_linea,
            l.id AS id_lote,
            p.nombre AS producto,
            a.nombre AS almacen,
            ml.cantidad_delta AS cantidad_ajustada,
            @stock_actual AS stock_anterior,
            (@stock_actual + @cantidad_delta) AS stock_nuevo,
            m.fecha AS fecha_ajuste,
            u.nombre AS usuario,
            m.referencia,
            m.comentario
        FROM
            Movimiento m
            INNER JOIN MovimientoLinea ml ON m.id = ml.id_movimiento
            INNER JOIN Lote l ON ml.id_lote = l.id
            INNER JOIN Producto p ON l.id_producto = p.id
            INNER JOIN Almacen a ON ml.id_almacen_origen = a.id
            INNER JOIN Usuario u ON m.id_usuario = u.id
        WHERE
            m.id = @id_movimiento;

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        DECLARE @ErrorState INT = ERROR_STATE();

        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END
GO

DECLARE @id_movimiento_salida INT;
exec RealizarAjusteInventario @id_usuario = 1,@id_lote = 1,@id_almacen=1,@cantidad_delta=-1,
@referencia='AJUSTE-001',@comentario='Ajuste por inventario físico: mercancía vencida',
@id_movimiento_generado=@id_movimiento_salida OUTPUT

-- Para aumentar stock (ajuste positivo)
EXEC RealizarAjusteInventario
    @id_usuario = 1,
    @id_lote = 1,
    @id_almacen = 1,
    @cantidad_delta = 5,
    @referencia = 'AJUSTE-001',
    @comentario = 'Ajuste por inventario físico: mercancía encontrada',
    @id_movimiento_generado = @id_movimiento_salida OUTPUT;

DECLARE @id_movimiento_salida INT;
-- Para reducir stock (ajuste negativo)
EXEC RealizarAjusteInventario
    @id_usuario = 1,
    @id_lote = 1,
    @id_almacen = 2,
    @cantidad_delta = -3,
    @referencia = 'AJUSTE-003',
    @comentario = 'Ajuste por mermas',
    @id_movimiento_generado = @id_movimiento_salida OUTPUT;

SELECT @id_movimiento_salida AS 'ID del Movimiento Generado';

CREATE OR ALTER PROCEDURE ListarHistorialCompletoLote
    @id_lote INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Información principal del lote
    SELECT
        l.id AS ID_Lote,
        p.nombre AS Producto,
        m.nombre AS Marca,
        l.precio_unit AS Precio_Unitario,
        l.cantidad AS Cantidad_Original,
        l.fecha_expiracion AS Fecha_Expiracion,
        c.fecha AS Fecha_Compra,
        pr.nombre AS Proveedor
    FROM
        Lote l
        INNER JOIN Producto p ON l.id_producto = p.id
        LEFT JOIN Marca m ON p.id_marca = m.id
        INNER JOIN Compra c ON l.id_compra = c.id
        INNER JOIN Proveedor pr ON c.id_proveedor = pr.id
    WHERE
        l.id = @id_lote;

    -- Historial cronológico de todos los movimientos
    SELECT
        ROW_NUMBER() OVER (ORDER BY m.fecha, ml.id) AS Secuencia,
        CONVERT(VARCHAR(10), m.fecha, 103) + ' ' + CONVERT(VARCHAR(8), m.fecha, 108) AS Fecha_Hora,
        ta.nombre AS Tipo_Accion,
        CASE
            WHEN ta.id = 1 THEN 'Entrada inicial'
            WHEN ta.id = 2 AND a_origen.id IS NOT NULL AND a_destino.id IS NOT NULL THEN 'Traslado entre almacenes'
            WHEN ta.id = 2 AND a_origen.id IS NULL THEN 'Entrada'
            WHEN ta.id = 2 AND a_destino.id IS NULL THEN 'Salida'
            WHEN ta.id = 3 THEN 'Ajuste de inventario'
            ELSE 'Otro'
        END AS Tipo_Movimiento,
        u.nombre AS Usuario,
        a_origen.nombre AS Almacen_Origen,
        a_destino.nombre AS Almacen_Destino,
        ml.cantidad_delta AS Cantidad_Movida,
        m.referencia AS Referencia,
        m.comentario AS Comentario
    FROM
        MovimientoLinea ml
        INNER JOIN Movimiento m ON ml.id_movimiento = m.id
        INNER JOIN Usuario u ON m.id_usuario = u.id
        INNER JOIN TipoAccion ta ON m.id_tipo_accion = ta.id
        LEFT JOIN Almacen a_origen ON ml.id_almacen_origen = a_origen.id
        LEFT JOIN Almacen a_destino ON ml.id_almacen_destino = a_destino.id
    WHERE
        ml.id_lote = @id_lote
    ORDER BY
        m.fecha, ml.id;

    -- Ubicación actual del lote
    SELECT
        a.nombre AS Almacen,
        COALESCE(ca.stock, 0) AS Stock_Actual,
        COALESCE(ca.stock, 0) * l.precio_unit AS Valor_Total,
        CASE
            WHEN ca.stock > 0 THEN 'Con stock'
            ELSE 'Sin stock'
        END AS Estado
    FROM
        Almacen a
        CROSS JOIN Lote l
        LEFT JOIN Contenido_Almacen ca ON a.id = ca.id_almacen AND l.id = ca.id_lote
    WHERE
        l.id = @id_lote
    ORDER BY
        ca.stock DESC, a.nombre;

    -- Resumen de movimientos por tipo
    SELECT
        SUM(CASE WHEN ta.id = 1 OR (ta.id = 2 AND ml.id_almacen_origen IS NULL) THEN ml.cantidad_delta ELSE 0 END) AS Total_Entradas,
        ABS(SUM(CASE WHEN ta.id = 2 AND ml.id_almacen_destino IS NULL THEN ml.cantidad_delta ELSE 0 END)) AS Total_Salidas,
        SUM(CASE WHEN ta.id = 3 THEN ml.cantidad_delta ELSE 0 END) AS Total_Ajustes,
        (SELECT COALESCE(SUM(stock), 0) FROM Contenido_Almacen WHERE id_lote = @id_lote) AS Stock_Actual_Total
    FROM
        MovimientoLinea ml
        INNER JOIN Movimiento m ON ml.id_movimiento = m.id
        INNER JOIN TipoAccion ta ON m.id_tipo_accion = ta.id
    WHERE
        ml.id_lote = @id_lote;
END
GO

exec ListarHistorialCompletoLote @id_lote = 1;
select * from Lote
select * from MovimientoLinea
select * from Compra
select * from Movimiento