import React, { useState } from "react";
import { Card, CardContent } from "../components/ui/card";
import { CheckCircle, Ban } from "lucide-react";

const countries = [
  { name: "United States", code: "US", status: "allowed" },
  { name: "United Kingdom", code: "UK", status: "allowed" },
  { name: "France", code: "FR", status: "allowed" },
  { name: "Italy", code: "IT", status: "allowed" },
  { name: "Spain", code: "ES", status: "allowed" },
  { name: "Portugal", code: "PT", status: "allowed" },
  { name: "Greece", code: "GR", status: "allowed" },
  { name: "Brazil", code: "BR", status: "allowed" },
  { name: "Argentina", code: "AR", status: "allowed" },
  { name: "Chile", code: "CL", status: "allowed" },
  { name: "Mexico", code: "MX", status: "allowed" },
  { name: "Colombia", code: "CO", status: "allowed" },
  { name: "Peru", code: "PE", status: "allowed" },
  { name: "Venezuela", code: "VE", status: "allowed" },
  { name: "Ecuador", code: "EC", status: "allowed" },
  { name: "Bolivia", code: "BO", status: "allowed" },
  { name: "Paraguay", code: "PY", status: "allowed" },
  { name: "Uruguay", code: "UY", status: "allowed" },
  { name: "Saudi Arabia", code: "SA", status: "allowed" },
  { name: "United Arab Emirates", code: "AE", status: "allowed" },
  { name: "Qatar", code: "QA", status: "allowed" },
  { name: "Kuwait", code: "KW", status: "allowed" },
  { name: "Bahrain", code: "BH", status: "allowed" },
  { name: "Oman", code: "OM", status: "allowed" }, 
  { name: "Jordan", code: "JO", status: "allowed" },
  { name: "Canada", code: "CA", status: "allowed" },
  { name: "Ukraine", code: "UA", status: "allowed" },
  { name: "Switzerland", code: "CH", status: "allowed" },
  { name: "Singapore", code: "SG", status: "allowed" },
  { name: "Romania", code: "RO", status: "allowed" },
  { name: "Netherlands", code: "NL", status: "allowed" },
  { name: "New Zealand", code: "NZ", status: "allowed" },
  { name: "Pakistan", code: "PK", status: "blocked" },
  { name: "Sri Lanka", code: "LK", status: "blocked" },
  { name: "Nepal", code: "NP", status: "blocked" },
  // { name: "Africa", code: "AF", status: "blocked" },
  { name: "China", code: "CN", status: "blocked" },
  { name: "Hong Kong", code: "HK", status: "blocked" },
  { name: "Russia", code: "RU", status: "blocked" },
  { name: "Philippines", code: "PH", status: "blocked" },
  { name: "Japan", code: "JP", status: "blocked" },
  { name: "Vietnam", code: "VN", status: "blocked" },
  { name: "Bangladesh", code: "BD", status: "blocked" },
  { name: "Afghanistan", code: "AF", status: "blocked" },
  { name: "Tajikistan", code: "TJ", status: "blocked" },
  { name: "Kazakhstan", code: "KZ", status: "blocked" },
  { name: "Kyrgyzstan", code: "KG", status: "blocked" },
  { name: "Turkmenistan", code: "TM", status: "blocked" },
  { name: "Papua New Guinea", code: "PG", status: "blocked" },
  { name: "Myanmar", code: "MM", status: "blocked" },
  { name: "Indonesia", code: "ID", status: "blocked" },
  { name: "Iran", code: "IR", status: "blocked" },
  { name: "Iraq", code: "IQ", status: "blocked" },
  { name: "Israel", code: "IL", status: "blocked" },
  { name: "Lebanon", code: "LB", status: "blocked" },
  { name: "Palestine", code: "PS", status: "blocked" },
  { name: "Syria", code: "SY", status: "blocked" },
  { name: "Turkey", code: "TR", status: "blocked" },
  { name: "Yemen", code: "YE", status: "blocked" },
  { name: "Zimbabwe", code: "ZW", status: "blocked" },
  
  // Add more as needed
];

const LeadPermissionPage = () => {
  const [filter, setFilter] = useState("all");

  const filteredCountries = countries.filter((c) =>
    filter === "all" ? true : c.status === filter
  );

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Lead Geo-Permission Matrix 🌍</h1>

      <div className="flex gap-4">
        <button
          className={`px-4 py-2 rounded-xl ${filter === "all" ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-slate-600"}`}
          onClick={() => setFilter("all")}
        >
          All
        </button>
        <button
          className={`px-4 py-2 rounded-xl ${filter === "allowed" ? "bg-green-600 text-white" : "bg-gray-200 dark:bg-slate-600"}`}
          onClick={() => setFilter("allowed")}
        >
          Allowed ✅
        </button>
        <button
          className={`px-4 py-2 rounded-xl ${filter === "blocked" ? "bg-red-600 text-white" : "bg-gray-200 dark:bg-slate-600"}`}
          onClick={() => setFilter("blocked")}
        >
          Blocked ❌
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCountries.map((country) => (
          <Card key={country.code} className="rounded-2xl shadow-md dark:shadow-black/25">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">{country.name}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-500">Code: {country.code}</p>
              </div>
              {country.status === "allowed" ? (
                <CheckCircle className="text-green-500 w-6 h-6" />
              ) : (
                <Ban className="text-red-500 w-6 h-6" />
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default LeadPermissionPage;
