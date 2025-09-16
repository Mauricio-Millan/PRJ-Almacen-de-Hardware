use master
USE DBRESTALMACEN
GO


-- Acciones realizadas por un usuario
CREATE OR ALTER PROCEDURE PA_ConsultarAccionesPorUsuario
  @id_usuario INT,
  @fecha_desde DATE = NULL,
  @fecha_hasta DATE = NULL,
  @id_tipo_accion INT = NULL,
  @limite_registros INT = 100
AS
BEGIN
  SET NOCOUNT ON;

  -- Validar parámetros
  SET @fecha_hasta = ISNULL(@fecha_hasta, GETDATE());

  IF @fecha_desde IS NULL
    SET @fecha_desde = DATEADD(MONTH, -1, @fecha_hasta); -- Por defecto, último mes

  -- Consulta principal
  SELECT TOP (@limite_registros)
    m.id AS ID_Movimiento,
    CONVERT(VARCHAR(10), m.fecha, 103) + ' ' + CONVERT(VARCHAR(8), m.fecha, 108) AS Fecha_Hora,
    ta.nombre AS Tipo_Accion,
    ta.id AS ID_Tipo_Accion,
    ISNULL(m.referencia, 'Sin referencia') AS Referencia,
    ISNULL(m.comentario, 'Sin comentario') AS Comentario,
    u.nombre AS Usuario,
    u.id AS ID_Usuario,
    -- Información resumida de los artículos afectados
    (SELECT COUNT(DISTINCT ml.id_lote) FROM MovimientoLinea ml WHERE ml.id_movimiento = m.id) AS Lotes_Afectados,
    (SELECT SUM(ABS(ml.cantidad_delta)) FROM MovimientoLinea ml WHERE ml.id_movimiento = m.id) AS Cantidad_Total,
    m.created_at AS Fecha_Registro
  FROM
    Movimiento m
    INNER JOIN TipoAccion ta ON m.id_tipo_accion = ta.id
    INNER JOIN Usuario u ON m.id_usuario = u.id
  WHERE
    m.id_usuario = @id_usuario
    AND m.fecha BETWEEN @fecha_desde AND @fecha_hasta
    AND (@id_tipo_accion IS NULL OR m.id_tipo_accion = @id_tipo_accion)
  ORDER BY
    m.fecha DESC, m.id DESC;
END
exec PA_ConsultarAccionesPorUsuario 1,'2024-01-01', '2026-01-01', null, 50



    -- Acciones relacionadas a un lote o producto específico
CREATE OR ALTER PROCEDURE PA_ConsultarAccionesPorLoteOProducto
  @id_lote INT = NULL,
  @id_producto INT = NULL
AS
BEGIN
  SELECT
    ml.id,
    m.fecha,
    ta.nombre AS tipo_accion,
    ml.id_lote,
    CASE
      WHEN ml.id_almacen_destino IS NOT NULL THEN alm_destino.nombre
      WHEN ml.id_almacen_origen IS NOT NULL THEN alm_origen.nombre + ' (Origen)'
      ELSE 'Sin ubicación'
    END AS Ubicado,
    CASE
      WHEN ml.id_almacen_origen IS NOT NULL AND ml.id_almacen_destino IS NOT NULL THEN 'Traslado: ' + alm_origen.nombre + ' → ' + alm_destino.nombre
      WHEN ml.id_almacen_origen IS NOT NULL AND ml.id_almacen_destino IS NULL THEN 'Salida desde ' + alm_origen.nombre
      WHEN ml.id_almacen_origen IS NULL AND ml.id_almacen_destino IS NOT NULL THEN 'Entrada a ' + alm_destino.nombre
      ELSE 'Otro'
    END AS Tipo_Movimiento,
    p.nombre as Producto,
    ml.cantidad_delta AS Cantidad,
    m.referencia,
    m.comentario,
    u.nombre AS usuario_nombre
  FROM MovimientoLinea ml
  INNER JOIN Movimiento m ON ml.id_movimiento = m.id
  INNER JOIN TipoAccion ta ON m.id_tipo_accion = ta.id
  INNER JOIN Lote l ON ml.id_lote = l.id
  INNER JOIN Usuario u ON m.id_usuario = u.id
  INNER JOIN Producto p ON l.id_producto = p.id
  LEFT JOIN Almacen alm_destino ON ml.id_almacen_destino = alm_destino.id
  LEFT JOIN Almacen alm_origen ON ml.id_almacen_origen = alm_origen.id
  WHERE (@id_lote IS NULL OR ml.id_lote = @id_lote)
    AND (@id_producto IS NULL OR l.id_producto = @id_producto)
  ORDER BY m.fecha DESC
