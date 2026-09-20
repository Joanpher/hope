-- =============================================================================
--  Fundación Esperanza — Datos de demostración
--  Archivo : migraciones/002_datos_demo.sql
--  Uso     : ejecutar DESPUÉS de 001_esquema_inicial.sql
--  Opcional: si prefieres arrancar con la base vacía, omite este archivo.
--
--  Equivale a `npx prisma db seed` (prisma/seed.ts), pero en SQL puro para
--  poder ejecutarlo directamente en el SQL Editor de Supabase.
--
--  Los hashes bcrypt incluidos son reales (12 rondas) y están verificados
--  contra bcryptjs, que es la librería que usa la app en src/auth.config.ts.
--
--  CREDENCIALES (solo desarrollo, cámbialas antes de producción):
--    ADMIN  admin@fundaciondemo.com        Admin@2026!
--    ADMIN  coordinador@fundaciondemo.com  Admin@2026!
--    USER   maria@demo.com                 User@2026!
--    USER   carlos@demo.com                User@2026!
--    USER   ana@demo.com                   User@2026!
--    USER   jose@demo.com                  User@2026!
--    USER   laura@demo.com                 User@2026!
-- =============================================================================

begin;

-- ─── Limpieza de datos (respeta el orden de las claves foráneas) ─────────────
truncate table
  public.aid_request_history,
  public.documents,
  public.notifications,
  public.password_reset_tokens,
  public.email_verification_tokens,
  public.contact_messages,
  public.aid_requests,
  public.users
restart identity cascade;


-- ─── Administradores ─────────────────────────────────────────────────────────
-- Dos cuentas ADMIN para poder probar el panel con más de un operador y ver
-- en la bitácora quién hizo cada cambio de estado.

insert into public.users
  (id, email, password, role, "isActive", "firstName", "lastName", phone,
   "documentId", address, city, province, "acceptedTerms", "acceptedTermsAt", "createdAt")
values
  ('usr_admin_000000000000001',
   'admin@fundaciondemo.com',
   '$2b$12$LJ1Q1bgRecfZlCj5Jf/SBOuuOaqjKFzxGRj.VCDxAZCOZefkLf9Gq',  -- Admin@2026!
   'ADMIN', true, 'Admin', 'Fundación', '809-555-0001',
   '000-0000000-0', 'Av. Principal 123', 'Santo Domingo', 'Distrito Nacional',
   true, current_timestamp, current_timestamp - interval '90 days'),

  ('usr_admin_000000000000002',
   'coordinador@fundaciondemo.com',
   '$2b$12$LJ1Q1bgRecfZlCj5Jf/SBOuuOaqjKFzxGRj.VCDxAZCOZefkLf9Gq',  -- Admin@2026!
   'ADMIN', true, 'Lucía', 'Coordinadora', '809-555-0002',
   '000-0000000-1', 'Av. Principal 123', 'Santo Domingo', 'Distrito Nacional',
   true, current_timestamp, current_timestamp - interval '60 days');


-- ─── Beneficiarios ───────────────────────────────────────────────────────────

insert into public.users
  (id, email, password, role, "isActive", "firstName", "lastName", phone,
   "documentId", address, city, province, "acceptedTerms", "acceptedTermsAt", "createdAt")
values
  ('usr_benef_00000000000001', 'maria@demo.com',
   '$2b$12$4LbHbwJoMeIDZ4S1ZJwu0enNII0rhGu8RmKeMP4V5GFwc47cPgqmW',  -- User@2026!
   'USER', true, 'María', 'González', '809-555-0101', '001-1234567-1',
   'Calle Las Flores 45', 'Santiago', 'Santiago',
   true, current_timestamp - interval '28 days', current_timestamp - interval '28 days'),

  ('usr_benef_00000000000002', 'carlos@demo.com',
   '$2b$12$4LbHbwJoMeIDZ4S1ZJwu0enNII0rhGu8RmKeMP4V5GFwc47cPgqmW',
   'USER', true, 'Carlos', 'Rodríguez', '849-555-0202', '002-2345678-2',
   'Av. Independencia 67', 'La Romana', 'La Romana',
   true, current_timestamp - interval '25 days', current_timestamp - interval '25 days'),

  ('usr_benef_00000000000003', 'ana@demo.com',
   '$2b$12$4LbHbwJoMeIDZ4S1ZJwu0enNII0rhGu8RmKeMP4V5GFwc47cPgqmW',
   'USER', true, 'Ana', 'Martínez', '809-555-0303', '003-3456789-3',
   'C/ Principal 12', 'San Pedro de Macorís', 'San Pedro de Macorís',
   true, current_timestamp - interval '20 days', current_timestamp - interval '20 days'),

  ('usr_benef_00000000000004', 'jose@demo.com',
   '$2b$12$4LbHbwJoMeIDZ4S1ZJwu0enNII0rhGu8RmKeMP4V5GFwc47cPgqmW',
   'USER', true, 'José', 'Pérez', '829-555-0404', '004-4567890-4',
   'Urb. Los Pinos 8', 'Santo Domingo Este', 'Santo Domingo',
   true, current_timestamp - interval '14 days', current_timestamp - interval '14 days'),

  ('usr_benef_00000000000005', 'laura@demo.com',
   '$2b$12$4LbHbwJoMeIDZ4S1ZJwu0enNII0rhGu8RmKeMP4V5GFwc47cPgqmW',
   'USER', true, 'Laura', 'Sánchez', '809-555-0505', '005-5678901-5',
   'Residencial El Edén', 'Higüey', 'La Altagracia',
   true, current_timestamp - interval '10 days', current_timestamp - interval '10 days');


