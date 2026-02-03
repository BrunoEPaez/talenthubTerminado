# db/seeds.rb
puts "Limpiando base de datos..."
Job.destroy_all
User.destroy_all

puts "Creando usuario de prueba..."
# Ajusta los campos según tu modelo de User (ej. email, password)
usuario = User.create!(
  email: "admin@test.com",
  password: "password123", 
  password_confirmation: "password123"
)

puts "Creando empleos para #{usuario.email}..."
usuario.jobs.create!([
  {
    title: "Desarrollador Ruby on Rails",
    company: "Tech Solutions",
    description: "Buscamos experto en Rails 8 para proyecto innovador.",
    location: "Remoto",
    job_type: "Full-time",
    modality: "Remote"
  },
  {
    title: "Frontend Developer (React)",
    company: "Creative Studio",
    description: "Trabaja con las últimas tecnologías de UI.",
    location: "Buenos Aires",
    job_type: "Part-time",
    modality: "Hybrid"
  }
])

puts "¡Seeds completados!"
puts "Usuario: admin@test.com / password123"
puts "Empleos creados: #{Job.count}"