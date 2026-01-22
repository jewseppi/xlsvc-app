import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import axios from "axios";
import styled, { ThemeProvider, createGlobalStyle } from "styled-components";
import { theme } from "./styled/theme";
import LandingPage from "./components/LandingPage";
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
import GeneratedFiles from "./components/GeneratedFiles";

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

// Error Boundary Fallback Component
function ErrorFallback({error, resetErrorBoundary}) {
  return (
    <div style={{
      padding: '2rem',
      textAlign: 'center',
      background: '#f8f9fa',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <h2 style={{color: '#dc3545', marginBottom: '1rem'}}>Something went wrong</h2>
      <pre style={{
        color: '#dc3545',
        background: '#f8d7da',
        padding: '1rem',
        borderRadius: '4px',
        marginBottom: '1rem',
        fontSize: '0.875rem'
      }}>
        {error.message}
      </pre>
      <Button variant="primary" onClick={resetErrorBoundary}>
        Try again
      </Button>
    </div>
  );
}

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
    <BrowserRouter>
    <ThemeProvider theme={theme}>
      <GlobalStyle />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/app" element={
      <AppContainer>
        {!user ? (
          <AuthPage setUser={setUser} />
        ) : (
                <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Dashboard user={user} logout={logout} />
                </ErrorBoundary>
        )}
      </AppContainer>
          } />
        </Routes>
    </ThemeProvider>
    </BrowserRouter>
  );
}

function AuthPage({ setUser }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [invitationToken, setInvitationToken] = useState(null);
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  // Extract invitation token from URL query params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    const registerParam = urlParams.get("register");
    
    if (token && registerParam === "1") {
      setInvitationToken(token);
      setIsLogin(false);
      
      // Validate token and extract email
      axios
        .post(`${API_BASE}/validate-invitation`, { token })
        .then((response) => {
          if (response.data.valid) {
            setEmail(response.data.email);
          }
        })
        .catch((err) => {
          setError(err.response?.data?.error || "Invalid invitation link");
        });
    }
  }, []);

  // Validate password strength
  useEffect(() => {
    if (!password) {
      setPasswordRequirements({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false,
      });
      return;
    }

    setPasswordRequirements({
      length: password.length >= 12,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    });
  }, [password]);

  const isPasswordValid = Object.values(passwordRequirements).every(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (invitationToken && !isLogin) {
        // Registration with invitation token
        if (!isPasswordValid) {
          setError("Password does not meet all requirements");
          setLoading(false);
          return;
        }

        const response = await axios.post(`${API_BASE}/register`, {
          invitation_token: invitationToken,
          password,
        });

        const { access_token } = response.data;
        localStorage.setItem("token", access_token);

        const profileResponse = await axios.get(`${API_BASE}/profile`, {
          headers: { Authorization: `Bearer ${access_token}` },
        });

        setUser(profileResponse.data);
      } else if (isLogin) {
        // Login
        const response = await axios.post(`${API_BASE}/login`, {
          email,
          password,
        });

        const { access_token } = response.data;
        localStorage.setItem("token", access_token);

        const profileResponse = await axios.get(`${API_BASE}/profile`, {
          headers: { Authorization: `Bearer ${access_token}` },
        });

        setUser(profileResponse.data);
      } else {
        setError("Registration requires an invitation link");
        setLoading(false);
      }
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
          {invitationToken
            ? "Create your account"
            : isLogin
            ? "Sign in to your account"
            : "Registration requires an invitation"}
        </AuthSubtitle>

        {!invitationToken && !isLogin && (
          <div style={{ padding: "1rem", textAlign: "center", color: "#6b7280" }}>
            <p>Registration is by invitation only.</p>
            <p style={{ fontSize: "0.875rem", marginTop: "0.5rem" }}>
              Please check your email for an invitation link.
            </p>
          </div>
        )}

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
              disabled={!!invitationToken}
            />
            {invitationToken && (
              <p style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "0.25rem" }}>
                Email from invitation link
              </p>
            )}
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
            {!isLogin && (
              <div style={{ marginTop: "0.75rem", fontSize: "0.875rem" }}>
                <div style={{ marginBottom: "0.5rem", fontWeight: 500 }}>
                  Password Requirements:
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span>{passwordRequirements.length ? "✓" : "○"}</span>
                    <span style={{ color: passwordRequirements.length ? "#10b981" : "#6b7280" }}>
                      At least 12 characters
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span>{passwordRequirements.uppercase ? "✓" : "○"}</span>
                    <span style={{ color: passwordRequirements.uppercase ? "#10b981" : "#6b7280" }}>
                      One uppercase letter
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span>{passwordRequirements.lowercase ? "✓" : "○"}</span>
                    <span style={{ color: passwordRequirements.lowercase ? "#10b981" : "#6b7280" }}>
                      One lowercase letter
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span>{passwordRequirements.number ? "✓" : "○"}</span>
                    <span style={{ color: passwordRequirements.number ? "#10b981" : "#6b7280" }}>
                      One number
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span>{passwordRequirements.special ? "✓" : "○"}</span>
                    <span style={{ color: passwordRequirements.special ? "#10b981" : "#6b7280" }}>
                      One special character (!@#$%^&* etc.)
                    </span>
                  </div>
                </div>
              </div>
            )}
          </FormGroup>

          {isLogin ? (
            <>
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? "Processing..." : "Sign in"}
              </Button>
              <CenterText>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsLogin(false)}
                >
                  Don't have an account? Registration requires an invitation
                </Button>
              </CenterText>
            </>
          ) : invitationToken ? (
            <Button
              type="submit"
              variant="primary"
              disabled={loading || !isPasswordValid}
            >
              {loading ? "Creating account..." : "Create account"}
            </Button>
          ) : (
            <CenterText>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsLogin(true)}
              >
                Already have an account? Sign in
              </Button>
            </CenterText>
          )}
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

