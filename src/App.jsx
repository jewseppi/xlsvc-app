import React, { useState, useEffect } from "react";
import axios from "axios";
import styled, { ThemeProvider, createGlobalStyle } from "styled-components";
import { theme } from "./styled/theme";
import {
  AppContainer,
  LoadingContainer,
  Button,
  Input,
  Label,
} from "./styled/BaseComponents";
import {
  AuthContainer,
  AuthCard,
  AuthTitle,
  AuthSubtitle,
  Form,
  FormGroup,
  Alert,
  CenterText,
} from "./styled/AuthComponents";

// Import dashboard components
import {
  DashboardHeader,
  HeaderContent,
  DashboardTitle,
  UserInfo,
  UserEmail,
  MainContent,
  DashboardGrid,
  LeftColumn,
  RightColumn,
} from "./styled/DashboardComponents";

import {
  ContentCard,
  CardHeader,
  CardTitle,
  CardSubtitle,
  CardBody,
  EmptyState,
} from "./styled/CardComponents";

import {
  FileList,
  FileItem,
  FileInfo,
  FileIcon,
  FileDetails,
  FileMeta,
  FileName,
  Badge,
} from "./styled/FileComponents";

import {
  FileInput,
  ProgressContainer,
  ProgressBar,
  ProgressFill,
  ProgressText,
} from "./styled/UploadComponents";

import {
  ProcessingSection,
  SelectedFileInfo,
  ProcessDescription,
  ProcessingLog,
  LogEntry,
  DownloadSection,
  DownloadGrid,
  DownloadCard,
} from "./styled/ProcessingComponents";

import FilterConfiguration from "./components/FilterConfiguration";
import ProcessingHistory from "./components/ProcessingHistory";

// Global styles
const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html, body, #root {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
  }

  body {
    background: ${(props) => props.theme.colors.background.primary};
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Inter', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${(props) => props.theme.colors.background.secondary};
  }

  ::-webkit-scrollbar-thumb {
    background: ${(props) => props.theme.colors.border.secondary};
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${(props) => props.theme.colors.accent.primary};
  }
`;

// API Configuration
const API_BASE = import.meta.env.DEV
  ? "http://127.0.0.1:5000/api"
  : "https://api.xlsvc.jsilverman.ca/api";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios
        .get(`${API_BASE}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setUser(response.data);
        })
        .catch((error) => {
          console.error("Profile fetch error:", error);
          localStorage.removeItem("token");
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <LoadingContainer>
          <div>Loading...</div>
        </LoadingContainer>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <AppContainer>
        {!user ? (
          <AuthPage setUser={setUser} />
        ) : (
          <Dashboard user={user} logout={logout} />
        )}
      </AppContainer>
    </ThemeProvider>
  );
}

function AuthPage({ setUser }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const endpoint = isLogin ? "login" : "register";
      const response = await axios.post(`${API_BASE}/${endpoint}`, {
        email,
        password,
      });

      const { access_token } = response.data;
      localStorage.setItem("token", access_token);

      const profileResponse = await axios.get(`${API_BASE}/profile`, {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      setUser(profileResponse.data);
    } catch (err) {
      console.error("Auth error:", err);
      const errorMessage =
        err.response?.data?.error || err.message || "Something went wrong";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContainer>
      <AuthCard>
        <AuthTitle>Excel Processor</AuthTitle>
        <AuthSubtitle>
          {isLogin ? "Sign in to your account" : "Create a new account"}
        </AuthSubtitle>

        <Form onSubmit={handleSubmit}>
          {error && <Alert>{error}</Alert>}

          <FormGroup>
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </FormGroup>

          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? "Processing..." : isLogin ? "Sign in" : "Sign up"}
          </Button>

          <CenterText>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </Button>
          </CenterText>
        </Form>
      </AuthCard>
    </AuthContainer>
  );
}

