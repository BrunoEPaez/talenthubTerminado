# db/seeds.rb
Job.destroy_all # Limpia los datos existentes para no duplicar

Job.create!([
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

puts "¡Seeds creados con éxito! Creados #{Job.count} empleos."