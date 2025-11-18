USE DBRESTALMACEN
GO
-- ejecutar despues de crear tablas y triggers

-- =============================================
-- Procedimiento: PA_ConsultarContenidoAlmacenDetallado
-- Descripción: Consulta el contenido de un almacén específico
-- Parámetros:
--   @id_almacen: ID del almacén a consultar (obligatorio)
--   @nombre_producto: Nombre o parte del nombre del producto a filtrar (opcional)
-- =============================================
CREATE OR ALTER PROCEDURE PA_ConsultarContenidoAlmacenDetallado
    @id_almacen INT,
    @nombre_producto VARCHAR(255) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- Validar que el almacén exista
    IF NOT EXISTS (SELECT 1 FROM Almacen WHERE id = @id_almacen)
    BEGIN
        RAISERROR('El almacén con ID %d no existe.', 16, 1, @id_almacen);
        RETURN;
    END

    -- Información del almacén
    SELECT
        a.id AS ID_Almacen,
        a.nombre AS Nombre_Almacen,
        a.direccion AS Direccion,
        a.telefono AS Telefono
    FROM Almacen a
    WHERE a.id = @id_almacen;

    -- Contenido del almacén con filtro opcional por producto
    SELECT
        ca.id AS ID_ContenidoAlmacen,
        p.id AS ID_Producto,
        p.nombre AS Nombre_Producto,
        m.nombre AS Marca,
        l.id AS Numero_Lote,
        l.precio_unit AS Precio_Unitario,
        CONVERT(VARCHAR(10), l.fecha_expiracion, 103) AS Fecha_Expiracion,
        l.cantidad AS Cantidad_Lote,
        ca.stock AS Stock_Actual,
        CASE
            WHEN ca.stock = 0 THEN 'Sin Stock'
            WHEN ca.stock < (l.cantidad * 0.2) THEN 'Stock Bajo'
            ELSE 'Stock Normal'
        END AS Estado_Stock
    FROM
        ContenidoAlmacen ca
        INNER JOIN Lote l ON ca.id_lote = l.id
        INNER JOIN Producto p ON l.id_producto = p.id
        LEFT JOIN Marca m ON p.id_marca = m.id
    WHERE
        ca.id_almacen = @id_almacen
        AND (@nombre_producto IS NULL OR p.nombre LIKE '%' + @nombre_producto + '%')
        AND p.estado = 1
        AND l.estado = 1
    ORDER BY
        p.nombre, l.id;

    -- Resumen del almacén
    SELECT
        COUNT(DISTINCT p.id) AS Total_Productos_Distintos,
        COUNT(DISTINCT l.id) AS Total_Lotes,
        SUM(ca.stock) AS Total_Unidades,
        SUM(ca.stock * l.precio_unit) AS Valor_Total_Inventario,
        SUM(CASE WHEN ca.stock = 0 THEN 1 ELSE 0 END) AS Lotes_Sin_Stock,
        SUM(CASE WHEN ca.stock > 0 THEN 1 ELSE 0 END) AS Lotes_Con_Stock
    FROM
        ContenidoAlmacen ca
        INNER JOIN Lote l ON ca.id_lote = l.id
        INNER JOIN Producto p ON l.id_producto = p.id
    WHERE
        ca.id_almacen = @id_almacen
        AND (@nombre_producto IS NULL OR p.nombre LIKE '%' + @nombre_producto + '%')
        AND p.estado = 1
        AND l.estado = 1;
END
GO

-- Ver todo el contenido del almacén 1
EXEC PA_ConsultarContenidoAlmacenDetallado @id_almacen = 1;

-- Ver solo productos que contengan "Procesador" en el almacén 1
EXEC PA_ConsultarContenidoAlmacenDetallado
    @id_almacen = 1,
    @nombre_producto = 'Procesador';

-- Ver productos que contengan "RTX" en el almacén 1
EXEC PA_ConsultarContenidoAlmacenDetallado
    @id_almacen = 1,
    @nombre_producto = 'RTX';

-- Ver productos que contengan "RTX" en el almacén 2
EXEC PA_ConsultarContenidoAlmacenDetallado
    @id_almacen = 1,
    @nombre_producto = 'RTX';

