-- Crear inicio de sesión (Login) en el servidor
CREATE LOGIN usuario_minuta
WITH PASSWORD = 'ContraseñaSegura@123';

-- Seleccionar la base de datos
USE Minuta_Logistico;
GO

-- Crear usuario dentro de la base de datos
CREATE USER usuario_minuta
FOR LOGIN usuario_minuta;
GO

-- Asignar permisos para crear tablas y procedimientos almacenados
ALTER ROLE db_ddladmin ADD MEMBER usuario_minuta;
GO

-- (Opcional) Permiso adicional para ejecutar procedimientos
GRANT EXECUTE TO usuario_minuta;
GO


SELECT name, type_desc, is_disabled
FROM sys.server_principals
WHERE name = 'usuario_minuta';