user = User.create!(email: "emmanuel@test.com", password: "password123")
Job.create!(title: "React Dev", company: "Indeed Clone", description: "Full stack", location: "Remoto", user: user)