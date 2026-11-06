
import { useState } from 'react'
import './App.css'

function App() {
  const [showForm, setShowForm] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const [complaint, setComplaint] = useState({
    name: '',
    title: '',
    category: '',
    description: '',
    location: ''
  })

  const [photo, setPhoto] = useState(null)
  const [locationCoords, setLocationCoords] = useState(null)
  const [trackId, setTrackId] = useState('')
const [trackedReport, setTrackedReport] = useState(null)
const [trackError, setTrackError] = useState('')
const [submittedReportId, setSubmittedReportId] = useState(null)

  // Admin states
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminEmail, setAdminEmail] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [loginError, setLoginError] = useState('')

  // Load complaints from localStorage
  const [reports, setReports] = useState(() => {
    return JSON.parse(localStorage.getItem('civicReports') || '[]')
  })

  const handleChange = (e) => {
    setComplaint({
      ...complaint,
      [e.target.name]: e.target.value
    })
  }
  
const handleGetLocation = () => {
  if (!navigator.geolocation) {
    alert('Geolocation is not supported by your browser')
    return
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      setLocationCoords({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      })

      alert('Location detected successfully!')
    },
    () => {
      alert('Unable to detect location. Please allow location access.')
    }
  )
}


  // Submit complaint
  const handleSubmit = (e) => {
    e.preventDefault()

    const newReport = {
      ...complaint,
      latitude: locationCoords?.latitude || '',
longitude: locationCoords?.longitude || '',
      photo: photo ? photo.name : '',
      id: Date.now(),
      status: 'Pending',
priority: getDefaultPriority(
  complaint.title,
  complaint.description,
  complaint.category
),      date: new Date().toLocaleDateString()
    }

    const updatedReports = [...reports, newReport]

    localStorage.setItem(
      'civicReports',
      JSON.stringify(updatedReports)
    )

    setReports(updatedReports)
    setSubmittedReportId(newReport.id)
    setSubmitted(true)

    setComplaint({
      name: '',
      title: '',
      category: '',
      description: '',
      location: ''
    })

    setPhoto(null)
  }
  const getDefaultPriority = (title, description, category) => {
  const text = `${title} ${description} ${category}`.toLowerCase()

  const highKeywords = [
    'accident',
    'danger',
    'dangerous',
    'emergency',
    'fire',
    'flood',
    'electric shock',
    'exposed wire',
    'live wire',
    'open manhole',
    'severe pothole',
    'major road damage',
    'water contamination',
    'burst pipe',
    'building collapse',
    'injury',
    'life threatening'
  ]

  const mediumKeywords = [
    'pothole',
    'road damage',
    'streetlight',
    'street light',
    'garbage',
    'drainage',
    'water leakage',
    'water supply',
    'broken',
    'overflow',
    'blocked drain',
    'not working',
    'waste'
  ]

  if (highKeywords.some(keyword => text.includes(keyword))) {
    return 'High'
  }

  if (mediumKeywords.some(keyword => text.includes(keyword))) {
    return 'Medium'
  }

  return 'Low'
}

  const handleTrack = (e) => {
  e.preventDefault()

  const found = reports.find(
    (report) => String(report.id) === trackId.trim()
  )

  if (found) {
    setTrackedReport(found)
    setTrackError('')
  } else {
    setTrackedReport(null)
    setTrackError('Complaint ID not found. Please check your ID.')
  }
}

  // Admin login (demo only)
  const handleAdminLogin = (e) => {
    e.preventDefault()

    if (
      adminEmail === 'admin@civicconnect.com' &&
      adminPassword === 'admin123'
    ) {
      setIsAdmin(true)
      setShowAdminLogin(false)
      setLoginError('')
      setAdminEmail('')
      setAdminPassword('')
    } else {
      setLoginError('Invalid email or password!')
    }
  }

  // Update complaint status
  const updateStatus = (id, newStatus) => {
    const updatedReports = reports.map((report) =>
      report.id === id
        ? { ...report, status: newStatus }
        : report
    )

    setReports(updatedReports)

    localStorage.setItem(
      'civicReports',
      JSON.stringify(updatedReports)
    )
  }
  