-- ─── Solicitudes de ayuda ────────────────────────────────────────────────────
-- Una por cada estado relevante, para que el panel administrativo y el
-- dashboard muestren todas las tarjetas de estadísticas con datos.

insert into public.aid_requests
  (id, code, status, priority, "aidType", description, reason, "requestedAmount",
   "householdSize", "employmentStatus", "monthlyIncome", "contactPhone",
   "internalNotes", "userId", "createdAt", "updatedAt")
values
  ('req_00000000000000000001', 'AYU-2026-000001', 'DELIVERED', 'HIGH', 'MEDICINE',
   'Mi madre padece de hipertensión y diabetes. Necesito ayuda para comprar sus medicamentos mensuales que suman aproximadamente RD$8,000. Actualmente no tenemos ingresos suficientes para cubrir este gasto.',
   'Medicamentos esenciales para condición crónica de adulto mayor.',
   8000, 3, 'UNEMPLOYED', 12000, '809-555-0000',
   'Caso verificado con receta médica. Entrega coordinada con farmacia aliada.',
   'usr_benef_00000000000001', current_timestamp - interval '24 days', current_timestamp),

  ('req_00000000000000000002', 'AYU-2026-000002', 'APPROVED', 'HIGH', 'FOOD',
   'Somos una familia de 5 personas. Mi esposo perdió su trabajo hace 2 meses y necesitamos apoyo con una canasta básica para poder alimentar a nuestros tres hijos.',
   'Desempleo temporal del jefe del hogar con tres menores dependientes.',
   5000, 5, 'UNEMPLOYED', 8000, '809-555-0000',
   'Aprobado para canasta básica mensual por 3 meses.',
   'usr_benef_00000000000001', current_timestamp - interval '21 days', current_timestamp),

  ('req_00000000000000000003', 'AYU-2026-000003', 'EVALUATION', 'MEDIUM', 'EDUCATION',
   'Tengo dos hijos que inician el año escolar y no cuento con recursos para comprar útiles, uniformes y pagar la cuota del colegio. Trabajo como empleado informal.',
   'Inicio del año escolar sin recursos para útiles y matrícula.',
   12000, 4, 'SELF_EMPLOYED', 18000, '809-555-0000',
   'Pendiente confirmar matrícula con el centro educativo.',
   'usr_benef_00000000000002', current_timestamp - interval '18 days', current_timestamp),

  ('req_00000000000000000004', 'AYU-2026-000004', 'PENDING_DOCS', 'URGENT', 'HEALTH',
   'Necesito realizarme una cirugía urgente que el seguro no cubre completamente. El procedimiento cuesta RD$45,000 y solo tengo cubierto el 60%.',
   'Cirugía urgente sin cobertura completa de seguro médico.',
   18000, 2, 'EMPLOYED', 35000, '809-555-0000',
   'Falta la cotización del centro médico y la carta del seguro.',
   'usr_benef_00000000000002', current_timestamp - interval '15 days', current_timestamp),

  ('req_00000000000000000005', 'AYU-2026-000005', 'IN_REVIEW', 'HIGH', 'HOUSING',
   'El huracán dañó el techo de mi casa y el agua está entrando. Tengo dos niños pequeños y no puedo pagar la reparación que cuesta aproximadamente RD$25,000.',
   'Emergencia habitacional por daños causados por lluvia intensa.',
   25000, 4, 'EMPLOYED', 22000, '809-555-0000',
   'Programar visita técnica para evaluar el daño.',
   'usr_benef_00000000000003', current_timestamp - interval '12 days', current_timestamp),

  ('req_00000000000000000006', 'AYU-2026-000006', 'RECEIVED', 'URGENT', 'EMERGENCY',
   'Sufrí un accidente de tránsito y estoy incapacitado temporalmente. No puedo trabajar y tengo deudas urgentes que pagar incluyendo el alquiler.',
   'Incapacidad laboral temporal por accidente, sin ingresos actuales.',
   15000, 3, 'UNEMPLOYED', 0, '809-555-0000',
   null,
   'usr_benef_00000000000003', current_timestamp - interval '9 days', current_timestamp),

  ('req_00000000000000000007', 'AYU-2026-000007', 'REJECTED', 'LOW', 'ECONOMIC',
   'Necesito apoyo económico para pagar deudas acumuladas durante la pandemia.',
   'Deudas acumuladas.',
   50000, 1, 'EMPLOYED', 45000, '809-555-0000',
   'Ingreso mensual por encima del umbral del programa. No elegible.',
   'usr_benef_00000000000004', current_timestamp - interval '6 days', current_timestamp),

  ('req_00000000000000000008', 'AYU-2026-000008', 'PREPARING', 'HIGH', 'FOOD',
   'Soy una madre soltera con tres hijos. Trabajo en limpieza por días y mis ingresos son muy variables. Esta semana no he tenido trabajo y no tenemos comida suficiente.',
   'Madre soltera sin ingresos estables con tres menores a cargo.',
   4000, 4, 'SELF_EMPLOYED', 10000, '809-555-0000',
   'Canasta lista en almacén. Coordinar entrega para esta semana.',
   'usr_benef_00000000000005', current_timestamp - interval '3 days', current_timestamp);


