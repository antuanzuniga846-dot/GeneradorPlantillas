-- ============================================================
-- ESQUEMA COMPLETO Y SEGURO DE SUPABASE
-- ============================================================

-- 1. TABLA DE USUARIOS Y CONTRASEÑAS (CON ADICIÓN SEGURA DE COLUMNAS)
CREATE TABLE IF NOT EXISTS public.usuarios_permisos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario TEXT UNIQUE,
    nombre TEXT NOT NULL,
    password TEXT NOT NULL DEFAULT '123456',
    rol TEXT NOT NULL DEFAULT 'solicitante',
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.usuarios_permisos ADD COLUMN IF NOT EXISTS usuario TEXT;
ALTER TABLE public.usuarios_permisos ADD COLUMN IF NOT EXISTS password TEXT DEFAULT '123456';
ALTER TABLE public.usuarios_permisos ADD COLUMN IF NOT EXISTS rol TEXT DEFAULT 'solicitante';
ALTER TABLE public.usuarios_permisos ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT true;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'usuarios_permisos_usuario_key'
    ) THEN
        ALTER TABLE public.usuarios_permisos ADD CONSTRAINT usuarios_permisos_usuario_key UNIQUE (usuario);
    END IF;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE public.usuarios_permisos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acceso publico usuarios_permisos" ON public.usuarios_permisos;
CREATE POLICY "Acceso publico usuarios_permisos" ON public.usuarios_permisos FOR ALL USING (true) WITH CHECK (true);

-- 2. INSERTAR / ACTUALIZAR TODOS LOS USUARIOS CON SUS CONTRASEÑAS
INSERT INTO public.usuarios_permisos (usuario, nombre, password, rol, activo) VALUES
-- Editores y Administradores
('admin', 'Administrador', 'admin123', 'editor', true),
('cristofer.mora', 'Cristofer Mora', 'mora123', 'editor', true),
('cristofer', 'Cristofer Mora', 'mora123', 'editor', true),
('antuan', 'Antuan', 'antuan123', 'editor', true),
('adriel', 'Adriel', 'adriel123', 'editor', true),
('fabricio', 'Fabricio', 'fabricio123', 'editor', true),
('enoc', 'Enoc', 'enoc123', 'editor', true),

-- Agentes Solicitantes
('susan.badilla', 'Susan Badilla', 'badilla123', 'solicitante', true),
('kenneth.morera', 'Kenneth Morera', 'morera123', 'solicitante', true),
('sharon.barquero', 'Sharon Barquero', 'barquero123', 'solicitante', true),
('isaac.barrera', 'Isaac Barrera', 'barrera123', 'solicitante', true),
('joselyn.hidalgo', 'Joselyn Hidalgo', 'hidalgo123', 'solicitante', true),
('maria.chavarria', 'Maria Chavarria', 'chavarria123', 'solicitante', true),
('andrea.solis', 'Andrea Solis', 'solis123', 'solicitante', true),
('yesenia.benavides', 'Yesenia Benavides', 'benavides123', 'solicitante', true),
('michael.barrantes', 'Michael Barrantes', 'barrantes123', 'solicitante', true),
('farit.barrientos', 'Farit Barrientos', 'barrientos123', 'solicitante', true),
('alonso.marin', 'Alonso Marin', 'marin123', 'solicitante', true),
('fabiana.carrion', 'Fabiana Carrion', 'carrion123', 'solicitante', true),
('diana.obando', 'Diana Obando', 'obando123', 'solicitante', true),
('maria.camacho', 'Maria Camacho', 'camacho123', 'solicitante', true),
('joset.varela', 'Joset Varela', 'varela123', 'solicitante', true),
('jonathan.rodriguez', 'Jonathan Rodriguez', 'rodriguez123', 'solicitante', true),
('roberto.lopez', 'Roberto Lopez', 'lopez123', 'solicitante', true),
('laura.zuñiga', 'Laura Zuñiga', 'zuñiga123', 'solicitante', true),
('david.cordoba', 'David Cordoba', 'cordoba123', 'solicitante', true),
('yaslin.carmona', 'Yaslin Carmona', 'carmona123', 'solicitante', true),
('yulixa.ramirez', 'Yulixa Ramirez', 'ramirez123', 'solicitante', true),
('melany.iglesias', 'Melany Iglesias', 'iglesias123', 'solicitante', true),
('jorshan.jimenez', 'Jorshan Jimenez', 'jimenez123', 'solicitante', true),
('anthony.zapata', 'Anthony Zapata', 'zapata123', 'solicitante', true),
('olga.rodriguez', 'Olga Rodriguez', 'rodriguez123', 'solicitante', true),
('jazmin.jimenez', 'Jazmin Jimenez', 'jimenez123', 'solicitante', true),
('carlos.selva', 'Carlos Selva', 'selva123', 'solicitante', true),
('roberto.chacon', 'Roberto Chacon', 'chacon123', 'solicitante', true),
('luis.marin', 'Luis Marin', 'marin123', 'solicitante', true)

ON CONFLICT (usuario) DO UPDATE 
SET nombre = EXCLUDED.nombre, 
    password = EXCLUDED.password, 
    rol = EXCLUDED.rol, 
    activo = true;

-- 3. TABLA DE CONTROL DE LIMPIEZAS
CREATE TABLE IF NOT EXISTS public.control_limpiezas (
    id TEXT PRIMARY KEY,
    marca_temporal TEXT NOT NULL,
    monto TEXT NOT NULL,
    agente TEXT NOT NULL,
    cedula TEXT NOT NULL,
    cero_pagos BOOLEAN DEFAULT false,
    soporte TEXT DEFAULT '',
    categoria TEXT DEFAULT '',
    motivo TEXT DEFAULT '',
    en_proceso TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.control_limpiezas ADD COLUMN IF NOT EXISTS en_proceso TEXT DEFAULT '';
ALTER TABLE public.control_limpiezas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acceso publico control_limpiezas" ON public.control_limpiezas;
CREATE POLICY "Acceso publico control_limpiezas" ON public.control_limpiezas FOR ALL USING (true) WITH CHECK (true);

-- 4. HABILITACIÓN SEGURA DE REALTIME (IGNORA SI YA ESTÁ AGREGADO)
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.usuarios_permisos;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.control_limpiezas;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;