// Assign department to complaint
const assignDepartment = (id, department) => {
  
// Update complaint priority
const updatePriority = (id, newPriority) => {
  const updatedReports = reports.map((report) =>
    report.id === id
      ? { ...report, priority: newPriority }
      : report
  )

  setReports(updatedReports)

  localStorage.setItem(
    'civicReports',
    JSON.stringify(updatedReports)
  )
}

  const updatedReports = reports.map((report) =>
    report.id === id
      ? { ...report, department: department }
      : report
  )

  setReports(updatedReports)

  localStorage.setItem(
    'civicReports',
    JSON.stringify(updatedReports)
  )
}


  // Delete complaint
  const deleteReport = (id) => {
    if (window.confirm('Are you sure you want to delete this complaint?')) {
      const updatedReports = reports.filter(
        (report) => report.id !== id
      )

      setReports(updatedReports)

      localStorage.setItem(
        'civicReports',
        JSON.stringify(updatedReports)
      )
    }
  }

  const pendingCount = reports.filter(
    (r) => r.status === 'Pending'
  ).length

  const progressCount = reports.filter(
    (r) => r.status === 'In Progress'
  ).length

  const resolvedCount = reports.filter(
    (r) => r.status === 'Resolved'
  ).length

  return (
    <div className="app">

      {/* NAVBAR */}
      <nav className="navbar">
        <h2>🏙️ CivicConnect</h2>

        <div>
          <a href="#home" onClick={() => setIsAdmin(false)}>
            Home
          </a>

          <a href="#services" onClick={() => setIsAdmin(false)}>
            Services
          </a>

          <button
            className="admin-nav-btn"
            onClick={() => {
              if (isAdmin) {
                setIsAdmin(false)
              } else {
                setShowAdminLogin(true)
                setLoginError('')
              }
            }}
          >
            {isAdmin ? 'Logout Admin' : 'Admin'}
          </button>

          <button
            onClick={() => {
              setIsAdmin(false)
              setShowForm(true)
              setSubmitted(false)
            }}
          >
            Report Issue
          </button>
        </div>
      </nav>

      {/* ADMIN DASHBOARD */}
      {isAdmin ? (

        <section className="admin-dashboard">

          <h1>Admin Dashboard</h1>
          <p>Manage community complaints and track their progress.</p>

          <div className="admin-stats">

            <div>
              <h2>{reports.length}</h2>
              <p>Total Reports</p>
            </div>

            <div>
              <h2>{pendingCount}</h2>
              <p>Pending</p>
            </div>

            <div>
              <h2>{progressCount}</h2>
              <p>In Progress</p>
            </div>

            <div>
              <h2>{resolvedCount}</h2>
              <p>Resolved</p>
            </div>

          </div>

          <h2 className="complaints-heading">
            Manage Complaints
          </h2>

          {reports.length === 0 ? (

            <p className="no-reports">
              No complaints have been submitted yet.
            </p>

          ) : (

            <div className="complaints-list">

{[...reports]
  .sort((a, b) => {
    const priorityOrder = {
      High: 1,
      Medium: 2,
      Low: 3
    }

    return (
      (priorityOrder[a.priority || 'Medium'] || 2) -
      (priorityOrder[b.priority || 'Medium'] || 2)
    )
  })
  .map((report) => (
                <div className="complaint-card" key={report.id}>

                  <h3>{report.title}</h3>
                  
<p><strong>Priority:</strong>{' '}<span className={`priority-${(report.priority || 'Medium').toLowerCase()}`}>{report.priority || 'Medium'}</span></p>

                  <p><strong>Complaint ID:</strong> {report.id}</p>
                  <p><strong>Name:</strong> {report.name}</p>

                  <p><strong>Category:</strong> {report.category}</p>

                  <p><strong>Description:</strong> {report.description}</p>

                  <p><strong>Location:</strong> {report.location}</p>
                  
{report.latitude && report.longitude && (
  <p>
    <strong>Map Location:</strong>{' '}
    <a
      href={`https://www.google.com/maps?q=${report.latitude},${report.longitude}`}
      target="_blank"
      rel="noreferrer"
    >
      📍 View on Google Maps
    </a>
  </p>
)}


                  <p><strong>Date:</strong> {report.date}</p>

                  <p><strong>Photo:</strong> {report.photo || 'Not uploaded'}</p>

                  <div className="status-control">

                    <label>Update Status:</label>

                    <select
                      value={report.status}
                      onChange={(e) =>
                        updateStatus(report.id, e.target.value)
                      }
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                    
<label>Assign Department:</label>

<select
  value={report.department || 'Not Assigned'}
  onChange={(e) =>
    assignDepartment(report.id, e.target.value)
  }
>
  <option>Not Assigned</option>
  <option>Road Department</option>
  <option>Electricity Department</option>
  <option>Sanitation Department</option>
  <option>Water Department</option>
  <option>General Department</option>
</select>

<label>Priority:</label>

<select
  value={report.priority || 'Medium'}
  onChange={(e) =>
    updatePriority(report.id, e.target.value)
  }
>
  <option value="High">High</option>
  <option value="Medium">Medium</option>
  <option value="Low">Low</option>
</select>



                    <button
                      className="delete-btn"
                      onClick={() => deleteReport(report.id)}
                    >
                      Delete
                    </button>

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>

      ) : (

        <>

          {/* HOME PAGE */}
          <section className="hero" id="home">

            <p>BUILDING BETTER COMMUNITIES</p>

            <h1>Your City, Your Voice.</h1>

            <p>
              Report local problems, track their progress
              and help make your community better.
            </p>

            <button onClick={() => {
              setShowForm(true)
              setSubmitted(false)
            }}>
              + Report a Problem
            </button>

          </section>

          {/* STATISTICS */}
          <section className="stats">

            <div>
              <h2>{reports.length}</h2>
              <p>Reports Received</p>
            </div>

            <div>
              <h2>{resolvedCount}</h2>
              <p>Problems Resolved</p>
            </div>

            <div>
              <h2>{pendingCount + progressCount}</h2>
              <p>In Progress / Pending</p>
            </div>

          </section>

          
{/* TRACK COMPLAINT SECTION */}
<section className="tracking-section">

  <h2>Track Your Complaint</h2>

  <p>Enter your Complaint ID to check the latest status.</p>

  <form onSubmit={handleTrack} className="tracking-form">

    <input
      type="text"
      value={trackId}
      onChange={(e) => setTrackId(e.target.value)}
      placeholder="Enter your Complaint ID"
      required
    />

    <button type="submit">
      Track Complaint
    </button>

  </form>

  {trackError && (
    <p className="track-error">{trackError}</p>
  )}

  {trackedReport && (

    <div className="tracking-result">

      <h3>Complaint Details</h3>

      <p><strong>Complaint ID:</strong> {trackedReport.id}</p>

      <p><strong>Title:</strong> {trackedReport.title}</p>

      <p><strong>Category:</strong> {trackedReport.category}</p>

      <p><strong>Location:</strong> {trackedReport.location}</p>
      
{report.latitude && report.longitude && (
  <p>
    <strong>Map Location:</strong>{' '}
    <a
      href={`https://www.google.com/maps?q=${report.latitude},${report.longitude}`}
      target="_blank"
      rel="noreferrer"
    >
      📍 View on Google Maps
    </a>
  </p>
)}


      <p><strong>Date:</strong> {trackedReport.date}</p>

      <p>
        <strong>Status:</strong>
        {' '}
        <span className="tracking-status">
          {trackedReport.status}
        </span>
      </p>

    </div>

  )}

</section>

          {/* SERVICES */}
          <section className="services" id="services">

            <h2>What would you like to report?</h2>
            <p>Choose an issue category</p>

            <div className="categories">

              <div onClick={() => setShowForm(true)}>
                <span>🚧</span>
                <h3>Road Problems</h3>
                <p>Potholes and damaged roads</p>
              </div>

              <div onClick={() => setShowForm(true)}>
                <span>💡</span>
                <h3>Streetlights</h3>
                <p>Broken streetlights</p>
              </div>

              <div onClick={() => setShowForm(true)}>
                <span>🗑️</span>
                <h3>Garbage</h3>
                <p>Waste management</p>
              </div>

              <div onClick={() => setShowForm(true)}>
                <span>💧</span>
                <h3>Water Problems</h3>
                <p>Water leakage and supply</p>
              </div>

            </div>
          </section>

        </>
      )}

      {/* ADMIN LOGIN MODAL */}
      {showAdminLogin && (

        <div className="modal">

          <div className="modal-content">

            <button
              className="close"
              onClick={() => setShowAdminLogin(false)}
            >
              ✕
            </button>

            <form onSubmit={handleAdminLogin}>

              <h2>🔐 Admin Login</h2>

              <label>Admin Email</label>

              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="Enter admin email"
                required
              />

              <label>Password</label>

              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Enter password"
                required
              />

              {loginError && (
                <p className="login-error">{loginError}</p>
              )}

              <button type="submit">
                Login
              </button>

            </form>

          </div>

        </div>
      )}

      {/* REPORT ISSUE MODAL */}
      {showForm && (

        <div className="modal">

          <div className="modal-content">

            <button
              className="close"
              onClick={() => setShowForm(false)}
            >
              ✕
            </button>

            {submitted ? (

              <div>
    <h2>✅ Report Submitted!</h2>

    <p>Your complaint has been successfully registered.</p>

    <p><strong>Your Complaint ID:</strong></p>

    <h3>{submittedReportId}</h3>

    <p>Please save this ID to track your complaint.</p>

    <button onClick={() => {
      setShowForm(false)
      setSubmitted(false)
    }}>
      Done
    </button>
  </div>

            ) : (

              <form onSubmit={handleSubmit}>

                <h2>Report a Problem</h2>

                <label>Your Name</label>
                <input
                  name="name"
                  value={complaint.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  required
                />

                <label>Problem Title</label>
                <input
                  name="title"
                  value={complaint.title}
                  onChange={handleChange}
                  placeholder="Example: Road pothole"
                  required
                />

                <label>Problem Category</label>
                <select
                  name="category"
                  value={complaint.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select category</option>
                  <option>Road Problems</option>
                  <option>Streetlights</option>
                  <option>Garbage</option>
                  <option>Water Problems</option>
                  <option>Other</option>
                </select>

                <label>Description</label>
                <textarea
                  name="description"
                  value={complaint.description}
                  onChange={handleChange}
                  placeholder="Describe the problem..."
                  required
                />

                <label>Location</label>
                <input
                  name="location"
                  value={complaint.location}
                  onChange={handleChange}
                  placeholder="Enter problem location"
                  required
                />
                
<button type="button" onClick={handleGetLocation}>
  📍 Detect My Current Location
</button>

{locationCoords && (
  <p>
    ✅ Location detected:
    {locationCoords.latitude.toFixed(5)},
    {locationCoords.longitude.toFixed(5)}
  </p>
)}


                <label>Upload Photograph</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPhoto(e.target.files[0])}
                />

                <button type="submit">
                  Submit Complaint
                </button>

              </form>

            )}

          </div>

        </div>
      )}

      <footer>
        © 2026 CivicConnect | Together for a Better Community
      </footer>

    </div>
  )
}

export default App
