import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import employeeAPI from "../../services/employeeAPI";
import { formatCurrency } from "../../utils/helpers";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  FileText,
  Download,
  Eye,
  ExternalLink,
  Building,
  Award,
  DollarSign,
  Clock,
  Globe,
  MessageCircle,
  RefreshCw,
  IndianRupee,
} from "lucide-react";

const EmployeeDetailsModal = ({ employee, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [fullEmployeeData, setFullEmployeeData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && employee?._id) {
      fetchFullEmployeeData();
    } else if (isOpen && employee?.userId) {
      // If we have userId but not _id, try to fetch by userId
      fetchEmployeeByUserId();
    }
  }, [isOpen, employee?._id, employee?.userId]);

  const fetchEmployeeByUserId = async () => {
    try {
      setLoading(true);
      console.log("Fetching employee by userId:", employee.userId);

      // Use the new API endpoint to get employee by userId
      const response = await employeeAPI.getByUserId(employee.userId);
      if (response.data.success) {
        console.log("Found employee by userId:", response.data.data);
        setFullEmployeeData(response.data.data);
      } else {
        console.log("No employee found with userId:", employee.userId);
        setFullEmployeeData(employee);
      }
    } catch (error) {
      console.error("Error fetching employee by userId:", error);
      setFullEmployeeData(employee);
    } finally {
      setLoading(false);
    }
  };

  const fetchFullEmployeeData = async () => {
    try {
      setLoading(true);
      console.log("Fetching employee data for ID:", employee._id);
      console.log("Employee object passed to modal:", employee);

      const response = await employeeAPI.getById(employee._id);
      console.log("Employee API response:", response);

      if (response.data.success) {
        console.log("Full employee data:", response.data.data);
        setFullEmployeeData(response.data.data);
      } else {
        console.error("API returned success: false:", response.data);
        setFullEmployeeData(employee);
      }
    } catch (error) {
      console.error("Error fetching employee details:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      // Fallback to the passed employee data
      setFullEmployeeData(employee);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshData = () => {
    console.log("Manual refresh requested");
    fetchFullEmployeeData();
  };

  // Use full employee data if available, otherwise fallback to passed employee
  const employeeData = fullEmployeeData || employee;

  console.log("Current employee data being used:", employeeData);
  console.log("Document fields:", {
    photograph: employeeData?.photograph,
    tenthMarksheet: employeeData?.tenthMarksheet,
    aadharCard: employeeData?.aadharCard,
    panCard: employeeData?.panCard,
    pcc: employeeData?.pcc,
    resume: employeeData?.resume,
    offerLetter: employeeData?.offerLetter,
  });

  if (!employeeData) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "INACTIVE":
        return "bg-gray-100 text-gray-800";
      case "TERMINATED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Employee Details
            </DialogTitle>
          </DialogHeader>
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const renderDocumentCard = (title, document, icon) => {
    console.log(`Rendering document card for ${title}:`, document);

    if (!document) {
      return (
        <Card key={title} className="mb-4 opacity-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-gray-500">
              {icon}
              <span className="text-sm">{title}</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">Not uploaded</p>
          </CardContent>
        </Card>
      );
    }

    // Handle different document structures
    let url = null;
    let filename = title;
    let size = null;

    if (typeof document === "string") {
      // Simple string URL
      url = document;
      filename = title;
    } else if (typeof document === "object") {
      // Object with various possible structures
      url = document.url || document.webViewLink || document.webContentLink;
      filename =
        document.originalName || document.fileName || document.name || title;
      size = document.size;
    }

    return (
      <Card key={title} className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {icon}
              <span className="text-sm font-medium">{title}</span>
            </div>
            {url && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(url, "_blank")}
                className="flex items-center gap-1"
              >
                <Eye className="w-3 h-3" />
                View
              </Button>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">{filename}</p>
          {size && (
            <p className="text-xs text-gray-400">
              Size: {(size / 1024).toFixed(1)} KB
            </p>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-4xl max-h-[90vh] overflow-y-auto"
        aria-describedby="employee-details-description"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Employee Details
          </DialogTitle>
        </DialogHeader>
        <div id="employee-details-description" className="sr-only">
          Detailed view of employee information including personal details,
          contact information, documents, and employment history.
        </div>

        <div className="space-y-6">
          {/* Header with basic info */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                    {employeeData.fullName?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {employeeData.fullName}
                    </h2>
                    <p className="text-gray-600">
                      {employeeData.role?.name || employeeData.role}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getStatusColor(employeeData.status)}>
                        {employeeData.status || "ACTIVE"}
                      </Badge>
                      <Badge variant="outline">
                        {employeeData.department?.name || "General"}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={handleRefreshData}
                    disabled={loading}
                    className="flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                        Refreshing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={onClose}>
                    Close
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="employment">Employment</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{employeeData.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">
                        Date of Birth: {formatDate(employeeData.dateOfBirth)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">
                        Joined: {formatDate(employeeData.joiningDate)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <IndianRupee className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium">
                        Salary: {formatCurrency(employeeData.salary, "INR")}
                      </span>
                    </div>

                    {employeeData.internshipDuration && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">
                          Internship: {employeeData.internshipDuration} months
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Documents Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm text-gray-600">
                      <p className="mb-2">
                        📋 <strong>Available Documents:</strong>
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-1">
                          {employeeData.photograph ? "✅" : "❌"} Photograph
                        </div>
                        <div className="flex items-center gap-1">
                          {employeeData.aadharCard ? "✅" : "❌"} Aadhar Card
                        </div>
                        <div className="flex items-center gap-1">
                          {employeeData.panCard ? "✅" : "❌"} PAN Card
                        </div>
                        <div className="flex items-center gap-1">
                          {employeeData.pcc ? "✅" : "❌"} PCC
                        </div>
                        <div className="flex items-center gap-1">
                          {employeeData.tenthMarksheet ? "✅" : "❌"} 10th
                          Marksheet
                        </div>
                        <div className="flex items-center gap-1">
                          {employeeData.twelfthMarksheet ? "✅" : "❌"} 12th
                          Marksheet
                        </div>
                        <div className="flex items-center gap-1">
                          {employeeData.bachelorDegree ? "✅" : "❌"} Bachelor
                          Degree
                        </div>
                        <div className="flex items-center gap-1">
                          {employeeData.postgraduateDegree ? "✅" : "❌"}{" "}
                          Postgraduate Degree
                        </div>
                        <div className="flex items-center gap-1">
                          {employeeData.resume ? "✅" : "❌"} Resume
                        </div>
                        <div className="flex items-center gap-1">
                          {employeeData.offerLetter ? "✅" : "❌"} Offer Letter
                        </div>
                      </div>
                      <p className="mt-3 text-blue-600 font-medium">
                        💡 Click on the "Documents" tab to view and download all
                        documents
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Contact Tab */}
            <TabsContent value="contact" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">
                        {employeeData.phoneNumber || "Not specified"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">
                        {employeeData.whatsappNumber || "Not specified"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">
                        {employeeData.linkedInUrl ? (
                          <a
                            href={employeeData.linkedInUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center gap-1"
                          >
                            LinkedIn Profile{" "}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          "Not specified"
                        )}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Address Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Current Address:
                      </p>
                      <p className="text-sm text-gray-600">
                        {employeeData.currentAddress || "Not specified"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Permanent Address:
                      </p>
                      <p className="text-sm text-gray-600">
                        {employeeData.permanentAddress || "Not specified"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Documents Tab */}
            <TabsContent value="documents" className="space-y-4">
              {console.log(
                "Documents tab content rendering with employeeData:",
                employeeData
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Identity Documents
                  </h3>
                  {renderDocumentCard(
                    "Photograph",
                    employeeData.photograph,
                    <User className="w-4 h-4" />
                  )}
                  {renderDocumentCard(
                    "Aadhar Card",
                    employeeData.aadharCard,
                    <FileText className="w-4 h-4" />
                  )}
                  {renderDocumentCard(
                    "PAN Card",
                    employeeData.panCard,
                    <FileText className="w-4 h-4" />
                  )}
                  {renderDocumentCard(
                    "PCC",
                    employeeData.pcc,
                    <FileText className="w-4 h-4" />
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" />
                    Educational Documents
                  </h3>
                  {renderDocumentCard(
                    "10th Marksheet",
                    employeeData.tenthMarksheet,
                    <FileText className="w-4 h-4" />
                  )}
                  {renderDocumentCard(
                    "12th Marksheet",
                    employeeData.twelfthMarksheet,
                    <FileText className="w-4 h-4" />
                  )}
                  {renderDocumentCard(
                    "Bachelor Degree",
                    employeeData.bachelorDegree,
                    <FileText className="w-4 h-4" />
                  )}
                  {renderDocumentCard(
                    "Postgraduate Degree",
                    employeeData.postgraduateDegree,
                    <FileText className="w-4 h-4" />
                  )}
                </div>

                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    Employment Documents
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderDocumentCard(
                      "Resume",
                      employeeData.resume,
                      <FileText className="w-4 h-4" />
                    )}
                    {renderDocumentCard(
                      "Offer Letter",
                      employeeData.offerLetter,
                      <FileText className="w-4 h-4" />
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Employment Tab */}
            <TabsContent value="employment" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      Department & Role
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium">
                        Department: {employeeData.department?.name || "General"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium">
                        Role: {employeeData.role?.name || employeeData.role}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">
                        Joining Date: {formatDate(employeeData.joiningDate)}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <GraduationCap className="w-4 h-4" />
                      Education
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">
                        College: {employeeData.collegeName || "Not specified"}
                      </span>
                    </div>
                    {employeeData.internshipDuration && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">
                          Internship Duration: {employeeData.internshipDuration}{" "}
                          months
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeDetailsModal;
