-- use master
USE DBRESTALMACEN
GO


-- Primer procedimiento: Crear compra y devolver ID
CREATE OR ALTER PROCEDURE PA_GenerarCompra
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
CREATE OR ALTER PROCEDURE PA_InsertarLoteCompra
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
CREATE OR ALTER PROCEDURE PA_RegistrarCompraMultiplesLotes
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
    EXEC PA_GenerarCompra
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
      EXEC PA_InsertarLoteCompra
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


CREATE OR ALTER PROCEDURE PA_InsertarMovimientoLoteEntreSedes
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



-- Procedimiento para realizar ajustes de inventario
CREATE OR ALTER PROCEDURE PA_RealizarAjusteInventario
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

        -- Verificar que el ajuste negativo no exceda el stock actual
        IF @cantidad_delta < 0 AND ABS(@cantidad_delta) > @stock_actual
        BEGIN
            DECLARE @stock_mensaje NVARCHAR(50) = CAST(@stock_actual AS NVARCHAR(50));
            RAISERROR('El ajuste negativo no puede exceder el stock actual (%s).', 16, 1, @stock_mensaje);
            ROLLBACK;
            RETURN;
        END

        -- 1. Crear el movimiento principal (tipo_accion = 3 para Ajustes)
        INSERT INTO Movimiento (fecha, id_usuario, id_tipo_accion, referencia, comentario, created_at)
        VALUES (GETDATE(), @id_usuario, 3, @referencia, @comentario, GETDATE());
        SET @id_movimiento = SCOPE_IDENTITY();
        SET @id_movimiento_generado = @id_movimiento;

        -- 2. Crear la línea de movimiento
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

            -- Ya no eliminamos los registros con stock 0 para mantener trazabilidad
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


--prueba de abastecimiento


DECLARE @LotesJSON NVARCHAR(MAX) = '[
    {"id_producto": 1, "cantidad": "30", "precio_unit": 1200.00, "fecha_expiracion": "2026-12-31"},
    {"id_producto": 2, "cantidad": "40", "precio_unit": 2500.00, "fecha_expiracion": "2027-06-30"},
    {"id_producto": 3, "cantidad": "20", "precio_unit": 1100.00, "fecha_expiracion": "2026-09-15"}
]';
EXEC PA_RegistrarCompraMultiplesLotes
  @id_usuario = 1,
  @id_proveedor = 1,
  @fecha = '2024-06-15',
  @referencia = 'COMPRA-002',
  @comentario = 'Abastecimiento mensual',
  @id_almacen_destino = 1,
  @LotesJSON = @LotesJSON;


EXEC PA_InsertarMovimientoLoteEntreSedes 1,1,2,6,14,'Traslado003',
'Traslado de 14 unidades del lote 6 del Almacen Central al Almacen Secundario';

DECLARE @id_movimiento_salida INT;
-- AJUSTE NEGATIVO
exec PA_RealizarAjusteInventario @id_usuario = 1,@id_lote = 1,@id_almacen=1,@cantidad_delta=-1,
@referencia='AJUSTE-001',@comentario='Ajuste por inventario físico: mercancía vencida',
@id_movimiento_generado=@id_movimiento_salida OUTPUT

-- Para aumentar stock (ajuste positivo)
DECLARE @id_movimiento_salida INT;
EXEC PA_RealizarAjusteInventario
    @id_usuario = 1,
    @id_lote = 1,
    @id_almacen = 1,
    @cantidad_delta = 3,
    @referencia = 'AJUSTE-001',
    @comentario = 'Ajuste por inventario físico: mercancía encontrada',
    @id_movimiento_generado = @id_movimiento_salida OUTPUT;
-- Para reducir stock (ajuste negativo)
DECLARE @id_movimiento_salida INT;
EXEC PA_RealizarAjusteInventario
    @id_usuario = 1,
    @id_lote = 1,
    @id_almacen = 1,
    @cantidad_delta = -3,
    @referencia = 'AJUSTE-003',
    @comentario = 'Ajuste por mermas',
    @id_movimiento_generado = @id_movimiento_salida OUTPUT;

