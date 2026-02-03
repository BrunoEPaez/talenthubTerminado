require "active_support/core_ext/integer/time"

Rails.application.configure do
  # Los ajustes aquí tienen precedencia sobre config/application.rb.

  # El código no se recarga entre peticiones.
  config.enable_reloading = false

  # Carga ávida del código para mejor rendimiento y ahorro de memoria.
  config.eager_load = true

  # Los informes de error completos están desactivados.
  config.consider_all_requests_local = false

  # Caché de archivos públicos (Necesario para que Rails sirva assets si no usas Nginx).
  config.public_file_server.enabled = ENV["RAILS_SERVE_STATIC_FILES"].present? || true
  config.public_file_server.headers = { "cache-control" => "public, max-age=#{1.year.to_i}" }

  # Almacenamiento de archivos (Active Storage).
  config.active_storage.service = :local

  # Logs a STDOUT para que Koyeb los pueda leer.
  config.log_tags = [ :request_id ]
  config.logger = ActiveSupport::TaggedLogging.logger(STDOUT)
  config.log_level = ENV.fetch("RAILS_LOG_LEVEL", "info")

  # No saturar los logs con los health checks.
  config.silence_healthcheck_path = "/up"

  # Desactivar reportes de deprecación.
  config.active_support.report_deprecations = false

  # -----------------------------------------------------------------------
  # CONFIGURACIÓN RAILS 8 - SOLID STACK (Cache, Queue, Cable)
  # -----------------------------------------------------------------------
  
  # 1. Configuración de Caché
  config.cache_store = :solid_cache_store

  # 2. Configuración de Colas (Background Jobs)
  config.active_job.queue_adapter = :solid_queue

  # 3. Configuración de Action Cable (Solid Cable)
  # Usamos la llave estándar de action_cable en lugar de config.solid_cable
  # para evitar errores de inicialización.
  config.action_cable.adapter = :solid_cable

  # Forzamos a que usen las conexiones definidas en database.yml después de inicializar
  config.after_initialize do
    SolidCable.connects_to = { database: { writing: :cable, reading: :cable } } if defined?(SolidCable)
    SolidCache.connects_to = { database: { writing: :cache, reading: :cache } } if defined?(SolidCache)
    SolidQueue.connects_to = { database: { writing: :queue, reading: :queue } } if defined?(SolidQueue)
  end
  # -----------------------------------------------------------------------

  # Internacionalización.
  config.i18n.fallbacks = true

  # No volcar el esquema después de migraciones.
  config.active_record.dump_schema_after_migration = false

  # Atributos visibles en inspecciones.
  config.active_record.attributes_for_inspect = [ :id ]

  # ==========================================
  # SOLUCIÓN AL ERROR DE BLOCKED HOSTS
  # ==========================================
  # Limpiamos todas las restricciones de hosts para que Koyeb pueda entrar.
  config.hosts.clear
  
  # También permitimos específicamente la ruta /up por seguridad.
  config.host_authorization = { exclude: ->(request) { request.path == "/up" } }
end