import React, { useState, useEffect } from "react";
import { salesAPI, leadsAPI, authAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout/Layout";
import {
  FaWhatsapp,
  FaEnvelope,
  FaPhone,
  FaTrash,
  FaEdit,
  FaCheck,
  FaTimes,
  FaFileExport,
} from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";
import PhoneInput from "react-phone-input-2";
import {
  professionalClasses,
  transitions,
  shadows,
} from "../utils/professionalDarkMode";
import "react-phone-input-2/lib/style.css";
import api from "../services/api"; // Import the api instance to access baseURL
import LoggingService from "../services/loggingService"; // Add LoggingService import
import { exportSalesToCSV } from "../utils/csvExport"; // Import CSV export utility
const SalesTrackingPage = () => {
  // Custom styles for PhoneInput
  const phoneInputStyle = {
    container: {
      width: "100%",
    },
    inputStyle: {
      width: "100%",
      height: "42px",
      padding: "8px 8px 8px 50px",
      borderRadius: "0.375rem",
      fontSize: "0.875rem",
      borderColor: "#D1D5DB",
    },
    buttonStyle: {
      borderTopLeftRadius: "0.375rem",
      borderBottomLeftRadius: "0.375rem",
      borderColor: "#D1D5DB",
    },
    dropdownStyle: {
      width: "300px",
    },
  };
  const { user } = useAuth();
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingSale, setEditingSale] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSale, setNewSale] = useState({
    leadId: "",
    totalCost: "",
    tokenAmount: "",
    pending: "",
    product: "",
    status: "Pending",
    isReference: false,
    customerName: "",
    email: "",
    contactNumber: "",
    country: "",
    leadPerson: "",
    countryCode: "+1",
    loginId: "",
    password: "",
    leadBy: "",
    saleDate: new Date(),
    currency: "USD", // Default currency
  });
  const [availableLeads, setAvailableLeads] = useState([]);
  const [leadOptions, setLeadOptions] = useState([]);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [leadPersonOptions, setLeadPersonOptions] = useState([]);
  const [loadingLeadPersons, setLoadingLeadPersons] = useState(false);
  // Client search functionality
  const [clientSearchResults, setClientSearchResults] = useState([]);
  const [clientSearchLoading, setClientSearchLoading] = useState(false);
  const [clientSearchQuery, setClientSearchQuery] = useState("");
  const [showClientSearch, setShowClientSearch] = useState(false);
  // Date filtering state
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1); // Current month (1-12)
  const [filterYear, setFilterYear] = useState(new Date().getFullYear()); // Current year
  const [showCurrentMonth, setShowCurrentMonth] = useState(false); // Changed to false - don't filter by default
  const [showAllSales, setShowAllSales] = useState(true); // Changed to true - show all sales by default
  // Advanced filter state
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    country: "",
    course: "",
    salesPerson: "",
    leadPerson: "",
    dateFrom: "",
    dateTo: "",
    amountFrom: "",
    amountTo: "",
    currency: "",
  });
  // Options for filters
  const [filterOptions, setFilterOptions] = useState({
    countries: [],
    courses: [],
    salesPersons: [],
    leadPersons: [],
    currencies: [],
  });
  // Currency options
  const currencyOptions = [
    { value: "USD", label: "USD ($)", symbol: "$" },
    { value: "EUR", label: "EUR (€)", symbol: "€" },
    { value: "GBP", label: "GBP (£)", symbol: "£" },
    { value: "INR", label: "INR (₹)", symbol: "₹" },
    { value: "CAD", label: "CAD ($)", symbol: "$" },
    { value: "AUD", label: "AUD ($)", symbol: "$" },
    { value: "JPY", label: "JPY (¥)", symbol: "¥" },
    { value: "CNY", label: "CNY (¥)", symbol: "¥" },
  ];
  // Generate month options
  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];
  // Generate year options (5 years back from current year)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear - i);
  // Sale status options - must match the enum values in the server's Sale model
  const statusOptions = [
    "Pending",
    "Completed",
    // Only show Cancelled in dropdown for admin users
    ...(user?.role === "Admin" ? ["Cancelled"] : []),
  ];
  // Add a function to get available status options based on user role and current status
  const getAvailableStatusOptions = (currentStatus) => {
    // If status is already Cancelled, show it in options regardless of role
    if (currentStatus === "Cancelled") {
      return ["Pending", "Completed", "Cancelled"];
    }
    return statusOptions;
  };
  // Add new state for delete confirmation
  const [deletingSale, setDeletingSale] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  // State for collapsible advanced filters
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  // Fetch sales data
  useEffect(() => {
    fetchSales();
    fetchUserOptions();
  }, [user]);

  // Handle click outside to close client search dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showClientSearch &&
        !event.target.closest(".client-search-container")
      ) {
        setShowClientSearch(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showClientSearch]);
  // Apply filters when sales or filters change
  useEffect(() => {
    console.log(`Sales data changed: ${sales.length} sales available`);
    console.log("Current filter states:", {
      showAllSales,
      showCurrentMonth,
      filterMonth,
      filterYear,
    });
    if (sales.length > 0) {
      applyAllFilters();
      extractFilterOptions();
    } else {
      // If no sales, clear filtered sales
      setFilteredSales([]);
      console.log("No sales data available, clearing filtered sales");
    }
  }, [sales, filters, filterMonth, filterYear, showCurrentMonth, showAllSales]);
  // Auto-expand advanced filters if any are active
  useEffect(() => {
    const hasActiveFilters = Object.values(filters).some(
      (filter) => filter !== ""
    );
    if (hasActiveFilters && !showAdvancedFilters) {
      setShowAdvancedFilters(true);
    }
  }, [filters, showAdvancedFilters]);
  // Fetch lead persons when NOT in reference sale mode
  useEffect(() => {
    if (!newSale.isReference && leadPersonOptions.length === 0) {
      fetchLeadPersons();
    }
  }, [newSale.isReference]);
  // Function to apply all filters
  const applyAllFilters = () => {
    // Filter out null/undefined sales first
    let filtered = sales.filter((sale) => sale && sale._id);
    // Apply date filters first
    if (showAllSales) {
      // Show all sales regardless of date when showAllSales is true
      console.log("Showing all sales - no date filtering applied");
    } else if (showCurrentMonth) {
      // Show current month data
      const currentMonth = new Date().getMonth() + 1; // 1-12
      const currentYear = new Date().getFullYear();
      filtered = filtered.filter((sale) => {
        if (!sale || (!sale.date && !sale.createdAt)) return false;
        const saleDate = new Date(sale.date || sale.createdAt);
        const saleMonth = saleDate.getMonth() + 1;
        const saleYear = saleDate.getFullYear();
        return saleMonth === currentMonth && saleYear === currentYear;
      });
      console.log(
        `Filtered to current month (${currentMonth}/${currentYear}): ${filtered.length} sales`
      );
    } else {
      // Show selected month/year data
      filtered = filtered.filter((sale) => {
        if (!sale || (!sale.date && !sale.createdAt)) return false;
        const saleDate = new Date(sale.date || sale.createdAt);
        const saleMonth = saleDate.getMonth() + 1;
        const saleYear = saleDate.getFullYear();
        return saleMonth === filterMonth && saleYear === filterYear;
      });
      console.log(
        `Filtered to selected month (${filterMonth}/${filterYear}): ${filtered.length} sales`
      );
    }
    // Apply advanced filters
    // Text search (customer name, email, product, login ID)
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(
        (sale) =>
          (sale.customerName &&
            sale.customerName.toLowerCase().includes(searchTerm)) ||
          (sale.email && sale.email.toLowerCase().includes(searchTerm)) ||
          (sale.product && sale.product.toLowerCase().includes(searchTerm)) ||
          (sale.course && sale.course.toLowerCase().includes(searchTerm)) ||
          (sale.loginId && sale.loginId.toLowerCase().includes(searchTerm)) ||
          (sale.leadBy && sale.leadBy.toLowerCase().includes(searchTerm))
      );
    }
    // Status filter
    if (filters.status) {
      filtered = filtered.filter((sale) => sale.status === filters.status);
    }
    // Country filter
    if (filters.country) {
      filtered = filtered.filter((sale) => sale.country === filters.country);
    }
    // Course/Product filter
    if (filters.course) {
      filtered = filtered.filter(
        (sale) =>
          (sale.course && sale.course === filters.course) ||
          (sale.product && sale.product === filters.course)
      );
    }
    // Sales Person filter
    if (filters.salesPerson) {
      filtered = filtered.filter((sale) => {
        if (!sale || !sale.salesPerson) return false;
        const salesPersonId =
          typeof sale.salesPerson === "object"
            ? sale.salesPerson._id
            : sale.salesPerson;
        return salesPersonId === filters.salesPerson;
      });
    }
    // Lead Person filter
    if (filters.leadPerson) {
      filtered = filtered.filter((sale) => {
        if (!sale || !sale.leadPerson) return false;
        const leadPersonId =
          typeof sale.leadPerson === "object"
            ? sale.leadPerson._id
            : sale.leadPerson;
        return leadPersonId === filters.leadPerson;
      });
    }
    // Date range filter
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      filtered = filtered.filter((sale) => {
        if (!sale || (!sale.date && !sale.createdAt)) return false;
        const saleDate = new Date(sale.date || sale.createdAt);
        return saleDate >= fromDate;
      });
    }
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999); // End of the day
      filtered = filtered.filter((sale) => {
        if (!sale || (!sale.date && !sale.createdAt)) return false;
        const saleDate = new Date(sale.date || sale.createdAt);
        return saleDate <= toDate;
      });
    }
    // Amount range filter
    if (filters.amountFrom) {
      const minAmount = parseFloat(filters.amountFrom);
      filtered = filtered.filter((sale) => {
        if (!sale) return false;
        const amount = parseFloat(sale.amount || sale.totalCost || 0);
        return amount >= minAmount;
      });
    }
    if (filters.amountTo) {
      const maxAmount = parseFloat(filters.amountTo);
      filtered = filtered.filter((sale) => {
        if (!sale) return false;
        const amount = parseFloat(sale.amount || sale.totalCost || 0);
        return amount <= maxAmount;
      });
    }
    // Currency filter
    if (filters.currency) {
      filtered = filtered.filter(
        (sale) =>
          (sale && sale.currency === filters.currency) ||
          (sale && sale.totalCostCurrency === filters.currency)
      );
    }
    console.log(
      `Final filtered sales count: ${filtered.length} out of ${sales.length} total sales`
    );
    setFilteredSales(filtered);
  };
  // Extract filter options from sales data
  const extractFilterOptions = () => {
    const countries = [
      ...new Set(sales.map((sale) => sale.country).filter(Boolean)),
    ];
    const courses = [
      ...new Set(
        sales.map((sale) => sale.course || sale.product).filter(Boolean)
      ),
    ];
    const currencies = [
      ...new Set(
        sales
          .map((sale) => sale.currency || sale.totalCostCurrency)
          .filter(Boolean)
      ),
    ];
    setFilterOptions((prev) => ({
      ...prev,
      countries,
      courses,
      currencies,
    }));
  };
  // Fetch user options for filters
  const fetchUserOptions = async () => {
    try {
      const salesPersonsResponse = await authAPI.getUsers("Sales Person");
      const leadPersonsResponse = await authAPI.getUsers("Lead Person");
      setFilterOptions((prev) => ({
        ...prev,
        salesPersons: salesPersonsResponse.data.data || [],
        leadPersons: leadPersonsResponse.data.data || [],
      }));
    } catch (err) {
      console.error("Error fetching user options:", err);
    }
  };
  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    // Auto-expand filters when a filter is applied
    if (value && !showAdvancedFilters) {
      setShowAdvancedFilters(true);
    }
  };
  // Reset all filters
  const resetFilters = () => {
    setFilters({
      search: "",
      status: "",
      country: "",
      course: "",
      salesPerson: "",
      leadPerson: "",
      dateFrom: "",
      dateTo: "",
      amountFrom: "",
      amountTo: "",
      currency: "",
    });
    setShowCurrentMonth(false);
    setShowAllSales(true);
  };
  // Fetch sales data
  const fetchSales = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching sales data...");
      const response = await salesAPI.getAllForced();
      if (
        response.data &&
        response.data.success &&
        Array.isArray(response.data.data)
      ) {
        console.log(`Successfully loaded ${response.data.data.length} sales`);
        // Process and set the sales data
        const processedSales = response.data.data
          .filter((sale) => sale && sale._id) // Filter out invalid entries
          .map((sale) => ({
            ...sale,
            amount: parseFloat(sale.totalCost || sale.amount || 0),
            token: parseFloat(sale.tokenAmount || sale.token || 0),
            pending:
              sale.status === "Completed"
                ? 0
                : parseFloat(sale.totalCost || sale.amount || 0) -
                  parseFloat(sale.tokenAmount || sale.token || 0),
            product: sale.course || sale.product || "Unknown",
            status: sale.status || "Pending",
            currency: sale.currency || "USD",
            date: sale.date || sale.createdAt,
            remarks: sale.remarks || "", // Ensure remarks are included and defaulted to empty string
          }));
        setSales(processedSales);
        setFilteredSales(processedSales); // Initialize filtered sales
        if (processedSales.length === 0) {
          toast.info("No sales records found.");
        }
      } else {
        throw new Error("Invalid data format received");
      }
    } catch (err) {
      console.error("Error fetching sales:", err);
      setError("Failed to fetch sales data");
      toast.error("Failed to load sales data");
    } finally {
      setLoading(false);
    }
  };
  // Fetch available leads for selection in add sale form
  const fetchAvailableLeads = async () => {
    try {
      setLoadingLeads(true);
      let leadsData = [];
      // If sales person, fetch assigned leads
      if (user.role === "Sales Person") {
        const response = await leadsAPI.getAssigned();
        if (response.data.success) {
          leadsData = response.data.data.filter(
            (lead) => lead.status !== "Converted"
          );
        }
      } else {
        // For admin and manager, fetch all leads
        const response = await leadsAPI.getAll();
        if (response.data.success) {
          leadsData = response.data.data.filter(
            (lead) => lead.status !== "Converted"
          );
        }
      }
      setAvailableLeads(leadsData);
      // Create options for select dropdown
      const options = leadsData.map((lead) => ({
        value: lead._id,
        label: `${lead.name} - ${lead.course} (${lead.status})`,
        data: lead,
      }));
      setLeadOptions(options);
    } catch (err) {
      console.error("Error fetching leads:", err);
      setError("Failed to load leads. Please try again.");
    } finally {
      setLoadingLeads(false);
    }
  };
  // Fetch available lead persons (for lead selection in sales)
  const fetchLeadPersons = async () => {
    try {
      setLoadingLeadPersons(true);
      const response = await authAPI.getUsers("Lead Person");
      if (response.data.success) {
        const options = response.data.data.map((user) => ({
          value: user._id,
          label: user.fullName || user.email,
        }));
        setLeadPersonOptions(options);
      }
    } catch (err) {
      console.error("Error fetching lead persons:", err);
    } finally {
      setLoadingLeadPersons(false);
    }
  };

  // Search for existing clients/customers
  const searchClients = async (query) => {
    if (!query || query.length < 2) {
      setClientSearchResults([]);
      return;
    }

    try {
      setClientSearchLoading(true);
      // Search in both leads and existing sales for customer names
      const [leadsResponse, salesResponse] = await Promise.all([
        leadsAPI.getAll(),
        salesAPI.getAllForced(),
      ]);

      const results = [];

      // Search in leads
      if (leadsResponse.data.success && leadsResponse.data.data) {
        const leadMatches = leadsResponse.data.data
          .filter(
            (lead) =>
              lead.name && lead.name.toLowerCase().includes(query.toLowerCase())
          )
          .map((lead) => ({
            id: lead._id,
            name: lead.name,
            email: lead.email || lead["E-MAIL"] || "",
            phone: lead.phone || lead.NUMBER || "",
            country: lead.country || lead.COUNTRY || "",
            course: lead.course || lead.COURSE || "",
            source: "Lead",
            data: lead,
          }));
        results.push(...leadMatches);
      }

      // Search in existing sales
      if (salesResponse.data.success && salesResponse.data.data) {
        const salesMatches = salesResponse.data.data
          .filter(
            (sale) =>
              sale.customerName &&
              sale.customerName.toLowerCase().includes(query.toLowerCase())
          )
          .map((sale) => ({
            id: sale._id,
            name: sale.customerName,
            email: sale.email || "",
            phone: sale.contactNumber || "",
            country: sale.country || "",
            course: sale.course || sale.product || "",
            source: "Previous Sale",
            data: sale,
          }));
        results.push(...salesMatches);
      }

      // Remove duplicates based on name and email
      const uniqueResults = results.filter(
        (result, index, self) =>
          index ===
          self.findIndex(
            (r) => r.name === result.name && r.email === result.email
          )
      );

      setClientSearchResults(uniqueResults.slice(0, 10)); // Limit to 10 results
    } catch (err) {
      console.error("Error searching clients:", err);
      setClientSearchResults([]);
    } finally {
      setClientSearchLoading(false);
    }
  };

  // Handle client selection from search
  const handleClientSelect = (client) => {
    setNewSale((prev) => ({
      ...prev,
      customerName: client.name,
      email: client.email,
      contactNumber: client.phone,
      country: client.country,
      product: client.course,
      countryCode: client.data.countryCode || "+1",
    }));
    setClientSearchQuery(client.name);
    setShowClientSearch(false);
    setClientSearchResults([]);
  };
  // Handle opening add sale modal
  const handleAddSaleClick = () => {
    fetchAvailableLeads();
    // Always fetch lead persons when opening the add sale modal
    fetchLeadPersons();
    setShowAddModal(true);
    // Reset new sale form
    setNewSale({
      leadId: "",
      totalCost: "",
      tokenAmount: "",
      pending: "",
      product: "",
      status: "Pending",
      isReference: false,
      customerName: "",
      email: "",
      contactNumber: "",
      country: "",
      leadPerson: "",
      countryCode: "+1",
      loginId: "",
      password: "",
      leadBy: "",
      saleDate: new Date(),
      currency: "USD", // Default currency
    });
    // Clear client search
    setClientSearchQuery("");
    setClientSearchResults([]);
    setShowClientSearch(false);
  };
  // Handle lead selection in add form (updated for search functionality)
  const handleLeadSelect = (selectedLeadId, selectedLead = null) => {
    if (selectedLeadId && selectedLead) {
      setNewSale((prev) => ({
        ...prev,
        leadId: selectedLeadId,
        // Get course/product from lead
        product: selectedLead.course || selectedLead.COURSE || "",
        // Store other lead data we'll need for the API
        _selectedLead: selectedLead,
      }));
    } else {
      // Clear selection
      setNewSale((prev) => ({
        ...prev,
        leadId: "",
        product: "",
        _selectedLead: null,
      }));
    }
  };
  // Handle new sale form input changes
  const handleNewSaleChange = (field, value) => {
    setNewSale((prev) => {
      const updated = { ...prev, [field]: value };

      // If amount or token changes, recalculate pending
      if (
        field === "amount" ||
        field === "totalCost" ||
        field === "token" ||
        field === "tokenAmount"
      ) {
        // Get the current amount value (either from the field being updated or from previous state)
        let currentAmount = 0;
        if (field === "amount" || field === "totalCost") {
          currentAmount = parseFloat(value || 0) || 0;
        } else {
          currentAmount = parseFloat(prev.amount || prev.totalCost || 0) || 0;
        }

        // Get the current token value (either from the field being updated or from previous state)
        let currentToken = 0;
        if (field === "token" || field === "tokenAmount") {
          currentToken = parseFloat(value || 0) || 0;
        } else {
          currentToken = parseFloat(prev.token || prev.tokenAmount || 0) || 0;
        }

        // Calculate pending: Amount - Token
        updated.pending = (currentAmount - currentToken).toFixed(2);
      }

      // If status is Completed, set pending to 0
      if (field === "status" && value === "Completed") {
        updated.pending = "0";
      }

      return updated;
    });
  };
  // Toggle between reference and lead-based sale
  const handleReferenceToggle = (isReference) => {
    // If switching to reference sale, fetch lead persons for selection
    setNewSale({
      ...newSale,
      isReference,
      leadId: isReference ? "" : newSale.leadId,
      customerName: isReference ? newSale.customerName : "",
      contactNumber: isReference ? newSale.contactNumber : "",
      email: isReference ? newSale.email : "",
      country: isReference ? newSale.country : "",
      countryCode: isReference ? newSale.countryCode : "+1",
      // Don't reset leadPerson - we want to preserve this selection
    });
    if (!isReference && leadPersonOptions.length === 0) {
      fetchLeadPersons();
    }
  };
  // Submit new sale - simplified without currency conversion complexity
  const handleSubmitNewSale = async (e) => {
    e.preventDefault();
    try {
      // Different validation based on whether it's a reference sale
      if (!newSale.isReference) {
        // Non-reference sale validation
        if (!newSale.leadId) {
          setError("Please select a lead");
          return;
        }
        if (!newSale.product) {
          setError("Please enter a product/course name");
          return;
        }
        // Require a lead person to be selected for regular sales only
        if (!newSale.leadPerson) {
          setError("Please select a lead person who will see this sale");
          return;
        }
      } else {
        // Reference sale validation
        if (!newSale.customerName) {
          setError("Please enter customer name");
          return;
        }
        if (!newSale.contactNumber) {
          setError("Please enter contact number");
          return;
        }
        if (!newSale.product) {
          setError("Please enter a product/course name");
          return;
        }
        if (!newSale.country) {
          setError("Please enter country");
          return;
        }
      }
      // Get fresh token
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication required. Please log in again.");
        return;
      }
      let saleData;
      if (!newSale.isReference) {
        // Process normal sale from lead
        const selectedLead =
          newSale._selectedLead ||
          availableLeads.find((lead) => lead._id === newSale.leadId);
        if (!selectedLead) {
          setError("Lead information not found. Please select a lead again.");
          return;
        }
        // Extract lead details for the sale using the required schema fields
        saleData = {
          // Customer details from lead
          customerName:
            selectedLead.name ||
            selectedLead.NAME ||
            selectedLead.customerName ||
            "Unknown",
          country: selectedLead.country || selectedLead.COUNTRY || "Unknown",
          course: newSale.product, // Use the product field as course
          countryCode: selectedLead.countryCode || selectedLead.CODE || "+1",
          contactNumber:
            selectedLead.phone ||
            selectedLead.contactNumber ||
            selectedLead.NUMBER ||
            selectedLead.MOBILE ||
            "",
          email:
            selectedLead.email ||
            selectedLead["E-MAIL"] ||
            selectedLead.EMAIL ||
            "",
          // ID references
          salesPerson: user._id, // Current user is the sales person
          // Use the explicitly selected lead person
          leadPerson: newSale.leadPerson,
          // Optional fields - new
          loginId: newSale.loginId || "",
          password: newSale.password || "",
          leadBy: newSale.leadBy || "",
          // Source info
          source: selectedLead.source || selectedLead.SOURSE || "",
          clientRemark:
            selectedLead.client || selectedLead["CLIENT REMARK"] || "",
          // Financial info - with currency
          totalCost: parseFloat(newSale.totalCost || 0) || 0,
          tokenAmount: parseFloat(newSale.tokenAmount || 0) || 0,
          currency: newSale.currency || "USD",
          // Status info
          pending:
            newSale.status === "Completed"
              ? false
              : parseFloat(newSale.pending) > 0, // Set to false if status is completed
          status: newSale.status || "Pending",
          // Creation metadata
          createdBy: user._id,
          date: newSale.saleDate || new Date(), // Use selected date or current date
          // Flag to ensure this shows in lead person's dashboard
          isLeadPersonSale: true,
        };
      } else {
        // Process reference sale with manually entered data
        saleData = {
          // Customer details from form
          customerName: newSale.customerName,
          country: newSale.country,
          course: newSale.product,
          countryCode: newSale.countryCode || "+1",
          contactNumber: newSale.contactNumber || "",
          email: newSale.email || "",
          // ID references
          salesPerson: user._id, // Current user is the sales person
          leadPerson: newSale.leadPerson, // Use selected lead person
          // Optional fields - new
          loginId: newSale.loginId || "",
          password: newSale.password || "",
          leadBy: newSale.leadBy || "",
          // Source info
          source: "Reference", // Mark as reference
          isReference: true,
          // Financial info - with currency
          totalCost: parseFloat(newSale.totalCost || 0) || 0,
          tokenAmount: parseFloat(newSale.tokenAmount || 0) || 0,
          currency: newSale.currency || "USD",
          // Status info
          pending:
            newSale.status === "Completed"
              ? false
              : parseFloat(newSale.pending) > 0, // Set to false if status is completed
          status: newSale.status || "Pending",
          // Creation metadata
          createdBy: user._id,
          date: newSale.saleDate || new Date(), // Use selected date or current date
          // Flag to ensure this shows in lead person's dashboard
          isLeadPersonSale: true,
        };
      }

      // Debug: Log the data being sent
      console.log("Creating sale with data:", saleData);
      console.log("Email being sent:", saleData.email);
      console.log("Contact number being sent:", saleData.contactNumber);

      // Use the API service - explicitly set isLeadPersonSale flag to true for both types
      const response = await salesAPI.create({
        ...saleData,
        isLeadPersonSale: true,
      });
      if (response.data && response.data.success) {
        // Add new sale to the list
        setSales((prev) => [response.data.data, ...prev]);
        // Log the sale creation
        try {
          await LoggingService.logSaleCreate(response.data.data);
        } catch (logError) {
          console.error("Error logging sale creation:", logError);
        }
        // Close modal and reset form
        setShowAddModal(false);
        setNewSale({
          leadId: "",
          totalCost: "",
          tokenAmount: "",
          pending: "",
          product: "",
          status: "Pending",
          isReference: false,
          customerName: "",
          email: "",
          contactNumber: "",
          country: "",
          leadPerson: "",
          countryCode: "+1",
          loginId: "",
          password: "",
          leadBy: "",
          saleDate: new Date(),
          currency: "USD", // Default currency
        });
        // Show success message
        toast.success("Sale added successfully!");
        // Refresh data to ensure we have the latest
        refreshData();
      } else {
        setError(response.data?.message || "Failed to add sale");
      }
    } catch (err) {
      // Detailed error handling
      if (err.response) {
        if (err.response.status === 400) {
          // Better handling for validation errors
          const errorMsg = err.response.data?.message || "Invalid data";
          if (errorMsg.includes("enum value for path `status`")) {
            toast.error(
              `Invalid status value. Allowed values are: ${statusOptions.join(
                ", "
              )}`
            );
          } else {
            toast.error(`Bad request: ${errorMsg}`);
          }
        } else if (err.response.status === 401) {
          setError("Authentication failed. Please log in again.");
        } else {
          setError(
            `Failed to add sale: ${err.response.data?.message || err.message}`
          );
        }
      } else {
        setError("Network error while adding sale");
      }
    }
  };
  // Improved helper function to safely extract IDs from possibly nested or string IDs
  const extractId = (obj, field) => {
    if (!obj) return null;
    // If field is direct property and is a string already, return it
    if (typeof obj[field] === "string") return obj[field];
    // If field is an object with _id, return that
    if (obj[field] && obj[field]._id) {
      // MongoDB ObjectId is stored as an object that can be converted to string
      if (typeof obj[field]._id === "object" && obj[field]._id.toString) {
        return obj[field]._id.toString();
      }
      return obj[field]._id;
    }
    // If field itself is an object with an ID property, return that
    if (obj[field] && typeof obj[field].id === "string") return obj[field].id;
    // If the field is an ObjectId that can be converted to string
    if (obj[field] && typeof obj[field] === "object" && obj[field].toString) {
      return obj[field].toString();
    }
    // Return null if nothing found
    return null;
  };
  // Initialize edit values
  const handleEdit = (sale) => {
    if (!sale || !sale._id) {
      console.error("Invalid sale object:", sale);
      toast.error("Cannot edit this sale - invalid data");
      return;
    }
    setEditingSale(sale._id);
    setEditValues({
      amount: parseFloat(Number(sale.amount || sale.totalCost || 0).toFixed(2)),
      token: parseFloat(Number(sale.token || sale.tokenAmount || 0).toFixed(2)),
      pending: parseFloat(
        Number(
          sale.pending ||
            (sale.amount || sale.totalCost || 0) -
              (sale.token || sale.tokenAmount || 0)
        ).toFixed(2)
      ),
      status: sale.status || "Pending",
      product: sale.product || sale.course || "",
      saleDate: sale.date || new Date(),
      loginId: sale.loginId || "",
      password: sale.password || "",
      leadBy: sale.leadBy || "",
      currency: sale.currency || "USD",
      remarks: sale.remarks || "", // Initialize remarks from existing sale
    });
  };
  // Handle saving edits
  const handleSave = async (saleId) => {
    try {
      // Find the original sale for data we don't want to change
      const originalSale = sales.find((sale) => sale && sale._id === saleId);
      if (!originalSale) {
        setError("Sale not found");
        return;
      }
      // Create update data matching the schema
      const updateData = {
        // Keep original customer info
        customerName: originalSale.customerName,
        country: originalSale.country,
        course: editValues.product || originalSale.course, // Update course/product
        countryCode: originalSale.countryCode,
        contactNumber: originalSale.contactNumber,
        email: originalSale.email,
        // Updated fields
        salesPerson:
          editValues.salesPerson ||
          originalSale.salesPerson?._id ||
          originalSale.salesPerson,
        leadPerson: originalSale.leadPerson?._id || originalSale.leadPerson,
        source: originalSale.source,
        clientRemark: originalSale.clientRemark,
        totalCost: parseFloat(editValues.amount) || originalSale.totalCost,
        tokenAmount: parseFloat(editValues.token) || originalSale.tokenAmount,
        currency: editValues.currency || originalSale.currency,
        status: editValues.status || originalSale.status,
        remarks: editValues.remarks !== undefined ? editValues.remarks : originalSale.remarks || "",
        isReference: originalSale.isReference || false,
        date: editValues.saleDate || originalSale.date,
        loginId: editValues.loginId || originalSale.loginId || "",
        password: editValues.password || originalSale.password || "",
        leadBy: editValues.leadBy || originalSale.leadBy || "",
        // Update metadata
        updatedBy: user._id,
        updatedAt: new Date(),
      };
      // Use the API service
      const response = await salesAPI.update(saleId, updateData);
      if (response.data && response.data.success) {
        // Log the sale update
        try {
          await LoggingService.logSaleUpdate(saleId, updateData);
        } catch (logError) {
          console.error("Error logging sale update:", logError);
        }
        // Immediately update the local state with the new data
        const updatedSale = response.data.data;
        setSales((prevSales) =>
          prevSales.map((sale) =>
            sale && sale._id === saleId ? updatedSale : sale
          )
        );
        setFilteredSales((prevFiltered) =>
          prevFiltered.map((sale) =>
            sale && sale._id === saleId ? updatedSale : sale
          )
        );
        // Clear edit state
        setEditingSale(null);
        setEditValues({});
        toast.success("Sale updated successfully");
      } else {
        toast.error(response.data?.message || "Failed to update sale");
      }
    } catch (err) {
      console.error("Error updating sale:", err);
      toast.error(err.response?.data?.message || "Error updating sale");
    }
  };
  // Fixed handleInputChange to properly handle numeric values
  const handleInputChange = (field, value) => {
    setEditValues((prev) => {
      const updated = { ...prev, [field]: value };
      // If we're updating amount or token, recalculate the pending amount with proper rounding
      if (field === "amount" || field === "token") {
        const amount =
          parseFloat(
            Number(field === "amount" ? value : prev.amount).toFixed(2)
          ) || 0;
        const tokenAmount =
          parseFloat(
            Number(field === "token" ? value : prev.token).toFixed(2)
          ) || 0;
        updated.pending = parseFloat((amount - tokenAmount).toFixed(2));
      }
      // If status is set to Completed, set pending to 0
      if (field === "status" && value === "Completed") {
        updated.pending = 0;
      }
      return updated;
    });
  };
  // Fixed function to determine if user can edit a sale
  const canEditSale = (sale) => {
    if (!sale || !user || !user._id || !user.role) return false;
    // Get sales person ID handling both object and string formats
    const salesPersonId = extractId(sale, "salesPerson");
    const userId = user._id;
    // Sales person can edit their own sales
    if (user.role === "Sales Person") {
      const isOwnSale =
        salesPersonId &&
        userId &&
        salesPersonId.toString() === userId.toString();
      return isOwnSale;
    }
    // Lead person can edit sales they are the lead for
    if (user.role === "Lead Person") {
      const leadPersonId = extractId(sale, "leadPerson");
      return (
        leadPersonId && userId && leadPersonId.toString() === userId.toString()
      );
    }
    // Admins and managers can edit any sale
    return ["Admin", "Manager"].includes(user.role);
  };
  // Fixed function to determine if user can delete a sale
  const canDeleteSale = (sale) => {
    if (!sale || !user || !user._id || !user.role) return false;

    // Get sales person ID handling both object and string formats
    const salesPersonId = extractId(sale, "salesPerson");
    const userId = user._id;

    // Sales person can delete their own sales
    if (user.role === "Sales Person") {
      const isOwnSale =
        salesPersonId &&
        userId &&
        salesPersonId.toString() === userId.toString();
      return isOwnSale;
    }

    // Admins and managers can delete any sale
    return ["Admin", "Manager"].includes(user.role);
  };

  // Handle delete sale - improved to fix 403 errors
  const handleDeleteSale = async (saleId) => {
    try {
      setDeletingSale(saleId);

      // Find the original sale to include necessary data
      const saleToDelete = sales.find((sale) => sale._id === saleId);
      if (!saleToDelete) {
        toast.error("Sale not found");
        return;
      }

      // Use the API service instead of direct Axios call
      const response = await salesAPI.delete(saleId);

      if (response.data && response.data.success) {
        // Remove the deleted sale from state
        setSales((prevSales) =>
          prevSales.filter((sale) => sale._id !== saleId)
        );
        toast.success("Sale deleted successfully!");

        // Refresh sales data to ensure we have the latest
        fetchSales();
      } else {
        toast.error(response.data?.message || "Failed to delete sale");
      }
    } catch (err) {
      // Detailed error handling
      if (err.response) {
        if (err.response.status === 403) {
          toast.error(
            "You don't have permission to delete this sale. Only the creator or an admin can delete it."
          );
        } else if (err.response.status === 401) {
          toast.error("Your session has expired. Please log in again.");
        } else {
          toast.error(
            err.response.data?.message || "Server error while deleting sale"
          );
        }
      } else {
        toast.error("Network error while deleting sale");
      }
    } finally {
      setDeletingSale(null);
      setConfirmDelete(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Handle month change
  const handleMonthChange = (e) => {
    setFilterMonth(parseInt(e.target.value));
    setShowCurrentMonth(false);
    setShowAllSales(false); // Disable show all when selecting specific month
  };

  // Handle year change
  const handleYearChange = (e) => {
    setFilterYear(parseInt(e.target.value));
    setShowCurrentMonth(false);
    setShowAllSales(false); // Disable show all when selecting specific year
  };

  // Handle reset to current month
  const handleResetToCurrentMonth = () => {
    const today = new Date();
    setFilterMonth(today.getMonth() + 1);
    setFilterYear(today.getFullYear());
    setShowCurrentMonth(true);
    setShowAllSales(false); // Disable show all when resetting to current month
  };

  // Handle show all sales toggle for Managers and Admins
  const handleShowAllSales = () => {
    setShowAllSales(!showAllSales);
    if (!showAllSales) {
      // When enabling show all, disable other filters
      setShowCurrentMonth(false);
    }
  };

  const handleRemarksChange = async (saleId, newRemarks) => {
    try {
      const targetSale = sales.find((sale) => sale._id === saleId);
      if (!targetSale) return;

      if (!canEditSale(targetSale)) {
        toast.error("You don't have permission to update this sale");
        return;
      }

      setEditingSale(saleId);

      // Only send necessary fields for update
      const updateData = {
        remarks: newRemarks,
        updatedBy: user.id,
      };

      // Make API call to update remarks using salesAPI
      const response = await salesAPI.update(saleId, updateData);

      if (response.data.success) {
        // Update local state with new remarks
        setSales((prevSales) =>
          prevSales.map((sale) =>
            sale._id === saleId ? { ...sale, remarks: newRemarks } : sale
          )
        );
        toast.success("Remarks updated successfully");
      } else {
        toast.error("Failed to update remarks");
      }
    } catch (error) {
      console.error("Error updating remarks:", error);
      toast.error("Error updating remarks");
    } finally {
      setEditingSale(null);
    }
  };

  const handleStatusChange = async (saleId, newStatus) => {
    try {
      // Only proceed if user can edit this sale
      const targetSale = sales.find((sale) => sale._id === saleId);
      if (!targetSale) return;

      if (!canEditSale(targetSale)) {
        toast.error("You don't have permission to update this sale");
        return;
      }

      // Check if user has permission to set status to Cancelled
      if (newStatus === "Cancelled" && user?.role !== "Admin") {
        toast.error("Only administrators can cancel sales");
        return;
      }

      setEditingSale(saleId);

      // Only send necessary fields for update
      const updateData = {
        status: newStatus,
        remarks: targetSale.remarks || "", // Preserve existing remarks
        updatedBy: user.id,
      };

      // Make API call to update status using salesAPI
      const response = await salesAPI.update(saleId, updateData);

      if (response.data.success) {
        // Update local state
        setSales((prevSales) =>
          prevSales.map((sale) =>
            sale._id === saleId ? { ...sale, status: newStatus } : sale
          )
        );
        toast.success("Status updated successfully");
      } else {
        toast.error("Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Error updating status");
    } finally {
      setEditingSale(null);
    }
  };

  // Open WhatsApp with the phone number
  const openWhatsApp = (phone, countryCode) => {
    if (!phone) return;

    try {
      let cleanPhone = phone.toString().replace(/\D/g, "");

      // Get country code without + symbol
      const dialCode = countryCode
        ? countryCode.toString().replace(/^\+/, "")
        : "1";

      // Check if phone already contains the country code to avoid duplication
      if (cleanPhone.startsWith(dialCode)) {
        // Phone already has country code, use as is
        const whatsappUrl = `https://wa.me/${cleanPhone}`;
        window.open(whatsappUrl, "_blank", "noopener,noreferrer");
      } else {
        // Add country code
        const whatsappUrl = `https://wa.me/${dialCode}${cleanPhone}`;
        window.open(whatsappUrl, "_blank", "noopener,noreferrer");
      }
    } catch (error) {
      toast.error("Could not open WhatsApp. Please try again.");
    }
  };

  // Open email client with the email address
  const openEmail = (email) => {
    if (!email) return;
    window.location.href = `mailto:${email}`;
  };

  // Add function to refresh data after operations
  const refreshData = async () => {
    try {
      // Clear the state first to ensure update
      setSales([]);
      setFilteredSales([]);

      // Set loading state
      setLoading(true);

      // Use the API service with cache busting parameter
      const timestamp = new Date().getTime();
      const response = await salesAPI.getAllForced();

      if (response.data && response.data.success) {
        // Initialize sales with additional fields we want to track
        // Add extra safety checks for data structure
        if (!Array.isArray(response.data.data)) {
          console.error(
            "RefreshData: Sales data is not an array:",
            response.data.data
          );
          toast.error("Invalid data format received from server");
          return;
        }

        // Filter out null/undefined values and items without _id before processing
        const validSales = response.data.data.filter((sale) => {
          // More robust filtering
          return (
            sale &&
            typeof sale === "object" &&
            sale._id !== null &&
            sale._id !== undefined &&
            sale._id !== ""
          );
        });

        console.log(
          `RefreshData: Original array length: ${response.data.data.length}, Valid sales: ${validSales.length}`
        );

        if (response.data.data.length !== validSales.length) {
          console.log(
            `RefreshData: Filtered out ${
              response.data.data.length - validSales.length
            } null/invalid sales from ${response.data.data.length} total`
          );
        }

        const processedSales = validSales.map((sale) => {
          // Final safety check in case somehow a null value got through
          if (!sale || !sale._id) {
            console.error("Null sale in refreshData processing:", sale);
            return null;
          }

          // Create a properly formatted sale object with consistent fields
          const formattedSale = {
            ...sale,
            _id: sale._id,
            // Convert ObjectId to string if needed
            salesPerson:
              typeof sale.salesPerson === "object"
                ? sale.salesPerson._id || sale.salesPerson
                : sale.salesPerson,
            // Ensure all financial fields exist
            amount: parseFloat(sale.totalCost || 0),
            token: parseFloat(sale.tokenAmount || 0),
            pending:
              sale.status === "Completed"
                ? 0
                : parseFloat(sale.totalCost || 0) -
                  parseFloat(sale.tokenAmount || 0),
            // Ensure we have product info
            product: sale.course || sale.product || "Unknown",
            // Ensure we have a status
            status: sale.status || "Pending",
            // Ensure login credentials are preserved
            loginId: sale.loginId || "",
            password: sale.password || "",
            leadBy: sale.leadBy || "",
            // Ensure currency is preserved
            currency: sale.currency || "USD",
            // Ensure date is properly captured
            date: sale.date || sale.createdAt,
            // Ensure remarks are preserved
            remarks: sale.remarks || "",
          };

          return formattedSale;
        });

        // Filter out any null values that might have been returned by the map function
        const finalSales = processedSales.filter((sale) => sale !== null);

        // Update the sales state
        setSales(finalSales);
      } else {
        toast.error("Failed to refresh sales data. Please try again.");
      }
    } catch (err) {
      toast.error("Failed to refresh data. Please reload the page.");
    } finally {
      setLoading(false);

      // For new sales, refresh leads too
      if (showAddModal) {
        fetchAvailableLeads();
      }
    }
  };

  // Safely get a value from a possibly undefined property
  const safeGet = (obj, path, defaultValue = "N/A") => {
    if (!obj) return defaultValue;
    const keys = path.split(".");
    let result = obj;

    for (const key of keys) {
      if (
        result === null ||
        result === undefined ||
        typeof result !== "object"
      ) {
        return defaultValue;
      }
      result = result[key];
    }

    return result === null || result === undefined ? defaultValue : result;
  };

  // Add a formatter for customer name that handles different field formats
  const formatCustomerName = (sale) => {
    if (!sale) return "N/A";

    // Try different possible locations for customer name
    return (
      sale.customerName ||
      safeGet(sale, "leadId.name") ||
      safeGet(sale, "leadId.NAME") ||
      "Unknown Customer"
    );
  };

  // Add a formatter for sales person name that handles different field formats
  const formatSalesPersonName = (sale) => {
    if (!sale) return "N/A";

    // If salesPerson is an object with fullName or name
    if (typeof sale.salesPerson === "object" && sale.salesPerson) {
      return (
        sale.salesPerson.fullName ||
        sale.salesPerson.name ||
        sale.salesPerson.email ||
        "Unknown Sales Person"
      );
    }

    // If salesPerson is just an ID, try to find the name in filterOptions
    if (typeof sale.salesPerson === "string" && filterOptions.salesPersons) {
      const salesPersonData = filterOptions.salesPersons.find(
        (sp) => sp._id === sale.salesPerson
      );
      return salesPersonData
        ? salesPersonData.fullName ||
            salesPersonData.name ||
            salesPersonData.email
        : "Unknown Sales Person";
    }

    // If we have a direct salesPersonName field
    if (sale.salesPersonName) {
      return sale.salesPersonName;
    }

    return "N/A";
  };

  // Render a small tooltip with permission info, shown on hover
  const PermissionTooltip = ({ role }) => {
    let message = "";

    if (role === "Sales Person") {
      message =
        "As a Sales Person, you can only update the status of your own sales.";
    } else if (role === "Lead Person") {
      message = "As a Lead Person, you can only edit your own leads.";
    }

    return message ? (
      <div className="relative inline-block ml-1 text-gray-400 dark:text-gray-400">
        <span className="cursor-help text-sm">
          <i className="fas fa-info-circle"></i>
          <span className="tooltip absolute invisible group-hover:visible bg-gray-800 text-white p-2 rounded text-xs w-48 -mt-16 -ml-24 z-10">
            {message}
          </span>
        </span>
      </div>
    ) : null;
  };

  // Replace the 'You don't have permission' message with a more helpful one
  const getPermissionMessage = (sale, userRole) => {
    if (!sale) return "Invalid sale data";

    if (userRole === "Sales Person") {
      const salesPersonId = extractId(sale, "salesPerson");
      const userId = user?._id;

      if (
        salesPersonId &&
        userId &&
        salesPersonId.toString() === userId.toString()
      ) {
        return "As a Sales Person, you can edit and delete your own sales";
      } else {
        return "You can only edit and delete sales you created as a Sales Person";
      }
    }

    // Default message
    return "You don't have permission to update this sale. Only the creator or an admin can update it.";
  };

  // Render a sale row
  const renderSaleRow = (sale, index) => (
    <tr
      key={sale._id}
      onClick={() => handleEdit(sale)}
      className={`cursor-pointer ${
        index % 2 === 0
          ? "bg-white dark:bg-gray-800"
          : "bg-gray-50 dark:bg-gray-700"
      }`}
    >
      {/* Date Column */}
      <td className="px-2 py-2 whitespace-normal break-words">
        {editingSale === sale._id ? (
          <div className="flex flex-col space-y-2">
            <input
              type="date"
              value={
                editValues.saleDate
                  ? new Date(editValues.saleDate).toISOString().split("T")[0]
                  : new Date(sale.date || sale.createdAt)
                      .toISOString()
                      .split("T")[0]
              }
              onChange={(e) =>
                handleInputChange("saleDate", new Date(e.target.value))
              }
              className="w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
            <div className="flex space-x-2">
              <button
                onClick={() => handleSave(sale._id)}
                className="text-green-600 hover:text-green-900 flex items-center text-xs px-2 py-1 bg-green-50 rounded"
              >
                <FaCheck className="mr-1" /> Save
              </button>
              <button
                onClick={() => {
                  setEditingSale(null);
                  setEditValues({});
                }}
                className="text-red-600 hover:text-red-900 flex items-center text-xs px-2 py-1 bg-red-50 rounded"
              >
                <FaTimes className="mr-1" /> Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col space-y-2">
            <div className="text-sm text-gray-900 dark:text-white">
              {formatDate(sale.date || sale.createdAt || new Date())}
            </div>
          </div>
        )}
      </td>
      {/* Customer Column */}
      <td className="px-2 py-2 whitespace-normal break-words">
        <div className="text-sm font-medium text-gray-900 dark:text-white">
          {formatCustomerName(sale)}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-500">
          {sale.product || safeGet(sale, "leadId.course") || "No product"}
        </div>
        {editingSale === sale._id && (
          <div className="mt-2">
            <input
              type="text"
              placeholder="Lead By (Optional)"
              value={editValues.leadBy || ""}
              onChange={(e) => handleInputChange("leadBy", e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3 text-gray-400 dark:text-gray-400 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Name of person who led this sale</span>
            </div>
          </div>
        )}
        {!editingSale === sale._id && sale.leadBy && (
          <div className="text-xs text-gray-600 dark:text-gray-500 mt-1">
            Lead By: {sale.leadBy}
          </div>
        )}
      </td>
      {/* Contact Column */}
      <td className="px-2 py-2">
        <div className="flex flex-col space-y-1">
          {(sale.contactNumber || safeGet(sale, "leadId.phone")) && (
            <div className="flex items-center">
              <button
                onClick={() =>
                  openWhatsApp(
                    sale.contactNumber || safeGet(sale, "leadId.phone"),
                    sale.countryCode ||
                      safeGet(sale, "leadId.countryCode", "+91")
                  )
                }
                className="text-sm text-gray-900 dark:text-white flex items-center hover:text-green-600"
                title="Open in WhatsApp"
              >
                <FaWhatsapp className="mr-1 text-green-500" />
                {(() => {
                  const phone =
                    sale.contactNumber || safeGet(sale, "leadId.phone");
                  const countryCode =
                    sale.countryCode ||
                    safeGet(sale, "leadId.countryCode", "+91");

                  // If phone already starts with +, don't add country code
                  if (phone && phone.toString().startsWith("+")) {
                    return phone;
                  }
                  // If phone already starts with country code (without +), don't add it again
                  if (
                    phone &&
                    countryCode &&
                    phone.toString().startsWith(countryCode.replace("+", ""))
                  ) {
                    return `+${phone}`;
                  }
                  // Otherwise, combine country code and phone
                  return `${countryCode} ${phone}`;
                })()}
              </button>
            </div>
          )}
          {(sale.email || safeGet(sale, "leadId.email")) && (
            <div className="flex items-center">
              <button
                onClick={() =>
                  openEmail(sale.email || safeGet(sale, "leadId.email"))
                }
                className="text-sm text-gray-500 dark:text-gray-500 flex items-center hover:text-blue-600"
                title="Send email"
              >
                <FaEnvelope className="mr-1 text-blue-500" />
                {sale.email || safeGet(sale, "leadId.email")}
              </button>
            </div>
          )}
          {editingSale === sale._id && (
            <div className="mt-2 flex flex-col space-y-2">
              <input
                type="text"
                placeholder="Login ID (Optional)"
                value={editValues.loginId || ""}
                onChange={(e) => handleInputChange("loginId", e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
              <input
                type="text"
                placeholder="Password (Optional)"
                value={editValues.password || ""}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
          )}
          {!editingSale === sale._id && (sale.loginId || sale.password) && (
            <div className="mt-2 text-xs">
              {sale.loginId && <div>Login ID: {sale.loginId}</div>}
              {sale.password && <div>Password: {sale.password}</div>}
            </div>
          )}
        </div>
      </td>
      {/* Product Column */}
      <td className="px-2 py-2 whitespace-normal break-words">
        {editingSale === sale._id ? (
          <div>
            <input
              type="text"
              value={editValues.product || ""}
              onChange={(e) => handleInputChange("product", e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="Product or course name"
            />
            {sale.leadPerson &&
              typeof sale.leadPerson === "object" &&
              sale.leadPerson.fullName ? (
                <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Lead Person: {sale.leadPerson.fullName}
                </div>
              ) : sale.isReference ? (
                <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Lead Person: Reference
                </div>
              ) : null}
          </div>
        ) : (
          <div className="text-sm text-gray-900 dark:text-white">
            {sale.product || safeGet(sale, "course") || "N/A"}
          </div>
        )}
        {!editingSale === sale._id &&
          (sale.leadPerson &&
            typeof sale.leadPerson === "object" &&
            sale.leadPerson.fullName ? (
              <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Lead Person: {sale.leadPerson.fullName}
              </div>
            ) : sale.isReference ? (
              <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Lead Person: Reference
              </div>
            ) : null)}
      </td>
      {/* Sales Person Column */}
      <td className="px-2 py-2 whitespace-normal break-words">
        {editingSale === sale._id ? (
          <div className="flex flex-col space-y-2">
            <select
              value={editValues.salesPerson || sale.salesPerson?._id || ""}
              onChange={(e) => handleInputChange("salesPerson", e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">Select Sales Person</option>
              {filterOptions.salesPersons.map((sp) => (
                <option key={sp._id} value={sp._id}>
                  {sp.fullName}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="text-sm text-gray-900 dark:text-white">
            {sale.salesPerson?.fullName || "N/A"}
          </div>
        )}
      </td>
      {/* Amount Column */}
      <td className="px-2 py-2 whitespace-normal break-words">
        {editingSale === sale._id ? (
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-500">
                  {getCurrencySymbol(editValues.currency)}
                </span>
                <input
                  id="amount"
                  type="number"
                  value={
                    editValues.amount !== undefined
                      ? editValues.amount.toString()
                      : "0"
                  }
                  onChange={(e) => handleInputChange("amount", e.target.value)}
                  className="w-24 px-2 pl-7 border border-gray-300 dark:border-slate-600 rounded"
                />
              </div>
              <select
                value={editValues.currency || "USD"}
                onChange={(e) => handleInputChange("currency", e.target.value)}
                className="border border-gray-300 dark:border-slate-600 rounded p-1 text-xs"
              >
                {currencyOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : (
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {formatCurrency(
              sale.amount || sale.totalCost || 0,
              sale.currency || "USD"
            )}
          </div>
        )}
      </td>
      {/* Token Column */}
      <td className="px-2 py-2 whitespace-normal break-words">
        {editingSale === sale._id ? (
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-500">
              {getCurrencySymbol(editValues.currency)}
            </span>
            <input
              id="token"
              type="number"
              value={
                editValues.token !== undefined
                  ? editValues.token.toString()
                  : "0"
              }
              onChange={(e) => handleInputChange("token", e.target.value)}
              className="w-24 px-2 pl-7 border border-gray-300 dark:border-slate-600 rounded"
            />
          </div>
        ) : (
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {formatCurrency(
              sale.token || sale.tokenAmount || 0,
              sale.currency || "USD"
            )}
          </div>
        )}
      </td>
      {/* Pending Column */}
      <td className="px-2 py-2 whitespace-normal break-words">
        {editingSale === sale._id ? (
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-500">
              {getCurrencySymbol(editValues.currency)}
            </span>
            <input
              id="pending"
              type="number"
              value={
                editValues.pending !== undefined
                  ? editValues.pending.toString()
                  : "0"
              }
              onChange={(e) => handleInputChange("pending", e.target.value)}
              className="w-24 px-2 pl-7 border border-gray-300 dark:border-slate-600 rounded"
              disabled={editValues.status === "Completed"}
            />
          </div>
        ) : (
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {formatCurrency(
              sale.status === "Completed"
                ? 0
                : sale.pending !== undefined
                ? sale.pending
                : (sale.amount || sale.totalCost || 0) -
                  (sale.token || sale.tokenAmount || 0),
              sale.currency || "USD"
            )}
          </div>
        )}
      </td>
      {/* Status Column */}
      <td className="px-2 py-2 whitespace-normal break-words">
        {editingSale === sale._id ? (
          <select
            value={editValues.status || sale.status}
            onChange={(e) => handleInputChange("status", e.target.value)}
            className={`text-sm px-2 py-1 rounded cursor-pointer ${
              sale.status === "Pending"
                ? "bg-yellow-100 text-yellow-800"
                : sale.status === "Completed"
                ? "bg-green-100 text-green-800"
                : sale.status === "Cancelled"
                ? "bg-red-100 text-red-800"
                : "bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200"
            } border border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400`}
            disabled={!canEditSale(sale)}
          >
            {getAvailableStatusOptions(sale.status).map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        ) : (
          <div className="relative">
            <select
              value={sale.status || "Pending"}
              onChange={(e) => handleStatusChange(sale._id, e.target.value)}
              className={`text-sm px-2 py-1 rounded cursor-pointer appearance-none w-auto pr-8 ${
                sale.status === "Pending"
                  ? "bg-yellow-100 text-yellow-800"
                  : sale.status === "Completed"
                  ? "bg-green-100 text-green-800"
                  : sale.status === "Cancelled"
                  ? "bg-red-100 text-red-800"
                  : "bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200"
              } border border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400`}
              disabled={!canEditSale(sale)}
            >
              {getAvailableStatusOptions(sale.status).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-400">
              <svg
                className="fill-current h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
            {!canEditSale(sale) && (
              <div className="absolute left-0 -bottom-5 w-full">
                <div className="text-xs text-gray-500 dark:text-gray-500 italic">
                  {user?.role === "Sales Person"
                    ? "Can only update your own sales"
                    : "No edit permission"}
                </div>
              </div>
            )}
          </div>
        )}
      </td>
      {/* Remarks Column */}
      <td className="px-2 py-2 whitespace-normal break-words text-sm text-gray-500 dark:text-gray-400">
        {editingSale === sale._id ? (
          <div className="space-y-2">
            <textarea
              value={editValues.remarks || ""}
              onChange={(e) => handleInputChange("remarks", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="Enter remarks (optional - leave blank to clear)"
              rows="2"
            />
            <div className="text-xs text-gray-500">Optional - leave blank to clear remarks</div>
          </div>
        ) : (
          <div className="text-sm max-w-xs overflow-hidden">
            {sale.remarks || "-"}
          </div>
        )}
      </td>
      {/* Actions Column */}
      <td className="px-2 py-2 whitespace-normal break-words text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center space-x-2">
          {canDeleteSale(sale) && (
            <button
              onClick={() => handleDelete(sale._id)}
              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-150"
              title="Delete sale"
            >
              <FaTrash className="h-5 w-5" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );

  // Format currency for display
  const formatCurrency = (value, currencyCode = "USD") => {
    // Get the currency symbol
    const currency =
      currencyOptions.find((c) => c.value === currencyCode) ||
      currencyOptions[0];
    const symbol = currency.symbol;

    // Return formatted currency
    return `${symbol}${parseFloat(value || 0).toFixed(2)}`;
  };

  // Get currency symbol
  const getCurrencySymbol = (currencyCode = "USD") => {
    const currency =
      currencyOptions.find((c) => c.value === currencyCode) ||
      currencyOptions[0];
    return currency.symbol;
  };

  // Add this function near other handler functions
  const handleDelete = async (saleId) => {
    try {
      if (!window.confirm("Are you sure you want to delete this sale?")) {
        return;
      }

      const response = await salesAPI.delete(saleId);

      if (response.data.success) {
        // Remove the sale from both sales and filtered sales
        setSales((prevSales) =>
          prevSales.filter((sale) => sale._id !== saleId)
        );
        setFilteredSales((prevSales) =>
          prevSales.filter((sale) => sale._id !== saleId)
        );
        toast.success("Sale deleted successfully");
      } else {
        toast.error("Failed to delete sale");
      }
    } catch (error) {
      console.error("Error deleting sale:", error);
      toast.error("Error deleting sale");
    }
  };

  return (
    <Layout>
      <div className="w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Sales Tracking</h2>
          <div className="flex gap-2">
            {/* Export button - only visible to Admin and Manager */}
            {(user?.role === 'Admin' || user?.role === 'Manager') && (
              <button
                onClick={() => {
                  try {
                    if (!filteredSales || filteredSales.length === 0) {
                      toast.error('No sales data to export');
                      return;
                    }
                    
                    // Generate filename with current date and filter info
                    const dateStr = new Date().toISOString().split('T')[0];
                    let filename = `sales-export-${dateStr}`;
                    
                    // Add filter info to filename if filters are active
                    const hasFilters = Object.values(filters).some(f => f !== '') || 
                                     !showAllSales || 
                                     showCurrentMonth;
                    if (hasFilters) {
                      filename += '-filtered';
                    }
                    filename += '.csv';
                    
                    exportSalesToCSV(filteredSales, filename);
                    toast.success(`Exported ${filteredSales.length} sales to CSV`);
                  } catch (error) {
                    console.error('Error exporting CSV:', error);
                    toast.error('Failed to export CSV: ' + (error.message || 'Unknown error'));
                  }
                }}
                className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md transition duration-300 flex items-center gap-2"
                disabled={loading || !filteredSales || filteredSales.length === 0}
                title="Export filtered sales data to CSV (Google Sheets compatible)"
              >
                <FaFileExport />
                {loading || !filteredSales || filteredSales.length === 0 
                  ? 'Export' 
                  : `Export (${filteredSales.length})`
                }
              </button>
            )}
            <button
              onClick={fetchSales}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition duration-300"
              disabled={loading}
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
            <button
              onClick={handleAddSaleClick}
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md transition duration-300"
            >
              Add New Sale
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-md">
            {error}
          </div>
        )}

        {/* Debug information */}
        {!loading && (
          <div className="mb-4 p-3 bg-blue-50 text-blue-700 border border-blue-200 rounded-md text-sm">
            <strong>Debug Info:</strong> Total Sales: {sales.length} | Filtered
            Sales: {filteredSales.length} | Show All:{" "}
            {showAllSales ? "Yes" : "No"} | Show Current Month:{" "}
            {showCurrentMonth ? "Yes" : "No"} | Filter Month/Year: {filterMonth}
            /{filterYear}
          </div>
        )}

        {/* Loading indicator */}
        {loading ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-500">
              Loading sales data...
            </p>
          </div>
        ) : (
          <>
            {/* Advanced Filters */}
            <div className="bg-white dark:bg-slate-900 transition-all duration-200 ease-out border border-slate-200 dark:border-slate-700 rounded-lg shadow-md dark:shadow-2xl mb-6 shadow-sm">
              <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-slate-700">
                <div className="flex items-center space-x-3">
                  <h2 className="text-lg font-medium">Advanced Filters</h2>
                  {Object.values(filters).some((filter) => filter !== "") && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {
                        Object.values(filters).filter((filter) => filter !== "")
                          .length
                      }{" "}
                      active
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={resetFilters}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Reset All
                  </button>
                  <button
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    className="flex items-center text-sm text-gray-600 dark:text-gray-200 hover:text-gray-800"
                  >
                    {showAdvancedFilters ? "Hide Filters" : "Show Filters"}
                    <svg
                      className={`ml-1 h-4 w-4 transform transition-transform ${
                        showAdvancedFilters ? "rotate-180" : ""
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {showAdvancedFilters && (
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Search Field */}
                    <div>
                      <label
                        htmlFor="search"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1"
                      >
                        Search
                      </label>
                      <input
                        type="text"
                        id="search"
                        name="search"
                        placeholder="Search customer, email, product..."
                        value={filters.search}
                        onChange={handleFilterChange}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 focus:ring-offset-2 focus:border-blue-500"
                      />
                    </div>

                    {/* Status Filter */}
                    <div>
                      <label
                        htmlFor="status"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1"
                      >
                        Status
                      </label>
                      <select
                        id="status"
                        name="status"
                        value={filters.status}
                        onChange={handleFilterChange}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 focus:ring-offset-2 focus:border-blue-500"
                      >
                        <option value="">All Statuses</option>
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Sales Person Filter - Only show for Admin/Manager */}
                    {(user?.role === "Admin" || user?.role === "Manager") && (
                      <div>
                        <label
                          htmlFor="salesPerson"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1"
                        >
                          Sales Person
                        </label>
                        <select
                          id="salesPerson"
                          name="salesPerson"
                          value={filters.salesPerson}
                          onChange={handleFilterChange}
                          className="w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 focus:ring-offset-2 focus:border-blue-500"
                        >
                          <option value="">All Sales Persons</option>
                          {filterOptions.salesPersons.map((salesPerson) => (
                            <option
                              key={salesPerson._id}
                              value={salesPerson._id}
                            >
                              {salesPerson.fullName}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Country Filter */}
                    <div>
                      <label
                        htmlFor="country"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1"
                      >
                        Country
                      </label>
                      <select
                        id="country"
                        name="country"
                        value={filters.country}
                        onChange={handleFilterChange}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 focus:ring-offset-2 focus:border-blue-500"
                      >
                        <option value="">All Countries</option>
                        {filterOptions.countries.map((country) => (
                          <option key={country} value={country}>
                            {country}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Course/Product Filter */}
                    <div>
                      <label
                        htmlFor="course"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1"
                      >
                        Course/Product
                      </label>
                      <select
                        id="course"
                        name="course"
                        value={filters.course}
                        onChange={handleFilterChange}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 focus:ring-offset-2 focus:border-blue-500"
                      >
                        <option value="">All Courses</option>
                        {filterOptions.courses.map((course) => (
                          <option key={course} value={course}>
                            {course}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Lead Person Filter */}
                    <div>
                      <label
                        htmlFor="leadPerson"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1"
                      >
                        Lead Person
                      </label>
                      <select
                        id="leadPerson"
                        name="leadPerson"
                        value={filters.leadPerson}
                        onChange={handleFilterChange}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 focus:ring-offset-2 focus:border-blue-500"
                      >
                        <option value="">All Lead Persons</option>
                        {filterOptions.leadPersons.map((leadPerson) => (
                          <option key={leadPerson._id} value={leadPerson._id}>
                            {leadPerson.fullName}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Date Range - From */}
                    <div>
                      <label
                        htmlFor="dateFrom"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1"
                      >
                        Date From
                      </label>
                      <input
                        type="date"
                        id="dateFrom"
                        name="dateFrom"
                        value={filters.dateFrom}
                        onChange={handleFilterChange}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 focus:ring-offset-2 focus:border-blue-500"
                      />
                    </div>

                    {/* Date Range - To */}
                    <div>
                      <label
                        htmlFor="dateTo"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1"
                      >
                        Date To
                      </label>
                      <input
                        type="date"
                        id="dateTo"
                        name="dateTo"
                        value={filters.dateTo}
                        onChange={handleFilterChange}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 focus:ring-offset-2 focus:border-blue-500"
                      />
                    </div>

                    {/* Amount Range - From */}
                    <div>
                      <label
                        htmlFor="amountFrom"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1"
                      >
                        Amount From
                      </label>
                      <input
                        type="number"
                        id="amountFrom"
                        name="amountFrom"
                        placeholder="Min amount"
                        value={filters.amountFrom}
                        onChange={handleFilterChange}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 focus:ring-offset-2 focus:border-blue-500"
                      />
                    </div>

                    {/* Amount Range - To */}
                    <div>
                      <label
                        htmlFor="amountTo"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1"
                      >
                        Amount To
                      </label>
                      <input
                        type="number"
                        id="amountTo"
                        name="amountTo"
                        placeholder="Max amount"
                        value={filters.amountTo}
                        onChange={handleFilterChange}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 focus:ring-offset-2 focus:border-blue-500"
                      />
                    </div>

                    {/* Currency Filter */}
                    <div>
                      <label
                        htmlFor="currency"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1"
                      >
                        Currency
                      </label>
                      <select
                        id="currency"
                        name="currency"
                        value={filters.currency}
                        onChange={handleFilterChange}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 focus:ring-offset-2 focus:border-blue-500"
                      >
                        <option value="">All Currencies</option>
                        {currencyOptions.map((currency) => (
                          <option key={currency.value} value={currency.value}>
                            {currency.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Filter Summary */}
                  <div className="mt-4 p-3 bg-gray-50 dark:bg-slate-800 rounded-md">
                    <div className="text-sm text-gray-600 dark:text-gray-500">
                      <strong>{filteredSales.length}</strong> sales found from a
                      total of <strong>{sales.length}</strong> sales
                      {Object.values(filters).some(
                        (filter) => filter !== ""
                      ) && (
                        <span className="ml-2 text-blue-600">
                          (Filters applied)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Date Filter Controls */}
            <div className="mb-6 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-md dark:shadow-2xl transition-all duration-200 ease-out shadow-sm">
              <h3 className="text-lg font-semibold mb-3 text-slate-900 dark:text-slate-100">
                Quick Date Filters
              </h3>
              <div className="flex flex-wrap items-center gap-4">
                <div>
                  <label
                    htmlFor="month"
                    className="block text-sm font-medium text-gray-600 dark:text-gray-500 mb-1"
                  >
                    Month
                  </label>
                  <select
                    id="month"
                    value={filterMonth}
                    onChange={handleMonthChange}
                    className="border border-gray-300 dark:border-slate-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 focus:ring-offset-2 focus:border-blue-500"
                    disabled={showCurrentMonth}
                  >
                    {months.map((month) => (
                      <option key={month.value} value={month.value}>
                        {month.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="year"
                    className="block text-sm font-medium text-gray-600 dark:text-gray-500 mb-1"
                  >
                    Year
                  </label>
                  <select
                    id="year"
                    value={filterYear}
                    onChange={handleYearChange}
                    className="border border-gray-300 dark:border-slate-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 focus:ring-offset-2 focus:border-blue-500"
                    disabled={showCurrentMonth}
                  >
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center ml-4">
                  <input
                    id="currentMonth"
                    type="checkbox"
                    checked={showCurrentMonth}
                    onChange={() => {
                      setShowCurrentMonth(!showCurrentMonth);
                      if (!showCurrentMonth) {
                        setShowAllSales(false); // Disable show all when showing current month
                      }
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900 focus:ring-offset-2 border-gray-300 dark:border-slate-600 rounded"
                  />
                  <label
                    htmlFor="currentMonth"
                    className="ml-2 block text-sm text-gray-700 dark:text-gray-400"
                  >
                    Show Current Month Only
                  </label>
                </div>

                {/* Show All Sales option for Managers and Admins */}
                {(user?.role === "Manager" || user?.role === "Admin") && (
                  <div className="flex items-center ml-4">
                    <input
                      id="showAllSales"
                      type="checkbox"
                      checked={showAllSales}
                      onChange={handleShowAllSales}
                      className="h-4 w-4 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900 focus:ring-offset-2 border-gray-300 dark:border-slate-600 rounded"
                    />
                    <label
                      htmlFor="showAllSales"
                      className="ml-2 block text-sm text-gray-700 dark:text-gray-400 font-semibold text-blue-600"
                    >
                      Show All Sales (No Date Filter)
                    </label>
                  </div>
                )}

                <button
                  onClick={handleResetToCurrentMonth}
                  className="bg-gray-200 dark:bg-slate-600 hover:bg-gray-300 text-gray-800 dark:text-gray-200 py-2 px-4 rounded-md ml-auto transition duration-300"
                >
                  Reset to Current Month
                </button>
              </div>

              <div className="mt-3 text-sm text-gray-500 dark:text-gray-500">
                {showAllSales ? (
                  <p>Quick filter: All sales regardless of date</p>
                ) : showCurrentMonth ? (
                  <p>
                    Quick filter: Current month (
                    {months[new Date().getMonth()].label}{" "}
                    {new Date().getFullYear()})
                  </p>
                ) : (
                  <p>
                    Quick filter: {months[filterMonth - 1].label} {filterYear}
                  </p>
                )}
                <p className="text-xs text-gray-400 dark:text-gray-400 mt-1">
                  Note: Advanced filters above will further refine these results
                </p>
              </div>
            </div>

            {/* Active Filters Summary */}
            {Object.values(filters).some((filter) => filter !== "") && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-blue-800">
                    Active Filters:
                  </span>
                  {filters.search && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Search: "{filters.search}"
                    </span>
                  )}
                  {filters.status && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Status: {filters.status}
                    </span>
                  )}
                  {filters.salesPerson && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Sales Person:{" "}
                      {
                        filterOptions.salesPersons.find(
                          (sp) => sp._id === filters.salesPerson
                        )?.fullName
                      }
                    </span>
                  )}
                  {filters.country && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Country: {filters.country}
                    </span>
                  )}
                  {filters.course && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Course: {filters.course}
                    </span>
                  )}
                  {filters.leadPerson && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Lead Person:{" "}
                      {
                        filterOptions.leadPersons.find(
                          (lp) => lp._id === filters.leadPerson
                        )?.fullName
                      }
                    </span>
                  )}
                  {(filters.dateFrom || filters.dateTo) && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Date: {filters.dateFrom || "Start"} to{" "}
                      {filters.dateTo || "End"}
                    </span>
                  )}
                  {(filters.amountFrom || filters.amountTo) && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Amount: {filters.amountFrom || "0"} -{" "}
                      {filters.amountTo || "∞"}
                    </span>
                  )}
                  {filters.currency && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Currency: {filters.currency}
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="overflow-x-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-md dark:shadow-2xl transition-all duration-200 ease-out shadow-sm">
              <div className="w-full overflow-x-auto">
                <table className="min-w-full table-auto border-collapse divide-y divide-slate-200 dark:divide-slate-700">
                  <thead className="bg-gray-50 dark:bg-slate-800">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider"
                      >
                        #
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">
                        Lead
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">
                        Contact/Login
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">
                        Sales Person
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">
                        Token
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">
                        Pending
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      {/* Add Remarks Column Header */}
                      <th
                        scope="col"
                        className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Remarks
                      </th>
                      {/* Actions Column Header */}
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredSales.map((sale, index) => (
                      <tr
                        key={sale._id}
                        onClick={() => handleEdit(sale)}
                        className={`cursor-pointer ${
                          index % 2 === 0
                            ? "bg-white dark:bg-gray-800"
                            : "bg-gray-50 dark:bg-gray-700"
                        }`}
                      >
                        <td className="px-2 py-2 whitespace-normal break-words text-sm text-gray-500 dark:text-gray-400">
                          {index + 1}
                        </td>
                        {/* Date Column */}
                        <td className="px-2 py-2 whitespace-normal break-words">
                          {editingSale === sale._id ? (
                            <div className="flex flex-col space-y-2">
                              <input
                                type="date"
                                value={
                                  editValues.saleDate
                                    ? new Date(editValues.saleDate)
                                        .toISOString()
                                        .split("T")[0]
                                    : new Date(sale.date || sale.createdAt)
                                        .toISOString()
                                        .split("T")[0]
                                }
                                onChange={(e) =>
                                  handleInputChange(
                                    "saleDate",
                                    new Date(e.target.value)
                                  )
                                }
                                className="w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                              />
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleSave(sale._id)}
                                  className="text-green-600 hover:text-green-900 flex items-center text-xs px-2 py-1 bg-green-50 rounded"
                                >
                                  <FaCheck className="mr-1" /> Save
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingSale(null);
                                    setEditValues({});
                                  }}
                                  className="text-red-600 hover:text-red-900 flex items-center text-xs px-2 py-1 bg-red-50 rounded"
                                >
                                  <FaTimes className="mr-1" /> Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col space-y-2">
                              <div className="text-sm text-gray-900 dark:text-white">
                                {formatDate(
                                  sale.date || sale.createdAt || new Date()
                                )}
                              </div>
                            </div>
                          )}
                        </td>
                        {/* Customer Column */}
                        <td className="px-2 py-2 whitespace-normal break-words">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {formatCustomerName(sale)}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-500">
                            {sale.product ||
                              safeGet(sale, "leadId.course") ||
                              "No product"}
                          </div>
                          {editingSale === sale._id && (
                            <div className="mt-2">
                              <input
                                type="text"
                                placeholder="Lead By (Optional)"
                                value={editValues.leadBy || ""}
                                onChange={(e) =>
                                  handleInputChange("leadBy", e.target.value)
                                }
                                className="w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                              />
                              <div className="text-xs text-gray-500 dark:text-gray-500 mt-1 flex items-center">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-3 w-3 text-gray-400 dark:text-gray-400 mr-1"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                                <span>Name of person who led this sale</span>
                              </div>
                            </div>
                          )}
                          {!editingSale === sale._id && sale.leadBy && (
                            <div className="text-xs text-gray-600 dark:text-gray-500 mt-1">
                              Lead By: {sale.leadBy}
                            </div>
                          )}
                        </td>
                        {/* Contact Column */}
                        <td className="px-2 py-2">
                          <div className="flex flex-col space-y-1">
                            {(sale.contactNumber ||
                              safeGet(sale, "leadId.phone")) && (
                              <div className="flex items-center">
                                <button
                                  onClick={() =>
                                    openWhatsApp(
                                      sale.contactNumber ||
                                        safeGet(sale, "leadId.phone"),
                                      sale.countryCode ||
                                        safeGet(
                                          sale,
                                          "leadId.countryCode",
                                          "+91"
                                        )
                                    )
                                  }
                                  className="text-sm text-gray-900 dark:text-white flex items-center hover:text-green-600"
                                  title="Open in WhatsApp"
                                >
                                  <FaWhatsapp className="mr-1 text-green-500" />
                                  {(() => {
                                    const phone =
                                      sale.contactNumber ||
                                      safeGet(sale, "leadId.phone");
                                    const countryCode =
                                      sale.countryCode ||
                                      safeGet(
                                        sale,
                                        "leadId.countryCode",
                                        "+91"
                                      );

                                    // If phone already starts with +, don't add country code
                                    if (
                                      phone &&
                                      phone.toString().startsWith("+")
                                    ) {
                                      return phone;
                                    }
                                    // If phone already starts with country code (without +), don't add it again
                                    if (
                                      phone &&
                                      countryCode &&
                                      phone
                                        .toString()
                                        .startsWith(
                                          countryCode.replace("+", "")
                                        )
                                    ) {
                                      return `+${phone}`;
                                    }
                                    // Otherwise, combine country code and phone
                                    return `${countryCode} ${phone}`;
                                  })()}
                                </button>
                              </div>
                            )}
                            {(sale.email || safeGet(sale, "leadId.email")) && (
                              <div className="flex items-center">
                                <button
                                  onClick={() =>
                                    openEmail(
                                      sale.email ||
                                        safeGet(sale, "leadId.email")
                                    )
                                  }
                                  className="text-sm text-gray-500 dark:text-gray-500 flex items-center hover:text-blue-600"
                                  title="Send email"
                                >
                                  <FaEnvelope className="mr-1 text-blue-500" />
                                  {sale.email || safeGet(sale, "leadId.email")}
                                </button>
                              </div>
                            )}
                            {editingSale === sale._id && (
                              <div className="mt-2 flex flex-col space-y-2">
                                <input
                                  type="text"
                                  placeholder="Login ID (Optional)"
                                  value={editValues.loginId || ""}
                                  onChange={(e) =>
                                    handleInputChange("loginId", e.target.value)
                                  }
                                  className="w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                />
                                <input
                                  type="text"
                                  placeholder="Password (Optional)"
                                  value={editValues.password || ""}
                                  onChange={(e) =>
                                    handleInputChange(
                                      "password",
                                      e.target.value
                                    )
                                  }
                                  className="w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                />
                              </div>
                            )}
                            {!editingSale === sale._id &&
                              (sale.loginId || sale.password) && (
                                <div className="mt-2 text-xs">
                                  {sale.loginId && (
                                    <div>Login ID: {sale.loginId}</div>
                                  )}
                                  {sale.password && (
                                    <div>Password: {sale.password}</div>
                                  )}
                                </div>
                              )}
                          </div>
                        </td>
                        {/* Product Column */}
                        <td className="px-2 py-2 whitespace-normal break-words">
                          {editingSale === sale._id ? (
                            <div>
                              <input
                                type="text"
                                value={editValues.product || ""}
                                onChange={(e) =>
                                  handleInputChange("product", e.target.value)
                                }
                                className="w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                placeholder="Product or course name"
                              />
                              {sale.leadPerson &&
                                typeof sale.leadPerson === "object" &&
                                sale.leadPerson.fullName ? (
                                  <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                    Lead Person: {sale.leadPerson.fullName}
                                  </div>
                                ) : sale.isReference ? (
                                  <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                    Lead Person: Reference
                                  </div>
                                ) : null}
                            </div>
                          ) : (
                            <div className="text-sm text-gray-900 dark:text-white">
                              {sale.product || safeGet(sale, "course") || "N/A"}
                            </div>
                          )}
                          {!editingSale === sale._id &&
                            (sale.leadPerson &&
                              typeof sale.leadPerson === "object" &&
                              sale.leadPerson.fullName ? (
                                <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                  Lead Person: {sale.leadPerson.fullName}
                                </div>
                              ) : sale.isReference ? (
                                <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                  Lead Person: Reference
                                </div>
                              ) : null)}
                        </td>
                        {/* Sales Person Column */}
                        <td className="px-2 py-2 whitespace-normal break-words">
                          {editingSale === sale._id ? (
                            <div className="flex flex-col space-y-2">
                              <select
                                value={
                                  editValues.salesPerson ||
                                  sale.salesPerson?._id ||
                                  ""
                                }
                                onChange={(e) =>
                                  handleInputChange(
                                    "salesPerson",
                                    e.target.value
                                  )
                                }
                                className="w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                              >
                                <option value="">Select Sales Person</option>
                                {filterOptions.salesPersons.map((sp) => (
                                  <option key={sp._id} value={sp._id}>
                                    {sp.fullName}
                                  </option>
                                ))}
                              </select>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-900 dark:text-white">
                              {sale.salesPerson?.fullName || "N/A"}
                            </div>
                          )}
                        </td>
                        {/* Amount Column */}
                        <td className="px-2 py-2 whitespace-normal break-words">
                          {editingSale === sale._id ? (
                            <div className="flex flex-col space-y-2">
                              <div className="flex items-center space-x-2">
                                <div className="relative">
                                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-500">
                                    {getCurrencySymbol(editValues.currency)}
                                  </span>
                                  <input
                                    id="amount"
                                    type="number"
                                    value={
                                      editValues.amount !== undefined
                                        ? editValues.amount.toString()
                                        : "0"
                                    }
                                    onChange={(e) =>
                                      handleInputChange(
                                        "amount",
                                        e.target.value
                                      )
                                    }
                                    className="w-24 px-2 pl-7 border border-gray-300 dark:border-slate-600 rounded"
                                  />
                                </div>
                                <select
                                  value={editValues.currency || "USD"}
                                  onChange={(e) =>
                                    handleInputChange(
                                      "currency",
                                      e.target.value
                                    )
                                  }
                                  className="border border-gray-300 dark:border-slate-600 rounded p-1 text-xs"
                                >
                                  {currencyOptions.map((option) => (
                                    <option
                                      key={option.value}
                                      value={option.value}
                                    >
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {formatCurrency(
                                sale.amount || sale.totalCost || 0,
                                sale.currency || "USD"
                              )}
                            </div>
                          )}
                        </td>
                        {/* Token Column */}
                        <td className="px-2 py-2 whitespace-normal break-words">
                          {editingSale === sale._id ? (
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-500">
                                {getCurrencySymbol(editValues.currency)}
                              </span>
                              <input
                                id="token"
                                type="number"
                                value={
                                  editValues.token !== undefined
                                    ? editValues.token.toString()
                                    : "0"
                                }
                                onChange={(e) =>
                                  handleInputChange("token", e.target.value)
                                }
                                className="w-24 px-2 pl-7 border border-gray-300 dark:border-slate-600 rounded"
                              />
                            </div>
                          ) : (
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {formatCurrency(
                                sale.token || sale.tokenAmount || 0,
                                sale.currency || "USD"
                              )}
                            </div>
                          )}
                        </td>
                        {/* Pending Column */}
                        <td className="px-2 py-2 whitespace-normal break-words">
                          {editingSale === sale._id ? (
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-500">
                                {getCurrencySymbol(editValues.currency)}
                              </span>
                              <input
                                id="pending"
                                type="number"
                                value={
                                  editValues.pending !== undefined
                                    ? editValues.pending.toString()
                                    : "0"
                                }
                                onChange={(e) =>
                                  handleInputChange("pending", e.target.value)
                                }
                                className="w-24 px-2 pl-7 border border-gray-300 dark:border-slate-600 rounded"
                                disabled={editValues.status === "Completed"}
                              />
                            </div>
                          ) : (
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {formatCurrency(
                                sale.status === "Completed"
                                  ? 0
                                  : sale.pending !== undefined
                                  ? sale.pending
                                  : (sale.amount || sale.totalCost || 0) -
                                    (sale.token || sale.tokenAmount || 0),
                                sale.currency || "USD"
                              )}
                            </div>
                          )}
                        </td>
                        {/* Status Column */}
                        <td className="px-2 py-2 whitespace-normal break-words">
                          {editingSale === sale._id ? (
                            <select
                              value={editValues.status || sale.status}
                              onChange={(e) =>
                                handleInputChange("status", e.target.value)
                              }
                              className={`text-sm px-2 py-1 rounded cursor-pointer ${
                                sale.status === "Pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : sale.status === "Completed"
                                  ? "bg-green-100 text-green-800"
                                  : sale.status === "Cancelled"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200"
                              } border border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400`}
                              disabled={!canEditSale(sale)}
                            >
                              {getAvailableStatusOptions(sale.status).map(
                                (status) => (
                                  <option key={status} value={status}>
                                    {status}
                                  </option>
                                )
                              )}
                            </select>
                          ) : (
                            <div className="relative">
                              <select
                                value={sale.status || "Pending"}
                                onChange={(e) =>
                                  handleStatusChange(sale._id, e.target.value)
                                }
                                className={`text-sm px-2 py-1 rounded cursor-pointer appearance-none w-auto pr-8 ${
                                  sale.status === "Pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : sale.status === "Completed"
                                    ? "bg-green-100 text-green-800"
                                    : sale.status === "Cancelled"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200"
                                } border border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400`}
                                disabled={!canEditSale(sale)}
                              >
                                {getAvailableStatusOptions(sale.status).map(
                                  (status) => (
                                    <option key={status} value={status}>
                                      {status}
                                    </option>
                                  )
                                )}
                              </select>
                              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-400">
                                <svg
                                  className="fill-current h-4 w-4"
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                </svg>
                              </div>
                              {!canEditSale(sale) && (
                                <div className="absolute left-0 -bottom-5 w-full">
                                  <div className="text-xs text-gray-500 dark:text-gray-500 italic">
                                    {user?.role === "Sales Person"
                                      ? "Can only update your own sales"
                                      : "No edit permission"}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                        {/* Remarks Column */}
                        <td className="px-2 py-2 whitespace-normal break-words text-sm text-gray-500 dark:text-gray-400">
                          {editingSale === sale._id ? (
                            <div className="space-y-2">
                              <textarea
                                value={editValues.remarks || ""}
                                onChange={(e) =>
                                  handleInputChange("remarks", e.target.value)
                                }
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                placeholder="Enter remarks (optional - leave blank to clear)"
                                rows="2"
                              />
                              <div className="text-xs text-gray-500">
                                Optional - leave blank to clear remarks
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm max-w-xs overflow-hidden">
                              {sale.remarks || "-"}
                            </div>
                          )}
                        </td>
                        {/* Actions Column */}
                        <td className="px-2 py-2 whitespace-normal break-words text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center space-x-2">
                            {canDeleteSale(sale) && (
                              <button
                                onClick={() => handleDelete(sale._id)}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-150"
                                title="Delete sale"
                              >
                                <FaTrash className="h-5 w-5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Add Sale Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 transition-all duration-200 ease-out border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg dark:shadow-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-sm">
              <div className="bg-green-600 text-white p-4 flex justify-between items-center">
                <h3 className="text-xl font-bold">Add New Sale</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-white hover:text-gray-200 text-2xl"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleSubmitNewSale} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Reference Sale Toggle */}
                  <div className="col-span-2 mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-400">
                        Sale Type:
                      </span>
                      <div className="flex border border-gray-300 dark:border-slate-600 rounded-md overflow-hidden">
                        <button
                          type="button"
                          className={`px-4 py-2 text-sm font-medium ${
                            !newSale.isReference
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 dark:text-gray-400"
                          }`}
                          onClick={() => handleReferenceToggle(false)}
                        >
                          From Lead
                        </button>
                        <button
                          type="button"
                          className={`px-4 py-2 text-sm font-medium ${
                            newSale.isReference
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 dark:text-gray-400"
                          }`}
                          onClick={() => handleReferenceToggle(true)}
                        >
                          From Reference
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* FROM LEAD UI */}
                  {!newSale.isReference && (
                    <>
                      {/* Lead Selection with Search */}
                      <div className="col-span-2">
                        <label
                          htmlFor="leadId"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-400"
                        >
                          Lead
                          <span className="ml-1 text-xs text-blue-600 font-normal">
                            (Search existing leads)
                          </span>
                        </label>
                        <div className="relative mt-1 client-search-container">
                          <input
                            id="leadId"
                            type="text"
                            value={
                              clientSearchQuery ||
                              (newSale.leadId
                                ? availableLeads.find(
                                    (lead) => lead._id === newSale.leadId
                                  )?.name
                                : "")
                            }
                            onChange={(e) => {
                              const value = e.target.value;
                              setClientSearchQuery(value);
                              if (value.length >= 2) {
                                searchClients(value);
                                setShowClientSearch(true);
                              } else {
                                setShowClientSearch(false);
                                setClientSearchResults([]);
                                // Clear lead selection if search is cleared
                                if (!value) {
                                  handleNewSaleChange("leadId", "");
                                }
                              }
                            }}
                            onFocus={() => {
                              if (clientSearchQuery.length >= 2) {
                                setShowClientSearch(true);
                              }
                            }}
                            className="block w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100-md p-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 focus:ring-offset-2 focus:border-blue-500"
                            placeholder="Type to search existing leads..."
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                            {clientSearchLoading ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            ) : (
                              <svg
                                className="h-4 w-4 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                              </svg>
                            )}
                          </div>

                          {/* Search Results Dropdown */}
                          {showClientSearch &&
                            clientSearchResults.length > 0 && (
                              <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                {clientSearchResults.map((client, index) => (
                                  <div
                                    key={`${client.id}-${index}`}
                                    onClick={() => {
                                      // Handle lead selection differently for leads
                                      if (client.source === "Lead") {
                                        handleLeadSelect(
                                          client.id,
                                          client.data
                                        );
                                      }
                                      setClientSearchQuery(client.name);
                                      setShowClientSearch(false);
                                      setClientSearchResults([]);
                                    }}
                                    className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-200 dark:border-gray-600 last:border-b-0"
                                  >
                                    <div className="flex justify-between items-start">
                                      <div className="flex-1">
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                          {client.name}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                          {client.email && (
                                            <span>📧 {client.email}</span>
                                          )}
                                          {client.phone && (
                                            <span className="ml-2">
                                              📞 {client.phone}
                                            </span>
                                          )}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                          {client.country && (
                                            <span>🌍 {client.country}</span>
                                          )}
                                          {client.course && (
                                            <span className="ml-2">
                                              📚 {client.course}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      <div className="ml-2">
                                        <span
                                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                            client.source === "Lead"
                                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                              : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                          }`}
                                        >
                                          {client.source}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                          {/* No Results Message */}
                          {showClientSearch &&
                            clientSearchQuery.length >= 2 &&
                            clientSearchResults.length === 0 &&
                            !clientSearchLoading && (
                              <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg p-4">
                                <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
                                  No existing leads found for "
                                  {clientSearchQuery}"
                                </div>
                              </div>
                            )}
                        </div>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                          Start typing to search for existing leads or previous
                          clients
                        </p>
                      </div>

                      {/* Lead Person Selection */}
                      <div className="col-span-2">
                        <label
                          htmlFor="leadPerson"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-400"
                        >
                          Lead Person
                          <span className="ml-1 text-xs text-blue-600 font-normal">
                            (Who should see this sale on their dashboard)
                          </span>
                        </label>
                        <select
                          id="leadPerson"
                          value={newSale.leadPerson}
                          onChange={(e) =>
                            handleNewSaleChange("leadPerson", e.target.value)
                          }
                          className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 focus:ring-offset-2 focus:border-blue-500"
                        >
                          <option value="">Select a lead person</option>
                          {leadPersonOptions.map((person) => (
                            <option key={person.value} value={person.value}>
                              {person.label}
                            </option>
                          ))}
                        </select>
                        {loadingLeadPersons && (
                          <div className="mt-1 text-sm text-gray-500 dark:text-gray-500">
                            Loading lead persons...
                          </div>
                        )}
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                          The selected lead person will see this sale on their
                          dashboard
                        </p>
                      </div>

                      {/* Sale Date */}
                      <div className="col-span-2 md:col-span-1">
                        <label
                          htmlFor="saleDate"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-400"
                        >
                          Sale Date
                        </label>
                        <input
                          id="saleDate"
                          type="date"
                          value={
                            newSale.saleDate
                              ? new Date(newSale.saleDate)
                                  .toISOString()
                                  .split("T")[0]
                              : new Date().toISOString().split("T")[0]
                          }
                          onChange={(e) =>
                            handleNewSaleChange(
                              "saleDate",
                              new Date(e.target.value)
                            )
                          }
                          className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 focus:ring-offset-2 focus:border-blue-500"
                        />
                      </div>

                      {/* Lead By (Optional) */}
                      <div className="col-span-2 md:col-span-1">
                        <label
                          htmlFor="leadBy"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-400"
                        >
                          Lead By (Optional)
                          <span className="ml-1 inline-block relative group">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 text-gray-400 dark:text-gray-400 cursor-help"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-48 bg-gray-800 text-white text-xs rounded py-1 px-2 hidden group-hover:block">
                              Name of the person who led this sale (can be
                              different from the Lead Person assigned in the
                              system)
                            </span>
                          </span>
                        </label>
                        <input
                          id="leadBy"
                          type="text"
                          value={newSale.leadBy}
                          onChange={(e) =>
                            handleNewSaleChange("leadBy", e.target.value)
                          }
                          className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 focus:ring-offset-2 focus:border-blue-500"
                          placeholder="Who led this sale?"
                        />
                      </div>

                      {/* Product (pulled from lead but can be modified) */}
                      <div className="col-span-2">
                        <label
                          htmlFor="product"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-400"
                        >
                          Product
                        </label>
                        <input
                          id="product"
                          type="text"
                          value={newSale.product}
                          onChange={(e) =>
                            handleNewSaleChange("product", e.target.value)
                          }
                          className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 focus:ring-offset-2 focus:border-blue-500"
                          placeholder="Product or course name"
                        />
                      </div>

                      {/* Login Credentials (Optional) */}
                      <div className="col-span-2 md:col-span-1">
                        <label
                          htmlFor="loginId"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-400"
                        >
                          Login ID (Optional)
                        </label>
                        <input
                          id="loginId"
                          type="text"
                          value={newSale.loginId}
                          onChange={(e) =>
                            handleNewSaleChange("loginId", e.target.value)
                          }
                          className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 focus:ring-offset-2 focus:border-blue-500"
                          placeholder="Customer login ID"
                        />
                      </div>

                      <div className="col-span-2 md:col-span-1">
                        <label
                          htmlFor="password"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-400"
                        >
                          Password (Optional)
                        </label>
                        <input
                          id="password"
                          type="text"
                          value={newSale.password}
                          onChange={(e) =>
                            handleNewSaleChange("password", e.target.value)
                          }
                          className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 focus:ring-offset-2 focus:border-blue-500"
                          placeholder="Customer password"
                        />
                      </div>

                      {/* Currency */}
                      <div className="col-span-2 md:col-span-1">
                        <label
                          htmlFor="currency"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-400"
                        >
                          Currency
                        </label>
                        <select
                          id="currency"
                          value={newSale.currency}
                          onChange={(e) =>
                            handleNewSaleChange("currency", e.target.value)
                          }
                          className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 focus:ring-offset-2 focus:border-blue-500"
                        >
                          {currencyOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Amount */}
                      <div className="col-span-2 md:col-span-1">
                        <label
                          htmlFor="amount"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-400"
                        >
                          Amount
                        </label>
                        <div className="relative mt-1">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-500">
                            {getCurrencySymbol(newSale.currency)}
                          </span>
                          <input
                            id="amount"
                            type="number"
                            value={newSale.totalCost}
                            onChange={(e) =>
                              handleNewSaleChange("totalCost", e.target.value)
                            }
                            className="block w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 focus:ring-offset-2 focus:border-blue-500"
                            placeholder="0.00"
                          />
                        </div>
                      </div>

                      {/* Token */}
                      <div className="col-span-2 md:col-span-1">
                        <label
                          htmlFor="token"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-400"
                        >
                          Token
                        </label>
                        <div className="relative mt-1">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-500">
                            {getCurrencySymbol(newSale.currency)}
                          </span>
                          <input
                            id="token"
                            type="number"
                            value={newSale.tokenAmount}
                            onChange={(e) =>
                              handleNewSaleChange("tokenAmount", e.target.value)
                            }
                            className="block w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 focus:ring-offset-2 focus:border-blue-500"
                            placeholder="0.00"
                          />
                        </div>
                      </div>

                      {/* Pending (calculated automatically) */}
                      <div className="col-span-2 md:col-span-1">
                        <label
                          htmlFor="pending"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-400"
                        >
                          Pending
                        </label>
                        <div className="relative mt-1">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-500">
                            {getCurrencySymbol(newSale.currency)}
                          </span>
                          <input
                            id="pending"
                            type="number"
                            value={newSale.pending}
                            onChange={(e) =>
                              handleNewSaleChange("pending", e.target.value)
                            }
                            className="block w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 focus:ring-offset-2 focus:border-blue-500"
                            placeholder="0.00"
                            disabled={newSale.status === "Completed"}
                          />
                        </div>
                      </div>

                      {/* Status */}
                      <div className="col-span-2 md:col-span-1">
                        <label
                          htmlFor="status"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-400"
                        >
                          Status
                        </label>
                        <select
                          id="status"
                          value={newSale.status}
                          onChange={(e) =>
                            handleNewSaleChange("status", e.target.value)
                          }
                          className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 focus:ring-offset-2 focus:border-blue-500"
                        >
                          {statusOptions.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}

                  {/* REFERENCE SALE UI */}
                  {newSale.isReference && (
                    <>
                      {/* Customer Name with Search */}
                      <div className="col-span-2 md:col-span-1">
                        <label
                          htmlFor="customerName"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-400"
                        >
                          Customer Name
                          <span className="ml-1 text-xs text-blue-600 font-normal">
                            (Search existing clients)
                          </span>
                        </label>
                        <div className="relative mt-1 client-search-container">
                          <input
                            id="customerName"
                            type="text"
                            value={clientSearchQuery || newSale.customerName}
                            onChange={(e) => {
                              const value = e.target.value;
                              setClientSearchQuery(value);
                              handleNewSaleChange("customerName", value);
                              if (value.length >= 2) {
                                searchClients(value);
                                setShowClientSearch(true);
                              } else {
                                setShowClientSearch(false);
                                setClientSearchResults([]);
                              }
                            }}
                            onFocus={() => {
                              if (clientSearchQuery.length >= 2) {
                                setShowClientSearch(true);
                              }
                            }}
                            className="block w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100-md p-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 focus:ring-offset-2 focus:border-blue-500"
                            placeholder="Type to search existing clients..."
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                            {clientSearchLoading ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            ) : (
                              <svg
                                className="h-4 w-4 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                              </svg>
                            )}
                          </div>

                          {/* Search Results Dropdown */}
                          {showClientSearch &&
                            clientSearchResults.length > 0 && (
                              <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                {clientSearchResults.map((client, index) => (
                                  <div
                                    key={`${client.id}-${index}`}
                                    onClick={() => handleClientSelect(client)}
                                    className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-200 dark:border-gray-600 last:border-b-0"
                                  >
                                    <div className="flex justify-between items-start">
                                      <div className="flex-1">
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                          {client.name}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                          {client.email && (
                                            <span>📧 {client.email}</span>
                                          )}
                                          {client.phone && (
                                            <span className="ml-2">
                                              📞 {client.phone}
                                            </span>
                                          )}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                          {client.country && (
                                            <span>🌍 {client.country}</span>
                                          )}
                                          {client.course && (
                                            <span className="ml-2">
                                              📚 {client.course}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      <div className="ml-2">
                                        <span
                                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                            client.source === "Lead"
                                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                              : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                          }`}
                                        >
                                          {client.source}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                          {/* No Results Message */}
                          {showClientSearch &&
                            clientSearchQuery.length >= 2 &&
                            clientSearchResults.length === 0 &&
                            !clientSearchLoading && (
                              <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg p-4">
                                <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
                                  No existing clients found for "
                                  {clientSearchQuery}"
                                </div>
                              </div>
                            )}
                        </div>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                          Start typing to search for existing clients from leads
                          or previous sales
                        </p>
                      </div>

                      {/* Sale Date */}
                      <div className="col-span-2 md:col-span-1">
                        <label
                          htmlFor="saleDate"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-400"
                        >
                          Sale Date
                        </label>
                        <input
                          id="saleDate"
                          type="date"
                          value={
                            newSale.saleDate
                              ? new Date(newSale.saleDate)
                                  .toISOString()
                                  .split("T")[0]
                              : new Date().toISOString().split("T")[0]
                          }
                          onChange={(e) =>
                            handleNewSaleChange(
                              "saleDate",
                              new Date(e.target.value)
                            )
                          }
                          className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 focus:ring-offset-2 focus:border-blue-500"
                        />
                      </div>

                      {/* Contact Number */}
                      <div className="col-span-2">
                        <label
                          htmlFor="contactNumber"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1"
                        >
                          Contact Number
                        </label>
                        <PhoneInput
                          country={"us"}
                          value={newSale.contactNumber}
                          onChange={(value, data) => {
                            // Update both the contact number and country code
                            handleNewSaleChange("contactNumber", value);
                            handleNewSaleChange(
                              "countryCode",
                              `+${data.dialCode}`
                            );
                          }}
                          inputProps={{
                            id: "contactNumber",
                            name: "contactNumber",
                            required: true,
                          }}
                          containerStyle={phoneInputStyle.container}
                          inputStyle={phoneInputStyle.inputStyle}
                          buttonStyle={phoneInputStyle.buttonStyle}
                          dropdownStyle={phoneInputStyle.dropdownStyle}
                          enableSearch={true}
                          searchPlaceholder="Search country..."
                        />
                      </div>

                      {/* Email */}
                      <div className="col-span-2 md:col-span-1">
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-400"
                        >
                          Email
                        </label>
                        <input
                          id="email"
                          type="email"
                          value={newSale.email}
                          onChange={(e) =>
                            handleNewSaleChange("email", e.target.value)
                          }
                          className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 focus:ring-offset-2 focus:border-blue-500"
                          placeholder="customer@example.com"
                        />
                      </div>

                      {/* Country */}
                      <div className="col-span-2 md:col-span-1">
                        <label
                          htmlFor="country"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-400"
                        >
                          Country
                        </label>
                        <input
                          id="country"
                          type="text"
                          value={newSale.country}
                          onChange={(e) =>
                            handleNewSaleChange("country", e.target.value)
                          }
                          className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 focus:ring-offset-2 focus:border-blue-500"
                          placeholder="Enter country"
                        />
                      </div>

                      {/* Lead By (Optional) */}
                      <div className="col-span-2 md:col-span-1">
                        <label
                          htmlFor="leadBy"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-400"
                        >
                          Lead By (Optional)
                          <span className="ml-1 inline-block relative group">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 text-gray-400 dark:text-gray-400 cursor-help"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-48 bg-gray-800 text-white text-xs rounded py-1 px-2 hidden group-hover:block">
                              Name of the person who led this sale (can be
                              different from the Lead Person assigned in the
                              system)
                            </span>
                          </span>
                        </label>
                        <input
                          id="leadBy"
                          type="text"
                          value={newSale.leadBy}
                          onChange={(e) =>
                            handleNewSaleChange("leadBy", e.target.value)
                          }
                          className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 focus:ring-offset-2 focus:border-blue-500"
                          placeholder="Who led this sale?"
                        />
                      </div>

                      {/* Currency */}
                      <div className="col-span-2 md:col-span-1">
                        <label
                          htmlFor="currency"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-400"
                        >
                          Currency
                        </label>
                        <select
                          id="currency"
                          value={newSale.currency}
                          onChange={(e) =>
                            handleNewSaleChange("currency", e.target.value)
                          }
                          className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 focus:ring-offset-2 focus:border-blue-500"
                        >
                          {currencyOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Product */}
                      <div className="col-span-2 md:col-span-1">
                        <label
                          htmlFor="product"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-400"
                        >
                          Product
                        </label>
                        <input
                          id="product"
                          type="text"
                          value={newSale.product}
                          onChange={(e) =>
                            handleNewSaleChange("product", e.target.value)
                          }
                          className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 focus:ring-offset-2 focus:border-blue-500"
                          placeholder="Product or course name"
                        />
                      </div>

                      {/* Login Credentials (Optional) */}
                      <div className="col-span-2 md:col-span-1">
                        <label
                          htmlFor="loginId"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-400"
                        >
                          Login ID (Optional)
                        </label>
                        <input
                          id="loginId"
                          type="text"
                          value={newSale.loginId}
                          onChange={(e) =>
                            handleNewSaleChange("loginId", e.target.value)
                          }
                          className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 focus:ring-offset-2 focus:border-blue-500"
                          placeholder="Customer login ID"
                        />
                      </div>

                      <div className="col-span-2 md:col-span-1">
                        <label
                          htmlFor="password"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-400"
                        >
                          Password (Optional)
                        </label>
                        <input
                          id="password"
                          type="text"
                          value={newSale.password}
                          onChange={(e) =>
                            handleNewSaleChange("password", e.target.value)
                          }
                          className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 focus:ring-offset-2 focus:border-blue-500"
                          placeholder="Customer password"
                        />
                      </div>

                      {/* Lead Person Selection */}
                      <div className="col-span-2">
                        <label
                          htmlFor="leadPerson"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-400"
                        >
                          Lead Person
                        </label>
                        <select
                          id="leadPerson"
                          value={newSale.leadPerson}
                          onChange={(e) =>
                            handleNewSaleChange("leadPerson", e.target.value)
                          }
                          className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 focus:ring-offset-2 focus:border-blue-500"
                        >
                          <option value="">Select a lead person</option>
                          {leadPersonOptions.map((person) => (
                            <option key={person.value} value={person.value}>
                              {person.label}
                            </option>
                          ))}
                        </select>
                        {loadingLeadPersons && (
                          <div className="mt-1 text-sm text-gray-500 dark:text-gray-500">
                            Loading lead persons...
                          </div>
                        )}
                      </div>

                      {/* Amount */}
                      <div className="col-span-2 md:col-span-1">
                        <label
                          htmlFor="amount"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-400"
                        >
                          Amount
                        </label>
                        <div className="relative mt-1">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-500">
                            {getCurrencySymbol(newSale.currency)}
                          </span>
                          <input
                            id="amount"
                            type="number"
                            value={newSale.totalCost}
                            onChange={(e) =>
                              handleNewSaleChange("totalCost", e.target.value)
                            }
                            className="block w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 focus:ring-offset-2 focus:border-blue-500"
                            placeholder="0.00"
                          />
                        </div>
                      </div>

                      {/* Token */}
                      <div className="col-span-2 md:col-span-1">
                        <label
                          htmlFor="token"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-400"
                        >
                          Token
                        </label>
                        <div className="relative mt-1">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-500">
                            {getCurrencySymbol(newSale.currency)}
                          </span>
                          <input
                            id="token"
                            type="number"
                            value={newSale.tokenAmount}
                            onChange={(e) =>
                              handleNewSaleChange("tokenAmount", e.target.value)
                            }
                            className="block w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 focus:ring-offset-2 focus:border-blue-500"
                            placeholder="0.00"
                          />
                        </div>
                      </div>

                      {/* Pending (calculated automatically) */}
                      <div className="col-span-2 md:col-span-1">
                        <label
                          htmlFor="pending"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-400"
                        >
                          Pending
                        </label>
                        <div className="relative mt-1">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-500">
                            {getCurrencySymbol(newSale.currency)}
                          </span>
                          <input
                            id="pending"
                            type="number"
                            value={newSale.pending}
                            onChange={(e) =>
                              handleNewSaleChange("pending", e.target.value)
                            }
                            className="block w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 focus:ring-offset-2 focus:border-blue-500"
                            placeholder="0.00"
                            disabled={newSale.status === "Completed"}
                          />
                        </div>
                      </div>

                      {/* Status */}
                      <div className="col-span-2 md:col-span-1">
                        <label
                          htmlFor="status"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-400"
                        >
                          Status
                        </label>
                        <select
                          id="status"
                          value={newSale.status}
                          onChange={(e) =>
                            handleNewSaleChange("status", e.target.value)
                          }
                          className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 focus:ring-offset-2 focus:border-blue-500"
                        >
                          {statusOptions.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}
                </div>
                <div className="mt-6">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-sm dark:shadow-xl hover:shadow-md transition-all duration-200 text-white rounded-md"
                  >
                    Add Sale
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      // Modal for editing sale
      {editingSale && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-4xl overflow-y-auto max-h-[90vh]">
            <h3 className="text-2xl font-semibold mb-6 text-center">
              Edit Sale
            </h3>

            <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date */}
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input
                  type="date"
                  value={
                    editValues.saleDate
                      ? new Date(editValues.saleDate)
                          .toISOString()
                          .split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    handleInputChange("saleDate", new Date(e.target.value))
                  }
                  className="w-full border border-gray-300 dark:border-gray-600 rounded p-2"
                />
              </div>

              {/* Lead By */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Lead By
                </label>
                <input
                  type="text"
                  value={editValues.leadBy || ""}
                  onChange={(e) => handleInputChange("leadBy", e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded p-2"
                />
              </div>

              {/* Contact/Login */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Login ID
                </label>
                <input
                  type="text"
                  value={editValues.loginId || ""}
                  onChange={(e) => handleInputChange("loginId", e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Password
                </label>
                <input
                  type="text"
                  value={editValues.password || ""}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  className="w-full border border-gray-300 dark:border-gray-600 rounded p-2"
                />
              </div>

              {/* Product */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">
                  Product
                </label>
                <input
                  type="text"
                  value={editValues.product || ""}
                  onChange={(e) => handleInputChange("product", e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded p-2"
                />
              </div>

              {/* Sales Person */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Sales Person
                </label>
                <select
                  value={editValues.salesPerson || ""}
                  onChange={(e) =>
                    handleInputChange("salesPerson", e.target.value)
                  }
                  className="w-full border border-gray-300 dark:border-gray-600 rounded p-2"
                >
                  <option value="">Select Sales Person</option>
                  {filterOptions.salesPersons.map((sp) => (
                    <option key={sp._id} value={sp._id}>
                      {sp.fullName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium mb-1">Amount</label>
                <input
                  type="number"
                  value={editValues.amount || 0}
                  onChange={(e) => handleInputChange("amount", e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded p-2"
                />
              </div>

              {/* Token */}
              <div>
                <label className="block text-sm font-medium mb-1">Token</label>
                <input
                  type="number"
                  value={editValues.token || 0}
                  onChange={(e) => handleInputChange("token", e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded p-2"
                />
              </div>

              {/* Pending */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Pending
                </label>
                <input
                  type="number"
                  value={editValues.pending || 0}
                  onChange={(e) => handleInputChange("pending", e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded p-2"
                  disabled={editValues.status === "Completed"}
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={editValues.status || ""}
                  onChange={(e) => handleInputChange("status", e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded p-2"
                >
                  {getAvailableStatusOptions(editValues.status).map(
                    (status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* Remarks */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">
                  Remarks
                </label>
                <textarea
                  value={editValues.remarks || ""}
                  onChange={(e) => handleInputChange("remarks", e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded p-2"
                  rows="3"
                />
              </div>
            </form>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => handleSave(editingSale)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingSale(null);
                  setEditValues({});
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default SalesTrackingPage;