const testGitHub = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_BASE}/test-github`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("=== GITHUB TEST SUCCESS ===");
    console.log(response.data);
    alert(
      `GitHub Test Result: ${response.data.status}\nCheck console for details`
    );
  } catch (err) {
    console.error("=== GITHUB TEST ERROR ===");
    console.error("Error:", err);
    console.error("Response:", err.response?.data);
    alert(
      `GitHub Test Failed: ${
        err.response?.data?.error || err.message
      }\nCheck console for details`
    );
  }
};

function Dashboard({ user, logout }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [processingLog, setProcessingLog] = useState([]);
  const [processedFile, setProcessedFile] = useState(null);
  const [automatedJob, setAutomatedJob] = useState(null);
  const [jobStatus, setJobStatus] = useState("idle"); // idle, processing, completed, failed
  const [processingHistory, setProcessingHistory] = useState([]);

  const [filterRules, setFilterRules] = useState([
    { column: "F", value: "0" },
    { column: "G", value: "0" },
    { column: "H", value: "0" },
    { column: "I", value: "0" },
  ]);

  // Check if current filters match any completed job
  const checkFilterMatch = () => {
    const completedJobs = processingHistory.filter(
      (job) => job.status === "completed"
    );

    return completedJobs.some((job) => {
      if (!job.filter_rules || job.filter_rules.length === 0) return false;
      if (job.filter_rules.length !== filterRules.length) return false;

      return filterRules.every((currentRule) =>
        job.filter_rules.some(
          (jobRule) =>
            jobRule.column === currentRule.column &&
            jobRule.value === currentRule.value
        )
      );
    });
  };

  const filtersMatchExisting = selectedFile ? checkFilterMatch() : false;

  const handleAutomatedProcessing = async () => {
    if (!selectedFile) return;

    setJobStatus("processing");
    setProcessingLog(["Starting automated processing via GitHub Actions..."]);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_BASE}/process-automated/${selectedFile.id}`,
        { filter_rules: filterRules },
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000, // 10 seconds to start the job
        }
      );

      const result = response.data;
      setAutomatedJob(result);
      setProcessingLog([
        "✅ Processing job started on GitHub Actions",
        `📋 Job ID: ${result.job_id}`,
        `⏱️ Estimated time: ${result.estimated_time}`,
        "🔄 Monitoring progress...",
      ]);

      // Start polling for job status
      pollJobStatus(result.job_id);
    } catch (err) {
      console.error("=== AUTOMATED PROCESSING ERROR ===");
      console.error("Error object:", err);
      console.error("Error message:", err.message);
      console.error("Response status:", err.response?.status);
      console.error("Response data:", err.response?.data);
      console.error("Response headers:", err.response?.headers);

      setJobStatus("failed");

      let errorMessages = ["❌ Failed to start automated processing"];

      if (err.response?.data) {
        // Server returned an error response
        if (err.response.data.error) {
          errorMessages.push(`Server Error: ${err.response.data.error}`);
        }
        if (err.response.data.details) {
          errorMessages.push(`Details: ${err.response.data.details}`);
        }
        if (err.response.data.traceback) {
          errorMessages.push("Check server logs for full traceback");
          console.error("Server traceback:", err.response.data.traceback);
        }
        errorMessages.push(`HTTP Status: ${err.response.status}`);
      } else if (err.request) {
        // Request was made but no response received
        errorMessages.push(
          "No response from server - check if server is running"
        );
      } else {
        // Something else happened
        errorMessages.push(`Request Error: ${err.message}`);
      }

      setProcessingLog(errorMessages);
    }
  };

  const testGitHubDetailed = async () => {
    try {
      const token = localStorage.getItem("token");

      console.log("=== DETAILED GITHUB TEST ===");

      // Test 1: Basic GitHub auth test
      console.log("1. Testing basic GitHub auth...");
      const authResponse = await axios.get(`${API_BASE}/test-github`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Auth test result:", authResponse.data);

      // Test 2: Test the actual dispatch call with debug info
      console.log("2. Testing repository dispatch with debug...");
      const dispatchResponse = await axios.post(
        `${API_BASE}/test-dispatch`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("Dispatch test result:", dispatchResponse.data);

      alert("Tests completed - check console for detailed results");
    } catch (err) {
      console.error("=== DETAILED GITHUB TEST ERROR ===");
      console.error("Error:", err);
      console.error("Response:", err.response?.data);
      alert(
        `Test failed: ${
          err.response?.data?.error || err.message
        }\nCheck console for details`
      );
    }
  };

  const pollJobStatus = async (jobId) => {
    const token = localStorage.getItem("token");
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes max (5 second intervals)

    const poll = async () => {
      try {
        attempts++;
        const response = await axios.get(`${API_BASE}/job-status/${jobId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const status = response.data;

        if (status.status === "completed") {
          setJobStatus("completed");
          setProcessingLog((prev) => [
            ...prev,
            "✅ Processing completed successfully!",
            "📥 File ready for download",
          ]);

          setProcessedFile({
            isAutomated: true,
            jobId: jobId,
            downloadFileId: status.download_file_id,
            downloadFilename: status.download_filename,
          });
        } else if (status.status === "failed") {
          setJobStatus("failed");
          setProcessingLog((prev) => [
            ...prev,
            "❌ Processing failed on GitHub Actions",
            `Error: ${status.error || "Unknown error"}`,
          ]);
        } else if (attempts < maxAttempts) {
          // Still processing, update log occasionally
          if (attempts % 6 === 0) {
            // Every 30 seconds
            setProcessingLog((prev) => [
              ...prev,
              `🔄 Still processing... (${Math.floor((attempts * 5) / 60)} min ${
                (attempts * 5) % 60
              } sec)`,
            ]);
          }

          // Continue polling
          setTimeout(poll, 5000); // Poll every 5 seconds
        } else {
          // Timeout
          setJobStatus("failed");
          setProcessingLog((prev) => [
            ...prev,
            "⏰ Processing timeout - job may still be running",
            "Try refreshing the page in a few minutes",
          ]);
        }
      } catch (err) {
        console.error("Status polling error:", err);
        if (attempts < maxAttempts) {
          setTimeout(poll, 5000);
        } else {
          setJobStatus("failed");
          setProcessingLog((prev) => [
            ...prev,
            "❌ Failed to check job status",
          ]);
        }
      }
    };

    poll();
  };

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE}/files`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFiles(response.data.files);
    } catch (err) {
      console.error("Error loading files:", err);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      alert("Please select an Excel file (.xlsx or .xls)");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const token = localStorage.getItem("token");
      const response = await axios.post(`${API_BASE}/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        timeout: 300000, // 5 minutes
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(progress);
        },
      });

      const result = response.data;

      if (result.duplicate) {
        alert(
          `File "${result.filename}" already exists. Selecting existing file.`
        );
        // Find and select the existing file
        const existingFile = files.find((f) => f.id === result.file_id);
        if (existingFile) {
          setSelectedFile(existingFile);
        }
      } else {
        alert("File uploaded successfully!");
      }

      loadFiles();
      e.target.value = "";
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed: " + (err.response?.data?.error || "Unknown error"));
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Add cleanup function
  const cleanupMissingFiles = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_BASE}/cleanup-files`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert(`Cleaned up ${response.data.removed_count} missing files`);
      loadFiles(); // Refresh the list
    } catch (err) {
      console.error("Cleanup error:", err);
      alert(
        "Cleanup failed: " + (err.response?.data?.error || "Unknown error")
      );
    }
  };

  // Add debug function to see storage organization
  const debugStorage = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE}/debug/storage`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("=== STORAGE DEBUG ===");
      console.log("Database files:", response.data.database_files);
      console.log("Upload folder:", response.data.storage_folders.uploads);
      console.log("Processed folder:", response.data.storage_folders.processed);
      console.log("Macros folder:", response.data.storage_folders.macros);
    } catch (err) {
      console.error("Debug error:", err);
    }
  };

  const handleProcessFile = async () => {
    if (!selectedFile) return;

    setProcessing(true);
    setProcessingLog(["Starting file processing..."]);
    setProcessedFile(null);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_BASE}/process/${selectedFile.id}`,
        { filter_rules: filterRules },
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 600000,
        }
      );

      const result = response.data;
      setProcessingLog([
        "Processing completed successfully!",
        `Deleted ${result.deleted_rows} empty rows`,
        ...result.processing_log,
      ]);

      setProcessedFile({
        // Automated fields
        id: result.processed_file_id,
        filename: result.download_filename,
        deletedRows: result.deleted_rows,
        // Manual processing fields
        isAutomated: false,
        hasRowsToDelete: result.total_rows_to_delete > 0,
        totalRows: result.total_rows_to_delete,
        sheetsAffected: result.sheets_affected,
        downloads: result.downloads, // { macro: {...}, instructions: {...} }
      });

      loadFiles();
    } catch (err) {
      console.error("Processing error:", err);
      setProcessingLog([
        "Processing failed!",
        err.response?.data?.error || "Unknown error occurred",
      ]);
    } finally {
      setProcessing(false);
    }
  };

  {
    processedFile && (
      <DownloadSection>
        <h4>Analysis Results</h4>
        <p>Found {processedFile.totalRows} rows to delete</p>
        <p>Sheets affected: {processedFile.sheetsAffected?.join(", ")}</p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem",
            marginTop: "1rem",
          }}
        >
          {/* LibreOffice Macro Option */}
          <div
            style={{
              padding: "1rem",
              background: "rgba(99, 102, 241, 0.1)",
              borderRadius: "8px",
              border: "1px solid rgba(99, 102, 241, 0.3)",
            }}
          >
            <h5 style={{ color: "#6366f1", marginBottom: "0.5rem" }}>
              🖥️ LibreOffice Macro
            </h5>
            <p style={{ fontSize: "0.875rem", marginBottom: "1rem" }}>
              Automated deletion - recommended for most users
            </p>
            <Button
              variant="primary"
              onClick={() =>
                handleDownload(
                  processedFile.downloads.macro.file_id,
                  processedFile.downloads.macro.filename
                )
              }
            >
              Download Macro
            </Button>
          </div>

          {/* Manual Instructions Option */}
          <div
            style={{
              padding: "1rem",
              background: "rgba(139, 92, 246, 0.1)",
              borderRadius: "8px",
              border: "1px solid rgba(139, 92, 246, 0.3)",
            }}
          >
            <h5 style={{ color: "#8b5cf6", marginBottom: "0.5rem" }}>
              📋 Manual Instructions
            </h5>
            <p style={{ fontSize: "0.875rem", marginBottom: "1rem" }}>
              Step-by-step deletion guide
            </p>
            <Button
              variant="secondary"
              onClick={() =>
                handleDownload(
                  processedFile.downloads.instructions.file_id,
                  processedFile.downloads.instructions.filename
                )
              }
            >
              Download Guide
            </Button>
          </div>
        </div>

        <div
          style={{
            marginTop: "1rem",
            padding: "1rem",
            background: "rgba(16, 185, 129, 0.1)",
            borderRadius: "8px",
            border: "1px solid rgba(16, 185, 129, 0.3)",
          }}
        >
          <h5 style={{ color: "#10b981", marginBottom: "0.5rem" }}>
            📊 Full Analysis
          </h5>
          <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
            View detailed row-by-row analysis and create custom processing rules
          </p>
          <Button variant="ghost" disabled style={{ marginTop: "0.5rem" }}>
            Coming Soon
          </Button>
        </div>
      </DownloadSection>
    );
  }

  const handleDownload = async (fileId, filename) => {
    console.log("=== DOWNLOAD DEBUG ===");
    console.log("File ID:", fileId);
    console.log("Filename:", filename);
    console.log("API_BASE:", API_BASE);

    const token = localStorage.getItem("token");
    console.log("Token exists:", !!token);

    try {
      const url = `${API_BASE}/download/${fileId}`;
      console.log("Download URL:", url);

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);
      console.log("Blob size:", response.data.size);

      // Create download link
      const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      console.log("Download initiated successfully");
    } catch (err) {
      console.error("=== DOWNLOAD ERROR ===");
      console.error("Error:", err);
      console.error("Response data:", err.response?.data);
      console.error("Response status:", err.response?.status);
      alert("Download failed: " + (err.response?.data?.error || err.message));
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <>
      <DashboardHeader>
        <HeaderContent>
          <DashboardTitle>Excel Processor</DashboardTitle>
          <UserInfo>
            <UserEmail>Welcome, {user.email}</UserEmail>
            <Button variant="danger" small onClick={logout}>
              Logout
            </Button>
          </UserInfo>
        </HeaderContent>
      </DashboardHeader>

      <MainContent>
        <DashboardGrid>
          <LeftColumn>
            <ContentCard>
              <CardHeader>
                <CardTitle>Upload Excel File</CardTitle>
                <CardSubtitle>
                  Select .xlsx or .xls file (max 100MB)
                </CardSubtitle>
              </CardHeader>
              <CardBody>
                <FileInput
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />

                {uploading && (
                  <ProgressContainer>
                    <ProgressBar>
                      <ProgressFill progress={uploadProgress} />
                    </ProgressBar>
                    <ProgressText>Uploading... {uploadProgress}%</ProgressText>
                  </ProgressContainer>
                )}
              </CardBody>
            </ContentCard>

            <ContentCard>
              <CardHeader>
                <CardTitle>Your Files</CardTitle>
                <CardSubtitle>
                  Select a file to analyze for row deletion
                </CardSubtitle>
                {/* Add debug buttons for development */}
                <div
                  style={{
                    marginTop: "0.5rem",
                    display: "flex",
                    gap: "0.5rem",
                  }}
                >
                  <Button variant="ghost" small onClick={cleanupMissingFiles}>
                    🧹 Cleanup
                  </Button>
                  <Button variant="ghost" small onClick={debugStorage}>
                    🔍 Debug
                  </Button>
                  <Button variant="ghost" small onClick={testGitHubDetailed}>
                    🔗 Test GitHub
                  </Button>
                </div>
              </CardHeader>

              {files.length === 0 ? (
                <EmptyState>
                  <div className="icon">📊</div>
                  <p>No files uploaded yet</p>
                  <p>Upload an Excel file to get started</p>
                </EmptyState>
              ) : (
                <CardBody>
                  <FileList>
                    {files.map((file) => (
                      <FileItem
                        key={file.id}
                        selected={selectedFile?.id === file.id}
                        onClick={() => setSelectedFile(file)}
                      >
                        <FileInfo>
                          <FileIcon>XLS</FileIcon>
                          <FileDetails>
                            <FileName title={file.original_filename}>
                              {file.original_filename}
                            </FileName>
                            <FileMeta>
                              {formatFileSize(file.file_size)} • Uploaded{" "}
                              {new Date(file.upload_date).toLocaleDateString()}
                              {file.processed && " • Analyzed"}
                            </FileMeta>
                          </FileDetails>
                        </FileInfo>
                        <div>
                          {selectedFile?.id === file.id && (
                            <Badge style={{ backgroundColor: "#3b82f6" }}>
                              Selected
                            </Badge>
                          )}
                          {file.processed && selectedFile?.id !== file.id && (
                            <Badge style={{ backgroundColor: "#10b981" }}>
                              Analyzed
                            </Badge>
                          )}
                        </div>
                      </FileItem>
                    ))}
                  </FileList>
                </CardBody>
              )}
            </ContentCard>

            {selectedFile && (
              <ContentCard>
                <CardHeader>
                  <CardTitle>Processing History</CardTitle>
                  <CardSubtitle>
                    Past results for {selectedFile.original_filename}
                  </CardSubtitle>
                </CardHeader>
                <CardBody>
                  <ProcessingHistory
                    fileId={selectedFile.id}
                    apiBase={API_BASE}
                    onDownload={handleDownload}
                    history={processingHistory}
                    setHistory={setProcessingHistory}
                  />
                </CardBody>
              </ContentCard>
            )}
          </LeftColumn>

          <RightColumn>
            <ContentCard>
              <CardHeader>
                <CardTitle>Analyze File</CardTitle>
                <CardSubtitle>
                  Define which columns to check and what conditions to apply
                </CardSubtitle>
              </CardHeader>
              <CardBody>
                {selectedFile ? (
                  <ProcessingSection>
                    <SelectedFileInfo>
                      <strong>Selected: </strong>
                      {selectedFile.original_filename}
                    </SelectedFileInfo>

                    <FilterConfiguration
                      filterRules={filterRules}
                      setFilterRules={setFilterRules}
                    />

                    <ProcessDescription>
                      Choose your processing method:
                    </ProcessDescription>

                    {/* Manual Processing Button */}
                    <Button
                      variant="secondary"
                      onClick={handleProcessFile}
                      disabled={processing || jobStatus === "processing"}
                      style={{ width: "100%", marginTop: "1rem" }}
                    >
                      {processing
                        ? "Analyzing..."
                        : "📋 Generate Instructions & Macro"}
                    </Button>

                    {/* Automated Processing Button */}
                    <Button
                      variant="primary"
                      onClick={handleAutomatedProcessing}
                      disabled={
                        processing ||
                        jobStatus === "processing" ||
                        filtersMatchExisting
                      }
                      style={{ width: "100%", marginTop: "0.5rem" }}
                    >
                      {jobStatus === "processing"
                        ? "🔄 Processing on GitHub..."
                        : "⚡ Automated Processing"}
                    </Button>

                    <div
                      style={{
                        fontSize: "0.875rem",
                        color: "#6b7280",
                        marginTop: "0.5rem",
                        textAlign: "center",
                      }}
                    >
                      Automated processing preserves all images, charts, and
                      formatting
                    </div>
                  </ProcessingSection>
                ) : (
                  <EmptyState>
                    <p>Select a file from the left to start analysis</p>
                  </EmptyState>
                )}
              </CardBody>
            </ContentCard>

            {(processingLog.length > 0 || processedFile) && (
              <ContentCard>
                <CardHeader>
                  <CardTitle>Analysis Results</CardTitle>
                </CardHeader>
                <CardBody>
                  <ProcessingLog>
                    {processingLog.map((log, index) => (
                      <LogEntry
                        key={index}
                        error={log.includes("failed") || log.includes("error")}
                      >
                        {log}
                      </LogEntry>
                    ))}
                  </ProcessingLog>

                  {processedFile && processedFile.isAutomated && (
                    <DownloadSection>
                      <h4>🎉 Automated Processing Complete!</h4>
                      <p>Your file has been processed on GitHub Actions</p>

                      <Button
                        variant="primary"
                        onClick={() =>
                          handleDownload(
                            processedFile.downloadFileId,
                            processedFile.downloadFilename
                          )
                        }
                        style={{ width: "100%", marginTop: "1rem" }}
                      >
                        📥 Download Processed File
                      </Button>
                      {item.report_file_id && (
                        <Button
                          variant="secondary"
                          onClick={() =>
                            onDownload(
                              item.report_file_id,
                              `DeletionReport_${item.processed_filename}`
                            )
                          }
                          style={{ width: "100%" }}
                        >
                          📊 View Deleted Rows
                        </Button>
                      )}
                      <div
                        style={{
                          marginTop: "1rem",
                          padding: "1rem",
                          background: "rgba(16, 185, 129, 0.1)",
                          borderRadius: "8px",
                          fontSize: "0.875rem",
                          textAlign: "center",
                        }}
                      >
                        ✅ All images, charts, and formatting preserved
                        <br />
                        🤖 Processed automatically on secure GitHub
                        infrastructure
                      </div>
                    </DownloadSection>
                  )}

                  {/* Manual Processing Results */}
                  {processedFile &&
                    processedFile.hasRowsToDelete &&
                    !processedFile.isAutomated && (
                      <DownloadSection>
                        <h4>Analysis Complete - Download Instructions</h4>
                        <p>Found {processedFile.totalRows} rows to delete</p>
                        <p>
                          Sheets affected:{" "}
                          {processedFile.sheetsAffected?.join(", ")}
                        </p>

                        <div
                          style={{
                            display: "grid",
                            gap: "1rem",
                            marginTop: "1rem",
                          }}
                        >
                          {/* LibreOffice Macro */}
                          <div
                            style={{
                              padding: "1rem",
                              background: "rgba(99, 102, 241, 0.1)",
                              borderRadius: "8px",
                              border: "1px solid rgba(99, 102, 241, 0.3)",
                            }}
                          >
                            <h5
                              style={{
                                color: "#6366f1",
                                marginBottom: "0.5rem",
                              }}
                            >
                              LibreOffice Macro (Recommended)
                            </h5>
                            <p
                              style={{
                                fontSize: "0.875rem",
                                marginBottom: "1rem",
                                color: "#9ca3af",
                              }}
                            >
                              Automated deletion while preserving all formatting
                              and images
                            </p>
                            <Button
                              variant="primary"
                              onClick={() => {
                                console.log(
                                  "Downloading macro:",
                                  processedFile.downloads?.macro
                                );
                                handleDownload(
                                  processedFile.downloads?.macro?.file_id,
                                  processedFile.downloads?.macro?.filename
                                );
                              }}
                              style={{ width: "100%" }}
                            >
                              Download Macro (.bas)
                            </Button>
                          </div>

                          {/* Instructions */}
                          <div
                            style={{
                              padding: "1rem",
                              background: "rgba(139, 92, 246, 0.1)",
                              borderRadius: "8px",
                              border: "1px solid rgba(139, 92, 246, 0.3)",
                            }}
                          >
                            <h5
                              style={{
                                color: "#8b5cf6",
                                marginBottom: "0.5rem",
                              }}
                            >
                              Manual Instructions
                            </h5>
                            <p
                              style={{
                                fontSize: "0.875rem",
                                marginBottom: "1rem",
                                color: "#9ca3af",
                              }}
                            >
                              Step-by-step deletion guide with detailed
                              instructions
                            </p>
                            <Button
                              variant="secondary"
                              onClick={() => {
                                console.log(
                                  "Downloading instructions:",
                                  processedFile.downloads?.instructions
                                );
                                handleDownload(
                                  processedFile.downloads?.instructions
                                    ?.file_id,
                                  processedFile.downloads?.instructions
                                    ?.filename
                                );
                              }}
                              style={{ width: "100%" }}
                            >
                              Download Instructions (.txt)
                            </Button>
                          </div>
                          {processedFile.downloads?.report && (
                            <div
                              style={{
                                padding: "1rem",
                                background: "rgba(16, 185, 129, 0.1)",
                                borderRadius: "8px",
                                border: "1px solid rgba(16, 185, 129, 0.3)",
                              }}
                            >
                              <h5
                                style={{
                                  color: "#10b981",
                                  marginBottom: "0.5rem",
                                }}
                              >
                                📊 Deletion Report
                              </h5>
                              <p
                                style={{
                                  fontSize: "0.875rem",
                                  marginBottom: "1rem",
                                  color: "#9ca3af",
                                }}
                              >
                                Excel file showing all rows that will be deleted
                              </p>
                              <Button
                                variant="secondary"
                                onClick={() =>
                                  handleDownload(
                                    processedFile.downloads.report.file_id,
                                    processedFile.downloads.report.filename
                                  )
                                }
                                style={{ width: "100%" }}
                              >
                                Download Deletion Report (.xlsx)
                              </Button>
                            </div>
                          )}
                        </div>
                      </DownloadSection>
                    )}

                  {/* Show when no rows need deletion */}
                  {processedFile && !processedFile.hasRowsToDelete && (
                    <div
                      style={{
                        padding: "1rem",
                        background: "rgba(16, 185, 129, 0.1)",
                        borderRadius: "8px",
                        border: "1px solid rgba(16, 185, 129, 0.3)",
                        textAlign: "center",
                      }}
                    >
                      <h4 style={{ color: "#10b981" }}>✅ File is Clean!</h4>
                      <p style={{ color: "#6b7280" }}>
                        No rows found that need deletion. Your file is already
                        optimized.
                      </p>
                    </div>
                  )}
                </CardBody>
              </ContentCard>
            )}
          </RightColumn>
        </DashboardGrid>
      </MainContent>
    </>
  );
}

export default App;
