// import { useState } from 'react'
import './App.css'

function App() {


  // Sample data
  const users = [
    { name: 'Alice', email: 'alice@example.com' },
    { name: 'Bob', email: 'bob@example.com' },
    { name: 'Charlie', email: 'charlie@example.com' }
  ];
  const bugs = [
    { title: 'Login not working', status: 'Open', priority: 'High' },
    { title: 'UI glitch on dashboard', status: 'In Progress', priority: 'Medium' },
    { title: 'Typo in About page', status: 'Closed', priority: 'Low' }
  ];

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">

      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
        <div className="container-fluid">
          <a className="navbar-brand fw-bold" href="#">Issue Tracker</a>
        </div>
      </nav>

      <div className="container my-5">
        <div className="row mb-5">
          <div className="col-12 text-center">
            <div className="p-4 rounded bg-white shadow-sm">
              <h1 className="display-5 fw-bold mb-3">Welcome to Issue Tracker</h1>
              <p className="lead text-muted mb-0">Track users and bugs efficiently. Manage your project with clarity and speed.</p>
            </div>
          </div>
        </div>
        <div className="row justify-content-center">
          <div className="col-6 mb-4">
            <div className="card shadow h-100">
              <div className="card-header bg-info text-white fw-bold fs-5">Users</div>
              <a href="api/users/list" className="btn btn-outline-secondary mb-4">Go to Users List API</a>
              <ul className="list-group list-group-flush">
                {users.map((user, idx) => (
                  <li key={idx} className="list-group-item d-flex justify-content-between align-items-center">
                    <span className="fw-semibold">{user.name}</span>
                    <span className="text-muted small">{user.email}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="col-6 mb-4">
            <div className="card shadow h-100">
              <div className="card-header bg-danger text-white fw-bold fs-5">Bugs</div>
              <a href="api/bugs/list" className="btn btn-outline-secondary mb-4 ms-2">Go to Bugs List API</a>
              <ul className="list-group list-group-flush">
                {bugs.map((bug, idx) => (
                  <li key={idx} className="list-group-item">
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="fw-semibold">{bug.title}</span>
                      <span className={`badge bg-${bug.status === 'Open' ? 'danger' : bug.status === 'In Progress' ? 'warning' : 'success'} ms-2`}>{bug.status}</span>
                    </div>
                    <div className="text-muted small">Priority: {bug.priority}</div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-dark text-white text-center py-3 mt-auto shadow-sm">
        &copy; {new Date().getFullYear()} Issue Tracker. All rights reserved.
      </footer>
    </div>
  )
}

export default App
