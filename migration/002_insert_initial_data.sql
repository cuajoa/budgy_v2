-- Migration 002: Insertar datos iniciales
-- Descripción: Inserta tipos de gasto y centros de costo iniciales

-- Insertar tipos de gasto iniciales
INSERT INTO expense_types (name, description) VALUES
    ('Licencias', 'Gastos relacionados con licencias de software'),
    ('Staff Augmentation', 'Gastos de personal externo'),
    ('Proyecto', 'Gastos relacionados con proyectos específicos'),
    ('Infraestructura', 'Gastos de infraestructura y servidores')
ON CONFLICT (name) DO NOTHING;

-- Nota: Los centros de costo y compañías se crearán a través de la aplicación
-- ya que son específicos de cada implementación