function AdminPanel({ apiBase, onCleanup, onDebug, onTestGitHub, currentUser }) {
  const [inviteEmail, setInviteEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [invitationUrl, setInvitationUrl] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [invitations, setInvitations] = useState([]);
  const [loadingInvitations, setLoadingInvitations] = useState(false);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // { user, details }

  // Load invitations and users on mount
  useEffect(() => {
    loadInvitations();
    loadUsers();
  }, []);

  const loadInvitations = async () => {
    setLoadingInvitations(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${apiBase}/admin/invitations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInvitations(response.data.invitations);
    } catch (err) {
      console.error("Error loading invitations:", err);
    } finally {
      setLoadingInvitations(false);
    }
  };

  const handleGenerateInvitation = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");
    setInvitationUrl("");

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${apiBase}/admin/create-invitation`,
        { email: inviteEmail },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setInvitationUrl(response.data.invitation_url);
      setSuccessMessage(
        `Invitation link generated for ${response.data.email}`
      );
      setInviteEmail("");
      loadInvitations(); // Refresh list
    } catch (err) {
      console.error("Error generating invitation:", err);
      setErrorMessage(
        err.response?.data?.error || err.message || "Failed to generate invitation"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleExpireInvitation = async (invitationId, email) => {
    if (!confirm(`Revoke invitation for ${email}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${apiBase}/admin/invitations/${invitationId}/expire`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSuccessMessage(`Invitation for ${email} has been revoked`);
      setTimeout(() => setSuccessMessage(""), 3000);
      loadInvitations(); // Refresh list
    } catch (err) {
      console.error("Error expiring invitation:", err);
      setErrorMessage(
        err.response?.data?.error || err.message || "Failed to revoke invitation"
      );
    }
  };

  const handleCopyToClipboard = () => {
    if (invitationUrl) {
      navigator.clipboard.writeText(invitationUrl).then(() => {
        const prevMessage = successMessage;
        setSuccessMessage("Invitation URL copied to clipboard!");
        setTimeout(() => {
          if (prevMessage && prevMessage.includes("generated")) {
            setSuccessMessage(prevMessage);
          } else {
            setSuccessMessage("");
          }
        }, 3000);
      });
    }
  };

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${apiBase}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data.users);
    } catch (err) {
      console.error("Error loading users:", err);
      setErrorMessage(err.response?.data?.error || "Failed to load users");
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleDeleteUser = async (user) => {
    // Fetch user details for confirmation
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${apiBase}/admin/users/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeleteConfirm({ user, details: response.data });
    } catch (err) {
      console.error("Error fetching user details:", err);
      setErrorMessage(err.response?.data?.error || "Failed to load user details");
    }
  };

  const confirmDeleteUser = async () => {
    if (!deleteConfirm) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${apiBase}/admin/users/${deleteConfirm.user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccessMessage(`User ${deleteConfirm.user.email} has been deleted`);
      setTimeout(() => setSuccessMessage(""), 3000);
      setDeleteConfirm(null);
      loadUsers(); // Refresh list
    } catch (err) {
      console.error("Error deleting user:", err);
      setErrorMessage(err.response?.data?.error || "Failed to delete user");
      setDeleteConfirm(null);
    }
  };

  const pendingInvitations = invitations.filter((inv) => inv.status === "pending");

  return (
    <div>
      {/* Invitation Generator Section */}
      <div style={{ marginBottom: "2rem" }}>
        <form onSubmit={handleGenerateInvitation}>
          <FormGroup>
            <Label htmlFor="invite-email">Email Address</Label>
            <Input
              id="invite-email"
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="Enter email address for invitation"
              required
              disabled={loading}
            />
          </FormGroup>

          {errorMessage && (
            <div style={{ marginTop: "0.75rem", marginBottom: "0.75rem" }}>
              <Alert style={{ backgroundColor: "rgba(239, 68, 68, 0.2)", color: "#ef4444", borderColor: "rgba(239, 68, 68, 0.3)" }}>
                {errorMessage}
              </Alert>
            </div>
          )}

          {successMessage && !invitationUrl && !successMessage.includes("revoked") && (
            <div style={{ marginTop: "0.75rem", marginBottom: "0.75rem" }}>
              <Alert style={{ backgroundColor: "rgba(16, 185, 129, 0.2)", color: "#10b981", borderColor: "rgba(16, 185, 129, 0.3)" }}>
                {successMessage}
              </Alert>
            </div>
          )}

          {successMessage && successMessage.includes("revoked") && (
            <div style={{ marginTop: "0.75rem", marginBottom: "0.75rem" }}>
              <Alert style={{ backgroundColor: "rgba(16, 185, 129, 0.2)", color: "#10b981", borderColor: "rgba(16, 185, 129, 0.3)" }}>
                {successMessage}
              </Alert>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            disabled={loading || !inviteEmail}
            style={{ width: "100%", marginTop: "0.5rem" }}
          >
            {loading ? "Generating..." : "Generate Invitation Link"}
          </Button>
        </form>

        {invitationUrl && (
          <div
            style={{
              marginTop: "1.5rem",
              padding: "1.25rem",
              backgroundColor: "rgba(59, 130, 246, 0.1)",
              borderRadius: "8px",
              border: "2px solid rgba(59, 130, 246, 0.3)",
            }}
          >
            <div style={{ marginBottom: "1rem", fontWeight: 600, fontSize: "0.95rem", color: "#ffffff" }}>
              Invitation Link:
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              <textarea
                value={invitationUrl}
                readOnly
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  fontSize: "0.9rem",
                  fontFamily: "monospace",
                  backgroundColor: "#1e1e22",
                  border: "1px solid #2a2a2f",
                  borderRadius: "6px",
                  minHeight: "80px",
                  resize: "vertical",
                  lineHeight: "1.5",
                  color: "#ffffff",
                  wordBreak: "break-all",
                }}
                onClick={(e) => e.target.select()}
              />
              <Button
                variant="secondary"
                onClick={handleCopyToClipboard}
                style={{ width: "100%" }}
              >
                📋 Copy to Clipboard
              </Button>
            </div>
            {successMessage && successMessage.includes("copied") && (
              <div
                style={{
                  marginTop: "0.75rem",
                  fontSize: "0.875rem",
                  color: "#10b981",
                  fontWeight: 500,
                }}
              >
                {successMessage}
              </div>
            )}
            {successMessage && successMessage.includes("generated") && (
              <div
                style={{
                  marginTop: "0.75rem",
                  fontSize: "0.875rem",
                  color: "#10b981",
                }}
              >
                {successMessage}
              </div>
            )}
            <div
              style={{
                marginTop: "0.75rem",
                fontSize: "0.75rem",
                color: "#8b8b92",
              }}
            >
              This link expires in 7 days. Copy and paste it into your email to send to the user.
            </div>
          </div>
        )}
      </div>

      {/* Pending Invitations Section */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ marginBottom: "0.75rem", fontWeight: 600, fontSize: "0.95rem", color: "#ffffff" }}>
          Pending Invitations:
        </div>
        {loadingInvitations ? (
          <div style={{ color: "#8b8b92", fontSize: "0.875rem" }}>Loading...</div>
        ) : pendingInvitations.length === 0 ? (
          <div style={{ color: "#8b8b92", fontSize: "0.875rem" }}>No pending invitations</div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
            }}
          >
            {pendingInvitations.map((inv) => {
              const expiresAt = new Date(inv.expires_at);
              const daysLeft = Math.ceil((expiresAt - new Date()) / (1000 * 60 * 60 * 24));
              return (
                <div
                  key={inv.id}
                  style={{
                    padding: "0.75rem",
                    backgroundColor: "rgba(59, 130, 246, 0.1)",
                    border: "1px solid rgba(59, 130, 246, 0.3)",
                    borderRadius: "6px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ color: "#ffffff", fontWeight: 500, fontSize: "0.9rem" }}>
                      {inv.email}
                    </div>
                    <div style={{ color: "#8b8b92", fontSize: "0.75rem", marginTop: "0.25rem" }}>
                      Expires in {daysLeft} day{daysLeft !== 1 ? "s" : ""} • Created {new Date(inv.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    small
                    onClick={() => handleExpireInvitation(inv.id, inv.email)}
                    style={{ whiteSpace: "nowrap", marginLeft: "0.5rem" }}
                  >
                    Revoke
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* User Management Section */}
      <div
        style={{
          marginBottom: "2rem",
          paddingTop: "1.5rem",
          borderTop: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <div style={{ marginBottom: "0.75rem", fontWeight: 600, fontSize: "0.95rem", color: "#ffffff" }}>
          User Management:
        </div>
        {loadingUsers ? (
          <div style={{ color: "#8b8b92", fontSize: "0.875rem" }}>Loading users...</div>
        ) : users.length === 0 ? (
          <div style={{ color: "#8b8b92", fontSize: "0.875rem" }}>No users found</div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
            }}
          >
            {users.map((user) => {
              const createdDate = new Date(user.created_at);
              return (
                <div
                  key={user.id}
                  style={{
                    padding: "0.75rem",
                    backgroundColor: "rgba(139, 92, 246, 0.1)",
                    border: "1px solid rgba(139, 92, 246, 0.3)",
                    borderRadius: "6px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <div style={{ color: "#ffffff", fontWeight: 500, fontSize: "0.9rem" }}>
                        {user.email}
                      </div>
                      {user.is_admin && (
                        <span
                          style={{
                            padding: "0.125rem 0.5rem",
                            backgroundColor: "rgba(245, 158, 11, 0.2)",
                            color: "#f59e0b",
                            borderRadius: "4px",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                          }}
                        >
                          ADMIN
                        </span>
                      )}
                    </div>
                    <div style={{ color: "#8b8b92", fontSize: "0.75rem", marginTop: "0.25rem" }}>
                      Created {createdDate.toLocaleDateString()} • {user.file_count} file{user.file_count !== 1 ? "s" : ""}
                    </div>
                  </div>
                  {currentUser && currentUser.email === user.email ? (
                    <span style={{ color: "#8b8b92", fontSize: "0.75rem" }}>Current user</span>
                  ) : (
                    <Button
                      variant="ghost"
                      small
                      onClick={() => handleDeleteUser(user)}
                      style={{ whiteSpace: "nowrap", marginLeft: "0.5rem", color: "#ef4444" }}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            style={{
              backgroundColor: "#1e1e22",
              border: "2px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "12px",
              padding: "1.5rem",
              maxWidth: "500px",
              width: "90%",
              boxShadow: "0 10px 40px rgba(0, 0, 0, 0.5)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ marginBottom: "1rem", fontSize: "1.1rem", fontWeight: 600, color: "#ef4444" }}>
              ⚠️ Delete User
            </div>
            <div style={{ marginBottom: "1rem", color: "#ffffff" }}>
              Are you sure you want to delete <strong>{deleteConfirm.user.email}</strong>?
            </div>
            <div style={{ marginBottom: "1rem", padding: "0.75rem", backgroundColor: "rgba(239, 68, 68, 0.1)", borderRadius: "6px" }}>
              <div style={{ color: "#ef4444", fontSize: "0.875rem", marginBottom: "0.5rem" }}>
                This will permanently delete:
              </div>
              <ul style={{ color: "#ffffff", fontSize: "0.875rem", margin: 0, paddingLeft: "1.25rem" }}>
                <li>{deleteConfirm.details.file_count} file{deleteConfirm.details.file_count !== 1 ? "s" : ""}</li>
                <li>{deleteConfirm.details.job_count} processing job{deleteConfirm.details.job_count !== 1 ? "s" : ""}</li>
                <li>All invitation tokens created by this user</li>
                <li>The user account</li>
              </ul>
            </div>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
              <Button
                variant="ghost"
                onClick={() => setDeleteConfirm(null)}
                style={{ color: "#ffffff" }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={confirmDeleteUser}
                style={{ backgroundColor: "#ef4444", borderColor: "#ef4444" }}
              >
                Delete User
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Tools Section */}
      <div
        style={{
          paddingTop: "1.5rem",
          borderTop: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <div style={{ marginBottom: "0.75rem", fontWeight: 600, fontSize: "0.95rem", color: "#ffffff" }}>
          Admin Tools:
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          }}
        >
          <Button variant="ghost" small onClick={onCleanup} style={{ justifyContent: "flex-start" }}>
            🧹 Cleanup Missing Files
          </Button>
          <Button variant="ghost" small onClick={onDebug} style={{ justifyContent: "flex-start" }}>
            🔍 Debug Storage
          </Button>
          <Button variant="ghost" small onClick={onTestGitHub} style={{ justifyContent: "flex-start" }}>
            🔗 Test GitHub Connection
          </Button>
        </div>
      </div>
    </div>
  );
}

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
  const [generatedFiles, setGeneratedFiles] = useState({
    macros: [],
    instructions: [],
    reports: [],
  });

  const [filterRules, setFilterRules] = useState([
    { column: "F", value: "0" },
    { column: "G", value: "0" },
    { column: "H", value: "0" },
    { column: "I", value: "0" },
  ]);

  // Check if current filters match any completed job (for automated processing)
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

  // Check if macros already exist for this file
  const macrosExist = selectedFile ? generatedFiles.macros.length > 0 : false;

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
            reportFileId: status.report_file_id,
            reportFilename: status.report_filename,
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

        // Count consecutive errors to avoid infinite retries on persistent failures
        if (!poll.consecutiveErrors) {
          poll.consecutiveErrors = 0;
        }
        poll.consecutiveErrors++;

        // If we have 3+ consecutive errors, stop polling and show error
        if (poll.consecutiveErrors >= 3) {
          setJobStatus("failed");
          setProcessingLog((prev) => [
            ...prev,
            "❌ Lost connection to processing server",
            "Please check your internet connection and try again",
          ]);
          return; // Stop polling
        }

        if (attempts < maxAttempts) {
          // Continue polling but with exponential backoff for errors
          const delay = Math.min(5000 * Math.pow(1.5, poll.consecutiveErrors - 1), 30000);
          setTimeout(poll, delay);
        } else {
          setJobStatus("failed");
          setProcessingLog((prev) => [
            ...prev,
            "⏰ Processing timeout - lost connection to server",
            "The job may still be running. Check back later.",
          ]);
        }
      }
    };

    poll();
  };

  useEffect(() => {
    loadFiles();
  }, []);

  // Load generated files when selected file changes
  useEffect(() => {
    if (selectedFile) {
      loadGeneratedFiles(selectedFile.id);
    } else {
      setGeneratedFiles({ macros: [], instructions: [], reports: [] });
    }
  }, [selectedFile]);

  const loadGeneratedFiles = async (fileId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE}/files/${fileId}/generated`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGeneratedFiles(response.data);
    } catch (err) {
      console.error("Error loading generated files:", err);
      setGeneratedFiles({ macros: [], instructions: [], reports: [] });
    }
  };

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
      // Also refresh generated files and processing history for currently selected file
      if (selectedFile) {
        loadGeneratedFiles(selectedFile.id);
        setProcessingHistory([]); // Clear history to trigger reload
      }
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
      // Refresh generated files list
      if (selectedFile) {
        loadGeneratedFiles(selectedFile.id);
      }
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
              <>
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
                <ContentCard>
                  <CardHeader>
                    <CardTitle>Available Downloads</CardTitle>
                    <CardSubtitle>
                      Previously generated files for{" "}
                      {selectedFile.original_filename}
                    </CardSubtitle>
                  </CardHeader>
                  <CardBody>
                    <GeneratedFiles
                      fileId={selectedFile.id}
                      apiBase={API_BASE}
                      onDownload={handleDownload}
                    />
                  </CardBody>
                </ContentCard>
              </>
            )}

            {user.is_admin && (
              <ContentCard
                style={{
                  border: "2px solid #f59e0b",
                  backgroundColor: "rgba(245, 158, 11, 0.05)",
                }}
              >
                <CardHeader>
                  <CardTitle>
                    👑 Admin Panel
                  </CardTitle>
                  <CardSubtitle>
                    Generate invitation links and admin tools
                  </CardSubtitle>
                </CardHeader>
                <CardBody>
                  <AdminPanel
                    apiBase={API_BASE}
                    onCleanup={cleanupMissingFiles}
                    onDebug={debugStorage}
                    onTestGitHub={testGitHubDetailed}
                    currentUser={user}
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
                      disabled={processing || jobStatus === "processing" || macrosExist}
                      style={{ width: "100%", marginTop: "1rem" }}
                    >
                      {processing
                        ? "Analyzing..."
                        : "📋 Generate Macro & Instructions"}
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
                      {processedFile.reportFileId && (
                        <Button
                          variant="secondary"
                          onClick={() =>
                            handleDownload(
                              processedFile.reportFileId,
                              processedFile.reportFilename
                            )
                          }
                          style={{ width: "100%", marginTop: "0.5rem" }}
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