-- ─── Bitácora de cambios de estado ───────────────────────────────────────────
-- Cada solicitud tiene su recorrido completo, en orden cronológico correcto.
-- El primer registro siempre lo genera el sistema ("changedById" = null).

insert into public.aid_request_history
  ("previousStatus", "newStatus", description, "userComment", "internalComment",
   "changedById", "aidRequestId", "createdAt")
values
  -- AYU-2026-000001 → DELIVERED
  (null, 'RECEIVED', 'Solicitud creada y registrada en el sistema.', 'Tu solicitud ha sido recibida exitosamente.', null, null, 'req_00000000000000000001', current_timestamp - interval '24 days'),
  ('RECEIVED', 'IN_REVIEW', 'El equipo comenzó la revisión de la solicitud.', 'Hemos iniciado la revisión de tu caso.', null, 'usr_admin_000000000000001', 'req_00000000000000000001', current_timestamp - interval '23 days'),
  ('IN_REVIEW', 'EVALUATION', 'La solicitud fue enviada al proceso de evaluación.', 'Tu caso está siendo evaluado por nuestros especialistas.', 'Receta médica verificada.', 'usr_admin_000000000000001', 'req_00000000000000000001', current_timestamp - interval '22 days'),
  ('EVALUATION', 'APPROVED', 'La solicitud fue aprobada por el equipo.', '¡Tu solicitud fue aprobada! Nos pondremos en contacto contigo pronto.', null, 'usr_admin_000000000000002', 'req_00000000000000000001', current_timestamp - interval '3 days'),
  ('APPROVED', 'PREPARING', 'Se está coordinando la entrega de la ayuda.', 'Estamos preparando tu ayuda. Te contactaremos para coordinar la entrega.', null, 'usr_admin_000000000000002', 'req_00000000000000000001', current_timestamp - interval '2 days'),
  ('PREPARING', 'DELIVERED', 'La ayuda fue entregada satisfactoriamente.', 'La ayuda fue entregada. ¡Gracias por confiar en Fundación Esperanza!', 'Entrega firmada por la beneficiaria.', 'usr_admin_000000000000001', 'req_00000000000000000001', current_timestamp - interval '1 day'),

  -- AYU-2026-000002 → APPROVED
  (null, 'RECEIVED', 'Solicitud creada y registrada en el sistema.', 'Tu solicitud ha sido recibida exitosamente.', null, null, 'req_00000000000000000002', current_timestamp - interval '21 days'),
  ('RECEIVED', 'IN_REVIEW', 'El equipo comenzó la revisión de la solicitud.', 'Hemos iniciado la revisión de tu caso.', null, 'usr_admin_000000000000001', 'req_00000000000000000002', current_timestamp - interval '20 days'),
  ('IN_REVIEW', 'EVALUATION', 'La solicitud fue enviada al proceso de evaluación.', 'Tu caso está siendo evaluado por nuestros especialistas.', null, 'usr_admin_000000000000001', 'req_00000000000000000002', current_timestamp - interval '19 days'),
  ('EVALUATION', 'APPROVED', 'La solicitud fue aprobada por el equipo.', '¡Tu solicitud fue aprobada! Nos pondremos en contacto contigo pronto.', 'Aprobada por 3 meses.', 'usr_admin_000000000000002', 'req_00000000000000000002', current_timestamp - interval '2 days'),

  -- AYU-2026-000003 → EVALUATION
  (null, 'RECEIVED', 'Solicitud creada y registrada en el sistema.', 'Tu solicitud ha sido recibida exitosamente.', null, null, 'req_00000000000000000003', current_timestamp - interval '18 days'),
  ('RECEIVED', 'IN_REVIEW', 'El equipo comenzó la revisión de la solicitud.', 'Hemos iniciado la revisión de tu caso.', null, 'usr_admin_000000000000001', 'req_00000000000000000003', current_timestamp - interval '17 days'),
  ('IN_REVIEW', 'EVALUATION', 'La solicitud fue enviada al proceso de evaluación.', 'Tu caso está siendo evaluado por nuestros especialistas.', null, 'usr_admin_000000000000002', 'req_00000000000000000003', current_timestamp - interval '16 days'),

  -- AYU-2026-000004 → PENDING_DOCS
  (null, 'RECEIVED', 'Solicitud creada y registrada en el sistema.', 'Tu solicitud ha sido recibida exitosamente.', null, null, 'req_00000000000000000004', current_timestamp - interval '15 days'),
  ('RECEIVED', 'IN_REVIEW', 'El equipo comenzó la revisión de la solicitud.', 'Hemos iniciado la revisión de tu caso.', null, 'usr_admin_000000000000001', 'req_00000000000000000004', current_timestamp - interval '14 days'),
  ('IN_REVIEW', 'PENDING_DOCS', 'Se requieren documentos adicionales para continuar.', 'Necesitamos que nos envíes documentación adicional.', 'Solicitada cotización y carta del seguro.', 'usr_admin_000000000000001', 'req_00000000000000000004', current_timestamp - interval '13 days'),

  -- AYU-2026-000005 → IN_REVIEW
  (null, 'RECEIVED', 'Solicitud creada y registrada en el sistema.', 'Tu solicitud ha sido recibida exitosamente.', null, null, 'req_00000000000000000005', current_timestamp - interval '12 days'),
  ('RECEIVED', 'IN_REVIEW', 'El equipo comenzó la revisión de la solicitud.', 'Hemos iniciado la revisión de tu caso.', null, 'usr_admin_000000000000002', 'req_00000000000000000005', current_timestamp - interval '11 days'),

  -- AYU-2026-000006 → RECEIVED
  (null, 'RECEIVED', 'Solicitud creada y registrada en el sistema.', 'Tu solicitud ha sido recibida exitosamente.', null, null, 'req_00000000000000000006', current_timestamp - interval '9 days'),

  -- AYU-2026-000007 → REJECTED
  (null, 'RECEIVED', 'Solicitud creada y registrada en el sistema.', 'Tu solicitud ha sido recibida exitosamente.', null, null, 'req_00000000000000000007', current_timestamp - interval '6 days'),
  ('RECEIVED', 'IN_REVIEW', 'El equipo comenzó la revisión de la solicitud.', 'Hemos iniciado la revisión de tu caso.', null, 'usr_admin_000000000000001', 'req_00000000000000000007', current_timestamp - interval '5 days'),
  ('IN_REVIEW', 'EVALUATION', 'La solicitud fue enviada al proceso de evaluación.', 'Tu caso está siendo evaluado por nuestros especialistas.', null, 'usr_admin_000000000000001', 'req_00000000000000000007', current_timestamp - interval '4 days'),
  ('EVALUATION', 'REJECTED', 'La solicitud no cumplió con los criterios de elegibilidad.', 'Lamentablemente tu solicitud no pudo ser aprobada en esta oportunidad. Los criterios de elegibilidad no se cumplieron en esta ocasión.', 'Ingreso mensual supera el umbral del programa.', 'usr_admin_000000000000002', 'req_00000000000000000007', current_timestamp - interval '3 days'),

  -- AYU-2026-000008 → PREPARING
  (null, 'RECEIVED', 'Solicitud creada y registrada en el sistema.', 'Tu solicitud ha sido recibida exitosamente.', null, null, 'req_00000000000000000008', current_timestamp - interval '3 days'),
  ('RECEIVED', 'IN_REVIEW', 'El equipo comenzó la revisión de la solicitud.', 'Hemos iniciado la revisión de tu caso.', null, 'usr_admin_000000000000001', 'req_00000000000000000008', current_timestamp - interval '60 hours'),
  ('IN_REVIEW', 'EVALUATION', 'La solicitud fue enviada al proceso de evaluación.', 'Tu caso está siendo evaluado por nuestros especialistas.', null, 'usr_admin_000000000000001', 'req_00000000000000000008', current_timestamp - interval '48 hours'),
  ('EVALUATION', 'APPROVED', 'La solicitud fue aprobada por el equipo.', '¡Tu solicitud fue aprobada! Nos pondremos en contacto contigo pronto.', null, 'usr_admin_000000000000002', 'req_00000000000000000008', current_timestamp - interval '36 hours'),
  ('APPROVED', 'PREPARING', 'Se está coordinando la entrega de la ayuda.', 'Estamos preparando tu ayuda. Te contactaremos para coordinar la entrega.', 'Canasta lista en almacén.', 'usr_admin_000000000000002', 'req_00000000000000000008', current_timestamp - interval '24 hours');