END
GO
exec PA_ConsultarAccionesPorLoteOProducto 1, null


-- Procedimiento para obtener el historial de movimientos de un lote específico
CREATE OR ALTER PROCEDURE PA_ObtenerHistorialMovimientosLote
    @id_lote INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Validar si el lote existe
    IF NOT EXISTS (SELECT 1 FROM Lote WHERE id = @id_lote)
    BEGIN
        RAISERROR('El lote con ID %d no existe', 16, 1, @id_lote);
        RETURN;
    END

    BEGIN TRY
        BEGIN TRANSACTION;

        -- Información principal del lote
        SELECT
            l.id AS id_lote,
            p.nombre AS producto,
            p.id AS id_producto,
            m.nombre AS marca,
            l.precio_unit,
            l.fecha_expiracion,
            CONVERT(VARCHAR(10), l.fecha_expiracion, 103) AS fecha_expiracion_formato,
            l.cantidad AS cantidad_original,
            c.id AS id_compra,
            c.fecha AS fecha_compra,
            CONVERT(VARCHAR(10), c.fecha, 103) AS fecha_compra_formato,
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
            CONVERT(VARCHAR(10), m.fecha, 103) + ' ' + CONVERT(VARCHAR(8), m.fecha, 108) AS fecha_movimiento_formato,
            ta.nombre AS tipo_accion,
            ta.id AS id_tipo_accion,
            u.nombre AS usuario,
            u.id AS id_usuario,
            ml.cantidad_delta AS cantidad_movida,
            ml.cantidad_delta * CASE
                WHEN ta.id = 2 AND a_destino.id IS NULL THEN -1
                ELSE 1
            END AS cantidad_con_signo,
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
            m.created_at AS fecha_registro,
            CONVERT(VARCHAR(10), m.created_at, 103) + ' ' + CONVERT(VARCHAR(8), m.created_at, 108) AS fecha_registro_formato
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

        -- Balance de movimientos (para verificación) - Mejorado con una sola CTE más eficiente
        WITH Movimientos AS (
            SELECT
                ml.cantidad_delta AS cantidad,
                CASE
                    WHEN m.id_tipo_accion = 1 THEN 'Entrada'
                    WHEN m.id_tipo_accion = 2 AND ml.id_almacen_origen IS NOT NULL AND ml.id_almacen_destino IS NOT NULL THEN 'Traslado'
                    WHEN m.id_tipo_accion = 2 AND ml.id_almacen_destino IS NULL THEN 'Salida'
                    WHEN m.id_tipo_accion = 3 THEN 'Ajuste'
                    ELSE 'Otro'
                END AS tipo
            FROM
                MovimientoLinea ml
                INNER JOIN Movimiento m ON ml.id_movimiento = m.id
            WHERE
                ml.id_lote = @id_lote
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

        COMMIT TRANSACTION;
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

EXEC PA_ObtenerHistorialMovimientosLote @id_lote = 1;
CREATE OR ALTER PROCEDURE PA_RastrearMovimientosLoteEnAlmacen
    @id_lote INT,
    @id_almacen INT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM Lote WHERE id = @id_lote)
    BEGIN
        RAISERROR('El lote con ID %d no existe', 16, 1, @id_lote);
        RETURN;
    END

    IF NOT EXISTS (SELECT 1 FROM Almacen WHERE id = @id_almacen)
    BEGIN
        RAISERROR('El almacén con ID %d no existe', 16, 1, @id_almacen);
        RETURN;
    END

    CREATE TABLE #MovimientosAlmacen (
        ID_Movimiento INT,
        Fecha_Movimiento DATETIME,
        Tipo_Accion NVARCHAR(100),
        ID_Tipo_Accion INT,
        Usuario NVARCHAR(100),
        ID_Usuario INT,
        Cantidad DECIMAL(18,2),
        Tipo_Flujo NVARCHAR(50),
        Descripcion NVARCHAR(255),
        Referencia NVARCHAR(100),
        Comentario NVARCHAR(255),
        Fecha_Registro DATETIME
    );

    BEGIN TRY
        -- Información del lote y almacén
        SELECT
            l.id AS ID_Lote,
            p.nombre AS Producto,
            m.nombre AS Marca,
            l.precio_unit AS Precio_Unitario,
            CONVERT(VARCHAR(10), l.fecha_expiracion, 103) AS Fecha_Expiracion,
            a.id AS ID_Almacen,
            a.nombre AS Nombre_Almacen,
            COALESCE((SELECT stock FROM Contenido_Almacen WHERE id_lote = @id_lote AND id_almacen = @id_almacen), 0) AS Stock_Actual
        FROM
            Lote l
            INNER JOIN Producto p ON l.id_producto = p.id
            LEFT JOIN Marca m ON p.id_marca = m.id
            CROSS JOIN Almacen a
        WHERE
            l.id = @id_lote AND a.id = @id_almacen;

        -- Abastecimiento inicial (TipoAccion = 1)
        INSERT INTO #MovimientosAlmacen
        SELECT
            m.id,
            m.fecha,
            ta.nombre,
            ta.id,
            u.nombre,
            u.id,
            ml.cantidad_delta,
            'Abastecimiento',
            'Abastecimiento inicial',
            m.referencia,
            m.comentario,
            m.created_at
        FROM MovimientoLinea ml
        INNER JOIN Movimiento m ON ml.id_movimiento = m.id
        INNER JOIN TipoAccion ta ON m.id_tipo_accion = ta.id
        INNER JOIN Usuario u ON m.id_usuario = u.id
        WHERE ml.id_lote = @id_lote
          AND ml.id_almacen_destino = @id_almacen
          AND ta.id = 1;

        -- Entradas por movimiento (TipoAccion = 2, origen no nulo)
        INSERT INTO #MovimientosAlmacen
        SELECT
            m.id,
            m.fecha,
            ta.nombre,
            ta.id,
            u.nombre,
            u.id,
            ml.cantidad_delta,
            'Entrada por Movimiento',
            'Traslado desde ' + ISNULL(a_origen.nombre, 'N/A'),
            m.referencia,
            m.comentario,
            m.created_at
        FROM MovimientoLinea ml
        INNER JOIN Movimiento m ON ml.id_movimiento = m.id
        INNER JOIN TipoAccion ta ON m.id_tipo_accion = ta.id
        INNER JOIN Usuario u ON m.id_usuario = u.id
        LEFT JOIN Almacen a_origen ON ml.id_almacen_origen = a_origen.id
        WHERE ml.id_lote = @id_lote
          AND ml.id_almacen_destino = @id_almacen
          AND ta.id = 2
          AND ml.id_almacen_origen IS NOT NULL;

        -- Salidas por movimiento (TipoAccion = 2, destino no nulo)
        INSERT INTO #MovimientosAlmacen
        SELECT
            m.id,
            m.fecha,
            ta.nombre,
            ta.id,
            u.nombre,
            u.id,
            -1 * ml.cantidad_delta,
            'Salida por Movimiento',
            'Traslado hacia ' + ISNULL(a_destino.nombre, 'N/A'),
            m.referencia,
            m.comentario,
            m.created_at
        FROM MovimientoLinea ml
        INNER JOIN Movimiento m ON ml.id_movimiento = m.id
        INNER JOIN TipoAccion ta ON m.id_tipo_accion = ta.id
        INNER JOIN Usuario u ON m.id_usuario = u.id
        LEFT JOIN Almacen a_destino ON ml.id_almacen_destino = a_destino.id
        WHERE ml.id_lote = @id_lote
          AND ml.id_almacen_origen = @id_almacen
          AND ta.id = 2
          AND ml.id_almacen_destino IS NOT NULL;

        -- Salidas por venta (TipoAccion = 2, destino nulo)
        INSERT INTO #MovimientosAlmacen
        SELECT
            m.id,
            m.fecha,
            ta.nombre,
            ta.id,
            u.nombre,
            u.id,
            -1 * ml.cantidad_delta,
            'Salida por Venta',
            'Salida por venta o consumo',
            m.referencia,
            m.comentario,
            m.created_at
        FROM MovimientoLinea ml
        INNER JOIN Movimiento m ON ml.id_movimiento = m.id
        INNER JOIN TipoAccion ta ON m.id_tipo_accion = ta.id
        INNER JOIN Usuario u ON m.id_usuario = u.id
        WHERE ml.id_lote = @id_lote
          AND ml.id_almacen_origen = @id_almacen
          AND ta.id = 2
          AND ml.id_almacen_destino IS NULL;

        -- Ajustes
        INSERT INTO #MovimientosAlmacen
        SELECT
            m.id,
            m.fecha,
            ta.nombre,
            ta.id,
            u.nombre,
            u.id,
            ml.cantidad_delta,
            'Ajuste',
            CASE WHEN ml.cantidad_delta > 0 THEN 'Ajuste positivo de inventario' ELSE 'Ajuste negativo de inventario' END,
            m.referencia,
            m.comentario,
            m.created_at
        FROM MovimientoLinea ml
        INNER JOIN Movimiento m ON ml.id_movimiento = m.id
        INNER JOIN TipoAccion ta ON m.id_tipo_accion = ta.id
        INNER JOIN Usuario u ON m.id_usuario = u.id
        WHERE ml.id_lote = @id_lote
          AND ta.id = 3
          AND (
                (ml.id_almacen_origen = @id_almacen AND ml.id_almacen_destino IS NULL)
             OR (ml.id_almacen_origen IS NULL AND ml.id_almacen_destino = @id_almacen)
          );

        -- Resultado final ordenado cronológicamente y balance acumulado
        SELECT
            ROW_NUMBER() OVER(ORDER BY Fecha_Movimiento, ID_Movimiento) AS Secuencia,
            CONVERT(VARCHAR(10), Fecha_Movimiento, 103) + ' ' + CONVERT(VARCHAR(8), Fecha_Movimiento, 108) AS Fecha_Hora,
            Tipo_Accion,
            ID_Tipo_Accion,
            Tipo_Flujo,
            Descripcion,
            Usuario,
            ID_Usuario,
            Cantidad,
            CASE WHEN Tipo_Flujo IN ('Entrada por Movimiento') THEN Cantidad ELSE 0 END AS Entradas,
            CASE WHEN Tipo_Flujo IN ('Salida por Movimiento', 'Salida por Venta') THEN ABS(Cantidad) ELSE 0 END AS Salidas,
            Referencia,
            Comentario,
            CONVERT(VARCHAR(10), Fecha_Registro, 103) + ' ' + CONVERT(VARCHAR(8), Fecha_Registro, 108) AS Fecha_Registro_Formato,
            SUM(Cantidad) OVER(ORDER BY Fecha_Movimiento, ID_Movimiento ROWS UNBOUNDED PRECEDING) AS Balance_Acumulado
        FROM #MovimientosAlmacen
        ORDER BY Fecha_Movimiento, ID_Movimiento;

        -- Resumen de movimientos
        SELECT
            COUNT(*) AS Total_Movimientos,
            SUM(CASE WHEN Tipo_Flujo = 'Abastecimiento' THEN 1 ELSE 0 END) AS Cantidad_Abastecimiento,
            SUM(CASE WHEN Tipo_Flujo = 'Entrada por Movimiento' THEN 1 ELSE 0 END) AS Cantidad_Entradas,
            SUM(CASE WHEN Tipo_Flujo = 'Salida por Movimiento' THEN 1 ELSE 0 END) AS Cantidad_Salidas,
            SUM(CASE WHEN Tipo_Flujo = 'Salida por Venta' THEN 1 ELSE 0 END) AS Cantidad_Ventas,
            SUM(CASE WHEN Tipo_Flujo = 'Ajuste' THEN 1 ELSE 0 END) AS Cantidad_Ajustes,
            SUM(CASE WHEN Tipo_Flujo = 'Abastecimiento' THEN Cantidad ELSE 0 END) AS Total_Unidades_Abastecimiento,
            SUM(CASE WHEN Tipo_Flujo = 'Entrada por Movimiento' THEN Cantidad ELSE 0 END) AS Total_Unidades_Entrada,
            ABS(SUM(CASE WHEN Tipo_Flujo = 'Salida por Movimiento' THEN Cantidad ELSE 0 END)) AS Total_Unidades_Salida,
            ABS(SUM(CASE WHEN Tipo_Flujo = 'Salida por Venta' THEN Cantidad ELSE 0 END)) AS Total_Vendidos,
            SUM(CASE WHEN Tipo_Flujo = 'Ajuste' THEN Cantidad ELSE 0 END) AS Total_Unidades_Ajuste,
            SUM(Cantidad) AS Balance_Total,
            COALESCE((SELECT stock FROM Contenido_Almacen WHERE id_lote = @id_lote AND id_almacen = @id_almacen), 0) AS Stock_Actual,
            CASE
                WHEN SUM(Cantidad) = COALESCE((SELECT stock FROM Contenido_Almacen WHERE id_lote = @id_lote AND id_almacen = @id_almacen), 0)
                THEN 'Correcto'
                ELSE 'Discrepancia'
            END AS Estado_Balance
        FROM #MovimientosAlmacen;

        DROP TABLE #MovimientosAlmacen;
    END TRY
    BEGIN CATCH
        IF OBJECT_ID('tempdb..#MovimientosAlmacen') IS NOT NULL
            DROP TABLE #MovimientosAlmacen;

        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        DECLARE @ErrorState INT = ERROR_STATE();

        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END


CREATE OR ALTER PROCEDURE PA_ConsultarContenidoAlmacen
    @id_almacen INT
AS
BEGIN
    SELECT
        a.nombre AS nombre_almacen,
        p.nombre AS nombre_producto,
        l.id AS numero_lote,
        ca.stock AS cantidad_actual
    FROM
        Contenido_Almacen ca
        INNER JOIN Almacen a ON ca.id_almacen = a.id
        INNER JOIN Lote l ON ca.id_lote = l.id
        INNER JOIN Producto p ON l.id_producto = p.id
    WHERE
        a.id = @id_almacen
    ORDER BY
        l.id;
END


exec PA_ConsultarContenidoAlmacen 1
EXEC PA_RastrearMovimientosLoteEnAlmacen @id_lote = 1, @id_almacen = 1
exec PA_ObtenerHistorialMovimientosLote 1
EXEC PA_ConsultarAccionesPorUsuario 1, '2024-01-01', '2026-01-01', NULL, 50

select * from Producto