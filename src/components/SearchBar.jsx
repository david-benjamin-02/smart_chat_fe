// components/SearchBar.js
import React from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';

export default function SearchBar({ searchTerm, setSearchTerm }) {
  return (
    <div className="px-3 py-2 border-bottom">
      <div className="input-group">
        <span className="input-group-text bg-white border-end-0">
          <i className="bi bi-search"></i>
        </span>
        <input
          type="text"
          className="form-control border-start-0"
          placeholder="Search contacts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
    </div>
  );
}