-- ─── Notificaciones ──────────────────────────────────────────────────────────
-- Las de solicitudes cerradas van marcadas como leídas; el resto sin leer,
-- para que el contador del dashboard tenga algo que mostrar.

insert into public.notifications
  (title, message, "isRead", "userId", "aidRequestId", "createdAt")
values
  ('Ayuda entregada',           'Tu solicitud AYU-2026-000001 cambió a: Ayuda entregada.',       true,  'usr_benef_00000000000001', 'req_00000000000000000001', current_timestamp - interval '1 day'),
  ('Solicitud aprobada',        'Tu solicitud AYU-2026-000002 cambió a: Aprobada.',              false, 'usr_benef_00000000000001', 'req_00000000000000000002', current_timestamp - interval '2 days'),
  ('Actualización de tu solicitud', 'Tu solicitud AYU-2026-000003 cambió a: En evaluación.',     false, 'usr_benef_00000000000002', 'req_00000000000000000003', current_timestamp - interval '16 days'),
  ('Documentación pendiente',   'Tu solicitud AYU-2026-000004 cambió a: Documentación pendiente.', false, 'usr_benef_00000000000002', 'req_00000000000000000004', current_timestamp - interval '13 days'),
  ('Actualización de tu solicitud', 'Tu solicitud AYU-2026-000005 cambió a: En revisión.',       false, 'usr_benef_00000000000003', 'req_00000000000000000005', current_timestamp - interval '11 days'),
  ('Solicitud creada',          'Tu solicitud AYU-2026-000006 ha sido registrada exitosamente.', false, 'usr_benef_00000000000003', 'req_00000000000000000006', current_timestamp - interval '9 days'),
  ('Solicitud rechazada',       'Tu solicitud AYU-2026-000007 cambió a: Rechazada.',             true,  'usr_benef_00000000000004', 'req_00000000000000000007', current_timestamp - interval '3 days'),
  ('Preparando tu ayuda',       'Tu solicitud AYU-2026-000008 cambió a: Preparando ayuda.',      false, 'usr_benef_00000000000005', 'req_00000000000000000008', current_timestamp - interval '24 hours'),
  ('Bienvenido a Fundación Esperanza', 'Tu cuenta fue creada correctamente. Ya puedes crear tu primera solicitud de ayuda.', true, 'usr_benef_00000000000005', null, current_timestamp - interval '10 days');


-- ─── Mensajes del formulario de contacto ─────────────────────────────────────

insert into public.contact_messages (name, email, phone, subject, message, "isRead", "createdAt")
values
  ('Pedro Jiménez', 'pedro@test.com', '809-555-0707', 'Consulta sobre programas', 'Me gustaría conocer más sobre los programas de alimentación.', false, current_timestamp - interval '4 days'),
  ('Rosa Almonte',  'rosa@test.com',  null,           'Voluntariado',             '¿Cómo puedo unirme como voluntaria a la fundación?',          false, current_timestamp - interval '2 days');


commit;


-- ─── Verificación ────────────────────────────────────────────────────────────
-- Esperado: 7 usuarios (2 ADMIN + 5 USER), 8 solicitudes, 28 registros de
-- historial, 9 notificaciones y 2 mensajes de contacto.

select 'users'               as tabla, count(*) as filas from public.users
union all select 'aid_requests',        count(*) from public.aid_requests
union all select 'aid_request_history', count(*) from public.aid_request_history
union all select 'notifications',       count(*) from public.notifications
union all select 'contact_messages',    count(*) from public.contact_messages
order by tabla;
