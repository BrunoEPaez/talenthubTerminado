require "active_support/core_ext/integer/time"

Rails.application.configure do
  # Los ajustes aquí tienen precedencia sobre config/application.rb.

  # El código no se recarga entre peticiones.
  config.enable_reloading = false

  # Carga ávida del código para mejor rendimiento y ahorro de memoria.
  config.eager_load = true

  # Los informes de error completos están desactivados.
  config.consider_all_requests_local = false

  # Caché de archivos públicos.
  config.public_file_server.headers = { "cache-control" => "public, max-age=#{1.year.to_i}" }

  # Almacenamiento de archivos (Active Storage).
  config.active_storage.service = :local

  # Logs a STDOUT para que Koyeb los pueda leer.
  config.log_tags = [ :request_id ]
  config.logger = ActiveSupport::TaggedLogging.logger(STDOUT)

  # Nivel de log (info por defecto).
  config.log_level = ENV.fetch("RAILS_LOG_LEVEL", "info")

  # No saturar los logs con los health checks.
  config.silence_healthcheck_path = "/up"

  # Desactivar reportes de deprecación.
  config.active_support.report_deprecations = false

  # Configuración de caché y colas (Rails 8).
  config.cache_store = :solid_cache_store
  config.active_job.queue_adapter = :solid_queue

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
  
  # También permitimos específicamente la ruta /up por si acaso.
  config.host_authorization = { exclude: ->(request) { request.path == "/up" } }
end