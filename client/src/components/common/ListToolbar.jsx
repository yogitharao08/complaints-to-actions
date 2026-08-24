import React from "react";
import { Search } from "lucide-react";

export function ListToolbar({ title, search, setSearch, right }) {
  return (
    <section className="page-head simple-head">
      <div><h1>{title}</h1><p>Search by ID, title, category, or location.</p></div>
      <div className="toolbar-actions"><div className="search inline-search"><Search size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search complaints..." /></div>{right}</div>
    </section>
  );
}