-- =============================================
-- Procedimiento: PA_ObtenerLineaTiempoUsuario
-- Descripción: Recupera todas las acciones realizadas por un usuario específico
-- Parámetros:
--   @id_usuario: ID del usuario a consultar (obligatorio)
--   @fecha_desde: Fecha inicial del rango de búsqueda (opcional)
--   @fecha_hasta: Fecha final del rango de búsqueda (opcional)
--   @id_tipo_accion: ID del tipo de acción a filtrar (opcional, NULL = todos)
-- =============================================
CREATE OR ALTER PROCEDURE PA_ObtenerLineaTiempoUsuario
    @id_usuario INT,
    @fecha_desde DATETIME = NULL,
    @fecha_hasta DATETIME = NULL,
    @id_tipo_accion INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- Validar que el usuario exista
    IF NOT EXISTS (SELECT 1 FROM Usuario WHERE id = @id_usuario)
    BEGIN
        RAISERROR('El usuario con ID %d no existe.', 16, 1, @id_usuario);
        RETURN;
    END

    -- Establecer fechas por defecto si no se proporcionan
    IF @fecha_desde IS NULL
        SET @fecha_desde = '1900-01-01';

    IF @fecha_hasta IS NULL
        SET @fecha_hasta = GETDATE();

    -- Información del usuario
    SELECT
        u.id AS ID_Usuario,
        u.nombre AS Nombre_Usuario,
        u.dni AS DNI,
        r.nombre AS Rol
    FROM Usuario u
    INNER JOIN Roles r ON u.id_rol = r.id
    WHERE u.id = @id_usuario;

    -- Línea de tiempo de acciones del usuario
    SELECT
        m.id AS ID_Movimiento,
        CONVERT(VARCHAR(10), m.fecha, 103) + ' ' + CONVERT(VARCHAR(8), m.fecha, 108) AS Fecha_Hora,
        ta.id AS ID_Tipo_Accion,
        ta.nombre AS Tipo_Accion,
        m.referencia AS Referencia,
        m.comentario AS Comentario,
        -- Detalles de las líneas de movimiento
        ml.id AS ID_Movimiento_Linea,
        ml.cantidad_delta AS Cantidad,
        ml.Precio_Venta AS Precio_Venta,
        -- Información del lote y producto
        l.id AS ID_Lote,
        p.id AS ID_Producto,
        p.nombre AS Nombre_Producto,
        ma.nombre AS Marca,
        l.precio_unit AS Precio_Unitario_Lote,
        -- Almacenes involucrados
        ao.id AS ID_Almacen_Origen,
        ao.nombre AS Almacen_Origen,
        ad.id AS ID_Almacen_Destino,
        ad.nombre AS Almacen_Destino,
        -- Descripción de la acción
        CASE
            WHEN ta.id = 1 THEN
                'Abastecimiento de ' + CAST(ml.cantidad_delta AS VARCHAR) + ' unidades de ' + p.nombre +
                ' al ' + ISNULL(ad.nombre, 'N/A')
            WHEN ta.id = 2 THEN
                'Traslado de ' + CAST(ml.cantidad_delta AS VARCHAR) + ' unidades de ' + p.nombre +
                ' desde ' + ISNULL(ao.nombre, 'N/A') + ' hacia ' + ISNULL(ad.nombre, 'N/A')
            WHEN ta.id = 3 AND ml.cantidad_delta > 0 THEN
                'Ajuste positivo de ' + CAST(ml.cantidad_delta AS VARCHAR) + ' unidades de ' + p.nombre +
                ' en ' + ISNULL(ad.nombre, 'N/A')
            WHEN ta.id = 3 AND ml.cantidad_delta < 0 THEN
                'Ajuste negativo de ' + CAST(ABS(ml.cantidad_delta) AS VARCHAR) + ' unidades de ' + p.nombre +
                ' en ' + ISNULL(ao.nombre, 'N/A')
            WHEN ta.id = 4 THEN
                'Venta de ' + CAST(ml.cantidad_delta AS VARCHAR) + ' unidades de ' + p.nombre +
                ' desde ' + ISNULL(ao.nombre, 'N/A') +
                CASE WHEN ml.Precio_Venta IS NOT NULL THEN ' por S/ ' + CAST(ml.Precio_Venta AS VARCHAR) ELSE '' END
            ELSE 'Acción desconocida'
        END AS Descripcion_Accion,
        -- Fecha de registro
        CONVERT(VARCHAR(10), m.created_at, 103) + ' ' + CONVERT(VARCHAR(8), m.created_at, 108) AS Fecha_Registro,
        -- Indicador de tipo de flujo
        CASE
            WHEN ta.id = 1 THEN 'Entrada'
            WHEN ta.id = 2 AND ml.id_almacen_origen IS NOT NULL AND ml.id_almacen_destino IS NOT NULL THEN 'Traslado'
            WHEN ta.id = 3 AND ml.cantidad_delta > 0 THEN 'Ajuste Positivo'
            WHEN ta.id = 3 AND ml.cantidad_delta < 0 THEN 'Ajuste Negativo'
            WHEN ta.id = 4 THEN 'Salida por Venta'
            ELSE 'Otro'
        END AS Tipo_Flujo
    FROM
        Movimiento m
        INNER JOIN TipoAccion ta ON m.id_tipo_accion = ta.id
        INNER JOIN MovimientoLinea ml ON m.id = ml.id_movimiento
        INNER JOIN Lote l ON ml.id_lote = l.id
        INNER JOIN Producto p ON l.id_producto = p.id
        LEFT JOIN Marca ma ON p.id_marca = ma.id
        LEFT JOIN Almacen ao ON ml.id_almacen_origen = ao.id
        LEFT JOIN Almacen ad ON ml.id_almacen_destino = ad.id
    WHERE
        m.id_usuario = @id_usuario
        AND m.fecha BETWEEN @fecha_desde AND @fecha_hasta
        AND (@id_tipo_accion IS NULL OR ta.id = @id_tipo_accion)
        AND m.estado = 1
    ORDER BY
        m.fecha DESC, m.id DESC, ml.id;

    -- Resumen de actividades del usuario
    SELECT
        COUNT(DISTINCT m.id) AS Total_Movimientos,
        SUM(CASE WHEN ta.id = 1 THEN 1 ELSE 0 END) AS Total_Abastecimientos,
        SUM(CASE WHEN ta.id = 2 THEN 1 ELSE 0 END) AS Total_Traslados,
        SUM(CASE WHEN ta.id = 3 THEN 1 ELSE 0 END) AS Total_Ajustes,
        SUM(CASE WHEN ta.id = 4 THEN 1 ELSE 0 END) AS Total_Ventas,
        SUM(CASE WHEN ta.id = 1 THEN ml.cantidad_delta ELSE 0 END) AS Total_Unidades_Abastecidas,
        SUM(CASE WHEN ta.id = 2 THEN ml.cantidad_delta ELSE 0 END) AS Total_Unidades_Trasladadas,
        SUM(CASE WHEN ta.id = 4 THEN ml.cantidad_delta ELSE 0 END) AS Total_Unidades_Vendidas,
        SUM(CASE WHEN ta.id = 4 AND ml.Precio_Venta IS NOT NULL THEN ml.cantidad_delta * ml.Precio_Venta ELSE 0 END) AS Total_Ingresos_Ventas,
        MIN(m.fecha) AS Primera_Accion,
        MAX(m.fecha) AS Ultima_Accion
    FROM
        Movimiento m
        INNER JOIN TipoAccion ta ON m.id_tipo_accion = ta.id
        INNER JOIN MovimientoLinea ml ON m.id = ml.id_movimiento
    WHERE
        m.id_usuario = @id_usuario
        AND m.fecha BETWEEN @fecha_desde AND @fecha_hasta
        AND (@id_tipo_accion IS NULL OR ta.id = @id_tipo_accion)
        AND m.estado = 1;

    -- Productos más manejados por el usuario
    SELECT TOP 10
        p.id AS ID_Producto,
        p.nombre AS Nombre_Producto,
        ma.nombre AS Marca,
        COUNT(*) AS Cantidad_Movimientos,
        SUM(ml.cantidad_delta) AS Total_Unidades_Manejadas
    FROM
        Movimiento m
        INNER JOIN MovimientoLinea ml ON m.id = ml.id_movimiento
        INNER JOIN Lote l ON ml.id_lote = l.id
        INNER JOIN Producto p ON l.id_producto = p.id
        LEFT JOIN Marca ma ON p.id_marca = ma.id
    WHERE
        m.id_usuario = @id_usuario
        AND m.fecha BETWEEN @fecha_desde AND @fecha_hasta
        AND (@id_tipo_accion IS NULL OR m.id_tipo_accion = @id_tipo_accion)
        AND m.estado = 1
    GROUP BY
        p.id, p.nombre, ma.nombre
    ORDER BY
        Total_Unidades_Manejadas DESC;

    -- Almacenes más utilizados por el usuario
    SELECT
        a.id AS ID_Almacen,
        a.nombre AS Nombre_Almacen,
        COUNT(*) AS Cantidad_Operaciones,
        SUM(CASE WHEN ml.id_almacen_origen = a.id THEN 1 ELSE 0 END) AS Operaciones_Como_Origen,
        SUM(CASE WHEN ml.id_almacen_destino = a.id THEN 1 ELSE 0 END) AS Operaciones_Como_Destino
    FROM
        Movimiento m
        INNER JOIN MovimientoLinea ml ON m.id = ml.id_movimiento
        INNER JOIN Almacen a ON (ml.id_almacen_origen = a.id OR ml.id_almacen_destino = a.id)
    WHERE
        m.id_usuario = @id_usuario
        AND m.fecha BETWEEN @fecha_desde AND @fecha_hasta
        AND (@id_tipo_accion IS NULL OR m.id_tipo_accion = @id_tipo_accion)
        AND m.estado = 1
    GROUP BY
        a.id, a.nombre
    ORDER BY
        Cantidad_Operaciones DESC;
END
GO
--siguiente sp

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
            LEFT JOIN ContenidoAlmacen ca ON a.id = ca.id_almacen AND l.id = ca.id_lote
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
            FROM ContenidoAlmacen
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



-- Ver todas las acciones del usuario 1
EXEC PA_ObtenerLineaTiempoUsuario @id_usuario = 1;

-- Ver solo las ventas del usuario 1
EXEC PA_ObtenerLineaTiempoUsuario
    @id_usuario = 1,
    @id_tipo_accion = 4;

-- Ver acciones del usuario 1 en un rango de fechas
EXEC PA_ObtenerLineaTiempoUsuario
    @id_usuario = 1,
    @fecha_desde = '2024-01-01',
    @fecha_hasta = '2024-12-31';

-- Ver solo traslados del usuario 2 en junio 2024
EXEC PA_ObtenerLineaTiempoUsuario
    @id_usuario = 2,
    @fecha_desde = '2024-06-01',
    @fecha_hasta = '2024-06-30',
    @id_tipo_accion = 2;


